/**
 * Checklist.tsx — Digital maintenance checklist with gate enforcement.
 * Supervisors execute maintenance steps sequentially; gates block progression
 * until explicitly confirmed (Jose requirement: "no pueda continuar si no confirma").
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, generateLocalId } from '../db/local-db';
import type { WorkOrderCache, ChecklistItem } from '../db/local-db';

// ─── Step templates by work order type ────────────────────────────────────

interface StepTemplate {
  stepNumber: number;
  description: string;
  descriptionFr: string;
  isGate: boolean;
  requiresPhoto: boolean;
  acceptedMin?: number;
  acceptedMax?: number;
  unit?: string;
}

const STEP_TEMPLATES: Record<string, StepTemplate[]> = {
  PREVENTIVE: [
    {
      stepNumber: 1,
      description: 'Electrical lockout verified (LOTO)',
      descriptionFr: 'Blocage électrique vérifié (LOTO)',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 2,
      description: 'Work area cleared and clean',
      descriptionFr: 'Zone de travail dégagée et propre',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 3,
      description: 'Certified tools present and checked',
      descriptionFr: 'Outillage certifié présent et vérifié',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 4,
      description: 'Disassembly completed',
      descriptionFr: 'Démontage effectué',
      isGate: false,
      requiresPhoto: true,
    },
    {
      stepNumber: 5,
      description: 'Visual inspection of shaft and housing',
      descriptionFr: "Inspection visuelle de l'arbre et du logement",
      isGate: false,
      requiresPhoto: true,
    },
    {
      stepNumber: 6,
      description: 'New component installed',
      descriptionFr: 'Nouvel élément installé',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 7,
      description: 'GATE: Verify tightening torque',
      descriptionFr: 'PORTE: Vérifier couple de serrage',
      isGate: true,
      requiresPhoto: true,
      acceptedMin: 120,
      acceptedMax: 150,
      unit: 'Nm',
    },
    {
      stepNumber: 8,
      description: 'Functional test — equipment operates normally',
      descriptionFr: 'Test de fonctionnement — équipement opérationnel',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 9,
      description: 'Parameters within acceptable range',
      descriptionFr: 'Paramètres dans la plage acceptable',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 10,
      description: 'Handover to operator — signature',
      descriptionFr: "Remise à l'opérateur — signature",
      isGate: true,
      requiresPhoto: false,
    },
  ],
  CORRECTIVE: [
    {
      stepNumber: 1,
      description: 'Electrical lockout verified (LOTO)',
      descriptionFr: 'Blocage électrique vérifié (LOTO)',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 2,
      description: 'Fault diagnosis completed',
      descriptionFr: 'Diagnostic de panne effectué',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 3,
      description: 'Root cause identified',
      descriptionFr: 'Cause racine identifiée',
      isGate: true,
      requiresPhoto: true,
    },
    {
      stepNumber: 4,
      description: 'Corrective action performed',
      descriptionFr: 'Action corrective effectuée',
      isGate: false,
      requiresPhoto: true,
    },
    {
      stepNumber: 5,
      description: 'GATE: Functional test passed',
      descriptionFr: 'PORTE: Test de fonctionnement réussi',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 6,
      description: 'Handover to operator — signature',
      descriptionFr: "Remise à l'opérateur — signature",
      isGate: true,
      requiresPhoto: false,
    },
  ],
  PREDICTIVE: [
    {
      stepNumber: 1,
      description: 'PPE checked and worn',
      descriptionFr: 'EPI vérifié et porté',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 2,
      description: 'Measurement equipment calibrated',
      descriptionFr: 'Équipement de mesure calibré',
      isGate: false,
      requiresPhoto: false,
    },
    {
      stepNumber: 3,
      description: 'Vibration measurement — point A',
      descriptionFr: 'Mesure vibration — point A',
      isGate: false,
      requiresPhoto: false,
      acceptedMin: 0,
      acceptedMax: 7.1,
      unit: 'mm/s',
    },
    {
      stepNumber: 4,
      description: 'Vibration measurement — point B',
      descriptionFr: 'Mesure vibration — point B',
      isGate: false,
      requiresPhoto: false,
      acceptedMin: 0,
      acceptedMax: 7.1,
      unit: 'mm/s',
    },
    {
      stepNumber: 5,
      description: 'Temperature reading — bearing',
      descriptionFr: 'Relevé température — roulement',
      isGate: false,
      requiresPhoto: false,
      acceptedMin: 20,
      acceptedMax: 85,
      unit: '°C',
    },
    {
      stepNumber: 6,
      description: 'GATE: All results within acceptable range',
      descriptionFr: 'PORTE: Tous les résultats dans la plage acceptable',
      isGate: true,
      requiresPhoto: false,
    },
    {
      stepNumber: 7,
      description: 'Report completed and signed',
      descriptionFr: 'Rapport rempli et signé',
      isGate: true,
      requiresPhoto: false,
    },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateChecklistItems(workOrder: WorkOrderCache): ChecklistItem[] {
  const templates =
    STEP_TEMPLATES[workOrder.orderType] ?? STEP_TEMPLATES.PREVENTIVE;
  return templates.map((t) => ({
    localId: generateLocalId(),
    workOrderId: workOrder.orderId,
    stepNumber: t.stepNumber,
    description: t.description,
    descriptionFr: t.descriptionFr,
    isGate: t.isGate,
    requiresPhoto: t.requiresPhoto,
    acceptedMin: t.acceptedMin,
    acceptedMax: t.acceptedMax,
    unit: t.unit,
    completed: false,
    syncStatus: 'pending' as const,
  }));
}

type StepState = 'locked' | 'active' | 'completed';

function getStepState(item: ChecklistItem, index: number, items: ChecklistItem[]): StepState {
  if (item.completed) return 'completed';

  // All preceding gate steps must be complete before this step unlocks
  const precedingGates = items.slice(0, index).filter((i) => i.isGate);
  if (precedingGates.some((g) => !g.completed)) return 'locked';

  // Sequential: previous step must also be complete
  if (index > 0 && !items[index - 1].completed) return 'locked';

  return 'active';
}

// ─── StepCard ─────────────────────────────────────────────────────────────

interface StepCardProps {
  item: ChecklistItem;
  state: StepState;
  isExpanded: boolean;
  noteValue: string;
  measureValue: string;
  onToggleExpand: () => void;
  onNoteChange: (val: string) => void;
  onMeasureChange: (val: string) => void;
  onComplete: () => void;
  onFail: () => void;
  onUndo: () => void;
}

function StepCard({
  item,
  state,
  isExpanded,
  noteValue,
  measureValue,
  onToggleExpand,
  onNoteChange,
  onMeasureChange,
  onComplete,
  onFail,
  onUndo,
}: StepCardProps) {
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';

  const containerClass = isCompleted
    ? 'border border-green-300 bg-green-50'
    : item.isGate
    ? isLocked
      ? 'border border-gray-200 bg-gray-50'
      : 'border border-orange-300 bg-orange-50'
    : isLocked
    ? 'border border-gray-200 bg-gray-50'
    : 'border border-blue-200 bg-white';

  const measureNum = measureValue !== '' ? parseFloat(measureValue) : undefined;
  const measureValid: boolean | null =
    measureNum !== undefined &&
    item.acceptedMin !== undefined &&
    item.acceptedMax !== undefined
      ? measureNum >= item.acceptedMin && measureNum <= item.acceptedMax
      : null;

  return (
    <div className={`rounded-lg transition-all ${containerClass}`}>
      {/* Header row */}
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3 disabled:cursor-not-allowed"
        onClick={onToggleExpand}
        disabled={isLocked}
      >
        <span className="text-lg flex-shrink-0 mt-0.5 select-none">
          {isCompleted ? '✅' : isLocked ? '🔒' : item.isGate ? '🔸' : '◻️'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-gray-400">{item.stepNumber}</span>
            {item.isGate && !isCompleted && !isLocked && (
              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">
                PORTE
              </span>
            )}
          </div>
          <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
            {item.descriptionFr}
          </p>
          {isCompleted && item.completedAt && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {new Date(item.completedAt).toLocaleTimeString('fr-FR')}
              {item.measurement !== undefined && ` · ${item.measurement} ${item.unit ?? ''}`}
              {item.notes && item.notes !== 'NON CONFORME' && ` · "${item.notes}"`}
              {item.notes === 'NON CONFORME' && (
                <span className="ml-1 text-red-500 font-medium">— Non conforme</span>
              )}
            </p>
          )}
        </div>
      </button>

      {/* Action panel (active step only) */}
      {isExpanded && !isCompleted && !isLocked && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-3">
          {/* Measurement input */}
          {item.acceptedMin !== undefined && item.acceptedMax !== undefined && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Mesure ({item.unit}) — Plage:{' '}
                <strong className="text-gray-700">
                  {item.acceptedMin}–{item.acceptedMax} {item.unit}
                </strong>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={measureValue}
                  onChange={(e) => onMeasureChange(e.target.value)}
                  placeholder={String(item.acceptedMin)}
                  className="border rounded-lg px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-ocp-green focus:border-transparent outline-none"
                />
                <span className="text-sm text-gray-400">{item.unit}</span>
                {measureValid === true && (
                  <span className="text-xs font-semibold text-green-600">✓ OK</span>
                )}
                {measureValid === false && (
                  <span className="text-xs font-semibold text-red-600">✗ Hors plage</span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">
              Notes / observations
            </label>
            <textarea
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Saisir vos observations…"
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ocp-green focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onComplete}
              className="flex-1 bg-ocp-green text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-800 active:scale-95 transition-all"
            >
              ✅ Confirmer
            </button>
            <button
              onClick={onFail}
              className="flex-1 bg-red-50 text-red-700 border border-red-200 text-sm font-semibold py-2.5 rounded-lg hover:bg-red-100 active:scale-95 transition-all"
            >
              ❌ Non conforme
            </button>
          </div>

          {item.requiresPhoto && (
            <p className="text-xs text-amber-600 text-center">
              📷 Photo recommandée pour cette étape
            </p>
          )}
        </div>
      )}

      {/* Undo option for completed steps */}
      {isExpanded && isCompleted && (
        <div className="px-4 pb-3 pt-3 border-t border-gray-200">
          <button
            onClick={onUndo}
            className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
          >
            Annuler cette étape
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Checklist page ────────────────────────────────────────────────────────

function Checklist() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const [workOrder, setWorkOrder] = useState<WorkOrderCache | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [measureInputs, setMeasureInputs] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (!orderId) {
      setLoaded(true);
      return;
    }

    const order = await db.workOrders.get(orderId);
    setWorkOrder(order ?? null);

    if (!order) {
      setLoaded(true);
      return;
    }

    const existing = await db.checklists
      .where('workOrderId')
      .equals(orderId)
      .sortBy('stepNumber');

    if (existing.length > 0) {
      setItems(existing);
      // Auto-expand first incomplete active step
      const firstActive = existing.find((item, idx) => {
        if (item.completed) return false;
        const gates = existing.slice(0, idx).filter((i) => i.isGate);
        return gates.every((g) => g.completed) && (idx === 0 || existing[idx - 1].completed);
      });
      if (firstActive) setExpandedStep(firstActive.stepNumber);
    } else {
      const generated = generateChecklistItems(order);
      await db.checklists.bulkAdd(generated);
      setItems(generated);
      if (generated.length > 0) setExpandedStep(1);
    }
    setLoaded(true);
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistItem = async (updated: ChecklistItem) => {
    await db.checklists.put(updated);
    setItems((prev) => prev.map((i) => (i.localId === updated.localId ? updated : i)));
  };

  const handleComplete = async (item: ChecklistItem, failed = false) => {
    const noteVal = noteInputs[item.stepNumber] ?? '';
    const measureStr = measureInputs[item.stepNumber];
    const measurement =
      measureStr !== undefined && measureStr !== '' ? parseFloat(measureStr) : undefined;

    // Validate measurement range for confirmed (non-failed) steps
    if (
      !failed &&
      item.acceptedMin !== undefined &&
      item.acceptedMax !== undefined &&
      measurement !== undefined
    ) {
      if (measurement < item.acceptedMin || measurement > item.acceptedMax) {
        const proceed = window.confirm(
          `⚠️ Valeur hors plage!\n\n` +
            `Mesurée: ${measurement} ${item.unit ?? ''}\n` +
            `Acceptable: ${item.acceptedMin}–${item.acceptedMax} ${item.unit ?? ''}\n\n` +
            `Confirmer quand même ?`,
        );
        if (!proceed) return;
      }
    }

    const updated: ChecklistItem = {
      ...item,
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy: 'TECH',
      notes: noteVal || (failed ? 'NON CONFORME' : undefined),
      measurement,
      syncStatus: 'pending',
    };

    setIsSaving(true);
    await persistItem(updated);
    setIsSaving(false);
    setExpandedStep(null);

    // Auto-expand next step
    const nextItem = items.find((i) => i.stepNumber === item.stepNumber + 1);
    if (nextItem && !nextItem.completed) {
      setExpandedStep(nextItem.stepNumber);
    }
  };

  const handleUndo = async (item: ChecklistItem) => {
    const reset: ChecklistItem = {
      ...item,
      completed: false,
      completedAt: undefined,
      completedBy: undefined,
      notes: undefined,
      measurement: undefined,
      syncStatus: 'pending',
    };
    await persistItem(reset);
  };

  // ── No orderId ────────────────────────────────────────────────────────────
  if (!orderId) {
    return (
      <div className="text-center py-16 text-gray-400 max-w-sm mx-auto">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-sm">Sélectionnez un ordre depuis le Programme</p>
        <button
          onClick={() => navigate('/program')}
          className="mt-5 text-sm text-ocp-green underline font-medium"
        >
          Voir le Programme →
        </button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-2xl animate-pulse">⚙️</div>
      </div>
    );
  }

  // ── Order not found ────────────────────────────────────────────────────────
  if (!workOrder) {
    return (
      <div className="text-center py-16 text-gray-400 max-w-sm mx-auto">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-sm">Ordre non trouvé en cache local.</p>
        <p className="text-xs text-gray-400 mt-1">
          Synchronisez depuis la page Programme.
        </p>
        <button
          onClick={() => navigate('/program')}
          className="mt-5 text-sm text-ocp-green underline font-medium"
        >
          ← Retour au Programme
        </button>
      </div>
    );
  }

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const allDone = completedCount === items.length && items.length > 0;

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Work order header */}
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => navigate('/program')}
          className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 transition-colors"
        >
          ← Programme
        </button>
        <h2 className="font-semibold text-gray-900 text-sm">
          {workOrder.descriptionFr || workOrder.description}
        </h2>
        <div className="text-xs text-gray-500 mt-0.5">
          {workOrder.equipmentTag} · {workOrder.equipmentName}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {completedCount}/{items.length} étapes
            </span>
            <span className="font-semibold">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-ocp-green rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="text-center text-xs text-gray-400 py-1">💾 Enregistrement…</div>
      )}

      {/* All done banner */}
      {allDone && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
          <div className="text-2xl mb-1">✅</div>
          <p className="text-sm font-semibold text-green-800">Checklist complète!</p>
          <p className="text-xs text-green-600 mt-1">
            Synchronisez pour envoyer les résultats au serveur.
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const state = getStepState(item, index, items);
          const isExpanded = expandedStep === item.stepNumber;

          return (
            <StepCard
              key={item.localId}
              item={item}
              state={state}
              isExpanded={isExpanded}
              noteValue={noteInputs[item.stepNumber] ?? ''}
              measureValue={measureInputs[item.stepNumber] ?? ''}
              onToggleExpand={() => {
                if (state === 'locked') return;
                setExpandedStep(isExpanded ? null : item.stepNumber);
              }}
              onNoteChange={(val) =>
                setNoteInputs((prev) => ({ ...prev, [item.stepNumber]: val }))
              }
              onMeasureChange={(val) =>
                setMeasureInputs((prev) => ({ ...prev, [item.stepNumber]: val }))
              }
              onComplete={() => handleComplete(item, false)}
              onFail={() => handleComplete(item, true)}
              onUndo={() => handleUndo(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Checklist;
