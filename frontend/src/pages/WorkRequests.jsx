import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Eye, Filter, Clock, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Users, User, Globe, ImageOff, Search,
  Wrench, Tag, MapPin, Gauge, Package, Calendar, FileText, Trash2, Zap
} from 'lucide-react';
import { statusColor, priorityColor } from '../data/mockData';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';

/* ─── Status config (dynamic with i18n) ─── */
const STATUS_KEYS = ['ALL', 'DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'REJECTED', 'CANCELLED'];

const IMPACT_COLOR = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

/* ─── Scope tabs ─── */
const SCOPE_TABS = [
  { key: 'mine', icon: User },
  { key: 'team', icon: Users },
  { key: 'all', icon: Globe },
];

/* ─── Confidence Bar ─── */
function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = value >= 90 ? 'text-emerald-700 dark:text-emerald-400' : value >= 75 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${textColor}`}>{value}%</span>
    </div>
  );
}

/* ─── Photo Carousel ─── */
function PhotoCarousel({ photos = [], t }) {
  const [idx, setIdx] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <ImageOff className="w-10 h-10 mb-2 opacity-40" />
        <span className="text-sm">{t('workRequests.noPhotos')}</span>
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={photos[idx]}
          alt={`${t('workRequests.photos')} ${idx + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((idx + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <div className="flex justify-center gap-1.5 mt-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-[#1B5E20]' : 'bg-muted-foreground/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Duplicate Warning Banner ─── */
function DuplicateWarning({ duplicates, onViewDuplicate, onDismiss, t }) {
  if (!duplicates || duplicates.length === 0) return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('workRequests.duplicateWarning')}</span>
      </div>
      {duplicates.map((dup) => (
        <div key={dup.id} className="flex items-center justify-between bg-white dark:bg-card rounded-lg p-3 border border-amber-100 dark:border-amber-800">
          <div>
            <div className="text-sm font-medium text-foreground">{dup.equipment_name}</div>
            <div className="text-xs text-muted-foreground">
              {t('workRequests.duplicateDetail', { id: dup.id })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewDuplicate(dup)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/70 font-medium transition-colors"
            >
              {t('workRequests.viewDuplicate')}
            </button>
            <button
              onClick={onDismiss}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 font-medium transition-colors"
            >
              {t('workRequests.proceedAnyway')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Detail Modal (expanded + editable for supervisor) ─── */
function DetailModal({ item, onClose, onValidate, onReject, onCancel, onStart, onComplete, onCloseWR, onSaveEdit, onPlannerCreateOT, userRole, t }) {
  if (!item) return null;
  const isPending = item.status === 'PENDING_VALIDATION';
  const isValidated = item.status === 'VALIDATED';
  const canStart = ['VALIDATED', 'ASSIGNED', 'SCHEDULED'].includes(item.status);
  const canComplete = item.status === 'IN_PROGRESS';
  const canClose = item.status === 'COMPLETED';
  const isSupervisor = ['admin', 'manager'].includes(userRole);
  const isPlanner = userRole === 'planner';
  const canEdit = isPending && isSupervisor;

  // Editable state (supervisor can edit before approving)
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    failure_description: item.failure_description || '',
    priority_requested: item.priority_requested || 'P3',
    failure_mode: item.failure_mode || '',
    estimated_duration: item.estimated_duration || '',
    production_impact: item.production_impact || 'MEDIUM',
  });

  const statusLabels = {
    DRAFT: t('common.draft'),
    PENDING_VALIDATION: t('common.pending'),
    VALIDATED: t('workRequests.validate'),
    ASSIGNED: 'Asignado',
    REJECTED: t('common.reject'),
    CANCELLED: 'Cancelado',
    IN_PROGRESS: t('common.active'),
    COMPLETED: 'Completado',
    CLOSED: 'Cerrado',
    SCHEDULED: t('workRequests.scheduled'),
  };

  const impactLabels = {
    CRITICAL: t('workRequests.impactCritical'),
    HIGH: t('workRequests.impactHigh'),
    MEDIUM: t('workRequests.impactMedium'),
    LOW: t('workRequests.impactLow'),
  };

  const handleSaveAndApprove = () => {
    if (editing) onSaveEdit(item.id, editData);
    onValidate(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-muted-foreground">{item.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(item.status)}`}>
                {statusLabels[item.status] ?? item.status}
              </span>
              {item.wo_number && (
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-pointer hover:bg-emerald-200"
                  title="Ir a OT"
                  onClick={(e) => { e.stopPropagation(); window.location.href = '/work-orders'; }}>
                  OT: {item.wo_number}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{item.equipment_name}</h2>
            <p className="text-xs font-mono text-muted-foreground">{item.equipment_tag}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-semibold hover:bg-amber-100 transition-colors">
                Editar
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Photo Carousel */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('workRequests.photos')}</p>
          <PhotoCarousel photos={item.photos} t={t} />
        </div>

        {/* Detail Grid */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DetailCard icon={MapPin} label={t('workRequests.plantArea')} value={`${item.plant} / ${item.area}`} />
          <DetailCard icon={User} label="Creado por" value={item.created_by || '-'} />
          <DetailCard icon={Clock} label={t('workRequests.estimatedDuration')}>
            {editing ? (
              <input type="text" value={editData.estimated_duration} onChange={e => setEditData(d => ({ ...d, estimated_duration: e.target.value }))}
                className="w-full text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" />
            ) : (
              <span className="text-sm font-medium text-foreground">{item.estimated_duration}h</span>
            )}
          </DetailCard>
          <DetailCard icon={Gauge} label={t('workRequests.productionImpact')}>
            {editing ? (
              <select value={editData.production_impact} onChange={e => setEditData(d => ({ ...d, production_impact: e.target.value }))}
                className="text-xs px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(v => <option key={v} value={v}>{impactLabels[v]}</option>)}
              </select>
            ) : (
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${IMPACT_COLOR[item.production_impact] ?? 'bg-muted text-muted-foreground'}`}>
                {impactLabels[item.production_impact] ?? item.production_impact}
              </span>
            )}
          </DetailCard>
          <DetailCard icon={AlertTriangle} label={t('workRequests.priorityLabel')}>
            {editing ? (
              <select value={editData.priority_requested} onChange={e => setEditData(d => ({ ...d, priority_requested: e.target.value }))}
                className="text-xs px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none">
                {['P1', 'P2', 'P3', 'P4'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${priorityColor(item.priority_requested)}`}>
                  {item.priority_requested}
                </span>
                {item.priority_requested !== item.priority_suggested && (
                  <>
                    <span className="text-amber-500 text-xs">→</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${priorityColor(item.priority_suggested)}`}>
                      {item.priority_suggested}
                    </span>
                  </>
                )}
              </div>
            )}
          </DetailCard>
          <DetailCard icon={Search} label={t('workRequests.aiConfidence')}>
            <ConfidenceBar value={item.ai_confidence} />
          </DetailCard>
          {item.activity_class && (
            <DetailCard icon={Wrench} label="Clase de Actividad" value={item.activity_class} />
          )}
          {item.plant_condition && (
            <DetailCard icon={Zap} label="Condición de Planta" value={item.plant_condition} />
          )}
          {item.created_at && (
            <DetailCard icon={Calendar} label={t('workRequests.createdAt')} value={new Date(item.created_at).toLocaleDateString()} />
          )}
        </div>

        {/* Failure Description */}
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('workRequests.failureDesc')}</p>
          {editing ? (
            <textarea value={editData.failure_description} onChange={e => setEditData(d => ({ ...d, failure_description: e.target.value }))}
              rows={3} className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
          ) : (
            <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-3 border border-border">
              {item.failure_description}
            </p>
          )}
          <div className="mt-2">
            {editing ? (
              <input type="text" value={editData.failure_mode} onChange={e => setEditData(d => ({ ...d, failure_mode: e.target.value }))}
                className="text-xs px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none font-mono" placeholder="Failure mode" />
            ) : (
              <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded font-mono">
                {item.failure_mode}
              </span>
            )}
          </div>
        </div>

        {/* Failure Classification */}
        {(item.failure_category || item.failure_symptom || item.failure_cause) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clasificación de Falla</p>
            <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
              {item.failure_category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Categoría:</span>
                  <span className="text-sm font-medium text-foreground">{item.failure_category}</span>
                </div>
              )}
              {item.failure_symptom && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Síntoma:</span>
                  <span className="text-sm font-medium text-foreground">{item.failure_symptom}</span>
                </div>
              )}
              {item.failure_cause && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Causa:</span>
                  <span className="text-sm font-medium text-foreground">{item.failure_cause}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Action */}
        {item.suggested_action && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Acción Sugerida</p>
            <p className="text-sm text-foreground leading-relaxed bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
              {item.suggested_action}
            </p>
          </div>
        )}

        {/* Spare Parts */}
        {item.spare_parts && item.spare_parts.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('workRequests.spareParts')}</p>
            <div className="flex flex-wrap gap-2">
              {item.spare_parts.map((part, i) => (
                <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <Package size={10} />
                  {typeof part === 'string' ? part : part.name || part.code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SAP Aviso fields */}
        {(item.reported_by || item.circumstances || item.support_equipment) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Datos del Aviso (SAP)</p>
            <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
              {item.reported_by && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Autor del Aviso:</span>
                  <span className="text-sm font-medium text-foreground">{item.reported_by}</span>
                </div>
              )}
              {item.circumstances && (
                <div>
                  <span className="text-xs text-muted-foreground">Circunstancias:</span>
                  <p className="text-sm text-foreground mt-0.5">{item.circumstances}</p>
                </div>
              )}
              {item.support_equipment && item.support_equipment.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Equipos de Apoyo:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(item.support_equipment) ? item.support_equipment : []).map((eq, i) => (
                      <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                        {typeof eq === 'string' ? eq : eq.tag || eq.description || ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources & Materials summary */}
        {(item.resources?.length > 0 || item.materials?.length > 0) && (
          <div className="px-6 pb-4">
            {item.resources?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recursos</p>
                <div className="space-y-1">
                  {item.resources.map((r, i) => {
                    // Handle both string ("Mecánico x2") and object ({type, quantity, hours}) formats
                    if (typeof r === 'string') {
                      const match = r.match(/^(.+?)\s*x\s*(\d+)$/i);
                      return (
                        <div key={i} className="flex items-center gap-3 text-sm bg-muted/50 rounded px-3 py-1.5 border border-border">
                          <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="font-medium">{match ? match[1].trim() : r}</span>
                          {match && <span className="text-muted-foreground">×{match[2]} personas</span>}
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="flex items-center gap-3 text-sm bg-muted/50 rounded px-3 py-1.5 border border-border">
                        <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{r.type || r.name || ''}</span>
                        {r.quantity && <span className="text-muted-foreground">×{r.quantity} personas</span>}
                        {r.hours && <span className="text-muted-foreground">{r.hours} hrs</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {item.materials?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Materiales</p>
                <div className="space-y-1">
                  {item.materials.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-muted/50 rounded px-3 py-1.5 border border-border">
                      <Package className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      {typeof m === 'string'
                        ? <span className="font-medium">{m}</span>
                        : <>
                            {m.sapId && <span className="font-mono text-xs text-muted-foreground">{m.sapId}</span>}
                            <span className="font-medium">{m.description || m.name || ''}</span>
                            {m.quantity && <span className="text-muted-foreground">×{m.quantity} uds</span>}
                          </>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fast Track Banner for P1/P2 */}
        {isPending && ['P1', 'P2'].includes(editing ? editData.priority_requested : item.priority_requested) && (
          <div className="mx-6 mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">IMPREVISTO — Fast Track</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Al aprobar este aviso {editing ? editData.priority_requested : item.priority_requested}, se creará una OT directa sin planificación</p>
            </div>
          </div>
        )}

        {/* Validation Checklist */}
        {isPending && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('workRequests.validationChecklist')}</p>
            <div className="space-y-1.5">
              {[
                t('workRequests.priorityConfirmed'),
                t('workRequests.failureModeValidated'),
                t('workRequests.sparePartsVerified'),
                t('workRequests.personnelAvailable'),
              ].map((check, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" className="accent-[#1B5E20] w-4 h-4" />
                  {check}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(isPending || isValidated || canStart || canComplete || canClose) && (
          <div className="px-6 py-4 border-t border-border flex flex-wrap gap-3 sticky bottom-0 bg-card rounded-b-2xl">
            {/* Supervisor: Aprobar + Rechazar + Cancelar */}
            {isPending && (
              <>
                <button
                  onClick={handleSaveAndApprove}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B5E20] text-white text-sm font-semibold hover:bg-[#2E7D32] transition-colors"
                >
                  <CheckCircle size={16} />
                  {editing ? 'Guardar y Aprobar' : t('workRequests.validateRequest')}
                </button>
                <button
                  onClick={() => { onReject(item.id); onClose(); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <XCircle size={16} />
                  {t('common.reject')}
                </button>
                <button
                  onClick={() => { onCancel(item.id); onClose(); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <XCircle size={16} />
                  Cancelar
                </button>
              </>
            )}
            {/* Planner: Crear OT from approved WR */}
            {isValidated && isPlanner && onPlannerCreateOT && (
              <button
                onClick={() => { onPlannerCreateOT(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <FileText size={16} />
                Crear OT
              </button>
            )}
            {canStart && (
              <button
                onClick={() => { onStart(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Wrench size={16} />
                Iniciar Trabajo
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => { onComplete(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle size={16} />
                Completar Trabajo
              </button>
            )}
            {canClose && (
              <button
                onClick={() => { onCloseWR(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-600 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                <CheckCircle size={16} />
                Cierre Técnico
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, children }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={12} className="text-muted-foreground" />}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {children || <p className="text-sm font-semibold text-foreground">{value}</p>}
    </div>
  );
}

/* ─── Normalize API data ─── */
function normalizeWR(wr) {
  const cls = wr.ai_classification || {};
  const desc = wr.problem_description || {};
  return {
    id: wr.request_id || wr.id,
    equipment_tag: wr.equipment_tag || '',
    equipment_name: wr.equipment_name || wr.equipment_tag || '',
    plant: wr.plant_id || 'OCP-JFC1',
    area: wr.area || '',
    technician: wr.technician_name || wr.technician || cls.required_specialties?.[0] || '',
    created_by: wr.created_by || wr.technician || '',
    status: wr.status || 'DRAFT',
    priority_requested: cls.priority_suggested || wr.priority_requested || wr.priority || 'P3',
    priority_suggested: cls.priority_suggested || wr.priority_suggested || 'P3',
    failure_description: desc.original_text || desc.structured_description || wr.failure_description || wr.problem_description || '',
    failure_mode: desc.failure_mode_detected || desc.failure_mode_code || wr.failure_mode || '',
    production_impact: wr.production_impact || 'MEDIUM',
    estimated_duration: cls.estimated_duration_hours || wr.estimated_duration || 4,
    ai_confidence: Math.round((wr.equipment_confidence ?? 0.85) * 100),
    spare_parts: wr.spare_parts || [],
    photos: wr.photos || wr.images || [],
    created_at: wr.created_at || new Date().toISOString(),
    // Classification fields
    activity_class: wr.activity_class || '',
    work_class: wr.work_class || '',
    failure_category: wr.failure_category || cls.failure_category || '',
    failure_symptom: wr.failure_symptom || '',
    failure_cause: wr.failure_cause || '',
    plant_condition: wr.plant_condition || '',
    suggested_action: wr.suggested_action || '',
    // Resources & Materials
    resources: wr.resources || [],
    materials: wr.materials || [],
    // SAP Aviso fields
    notification_type: wr.notification_type || 'A1',
    reported_by: wr.reported_by || '',
    circumstances: wr.circumstances || '',
    support_equipment: wr.support_equipment || [],
    // Workflow fields
    wo_number: wr.wo_number || '',
    assigned_to_name: wr.assigned_to_name || '',
    approval_comment: wr.approval_comment || '',
    rejection_reason: wr.rejection_reason || '',
    sla_deadline: wr.sla_deadline || '',
    _raw: wr,
  };
}

/* ─── Find duplicates (same equipment, open status) ─── */
function findDuplicates(currentReq, allRequests) {
  const openStatuses = ['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'IN_PROGRESS'];
  return allRequests.filter(
    (r) =>
      r.id !== currentReq.id &&
      r.equipment_tag === currentReq.equipment_tag &&
      openStatuses.includes(r.status)
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const PAGE_SIZE = 25;

export default function WorkRequests({ onNavigateTab } = {}) {
  const [scope, setScope] = useState('all');
  const { user } = useAuth();
  const defaultQueue = user?.role === 'manager' ? 'supervisor' : user?.role === 'planner' ? 'planner' : 'all';
  const [priorityQueue, setPriorityQueue] = useState(defaultQueue); // 'all' | 'supervisor' (P1/P2) | 'planner' (P3/P4)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [showDuplicates, setShowDuplicates] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const { t } = useLanguage();
  const toast = useToast();
  const ctx = useOutletContext() || {};
  const plantId = ctx.plant || ctx.selectedPlant || '';
  const selectedArea = ctx.selectedArea || 'All Areas';

  useEffect(() => {
    setLoading(true);
    api.listWorkRequests(plantId ? { plant_id: plantId } : {})
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setRequests(arr.map(normalizeWR));
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [plantId]);

  /* ─── Scope filtering ─── */
  const scopeFiltered = useMemo(() => {
    if (scope === 'mine') {
      return requests.filter(
        (r) => r.technician === user?.full_name || r.technician === user?.username || r.created_by === user?.username
      );
    }
    if (scope === 'team') {
      return requests.filter((r) => r.plant === (user?.plant_id || 'JFC-1'));
    }
    return requests;
  }, [requests, scope, user]);

  /* ─── Priority queue filtering (supervisor P1/P2 vs planner P3/P4) ─── */
  const queueFiltered = useMemo(() => {
    if (priorityQueue === 'supervisor') {
      return scopeFiltered.filter((r) => ['P1', 'P2'].includes(r.priority_requested || r.priority_suggested));
    }
    if (priorityQueue === 'planner') {
      return scopeFiltered.filter((r) => !['P1', 'P2'].includes(r.priority_requested || r.priority_suggested));
    }
    return scopeFiltered;
  }, [scopeFiltered, priorityQueue]);

  /* ─── Area filtering ─── */
  const areaFiltered = useMemo(() => {
    if (!selectedArea || selectedArea === 'All Areas') return queueFiltered;
    const areaLower = selectedArea.toLowerCase();
    return queueFiltered.filter((r) => {
      const tag = (r.equipment_tag || '').toLowerCase();
      const name = (r.equipment_name || '').toLowerCase();
      const area = (r.area || '').toLowerCase();
      return tag.includes(areaLower) || name.includes(areaLower) || area.includes(areaLower);
    });
  }, [queueFiltered, selectedArea]);

  /* ─── Status + search filtering ─── */
  const filtered = useMemo(() => {
    return areaFiltered.filter((r) => {
      const matchesFilter = statusFilter === 'ALL' || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        r.id.toLowerCase().includes(q) ||
        r.equipment_tag.toLowerCase().includes(q) ||
        r.equipment_name.toLowerCase().includes(q) ||
        r.failure_description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [areaFiltered, statusFilter, search]);

  /* ─── Sort + Paginate ─── */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, search, scope, priorityQueue]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const pendingCount = queueFiltered.filter((r) => r.status === 'PENDING_VALIDATION').length;

  /* ─── Status labels (i18n) ─── */
  const statusLabels = useMemo(() => ({
    ALL: t('common.all'),
    DRAFT: t('common.draft'),
    PENDING_VALIDATION: t('common.pending'),
    VALIDATED: t('workRequests.validate'),
    ASSIGNED: 'Asignado',
    REJECTED: t('common.reject'),
    IN_PROGRESS: t('common.active'),
    COMPLETED: 'Completado',
    CLOSED: 'Cerrado',
    SCHEDULED: t('workRequests.scheduled'),
  }), [t]);

  const impactLabels = useMemo(() => ({
    CRITICAL: t('workRequests.impactCritical'),
    HIGH: t('workRequests.impactHigh'),
    MEDIUM: t('workRequests.impactMedium'),
    LOW: t('workRequests.impactLow'),
  }), [t]);

  const scopeLabels = useMemo(() => ({
    mine: t('workRequests.myRequests'),
    team: t('workRequests.teamRequests'),
    all: t('workRequests.allRequests'),
  }), [t]);

  /* ─── Actions ─── */
  function handleValidate(id) {
    const req = requests.find(r => r.id === id);
    const priority = req?.priority_requested || req?.priority_suggested || 'P3';
    const isFastTrack = ['P1', 'P2'].includes(priority);

    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'VALIDATED' } : r)));
    api.validateWorkRequest(id, { action: 'APPROVE' })
      .then(async () => {
        if (isFastTrack) {
          try {
            const wo = await api.createWOFromWR({ work_request_id: id });
            toast.success(
              <span>
                FAST TRACK: OT {wo.wo_number || ''} creada
                {onNavigateTab && (
                  <button onClick={() => onNavigateTab('execution')} className="ml-2 underline font-semibold">
                    → Ir a Ejecución
                  </button>
                )}
              </span>,
              8000
            );
          } catch {
            toast.success('Aviso validado. Error al crear OT automática — créala manualmente.');
          }
        } else {
          toast.success(
            <span>
              Aviso validado y agregado al Backlog
              {onNavigateTab && (
                <button onClick={() => onNavigateTab('planning')} className="ml-2 underline font-semibold">
                  → Ir a Planificación
                </button>
              )}
            </span>,
            8000
          );
        }
      })
      .catch(() => toast.error('Error al validar'));
  }

  function handleReject(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)));
    api.validateWorkRequest(id, { action: 'REJECT' }).catch(() => {});
  }

  function handleCancel(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r)));
    api.cancelWorkRequest(id)
      .then(() => toast.success('Aviso cancelado'))
      .catch(() => toast.error('Error al cancelar'));
  }

  function handleSaveEdit(id, updates) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    api.updateWorkRequest(id, updates)
      .then(() => toast.success('Aviso actualizado'))
      .catch(() => toast.error('Error al actualizar'));
  }

  function handlePlannerCreateOT(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'VALIDATED' } : r)));
    api.validateWorkRequest(id, { action: 'APPROVE' })
      .then(async () => {
        try {
          const wo = await api.createWOFromWR({ work_request_id: id });
          toast.success(
            <span>
              OT {wo.wo_number || ''} creada desde aviso
              {onNavigateTab && (
                <button onClick={() => onNavigateTab('work-orders')} className="ml-2 underline font-semibold">
                  → Ir a Work Orders
                </button>
              )}
            </span>,
            8000
          );
        } catch {
          toast.success('Aviso aprobado. Error al crear OT — créala manualmente desde Work Orders.');
        }
      })
      .catch(() => toast.error('Error al aprobar'));
  }

  function handleStart(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'IN_PROGRESS' } : r)));
    api.startWorkRequest(id)
      .then(() => toast.success('Trabajo iniciado'))
      .catch(() => toast.error('Error al iniciar'));
  }

  function handleComplete(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED' } : r)));
    api.completeWorkRequest(id, { completion_notes: '', actual_hours: 0 })
      .then(() => toast.success(
        <span>
          Trabajo completado
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('closure')} className="ml-2 underline font-semibold">
              → Ir a Cierre
            </button>
          )}
        </span>,
        8000
      ))
      .catch(() => toast.error('Error al completar'));
  }

  function handleClose(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CLOSED' } : r)));
    api.closeWorkRequest(id, { closure_notes: '' })
      .then(() => toast.success('Aviso cerrado técnicamente'))
      .catch(() => toast.error('Error al cerrar'));
  }

  function handleDelete(id) {
    const msg = t('workRequests.confirmDelete');
    if (!window.confirm(msg !== 'workRequests.confirmDelete' ? msg : '¿Eliminar este aviso de trabajo?')) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    api.deleteWorkRequest(id).catch(() => {
      // Re-fetch on error to restore state
      api.listWorkRequests().then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setRequests(arr.map(normalizeWR));
      });
    });
  }

  function fetchAndOpenDetail(req) {
    setDetailLoading(true);
    setSelected(req); // show immediately with list data
    api.getWorkRequest(req.id)
      .then((full) => setSelected(normalizeWR(full)))
      .catch(() => {}) // keep list data on error
      .finally(() => setDetailLoading(false));
  }

  function handleOpenDetail(req) {
    // Check for duplicates before opening
    const dups = findDuplicates(req, requests);
    if (dups.length > 0 && !duplicateTarget) {
      setDuplicateTarget(req);
      setShowDuplicates(dups);
    } else {
      fetchAndOpenDetail(req);
      setDuplicateTarget(null);
      setShowDuplicates([]);
    }
  }

  function handleViewDuplicate(dup) {
    fetchAndOpenDetail(dup);
    setDuplicateTarget(null);
    setShowDuplicates([]);
  }

  function handleDismissDuplicate() {
    if (duplicateTarget) {
      fetchAndOpenDetail(duplicateTarget);
    }
    setDuplicateTarget(null);
    setShowDuplicates([]);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <FileText size={22} className="text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('workRequests.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('workRequests.subtitle')}</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {pendingCount} {t('workRequests.pendingValidation')}
            </span>
          </div>
        )}
      </div>

      {/* Scope tabs: My / Team / All */}
      <div className="flex gap-2">
        {SCOPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key === 'mine'
            ? requests.filter((r) => r.technician === user?.full_name || r.technician === user?.username || r.created_by === user?.username).length
            : tab.key === 'team'
              ? requests.filter((r) => r.plant === (user?.plant_id || 'JFC-1')).length
              : requests.length;
          return (
            <button
              key={tab.key}
              onClick={() => setScope(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                scope === tab.key
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-md shadow-[#1B5E20]/20'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              <span>{scopeLabels[tab.key]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                scope === tab.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Priority queue tabs — role-based routing (QUOTE 79 Jorge: P1/P2 → supervisor, P3/P4 → planner) */}
      {['admin', 'manager', 'planner'].includes(user?.role) && (
        <div className="flex gap-2">
          {[
            { key: 'all', label: t('workRequests.queueAll'), icon: Globe, color: 'bg-gray-600' },
            { key: 'supervisor', label: t('workRequests.queueSupervisor'), icon: Zap, color: 'bg-red-600' },
            { key: 'planner', label: t('workRequests.queuePlanner'), icon: Wrench, color: 'bg-blue-600' },
          ].map((q) => {
            const Icon = q.icon;
            const cnt = q.key === 'all' ? scopeFiltered.length
              : q.key === 'supervisor' ? scopeFiltered.filter((r) => ['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length
              : scopeFiltered.filter((r) => !['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length;
            const pendCnt = q.key === 'all' ? scopeFiltered.filter((r) => r.status === 'PENDING_VALIDATION').length
              : q.key === 'supervisor' ? scopeFiltered.filter((r) => r.status === 'PENDING_VALIDATION' && ['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length
              : scopeFiltered.filter((r) => r.status === 'PENDING_VALIDATION' && !['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length;
            return (
              <button
                key={q.key}
                onClick={() => setPriorityQueue(q.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  priorityQueue === q.key
                    ? `${q.color} text-white border-transparent shadow-md`
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                <Icon size={16} />
                <span>{q.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  priorityQueue === q.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>{cnt}</span>
                {pendCnt > 0 && q.key !== 'all' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">{pendCnt}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Duplicate Warning */}
      {showDuplicates.length > 0 && (
        <DuplicateWarning
          duplicates={showDuplicates}
          onViewDuplicate={handleViewDuplicate}
          onDismiss={handleDismissDuplicate}
          t={t}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('workRequests.searchPlaceholder')}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] transition-colors placeholder:text-muted-foreground"
          />
        </div>

        {/* Status Buttons */}
        <div className="flex flex-wrap gap-2">
          {STATUS_KEYS.map((key) => {
            const count = key === 'ALL'
              ? queueFiltered.length
              : queueFiltered.filter((r) => r.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {statusLabels[key] ?? key}
                <span className={`ml-1.5 text-xs ${statusFilter === key ? 'text-green-200' : 'text-muted-foreground'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">{t('common.loading')}</span>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('equipment_name')}>
                    {t('workRequests.requestId')} / {t('workRequests.equipmentName')} {sortField === 'equipment_name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('workRequests.failureDesc')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('priority_requested')}>
                    {t('common.priority')} {sortField === 'priority_requested' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                    {t('common.status')} {sortField === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('ai_confidence')}>
                    {t('workRequests.aiConfidence')} {sortField === 'ai_confidence' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      {t('common.noData')}
                    </td>
                  </tr>
                )}
                {paged.map((req) => {
                  const priorityChanged = req.priority_requested !== req.priority_suggested;
                  const isPending = req.status === 'PENDING_VALIDATION';
                  const truncatedDesc =
                    req.failure_description.length > 60
                      ? req.failure_description.slice(0, 60) + '...'
                      : req.failure_description;
                  const hasDuplicates = findDuplicates(req, requests).length > 0;

                  const isFastTrackWR = ['P1', 'P2'].includes(req.priority_requested);

                  return (
                    <tr key={req.id} className={`hover:bg-muted/30 transition-colors ${isFastTrackWR && isPending ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      {/* ID / Equipment */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {hasDuplicates && (
                            <span title={t('workRequests.duplicateWarning')} className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="font-mono text-xs text-muted-foreground">{req.id}</p>
                              {isFastTrackWR && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                                  <Zap size={8} /> FAST TRACK
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-foreground text-xs">{req.equipment_name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{req.equipment_tag}</p>
                          </div>
                        </div>
                      </td>

                      {/* Failure */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-foreground/80 text-xs mb-1">{truncatedDesc}</p>
                        <span className="text-xs bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded font-mono">
                          {req.failure_mode}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${priorityColor(req.priority_requested)}`}>
                            {req.priority_requested}
                          </span>
                          {priorityChanged && (
                            <>
                              <span className="text-amber-500 text-xs font-bold">→</span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${priorityColor(req.priority_suggested)}`}>
                                {req.priority_suggested}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${statusColor(req.status)}`}>
                          {statusLabels[req.status] ?? req.status}
                        </span>
                      </td>

                      {/* AI Confidence */}
                      <td className="px-4 py-3">
                        <ConfidenceBar value={req.ai_confidence} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(req)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={t('common.details')}
                          >
                            <Eye size={16} />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleValidate(req.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                                title={t('workRequests.validate')}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                title={t('common.reject')}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {['VALIDATED', 'ASSIGNED', 'SCHEDULED'].includes(req.status) && (
                            <button
                              onClick={() => handleStart(req.id)}
                              className="text-[10px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                              title="Iniciar trabajo"
                            >
                              Iniciar
                            </button>
                          )}
                          {req.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleComplete(req.id)}
                              className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
                              title="Completar trabajo"
                            >
                              Completar
                            </button>
                          )}
                          {req.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleClose(req.id)}
                              className="text-[10px] px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 font-medium transition-colors"
                              title="Cierre técnico"
                            >
                              Cerrar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title={t('common.delete') || 'Eliminar'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('workRequests.showingOf', { shown: paged.length, total: sorted.length })}</span>
            <div className="flex items-center gap-3">
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronLeft size={14} /></button>
                  <span className="font-medium">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{t('workRequests.updatedAt', { time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onValidate={handleValidate}
          onReject={handleReject}
          onCancel={handleCancel}
          onStart={handleStart}
          onComplete={handleComplete}
          onCloseWR={handleClose}
          onSaveEdit={handleSaveEdit}
          onPlannerCreateOT={handlePlannerCreateOT}
          userRole={user?.role}
          t={t}
        />
      )}
    </div>
  );
}
