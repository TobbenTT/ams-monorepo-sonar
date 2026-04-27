import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, XCircle, Eye, Filter, Clock, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Users, User, Globe, ImageOff, Search,
  Wrench, Tag, MapPin, Gauge, Package, Calendar, FileText, Trash2, Zap,
  Save, Download, X, Info, ArrowRight, Maximize2, Minimize2
} from 'lucide-react';
import { statusColor, priorityColor } from '../data/mockData';
import * as api from '../api';
import { getCriticalityScore } from '../api';
// Reopen handler for admin
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { downloadExport } from '../utils/exportFile';

/* ─── Status config (dynamic with i18n) ─── */

function MaterialEditor({ materials, onChange }) {
  const [searchIdx, setSearchIdx] = useState(-1);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState('');
  const searchTimer = useRef(null);

  const handleSearch = (text, idx) => {
    setSearchText(text);
    setSearchIdx(idx);
    clearTimeout(searchTimer.current);
    if (text.length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await api.searchMaterials(text);
        setSearchResults(Array.isArray(res) ? res : []);
      } catch { setSearchResults([]); }
    }, 300);
  };

  const selectMaterial = (mat, idx) => {
    const arr = [...materials];
    arr[idx] = { ...arr[idx], sapId: mat.sapId, description: mat.description, unit: mat.unit };
    onChange(arr);
    setSearchIdx(-1);
    setSearchResults([]);
    setSearchText('');
  };

  const updateField = (idx, field, value) => {
    const arr = [...materials];
    arr[idx] = { ...(typeof arr[idx] === 'object' ? arr[idx] : { description: arr[idx] }), [field]: value };
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[90px_1fr_60px_50px_30px] gap-2 text-xs text-muted-foreground font-semibold">
        <span>SAP ID</span><span>Description</span><span>Cant</span><span>Ud</span><span></span>
      </div>
      {materials.map((m, i) => {
        const mat = typeof m === 'object' ? m : { description: m, quantity: 1 };
        return (
          <div key={i} className="relative">
            <div className="grid grid-cols-[90px_1fr_60px_50px_30px] gap-2 items-center">
              <input type="text" value={mat.sapId || ''} readOnly
                className="text-xs px-2 py-1.5 border border-border rounded bg-muted font-mono text-muted-foreground" />
              <div className="relative">
                <input type="text" value={searchIdx === i ? searchText : (mat.description || '')}
                  onChange={e => handleSearch(e.target.value, i)}
                  onFocus={() => { setSearchIdx(i); setSearchText(mat.description || ''); }}
                  placeholder="Search material..."
                  className="w-full text-sm px-2 py-1.5 border border-border rounded bg-background" />
                {searchIdx === i && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                    {searchResults.map((r, j) => (
                      <button key={j} onClick={() => selectMaterial(r, i)}
                        className="w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-blue-50 text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{r.sapId}</span>
                        <span>{r.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">({r.unit})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="number" min="1" value={mat.quantity || 1} onChange={e => updateField(i, 'quantity', parseInt(e.target.value) || 1)}
                className="text-sm px-2 py-1.5 border border-border rounded bg-background text-center" />
              <select value={mat.unit || 'PZ'} onChange={e => updateField(i, 'unit', e.target.value)}
                className="text-xs px-1 py-1.5 border border-border rounded bg-background">
                <option>PZ</option><option>KG</option><option>LT</option><option>MT</option><option>UD</option>
              </select>
              <button onClick={() => onChange(materials.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">&times;</button>
            </div>
          </div>
        );
      })}
      <button onClick={() => onChange([...materials, { sapId: '', description: '', quantity: 1, unit: 'PZ' }])}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add material</button>
    </div>
  );
}

const STATUS_KEYS = ['ALL', 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'CERRADO'];

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

/* ─── Confidence Bar con tooltip (Jorge 2026-04-22 #11) ─── */
function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = value >= 90 ? 'text-emerald-700 dark:text-emerald-400' : value >= 75 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';
  const tooltip = 'Nivel de confianza del análisis IA (0-100%). Se calcula ' +
    'combinando: match del equipo contra el maestro, claridad del texto del ' +
    'aviso, coincidencia con catálogo de fallas, y similitud con WRs pasados ' +
    'del mismo equipo. ≥90% = alta · 75-89% = media · <75% = revisar.';
  return (
    <div className="flex items-center gap-2 min-w-[100px]" title={tooltip}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${textColor}`}>{value}%</span>
      <span className="text-[9px] text-muted-foreground cursor-help">ⓘ</span>
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

/* ─── Duplicate Carousel with Side-by-Side Comparison ─── */
function DuplicateWarning({ duplicates, onViewDuplicate, onDismiss, t, currentRequest }) {
  const [dismissed, setDismissed] = React.useState([]);
  const [idx, setIdx] = React.useState(0);
  const visible = (duplicates || []).filter((_, i) => !dismissed.includes(i));
  if (visible.length === 0) return null;
  const current = currentRequest || {};
  const safeIdx = Math.min(idx, visible.length - 1);
  const dup = visible[safeIdx];

  const dismissOne = () => {
    const realIdx = (duplicates || []).indexOf(dup);
    setDismissed(prev => [...prev, realIdx]);
    if (safeIdx >= visible.length - 1) setIdx(Math.max(0, safeIdx - 1));
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">{visible.length} Possible Duplicate{visible.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          {visible.length > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setIdx(Math.max(0, safeIdx - 1))} disabled={safeIdx === 0}
                className="w-6 h-6 rounded-full bg-white border border-amber-200 flex items-center justify-center disabled:opacity-30 text-amber-700 hover:bg-amber-100">
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-bold text-amber-700 min-w-[32px] text-center">{safeIdx + 1}/{visible.length}</span>
              <button onClick={() => setIdx(Math.min(visible.length - 1, safeIdx + 1))} disabled={safeIdx >= visible.length - 1}
                className="w-6 h-6 rounded-full bg-white border border-amber-200 flex items-center justify-center disabled:opacity-30 text-amber-700 hover:bg-amber-100">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          <button onClick={onDismiss} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold">
            Dismiss All
          </button>
        </div>
      </div>

      {/* Side-by-side: Current vs Duplicate */}
      <div className="grid grid-cols-2 gap-2">
        {/* Current */}
        <div className="bg-white rounded-lg border border-blue-200 p-2.5">
          <div className="text-[10px] font-bold text-blue-600 uppercase mb-1.5">Current</div>
          <p className="text-xs font-semibold text-gray-800 truncate">{current.equipment_name || current.equipment_tag || '—'}</p>
          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{current.failure_description || current.description || '—'}</p>
          <div className="flex gap-2 mt-1.5">
            <span className={`text-[10px] font-bold ${current.priority === 'P1' ? 'text-red-600' : current.priority === 'P2' ? 'text-orange-600' : 'text-gray-500'}`}>{current.priority || '—'}</span>
            <span className="text-[10px] text-gray-400">{current.status || '—'}</span>
          </div>
        </div>

        {/* Duplicate */}
        <div className="bg-amber-50 rounded-lg border-2 border-amber-300 p-2.5 relative">
          <button onClick={dismissOne} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors" title="Not a duplicate">
            <X size={10} />
          </button>
          <div className="text-[10px] font-bold text-amber-700 uppercase mb-1.5">Duplicate #{safeIdx + 1}</div>
          <p className="text-xs font-semibold text-gray-800 truncate pr-5">{dup.equipment_name || dup.equipment_tag || '—'}</p>
          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{dup.failure_description || dup.description || '—'}</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-2">
              <span className={`text-[10px] font-bold ${dup.priority === 'P1' ? 'text-red-600' : dup.priority === 'P2' ? 'text-orange-600' : 'text-gray-500'}`}>{dup.priority || 'P3'}</span>
              <span className={`text-[10px] font-bold ${dup.status === 'APROBADO' ? 'text-green-600' : 'text-gray-500'}`}>{dup.status}</span>
            </div>
            <button onClick={() => onViewDuplicate(dup)} className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-800 hover:bg-amber-300 font-semibold">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {visible.length > 1 && (
        <div className="flex justify-center gap-1">
          {visible.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === safeIdx ? 'bg-amber-600' : 'bg-amber-200 hover:bg-amber-400'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Detail Modal (expanded + editable for supervisor) ─── */
function DetailModal({ item, duplicates = [], onOpenDuplicate, onClose, onValidate, onReject, onCancel, onStart, onComplete, onCloseWR, onSaveEdit, onPlannerCreateOT, onGoToOT, onToggleFullScreen, isFullScreen, userRole, t, _isInCarousel, _isDuplicate }) {
  if (!item) return null;
  const isPending = ['PENDING_VALIDATION', 'PENDIENTE'].includes(item.status);
  const isValidated = ['VALIDATED', 'APROBADO'].includes(item.status);
  const canStart = ['VALIDATED', 'ASSIGNED', 'SCHEDULED', 'APROBADO'].includes(item.status);
  const canComplete = item.status === 'IN_PROGRESS';
  const canClose = item.status === 'COMPLETED';
  const isSupervisor = ['admin', 'manager'].includes(userRole);
  const isPlanner = userRole === 'planner';
  // Jorge (2026-04-20): un aviso rechazado debe poder editarse para corregir
  // lo observado y volver a lanzarlo — el reject es "devolver", no "cerrar".
  // Se permite Edit también en RECHAZADO / REJECTED.
  const canEdit = (isSupervisor || isPlanner) && !['COMPLETED', 'CLOSED', 'CANCELLED', 'CERRADO', 'CANCELADO'].includes(item.status);
  const isRejected = ['RECHAZADO', 'REJECTED'].includes(item.status);

  // Editable state (supervisor can edit before approving)
  const [editing, setEditing] = useState(false);
  const [dupIdx, setDupIdx] = useState(0);
  const [impactScore, setImpactScore] = useState(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  useEffect(() => {
    setImpactScore(null);
    setShowScoreBreakdown(false);
    // normalizeWR() maps request_id → id, so the normalized item has .id (not .request_id)
    const rid = item.id || item._raw?.request_id || item.request_id;
    if (!rid) return;
    api.getWorkRequestImpactScore(rid).then(setImpactScore).catch(() => setImpactScore(null));
  }, [item.id]);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const CHECKLIST_COUNT = 4;
  const allChecked = checkedItems.size >= CHECKLIST_COUNT;
  const [editData, setEditData] = useState({
    failure_description: item.failure_description || '',
    priority_requested: item.priority_requested || 'P3',
    failure_mode: item.failure_mode || '',
    estimated_duration: item.estimated_duration || '',
    production_impact: item.production_impact || 'MEDIUM',
    suggested_action: (item.suggested_action || '').replace(/(\d+)\.\s/g, (m, num) => num === '1' ? m : '\n' + m),
    wo_title: item.wo_title || '',
    photos: Array.isArray(item.photos) ? [...item.photos] : [],
    failure_category: item.failure_category || '',
    failure_symptom: item.failure_symptom || '',
    failure_cause: item.failure_cause || '',
    support_equipment: Array.isArray(item.support_equipment) ? [...item.support_equipment] : [],
    resources: Array.isArray(item.resources) ? item.resources.map(r => {
      if (typeof r === "object") return { ...r };
      const m = String(r).match(/^(.+?)\s*x\s*(\d+)\s*\((\d+\.?\d*)h\)$/i);
      if (m) return { type: m[1].trim(), quantity: parseInt(m[2]) || 1, hours: parseFloat(m[3]) || 4 };
      return { type: r, quantity: 1, hours: 4 };
    }) : [],
    materials: Array.isArray(item.materials) ? item.materials.map(m => typeof m === "string" ? { description: m, quantity: 1 } : { ...m }) : [],
  });

  const statusLabels = {
    PENDIENTE: 'Pending',
    PENDING_VALIDATION: 'Pending',
    APROBADO: 'Approved',
    VALIDATED: 'Approved',
    RECHAZADO: 'Rejected',
    REJECTED: 'Rejected',
    CANCELADO: 'Cancelled',
    CANCELLED: 'Cancelled',
    CERRADO: 'Closed',
    CLOSED: 'Closed',
    DRAFT: 'Pending',
    ASSIGNED: 'Approved',
    IN_PROGRESS: 'Approved',
    COMPLETED: 'Closed',
  };

  const impactLabels = {
    CRITICAL: t('workRequests.impactCritical'),
    HIGH: t('workRequests.impactHigh'),
    MEDIUM: t('workRequests.impactMedium'),
    LOW: t('workRequests.impactLow'),
  };

  const handleSaveAndApprove = () => {
    if (!allChecked) {
      alert('Debe completar todos los items de la Lista de Verificacion antes de aprobar.');
      return;
    }
    if (editing) onSaveEdit(item.id, editData);
    onValidate(item.id);
    onClose();
  };

  const modalContent = (
      <div
        className={`relative bg-card rounded-2xl shadow-2xl w-full overflow-y-auto ${isFullScreen ? 'max-h-[95vh]' : 'max-h-[90vh]'} ${_isDuplicate ? 'border-2 border-red-400 ring-2 ring-red-200' : 'border border-border'}`}
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
                  onClick={(e) => { e.stopPropagation(); navigate('/work-orders'); }}>
                  OT: {item.wo_number}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{(() => { try { const ai = typeof item.ai_classification === 'string' ? JSON.parse(item.ai_classification) : item.ai_classification; return ai?.wo_title || item.equipment_name; } catch { return item.equipment_name; } })()}</h2>
            <p className="text-xs font-mono text-muted-foreground">{/^\d{8,}$/.test(item.equipment_tag) ? (item.equipment_name || item.equipment_tag) : item.equipment_tag}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const wr = item;
              const pd = typeof wr.problem_description === 'object' ? wr.problem_description : {};
              const ai = typeof wr.ai_classification === 'object' ? wr.ai_classification : {};
              const resources = wr.resources || pd.resources || [];
              const materials = wr.materials || pd.materials || [];
              const w = window.open('', '_blank');
              w.document.write(`<!DOCTYPE html><html><head><title>Aviso ${wr.id || ''}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #047857, #065f46); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
  .header h1 { font-size: 22px; margin-bottom: 5px; }
  .header .subtitle { opacity: 0.8; font-size: 13px; }
  .header .id { font-family: monospace; font-size: 14px; margin-top: 10px; background: rgba(255,255,255,0.15); display: inline-block; padding: 4px 12px; border-radius: 6px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 14px; font-weight: 700; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #047857; border-bottom: 2px solid #047857; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px; }
  .text-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; }
  .catalog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .catalog-item { text-align: center; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
  .cat-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .cat-yellow { background: #fefce8; color: #a16207; border: 1px solid #fde68a; }
  .cat-red { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #6b7280; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
  .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  .priority { display: inline-block; padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 12px; }
  .p1, .p2 { background: #fef2f2; color: #dc2626; }
  .p3 { background: #fefce8; color: #ca8a04; }
  .p4 { background: #eff6ff; color: #2563eb; }
  @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="header">
  <h1>Reporte de Aviso de Trabajo</h1>
  <div class="subtitle">AMS — Asset Management Software</div>
  <div class="id">${wr.id || wr.request_id || ''}</div>
</div>

<div class="grid">
  <div class="card"><div class="label">Status</div><div class="value">${wr.status || '-'}</div></div>
  <div class="card"><div class="label">Priority</div><div class="value"><span class="priority ${(wr.priority_requested||'p3').toLowerCase()}">${wr.priority_requested || wr.priority || '-'}</span></div></div>
  <div class="card"><div class="label">Clase Actividad</div><div class="value">${ai.activity_class || '-'}</div></div>
  <div class="card"><div class="label">Equipo / TAG</div><div class="value">${wr.equipment_tag || '-'}</div></div>
  <div class="card"><div class="label">Equipo Nombre</div><div class="value">${wr.equipment_name || '-'}</div></div>
  <div class="card"><div class="label">Duracion Estimada</div><div class="value">${wr.estimated_duration || ai.estimated_duration_hours || '-'}h</div></div>
  <div class="card"><div class="label">Created By</div><div class="value">${wr.created_by || '-'}</div></div>
  <div class="card"><div class="label">Fecha Creacion</div><div class="value">${wr.created_at ? new Date(wr.created_at).toLocaleDateString('es-CL') : '-'}</div></div>
  <div class="card"><div class="label">Plant</div><div class="value">${ai.plant_id || 'OCP-JFC1'}</div></div>
</div>

<div class="section">
  <div class="section-title">Description de Falla</div>
  <div class="text-box">${pd.original_text || wr.failure_description || '-'}</div>
</div>

<div class="section">
  <div class="section-title">Suggested Action</div>
  <div class="text-box">${wr.suggested_action || pd.suggested_action || '-'}</div>
</div>

<div class="section">
  <div class="section-title">Catalogo de Falla</div>
  <div class="catalog-grid">
    <div class="catalog-item cat-blue"><div style="font-size:10px;color:#6b7280">Categoria</div>${wr.failure_category || pd.failure_mode_detected || '-'}</div>
    <div class="catalog-item cat-yellow"><div style="font-size:10px;color:#6b7280">Sintoma</div>${wr.failure_symptom || pd.failure_symptom || '-'}</div>
    <div class="catalog-item cat-red"><div style="font-size:10px;color:#6b7280">Causa</div>${wr.failure_cause || pd.failure_cause || '-'}</div>
  </div>
</div>

${resources.length ? `<div class="section">
  <div class="section-title">Labour</div>
  <table><thead><tr><th>Specialty</th><th>Quantity</th><th>Hours</th></tr></thead><tbody>
  ${resources.map(r => typeof r === 'string' ? `<tr><td colspan="3">${r}</td></tr>` : `<tr><td>${r.type||''}</td><td>${r.quantity||1}</td><td>${r.hours||0}h</td></tr>`).join('')}
  </tbody></table>
</div>` : ''}

${materials.length ? `<div class="section">
  <div class="section-title">Spare Parts and Materials</div>
  <table><thead><tr><th>SAP ID</th><th>Description</th><th>Qty</th><th>Unit</th></tr></thead><tbody>
  ${materials.map(m => typeof m === 'string' ? `<tr><td colspan="4">${m}</td></tr>` : `<tr><td style="font-family:monospace">${m.sapId||''}</td><td>${m.description||''}</td><td>${m.quantity||1}</td><td>${m.unit||'PZ'}</td></tr>`).join('')}
  </tbody></table>
</div>` : ''}

<div class="footer">
  Generado automaticamente — AMS — ${new Date().toLocaleString('es-CL')}
</div>

<script>setTimeout(() => window.print(), 500);<\/script>
</body></html>`);
              w.document.close();
            }} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <Download size={12} /> PDF Report
            </button>
            {canEdit && !editing && (
            <button onClick={() => {
              // Re-hidratar editData con valores actuales antes de editar
              // (fix Jorge 2026-04-27: campos categoría/síntoma/causa no se recuperaban).
              setEditData({
                failure_description: item.failure_description || '',
                priority_requested: item.priority_requested || 'P3',
                failure_mode: item.failure_mode || '',
                estimated_duration: item.estimated_duration || '',
                production_impact: item.production_impact || 'MEDIUM',
                suggested_action: (item.suggested_action || '').replace(/(\d+)\.\s/g, (m, num) => num === '1' ? m : '\n' + m),
                wo_title: item.wo_title || '',
                photos: Array.isArray(item.photos) ? [...item.photos] : [],
                failure_category: item.failure_category || '',
                failure_symptom: item.failure_symptom || '',
                failure_cause: item.failure_cause || '',
                support_equipment: Array.isArray(item.support_equipment) ? [...item.support_equipment] : [],
                resources: Array.isArray(item.resources) ? item.resources.map(r => {
                  if (typeof r === 'object') return { ...r };
                  const m = String(r).match(/^(.+?)\s*x\s*(\d+)\s*\((\d+\.?\d*)h\)$/i);
                  if (m) return { type: m[1].trim(), quantity: parseInt(m[2]) || 1, hours: parseFloat(m[3]) || 4 };
                  return { type: r, quantity: 1, hours: 4 };
                }) : [],
                materials: Array.isArray(item.materials) ? item.materials.map(m => typeof m === 'string' ? { description: m, quantity: 1 } : { ...m }) : [],
              });
              setEditing(true);
            }} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-semibold hover:bg-amber-100 transition-colors">
                Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Duplicates shown in carousel wrapper, not here */}
        {/* Duplicates indicator - panels shown beside this modal */}

        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('workRequests.photos')}</p>
            {/* Jorge 2026-04-24: agregar/quitar fotos en modo edit */}
            {editing && (
              <label className="text-[10px] font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-1">
                + Agregar foto
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={async e => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const toBase64 = (f) => new Promise((res, rej) => {
                      const r = new FileReader();
                      r.onload = () => res(r.result);
                      r.onerror = rej;
                      r.readAsDataURL(f);
                    });
                    try {
                      const dataUrls = await Promise.all(files.map(toBase64));
                      setEditData(d => ({ ...d, photos: [...(d.photos || []), ...dataUrls] }));
                      e.target.value = '';
                    } catch { toast.error('Error leyendo imagen'); }
                  }} />
              </label>
            )}
          </div>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {(editData.photos || []).map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p} alt={`foto-${i}`} className="w-24 h-24 object-cover rounded-lg border border-border" />
                  <button type="button"
                    onClick={() => setEditData(d => ({ ...d, photos: (d.photos || []).filter((_, j) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Quitar foto">×</button>
                </div>
              ))}
              {(!editData.photos || editData.photos.length === 0) && (
                <div className="text-xs text-muted-foreground italic py-3">Sin fotos. Click "+ Agregar foto" para subir desde tu PC/móvil.</div>
              )}
            </div>
          ) : (
            <PhotoCarousel photos={item.photos} t={t} />
          )}
        </div>

        {/* Detail Grid */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DetailCard icon={MapPin} label={t('workRequests.plantArea')} value={`${item.plant} / ${item.area}`} />
          {/* Jorge 2026-04-24 14:18: TL + TAG DENTRO del modal aviso */}
          <DetailCard icon={MapPin} label="Ubic. Técnica" value={item.technical_location || '—'} />
          <DetailCard icon={Tag} label="Equipo / TAG" value={item.equipment_tag || '—'} />
          <DetailCard icon={User} label="Created By" value={item.created_by || '-'} />
            <DetailCard icon={CheckCircle} label="Approved By" value={item.approver_id || (["Approved","APROBADO","VALIDATED"].includes(item.status) ? "Supervisor" : "—")} />
          <DetailCard icon={Clock} label={t('workRequests.estimatedDuration')}>
            {editing ? (
              <input type="number" min="0" step="0.5" inputMode="decimal"
                value={editData.estimated_duration}
                onChange={e => setEditData(d => ({ ...d, estimated_duration: e.target.value.replace(/[^\d.]/g, '') }))}
                onKeyDown={e => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                className="w-full text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" />
            ) : (
              <span className="text-sm font-medium text-foreground">{item.estimated_duration}h</span>
            )}
          </DetailCard>
          <DetailCard icon={Gauge} label={t('workRequests.productionImpact')}>
            {editing ? (
              /* Jorge 2026-04-24 14:18: "automático PERO modificable" — se
                 pre-popula derivado de priority pero el planner puede sobreescribirlo. */
              <select value={editData.production_impact || 'MEDIUM'}
                onChange={e => setEditData(d => ({ ...d, production_impact: e.target.value }))}
                className="text-xs px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(v => <option key={v} value={v}>{impactLabels[v]}</option>)}
              </select>
            ) : (() => {
              // Prefer real multi-criteria score when available
              const label = impactScore?.impact_label || item.production_impact;
              const score = impactScore?.total_score;
              return (
                <button
                  type="button"
                  onClick={() => impactScore && setShowScoreBreakdown(s => !s)}
                  disabled={!impactScore}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${IMPACT_COLOR[label] ?? 'bg-muted text-muted-foreground'} ${impactScore ? 'hover:ring-2 hover:ring-primary/30 cursor-pointer' : 'cursor-default'}`}
                  title={impactScore ? 'Click para ver cómo se calcula' : 'Loading...'}>
                  {impactLabels[label] ?? label}
                  {score != null && <span className="ml-1 opacity-70">· {Math.round(score)}</span>}
                  {impactScore && <Info size={10} className="opacity-60" />}
                </button>
              );
            })()}
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
            <DetailCard icon={Wrench} label="Activity Class" value={item.activity_class} />
          )}
          {item.plant_condition && (
            <DetailCard icon={Zap} label="Required Condition" value={item.plant_condition} />
          )}
          {item.created_at && (
            <DetailCard icon={Calendar} label={t('workRequests.createdAt')} value={new Date(item.created_at).toLocaleDateString()} />
          )}
          {item.notification_type && (
            <DetailCard icon={FileText} label="Notification Type" value={item.notification_type} />
          )}
          {item.work_class && (
            <DetailCard icon={Tag} label="Work Class" value={item.work_class} />
          )}
          {item.wo_number && (
            <div className="bg-white dark:bg-card rounded-xl border border-border px-3 py-2.5 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">OT Vinculada</p>
                {/* Jorge (2026-04-20): link bidireccional — desde el aviso se puede
                    saltar a la OT. Abre en nueva pestaña para no perder el detalle. */}
                <button
                  onClick={() => window.open(
                    `/work-management?tab=planning&openWo=${encodeURIComponent(item.wo_number)}`,
                    '_blank', 'noopener,noreferrer'
                  )}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-900 underline font-mono"
                  title="Ver OT vinculada (nueva pestaña)"
                >
                  {item.wo_number} ↗
                </button>
              </div>
            </div>
          )}
          {item.assigned_to_name && (
            <DetailCard icon={Users} label="Asignado a" value={item.assigned_to_name} />
          )}
          {item.sla_deadline && (
            <DetailCard icon={Clock} label="SLA Deadline"
              value={new Date(item.sla_deadline).toLocaleDateString()}
              title="SLA = Service Level Agreement. Fecha tope según la prioridad: P1<24h, P2<7d, P3>7d, P4 parada de plantas." />
          )}
        </div>

        {/* Impact Score Breakdown (collapsible, shown below grid) */}
        {showScoreBreakdown && impactScore && (
          <div className="mx-6 mb-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-foreground">¿Cómo se calcula? (100 = mayor impacto)</div>
              <button onClick={() => setShowScoreBreakdown(false)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { key: 'criticality',       label: 'Criticidad equipo',    ctx: impactScore.context.criticality_class },
                { key: 'health_score',      label: 'Health score',         ctx: impactScore.context.health_composite != null ? `${Math.round(impactScore.context.health_composite)}/100` : 'sin data' },
                { key: 'sla_proximity',     label: 'Proximidad SLA',       ctx: impactScore.context.sla_remaining_hours != null ? `${Math.round(impactScore.context.sla_remaining_hours)}h / ${impactScore.context.sla_total_hours}h` : 'sin SLA' },
                { key: 'failure_frequency', label: 'Fallas últimos 12m',   ctx: `${impactScore.context.failure_count_12m} correctivas` },
                { key: 'cost_of_deferral',  label: 'Costo de postergar',   ctx: `${impactScore.context.estimated_hours}h estimadas` },
                { key: 'safety_impact',     label: 'Impacto de seguridad', ctx: impactScore.context.safety_flags ? 'flag' : (item.priority_requested === 'P1' || item.priority_requested === 'P2' ? 'fast-track' : 'estándar') },
              ].map(row => {
                const weight = impactScore.weights[row.key];
                const contribution = impactScore.contributions[row.key];
                const barPct = Math.min(100, (contribution / weight) * 100);
                return (
                  <div key={row.key} className="flex items-center gap-2">
                    <div className="w-36 text-foreground/80 truncate" title={row.label}>{row.label}</div>
                    <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${barPct}%` }}></div>
                    </div>
                    <div className="w-28 text-right text-muted-foreground text-[10px]">{row.ctx}</div>
                    <div className="w-16 text-right font-mono">
                      <span className="font-semibold text-foreground">{contribution}</span>
                      <span className="text-muted-foreground"> / {weight}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-border">
                <div className="w-36 font-semibold">Total</div>
                <div className="flex-1" />
                <div className="w-44 text-right font-mono font-bold">{impactScore.total_score} / 100 · {impactLabels[impactScore.impact_label] ?? impactScore.impact_label}</div>
              </div>
            </div>
            {impactScore.alerts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {impactScore.alerts.map(a => (
                  <span key={a} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
                    {a === 'SLA_BREACH_RISK' ? '⚠️ SLA en riesgo' : a === 'CHRONIC_EQUIPMENT' ? '🔁 Equipo crónico' : a === 'SAFETY_FLAG' ? '🛡️ Seguridad' : a}
                  </span>
                ))}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground mt-2 italic">
              Pesos: criticidad 25% · health 20% · SLA 20% · frecuencia 15% · costo 10% · seguridad 10%
            </div>
          </div>
        )}

        {/* WO Title — Jorge 2026-04-24 (obs doc): debe ser editable */}
        {(item.wo_title || editing) && (
          <div className="px-6 pb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Work Order Title</p>
            {editing ? (
              <input type="text" value={editData.wo_title || ''}
                onChange={e => setEditData(d => ({ ...d, wo_title: e.target.value }))}
                className="w-full text-base font-bold text-foreground bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="Título para la OT (arrastrado desde el aviso)" />
            ) : (
              <p className="text-base font-bold text-foreground bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">{item.wo_title}</p>
            )}
          </div>
        )}

        {/* Rejection Reason — visible si el aviso está rechazado (Jorge pidió
            poder leer el motivo sin entrar a la auditoría). */}
        {['RECHAZADO', 'REJECTED'].includes(item.status) && (
          <div className="px-6 pb-4">
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wide text-red-700">Rejection Reason</p>
              </div>
              <p className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap">
                {item.rejection_reason || item.validation?.rejection_reason || <span className="italic text-red-500">No reason recorded</span>}
              </p>
              {(item.rejected_by || item.approver_id) && (
                <p className="text-[11px] text-red-600 mt-2">
                  Rejected by {item.rejected_by || item.approver_id}
                  {item.rejected_at || item.approved_at ? ` · ${new Date(item.rejected_at || item.approved_at).toLocaleString()}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Failure Description */}
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('workRequests.failureDesc')}</p>
          {editing ? (
            <textarea value={editData.failure_description} onChange={e => setEditData(d => ({ ...d, failure_description: e.target.value }))}
              rows={6} className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-y" />
          ) : (
            <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-3 border border-border">
              {item.failure_description}
            </p>
          )}

        </div>

        {/* Original Request (raw text from technician) */}
        {item.original_text && item.original_text !== item.failure_description && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Original Request</p>
            <p className="text-sm text-muted-foreground italic leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200">
              "{item.original_text}"
            </p>
          </div>
        )}

        {/* Failure Classification */}
        {(item.failure_category || item.failure_symptom || item.failure_cause || editing) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Failure Classification</p>
            {editing ? (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
                {/* Jorge 2026-04-27: labels EN (los enum values quedan ES por compat DB) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Category:</span>
                  <select value={editData.failure_category || ''} onChange={e => setEditData(d => ({ ...d, failure_category: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30">
                    <option value="">— Seleccionar —</option>
                    <option>MECANICO</option><option>ELECTRICO</option><option>INSTRUMENTACION</option>
                    <option>ESTRUCTURAL</option><option>HIDRAULICO</option><option>NEUMATICO</option>
                    <option>LUBRICACION</option><option>OTRO</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Symptom:</span>
                  <select value={editData.failure_symptom || ''} onChange={e => setEditData(d => ({ ...d, failure_symptom: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30">
                    <option value="">— Seleccionar —</option>
                    <option>FUGA</option><option>VIBRACION</option><option>RUIDO</option>
                    <option>SOBRETEMPERATURA</option><option>NO ARRANCA</option><option>BAJO RENDIMIENTO</option>
                    <option>CORROSION</option><option>DESGASTE</option><option>ROTURA</option>
                    <option>OBSTRUCCION</option><option>DESALINEACION</option><option>OTRO</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Cause:</span>
                  <select value={editData.failure_cause || ''} onChange={e => setEditData(d => ({ ...d, failure_cause: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30">
                    <option value="">— Seleccionar —</option>
                    <option>DESGASTE NORMAL</option><option>FATIGA</option><option>CORROSION</option>
                    <option>MAL MANTENIMIENTO</option><option>SOBRECARGA</option><option>CONTAMINACION</option>
                    <option>MAL MONTAJE</option><option>DEFECTO FABRICACION</option><option>OPERACION FUERA RANGO</option>
                    <option>DESCONOCIDA</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
                {item.failure_object_part && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground min-w-[80px]">Object Part:</span>
                    <span className="text-sm font-medium text-foreground">{item.failure_object_part}</span>
                  </div>
                )}
                {item.failure_symptom && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground min-w-[80px]">Symptom:</span>
                    <span className="text-sm font-medium text-foreground">{item.failure_symptom}</span>
                  </div>
                )}
                {item.failure_cause && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground min-w-[80px]">Cause:</span>
                    <span className="text-sm font-medium text-foreground">{item.failure_cause}</span>
                  </div>
                )}
                {item.failure_category && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground min-w-[80px]">Category:</span>
                    <span className="text-sm font-medium text-foreground">{item.failure_category}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Jorge 2026-04-24 (obs doc): "Failure Short Description" eliminado del detalle
            — duplica info que ya está en Síntoma/Causa/Categoría de Clasificación. */}

        {/* Suggested Action */}
        {(item.suggested_action || editing) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Acción Sugerida</p>
            {editing ? (
              <textarea value={editData.suggested_action || ''} onChange={e => setEditData(d => ({ ...d, suggested_action: e.target.value }))}
                rows={10} placeholder="¿Qué se debe hacer?"
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-y" />
            ) : /\d{1,2}\.\s/.test(item.suggested_action) ? (
              <div className="space-y-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                {(() => {
                  const steps = [];
                  const raw = item.suggested_action;
                  for (let n = 1; n <= 20; n++) {
                    const s = raw.indexOf(`${n}. `);
                    if (s === -1) break;
                    const nx = raw.indexOf(`${n+1}. `, s+1);
                    steps.push({ num: n, text: raw.substring(s, nx > -1 ? nx : undefined).replace(/^\d+\.\s*/, '').trim() });
                  }
                  // Jorge SF-505: el paso de bloqueo LOTO debe ir primero.
                  const lotoIdx = steps.findIndex(st => /\bLOTO\b|bloqueo.*energ|lockout.*tagout/i.test(st.text));
                  if (lotoIdx > 0) {
                    const [loto] = steps.splice(lotoIdx, 1);
                    steps.unshift(loto);
                    steps.forEach((st, i) => { st.num = i + 1; });
                  }
                  // SF-539: LOTO condicional. Si el equipo está operando (running),
                  // omitir el paso LOTO porque el supuesto es inspección/medición
                  // sin desenergizar. Si está detenido, mantenerlo.
                  const equipCond = (item.ai_classification?.equipment_condition || item.equipment_condition || '').toLowerCase();
                  if (equipCond === 'operating' || equipCond === 'running') {
                    const filtered = steps.filter(st => !/\bLOTO\b|bloqueo.*energ|lockout.*tagout/i.test(st.text));
                    if (filtered.length !== steps.length) {
                      steps.length = 0;
                      filtered.forEach((s, i) => { s.num = i + 1; steps.push(s); });
                    }
                  }
                  return steps.map((s, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className={`font-bold min-w-[20px] ${/\bLOTO\b|bloqueo/i.test(s.text) ? 'text-red-600' : 'text-emerald-600'}`}>{s.num}.</span>
                      <span>{s.text}</span>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                {item.suggested_action}
              </p>
            )}
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
        {(item.reported_by || item.circumstances) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notification Details</p>
            <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
              {item.reported_by && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Notificated by:</span>
                  <span className="text-sm font-medium text-foreground">{item.reported_by}</span>
                </div>
              )}
              {item.circumstances && (
                <div>
                  <span className="text-xs text-muted-foreground">Circunstancias:</span>
                  <p className="text-sm text-foreground mt-0.5">{item.circumstances}</p>
                </div>
              )}
              {/* Jorge 2026-04-23 17:38: support_equipment duplicado (estaba
                  renderizando acá inline Y más abajo en sección independiente).
                  Ocultado el inline; la sección completa queda más abajo. */}
              {false && (item.support_equipment?.length > 0 || editing) && (
                <div>
                  <span className="text-xs text-muted-foreground">Support Equipment:</span>
                  {editing ? (
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(Array.isArray(editData.support_equipment) ? editData.support_equipment : []).map((eq, i) => (
                          <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {typeof eq === 'string' ? eq : eq.tag || eq.description || ''}
                            <button onClick={() => setEditData(d => ({ ...d, support_equipment: (d.support_equipment || []).filter((_, j) => j !== i) }))} className="text-purple-400 hover:text-red-500">&times;</button>
                          </span>
                        ))}
                      </div>
                      <input type="text" placeholder="Add equipment + Enter" className="text-xs px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none w-full"
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { setEditData(d => ({ ...d, support_equipment: [...(d.support_equipment || []), e.target.value.trim()] })); e.target.value = ''; } }} />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {/* Jorge SF-505: dedup case-insensitive de equipos de apoyo. */}
                      {(() => {
                        const arr = Array.isArray(item.support_equipment) ? item.support_equipment : [];
                        const seen = new Set();
                        const uniq = [];
                        for (const eq of arr) {
                          const label = typeof eq === 'string' ? eq : (eq.tag || eq.description || '');
                          const key = label.trim().toLowerCase();
                          if (key && !seen.has(key)) { seen.add(key); uniq.push(label); }
                        }
                        return uniq.map((label, i) => (
                          <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                            {label}
                          </span>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources & Materials summary */}
        {(item.resources?.length > 0 || item.materials?.length > 0 || editing) && (
          <div className="px-6 pb-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Labour</p>
              {editing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_80px_30px] gap-2 text-xs text-muted-foreground font-semibold">
                    <span>Specialty</span><span>People</span><span>Hours</span><span></span>
                  </div>
                  {(editData.resources || []).map((r, i) => {
                    const res = typeof r === 'object' ? r : { type: r, quantity: 1, hours: 4 };
                    return (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px_30px] gap-2 items-center">
                      <select value={res.type || ''} onChange={e => {
                        const arr = [...(editData.resources || [])];
                        arr[i] = { ...res, type: e.target.value };
                        setEditData(d => ({ ...d, resources: arr }));
                      }} className="text-sm px-2 py-1.5 border border-border rounded bg-background">
                        <option value="">Select...</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Instrumentation">Instrumentation</option>
                        <option value="Welder">Welder</option>
                        <option value="Rigger">Rigger</option>
                        <option value="Helper">Helper</option>
                      </select>
                      <input type="number" min="1" value={res.quantity || 1} onChange={e => {
                        const arr = [...(editData.resources || [])];
                        arr[i] = { ...res, quantity: parseInt(e.target.value) || 1 };
                        setEditData(d => ({ ...d, resources: arr }));
                      }} className="text-sm px-2 py-1.5 border border-border rounded bg-background text-center" />
                      <input type="number" min="0.5" step="0.5" value={res.hours || ''} onChange={e => {
                        const arr = [...(editData.resources || [])];
                        arr[i] = { ...res, hours: parseFloat(e.target.value) || 0 };
                        setEditData(d => ({ ...d, resources: arr }));
                      }} className="text-sm px-2 py-1.5 border border-border rounded bg-background text-center" />
                      <button onClick={() => setEditData(d => ({ ...d, resources: (d.resources || []).filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                    );
                  })}
                  <button onClick={() => setEditData(d => ({ ...d, resources: [...(d.resources || []), { type: 'Mechanical', quantity: 1, hours: 4 }] }))}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add recurso</button>
                </div>
              ) : (
                <div className="space-y-1">
                  {(item.resources || []).map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-muted/50 rounded px-3 py-1.5 border border-border">
                      <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">{typeof r === 'string' ? r : (r.type || r.name || '')}</span>
                      {typeof r === 'object' && r.quantity && <span className="text-muted-foreground">x{r.quantity} ({r.hours}h)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Spare Parts and Materials</p>
              {editing ? (
                <MaterialEditor materials={editData.materials || []} onChange={(mats) => setEditData(d => ({ ...d, materials: mats }))} />
              ) : (
                <div className="space-y-1">
                  {(item.materials || []).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-muted/50 rounded px-3 py-1.5 border border-border">
                      <Package className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      {typeof m === 'string' ? <span className="font-medium">{m}</span> : <>
                        {m.sapId && <span className="font-mono text-xs text-muted-foreground">{m.sapId}</span>}
                        <span className="font-medium">{m.description || m.name || ''}</span>
                        {m.quantity && <span className="text-muted-foreground">x{m.quantity} {m.unit || 'uds'}</span>}
                      </>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Equipment — independent section.
            Jorge (2026-04-20 tarde): el supervisor tiene que poder AGREGAR
            equipos de apoyo que falten, no sólo ver los que identificó el
            mantenedor. Igual que materiales y recursos. */}
        {(item.support_equipment?.length > 0 || editing || canEdit) && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Support Equipment</p>
              {(editing || canEdit) && (
                <button
                  onClick={() => {
                    if (!editing) setEditing(true);
                    const name = window.prompt('Nombre o tag del equipo de apoyo:');
                    if (!name || !name.trim()) return;
                    setEditData(d => ({ ...d, support_equipment: [...(d.support_equipment || []), name.trim()] }));
                  }}
                  className="text-[10px] font-semibold px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-1"
                >
                  + Add Equipment
                </button>
              )}
            </div>
            {editing ? (
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(editData.support_equipment) ? editData.support_equipment : []).map((eq, i) => (
                  <span key={i} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                    {typeof eq === 'string' ? eq : eq.name || eq.tag || ''}
                    <button onClick={() => setEditData(d => ({ ...d, support_equipment: (d.support_equipment || []).filter((_, j) => j !== i) }))}
                      className="text-purple-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
                {(!editData.support_equipment || editData.support_equipment.length === 0) && (
                  <span className="text-[11px] italic text-muted-foreground">Sin equipos de apoyo cargados</span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(item.support_equipment) ? item.support_equipment : []).map((eq, i) => (
                  <span key={i} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium">{typeof eq === 'string' ? eq : eq.name || eq.tag || ''}</span>
                ))}
                {(!item.support_equipment || item.support_equipment.length === 0) && (
                  <span className="text-[11px] italic text-muted-foreground">Sin equipos de apoyo</span>
                )}
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
                  <input type="checkbox" className="accent-[#1B5E20] w-4 h-4" checked={checkedItems.has(i)} onChange={() => { const s = new Set(checkedItems); if (s.has(i)) s.delete(i); else s.add(i); setCheckedItems(s); }} />
                  {check}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(isPending || isValidated || canStart || canComplete || canClose || editing || isRejected) && (
          <div className="px-6 py-4 border-t border-border flex flex-wrap gap-3 sticky bottom-0 bg-card rounded-b-2xl">
            {/* Jorge (2026-04-20): desde RECHAZADO el supervisor corrige y
                vuelve a lanzar (reopenWorkRequest deja status en PENDIENTE
                para que el planificador lo vuelva a revisar). */}
            {isRejected && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  <Save size={16} />
                  Corregir
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm('Re-enviar este aviso al planificador?')) return;
                    api.reopenWorkRequest(item.id)
                      .then(() => { onClose(); })
                      .catch(e => alert('Error: ' + (e.message || '')));
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight size={16} />
                  Re-enviar al planificador
                </button>
              </>
            )}
            {/* Save button (standalone — save without approving) */}
            {editing && (
              <button
                onClick={() => { onSaveEdit(item.id, editData); setEditing(false); }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            )}
            {/* Supervisor: Approve + Reject + Cancelar Aviso */}
            {isPending && (
              <>
                <button
                  onClick={handleSaveAndApprove}
                  disabled={!allChecked}
                  title={!allChecked ? 'Complete la lista de verificacion' : ''}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${allChecked ? 'bg-[#1B5E20] text-white hover:bg-[#2E7D32]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <CheckCircle size={16} />
                  {t('workRequests.validateRequest')}
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  <XCircle size={16} />
                  {t('common.reject')}
                </button>
                <button
                  onClick={() => onCancel(item.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold hover:bg-orange-100 transition-colors"
                >
                  <XCircle size={16} />
                  Cancelar
                </button>
              </>
            )}
            {/* Jorge 2026-04-24 14:18: "Ver OT" debe aparecer SÓLO cuando la OT ya
                existe (item.wo_number / wo_id). Antes siempre aparecía, ahora condicional. */}
            {onGoToOT && (item.wo_number || item.wo_id) && (
              <button
                onClick={onGoToOT}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-100 transition-colors"
                title="Ver OT vinculada"
              >
                <ArrowRight size={16} />
                Ver OT {item.wo_number || ''}
              </button>
            )}
            {/* Planner: Create WO from approved WR */}
            {isValidated && (
              <>
                <button
                  onClick={() => { onPlannerCreateOT(item.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <FileText size={16} />
                  Create WO
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => onCancel(item.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold hover:bg-orange-100 transition-colors"
                >
                  <XCircle size={16} />
                  Cancelar
                </button>
              </>
            )}
            {/* Jorge 2026-04-23: Cancelar Aviso disponible SIEMPRE que el aviso no esté cerrado/cancelado/rechazado.
                Antes solo aparecía en PENDIENTE/APROBADO; faltaba para OT_CREADA e IN_PROGRESS. */}
            {!isPending && !isValidated && !['CERRADO', 'CLOSED', 'COMPLETED', 'CANCELADO', 'CANCELLED', 'RECHAZADO', 'REJECTED'].includes(item.status) && (
              <button
                onClick={() => onCancel(item.id)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold hover:bg-orange-100 transition-colors"
              >
                <XCircle size={16} />
                Cancelar
              </button>
            )}
            {/* Start Work button removed per client feedback */}
            {canComplete && (
              <button
                onClick={() => { onComplete(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle size={16} />
                Complete Trabajo
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
            {/* Always show Close button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
  );

  if (_isInCarousel) return modalContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        {modalContent}
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
  const cls = typeof wr.ai_classification === 'string' ? (() => { try { return JSON.parse(wr.ai_classification); } catch { return {}; } })() : (wr.ai_classification || {});
  const desc = typeof wr.problem_description === 'string' ? (() => { try { return JSON.parse(wr.problem_description); } catch { return {}; } })() : (wr.problem_description || {});
  return {
    id: wr.request_id || wr.id,
    equipment_tag: wr.equipment_tag || '',
    equipment_name: cls.wo_title || wr.equipment_name || wr.equipment_tag || '',
    wo_title: cls.wo_title || desc.wo_title || '',
    plant: wr.plant_id || 'OCP-JFC1',
    area: wr.area || '',
    technician: wr.technician_name || wr.technician || cls.required_specialties?.[0] || '',
    created_by: wr.created_by || wr.technician || '',
    status: wr.status || 'DRAFT',
    priority_requested: cls.priority_suggested || wr.priority_requested || wr.priority || 'P3',
    priority_suggested: cls.priority_suggested || wr.priority_suggested || 'P3',
    failure_description: desc.original_text || desc.structured_description || wr.failure_description || (typeof wr.problem_description === 'string' ? wr.problem_description : '') || '',
    original_text: desc.original_text || '',
    technical_location: desc.technical_location || desc.technical_location_code || cls.technical_location || '',
    failure_mode: desc.failure_mode_detected || desc.failure_mode_code || wr.failure_mode || '',
    // Jorge 2026-04-24 14:18: auto-derivado si no existe, pero si el usuario
    // lo sobreescribió, mantener el valor manual.
    production_impact: wr.production_impact || cls.production_impact || (() => {
      const p = cls.priority_suggested || wr.priority_requested || wr.priority || 'P3';
      return { P1: 'CRITICAL', P2: 'HIGH', P3: 'MEDIUM', P4: 'HIGH' }[p] || 'MEDIUM';
    })(),
    estimated_duration: cls.estimated_duration_hours || wr.estimated_duration || 4,
    ai_confidence: Math.round(((cls.confidence ?? wr.equipment_confidence) ?? 0.85) * 100),
    spare_parts: wr.spare_parts || [],
    photos: wr.photos || wr.images || (wr.documents || []).filter(d => d.type === 'photo').map(d => d.data) || [],
    created_at: wr.created_at || new Date().toISOString(),
    // Classification fields (check both top-level, ai_classification, and problem_description)
    activity_class: wr.activity_class || cls.activity_class || '',
    work_class: wr.work_class || '',
    failure_category: wr.failure_category || cls.failure_category || desc.failure_catalog?.category || desc.failure_mode_detected || '',
    failure_object_part: wr.failure_object_part || desc.failure_catalog?.object_part || '',
    failure_symptom: wr.failure_symptom || desc.failure_catalog?.symptom || desc.failure_symptom || '',
    failure_cause: wr.failure_cause || desc.failure_catalog?.cause || desc.failure_cause || '',
    plant_condition: wr.plant_condition || cls.plant_condition || '',
    suggested_action: wr.suggested_action || desc.suggested_action || '',
    // Resources & Materials (also check inside problem_description)
    resources: wr.resources || desc.resources || [],
    materials: wr.materials || desc.materials || [],
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
  const openStatuses = ['DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'IN_PROGRESS', 'PENDIENTE', 'APROBADO'];
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

export default function WorkRequests({ onNavigateTab, onRefreshCounts, autoOpenWrId, onClearAutoOpen, viewMode, isActive, selectedTimeRange } = {}) {
  const [scope, setScope] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const defaultQueue = user?.role === 'manager' ? 'supervisor' : user?.role === 'planner' ? 'planner' : 'all';
  const [priorityQueue, setPriorityQueue] = useState(defaultQueue); // 'all' | 'supervisor' (P1/P2) | 'planner' (P3/P4)
  const [statusFilter, setStatusFilter] = useState([]); // empty array = ALL, multi-select
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Default filter: always show ALL
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { id, title }
  const [rejectReason, setRejectReason] = useState('');
  const [otCreatedModal, setOtCreatedModal] = useState(null); // { woNumber, woId } — SF-355 Jorge
  const [dismissedDups, setDismissedDups] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedWRs, setDeletedWRs] = useState([]);
  const [viewDeletedWR, setViewDeletedWR] = useState(null);
  const [critScore, setCritScore] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  // Auto-open WR detail when navigating from duplicate panel
  useEffect(() => {
    if (autoOpenWrId && requests.length > 0) {
      const found = requests.find(r => r.id === autoOpenWrId);
      if (found) { fetchAndOpenDetail(found); onClearAutoOpen?.(); }
    }
  }, [autoOpenWrId, requests]);
  // Jorge (2026-04-20): abrir aviso al llegar desde OT con state.openWrId
  useEffect(() => {
    const id = location?.state?.openWrId;
    if (!id || requests.length === 0) return;
    const found = requests.find(r => r.id === id || r.request_id === id);
    if (found) {
      // Jorge 2026-04-24 item 27: refrescar la lista antes de abrir el detalle,
      // para que el status y campos vengan actualizados (no la versión cacheada).
      refreshList();
      fetchAndOpenDetail(found);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location?.state?.openWrId, requests]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showDuplicates, setShowDuplicates] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [wrsWithOT, setWrsWithOT] = useState(new Set());
  // Jorge 2026-04-23: ver aviso full-screen
  // Jorge 2026-04-23: modal de Cancelar Aviso con textarea (reemplaza window.prompt)
  const [cancelModal, setCancelModal] = useState(null); // { id } o null
  const [cancelReason, setCancelReason] = useState('');

  const { t } = useLanguage();
  const toast = useToast();
  const ctx = useOutletContext() || {};
  const plantId = ctx.plant || ctx.selectedPlant || '';
  const selectedArea = ctx.selectedArea || 'All Areas';

  const refreshList = () => {
    api.listWorkRequests(plantId ? { plant_id: plantId } : {})
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setRequests(arr.map(normalizeWR));
      })
      .catch(() => {});
  };

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

  // Jorge 2026-04-23: auto-refresh al reconectarse el WS (sin tener que recargar)
  useEffect(() => {
    const h = () => refreshList();
    window.addEventListener('ws:reconnected', h);
    return () => window.removeEventListener('ws:reconnected', h);
  }, [plantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data when tab becomes active
  useEffect(() => {
    if (isActive) refreshList();
  }, [isActive]);
  useWebSocket(plantId, useCallback((msg) => {
    if (msg.event?.startsWith('wr_') || msg.event?.startsWith('wo_')) refreshList();
  }, []));

  /* ─── Scope filtering ─── */
  const scopeFiltered = useMemo(() => {
    if (scope === 'mine') {
      const uid = user?.user_id || '';
      const uname = user?.username || '';
      const fname = user?.full_name || '';
      return requests.filter(
        (r) => r.created_by === uname || r.created_by === uid || r.created_by === fname ||
               r.technician === fname || r.technician === uname ||
               r.reported_by === uname || r.reported_by === fname
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
      const statusMap = { PENDING_VALIDATION: 'PENDIENTE', VALIDATED: 'APROBADO', REJECTED: 'RECHAZADO', CANCELLED: 'CANCELADO', CLOSED: 'CERRADO', DRAFT: 'PENDIENTE', ASSIGNED: 'APROBADO', IN_PROGRESS: 'APROBADO', COMPLETED: 'CERRADO' };
      const normalizedStatus = statusMap[r.status] || r.status;
      const matchesFilter = statusFilter.length === 0 || statusFilter.includes(normalizedStatus) || statusFilter.includes(r.status);
      // Jorge 2026-04-24: búsqueda tolera prefijo "WR-" (se muestra sin él pero
      // el ID crudo lo tiene). Normalizamos ambos lados para que "WR-2026-00146",
      // "wr-2026-00146" y "2026-00146" encuentren lo mismo.
      const q = search.toLowerCase().replace(/^wr-?/i, '');
      const idNorm = (r.id || r.request_id || '').toLowerCase().replace(/^wr-?/i, '');
      const matchesSearch =
        !search ||
        idNorm.includes(q) ||
        (r.id || r.request_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.equipment_tag || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.equipment_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.failure_description || '').toLowerCase().includes(search.toLowerCase());
      // Location filter
      const matchesLocation = !locationFilter ||
        (r.technical_location || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
        (r.equipment_tag || '').toLowerCase().includes(locationFilter.toLowerCase());
      // Date filter
      const rDate = r.created_at ? r.created_at.slice(0, 10) : '';
      const matchesDateFrom = !dateFrom || rDate >= dateFrom;
      const matchesDateTo = !dateTo || rDate <= dateTo;
      // Jorge 2026-04-23: multi-select priority (P3+P4 juntos). priorityFilter puede ser
      // string (legacy) o array.
      const pCurrent = (r.priority_requested || r.priority_suggested || "");
      const matchesPriority = !priorityFilter || priorityFilter.length === 0
        || (Array.isArray(priorityFilter) ? priorityFilter.includes(pCurrent) : pCurrent === priorityFilter);
      // Jorge SF-548: bug — los botones "7d/30d/90d" no refrescaban porque
      // el filtro saltaba "Last 30 Days" pensando que era default. Ahora SIEMPRE
      // aplica el rango si hay selectedTimeRange definido.
      let matchesTimeRange = true;
      if (selectedTimeRange && rDate) {
        const now = new Date();
        const daysMap = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 90 Days': 90, 'Last 365 Days': 365 };
        const days = daysMap[selectedTimeRange];
        if (days) {
          const cutoff = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
          matchesTimeRange = rDate >= cutoff;
        }
      }
      return matchesFilter && matchesSearch && matchesLocation && matchesDateFrom && matchesDateTo && matchesPriority && matchesTimeRange;
    });
  }, [areaFiltered, statusFilter, search, locationFilter, dateFrom, dateTo, priorityFilter, selectedTimeRange]);

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
  useEffect(() => { setPage(1); }, [statusFilter, search, scope, priorityQueue, locationFilter, dateFrom, dateTo]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const pendingCount = queueFiltered.filter((r) => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status)).length;

  /* ─── Status labels (i18n) ─── */
  const statusLabels = useMemo(() => ({
    ALL: 'Todos',
    PENDIENTE: 'Pending',
    PENDING_VALIDATION: 'Pending',
    APROBADO: 'Approved',
    VALIDATED: 'Approved',
    RECHAZADO: 'Rejected',
    REJECTED: 'Rejected',
    CANCELADO: 'Cancelled',
    CANCELLED: 'Cancelled',
    CERRADO: 'Closed',
    CLOSED: 'Closed',
    DRAFT: 'Pending',
    ASSIGNED: 'Approved',
    IN_PROGRESS: 'Approved',
    COMPLETED: 'Closed',
    SCHEDULED: 'Approved',
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
  function handleValidate(id) { // Approve aviso
    const req = requests.find(r => r.id === id);
    const priority = req?.priority_requested || req?.priority_suggested || 'P3';
    const isFastTrack = ['P1', 'P2'].includes(priority);

    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APROBADO' } : r)));
    api.validateWorkRequest(id, { action: 'APPROVE' })
      .then(async () => {
        if (isFastTrack) {
          try {
            const wo = await api.createWOFromWR({ work_request_id: id });
            setWrsWithOT(prev => new Set([...prev, id]));
            toast.success('FAST TRACK: WO ' + (wo.wo_number || '') + ' created — available in Planning');
          } catch {
            toast.success(t('workRequests.validatedNoOT') || 'Request approved. Error creating WO — create it manually.');
          }
        } else {
          // Clean confirmation. The Planning tab badge counter already signals that
          // new work is waiting — no need to push the user out of Identification flow.
          toast.success(t('workRequests.validatedBacklog') || 'Aviso aprobado · listo en Planning');
        }
      })
      .catch(() => toast.error(t('workRequests.errorValidate') || 'Error validating'))
      .finally(() => { onRefreshCounts?.(); refreshList(); });
  }

  function handleReject(id) {
    const wr = requests.find(r => r.id === id);
    setRejectModal({ id, title: wr?.equipment_tag || wr?.description?.substring(0, 40) || id });
    setRejectReason('');
  }

  function confirmReject() {
    if (!rejectModal || !rejectReason.trim()) return;
    const { id } = rejectModal;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'RECHAZADO', rejection_reason: rejectReason } : r)));
    api.validateWorkRequest(id, { action: 'REJECT', rejection_reason: rejectReason })
      .then(() => toast.success('Notification rejected'))
      .catch(() => toast.error('Error rejecting'))
      .finally(() => {
        // Jorge (2026-04-20): al rechazar, cerrar también el detalle del aviso.
        // El Cancel del modal de rechazo ya solo cierra el modal, no el detalle.
        setRejectModal(null);
        setRejectReason('');
        setSelected(null);
        onRefreshCounts?.();
        refreshList();
      });
  }

  function handleReopen(id) {
    api.reopenWorkRequest(id)
      .then(() => { toast.success('Notification reopened'); onRefreshCounts?.(); refreshList(); })
      .catch(() => toast.error('Error reopening'));
  }

  function handleCancel(id) {
    // Jorge 2026-04-23: modal con textarea (antes era window.prompt).
    setCancelModal({ id });
  }

  function confirmCancel(reason) {
    const id = cancelModal?.id;
    if (!id || !reason || !reason.trim()) {
      toast.error('Motivo obligatorio para cancelar');
      return;
    }
    api.cancelWorkRequest(id, { reason: reason.trim() })
      .then(() => {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CERRADO', cancellation_reason: reason.trim() } : r)));
        toast.success('Aviso cancelado y cerrado');
        setSelected(null);
        setCancelModal(null);
        onRefreshCounts?.();
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err?.message || 'Error cancelling';
        toast.error(msg);
      });
  }

  function handleSaveEdit(id, updates) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    api.updateWorkRequest(id, updates)
      .then(() => toast.success(t('workRequests.updated') || 'Aviso actualizado'))
      .catch(() => toast.error(t('workRequests.errorUpdate') || 'Error al actualizar'));
  }

  function handlePlannerCreateOT(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APROBADO' } : r)));
    api.validateWorkRequest(id, { action: 'APPROVE' })
      .then(async () => {
        try {
          const wo = await api.createWOFromWR({ work_request_id: id });
          // Jorge (2026-04-20): mismo estilo que el modal centrado de creación de aviso.
          setOtCreatedModal({ woNumber: wo.wo_number || '', woId: wo.wo_id || null });
          setSelected(null);
        } catch {
          toast.success(t('workRequests.approvedNoOT') || 'Aviso aprobado. Error creating OT — créala manualmente desde Work Orders.');
        }
      })
      .catch(() => toast.error(t('workRequests.errorApprove') || 'Error al aprobar'));
  }

  function handleStart(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'IN_PROGRESS' } : r)));
    api.startWorkRequest(id)
      .then(() => toast.success(t('workRequests.started') || 'Trabajo iniciado'))
      .catch(() => toast.error(t('workRequests.errorStart') || 'Error al iniciar'));
  }

  function handleComplete(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED' } : r)));
    api.completeWorkRequest(id, { completion_notes: '', actual_hours: 0 })
      .then(() => toast.success(
        <span>
          {t('workRequests.completed') || 'Trabajo completado'}
          {onNavigateTab && (
            <button onClick={() => onNavigateTab('closure')} className="ml-2 underline font-semibold">
              → Ir a Cierre
            </button>
          )}
        </span>,
        8000
      ))
      .catch(() => toast.error(t('workRequests.errorComplete') || 'Error al completar'));
  }

  function handleClose(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CLOSED' } : r)));
    api.closeWorkRequest(id, { closure_notes: '' })
      .then(() => toast.success(t('workRequests.closed') || 'Aviso cerrado técnicamente'))
      .catch(() => toast.error(t('workRequests.errorClose') || 'Error al cerrar'));
  }

  function handleDelete(id) {
    setDeleteConfirm(id);
    setDeleteReason('');
  }
  function confirmDelete() {
    const id = deleteConfirm;
    const reason = deleteReason.trim();
    setDeleteConfirm(null);
    setDeleteReason('');
    setRequests((prev) => prev.filter((r) => r.id !== id));
    api.deleteWorkRequest(id, { reason }).catch(() => {
      api.listWorkRequests().then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setRequests(arr.map(normalizeWR));
      });
    });
  }

  function handleExportWRs() {
    if (!sorted.length) return;
    const headers = ['ID', 'Equipo TAG', 'Equipo', 'Descripción Falla', 'Priority', 'Status', 'Impacto', 'Duración Est. (h)', 'Categoría Falla', 'Síntoma', 'Causa', 'Acción Sugerida', 'Técnico', 'Creado'];
    const rows = sorted.map(r => [
      r.id, r.equipment_tag, r.equipment_name, r.failure_description,
      r.priority_requested, r.status, r.production_impact,
      r.estimated_duration, r.failure_category, r.failure_symptom,
      r.failure_cause, r.suggested_action, r.technician,
      r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
    ]);
    downloadExport({ format: 'EXCEL', sheets: [{ name: 'Avisos', headers, rows }] }, `avisos-${new Date().toISOString().slice(0, 10)}`);
  }

  function fetchAndOpenDetail(req) {
    setDetailLoading(true);
    setCritScore(null);
    getCriticalityScore(req.id || req.request_id).then(s => setCritScore(s)).catch(() => setCritScore(null));
    setSelected(req); // show immediately with list data
    api.getWorkRequest(req.id)
      .then((full) => setSelected(normalizeWR(full)))
      .catch(() => {}) // keep list data on error
      .finally(() => setDetailLoading(false));
  }

  function handleOpenDetail(req) {
    fetchAndOpenDetail(req);
    setDuplicateTarget(null);
    setShowDuplicates([]);
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Pending', count: queueFiltered.filter(r => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status)).length, borderColor: 'border-l-yellow-400', textColor: 'text-yellow-600' },
          { label: 'Approved', count: queueFiltered.filter(r => ['VALIDATED', 'APPROVED', 'ASSIGNED', 'APROBADO'].includes(r.status)).length, borderColor: '', textColor: 'text-gray-500' },
          { label: 'Rejected', count: queueFiltered.filter(r => ['REJECTED', 'RECHAZADO'].includes(r.status)).length, borderColor: 'border-l-red-400', textColor: 'text-red-600' },
          { label: 'Cancelled', count: queueFiltered.filter(r => ['CANCELLED', 'CANCELADO'].includes(r.status)).length, borderColor: 'border-l-gray-400', textColor: 'text-gray-500' },
          // Jorge 2026-04-23 17:38: agregar tarjeta "Closed" para ver cuántos avisos se cerraron (vía OT auto-close).
          { label: 'Closed', count: queueFiltered.filter(r => ['CLOSED', 'CERRADO', 'COMPLETED'].includes(r.status)).length, borderColor: 'border-l-emerald-500', textColor: 'text-emerald-700' },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-white dark:bg-card rounded-lg border border-border ${kpi.borderColor ? 'border-l-4 ' + kpi.borderColor : ''} p-5`}>
            <p className={`text-sm ${kpi.textColor} mb-1`}>{kpi.label}</p>
            <p className="text-3xl font-bold text-foreground">{kpi.count}</p>
          </div>
        ))}
      </div>

      {/* Scope tabs: My / Team / All */}
      <div className="flex gap-2">
        {SCOPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key === 'mine'
            ? requests.filter((r) => r.created_by === (user?.username || '') || r.created_by === (user?.user_id || '') || r.technician === (user?.full_name || '') || r.reported_by === (user?.username || '')).length
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
            const pendCnt = q.key === 'all' ? scopeFiltered.filter((r) => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status)).length
              : q.key === 'supervisor' ? scopeFiltered.filter((r) => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status) && ['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length
              : scopeFiltered.filter((r) => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status) && !['P1', 'P2'].includes(r.priority_requested || r.priority_suggested)).length;
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

      {/* Duplicates now shown inside DetailModal as carousel */}

      {/* Filter Bar - Planning style */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('workRequests.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_KEYS.map(key => {
              const colors = { ALL: 'bg-gray-600', PENDIENTE: 'bg-gray-500', APROBADO: 'bg-green-600', RECHAZADO: 'bg-red-600', CANCELADO: 'bg-red-500', CERRADO: 'bg-emerald-700' };
              const cnt = key === 'ALL' ? areaFiltered.length : areaFiltered.filter(r => {
                const sm = { PENDING_VALIDATION: 'PENDIENTE', VALIDATED: 'APROBADO', REJECTED: 'RECHAZADO', CANCELLED: 'CANCELADO', CLOSED: 'CERRADO', DRAFT: 'PENDIENTE', ASSIGNED: 'APROBADO', IN_PROGRESS: 'APROBADO', COMPLETED: 'CERRADO' };
                return (sm[r.status] || r.status) === key || r.status === key;
              }).length;
              const isSelected = key === 'ALL' ? statusFilter.length === 0 : statusFilter.includes(key);
              return (
                <button key={key} onClick={() => {
                  if (key === 'ALL') { setStatusFilter([]); return; }
                  setStatusFilter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
                }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isSelected ? (colors[key] || 'bg-gray-600') + ' text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {statusLabels[key] ?? key} <span className="ml-1 opacity-75">{cnt}</span>
                </button>
              );
            })}
            {/* Jorge 2026-04-23 — SAP no borra, cierra. Botón Eliminados removido. */}
          </div>
          {/* Jorge 2026-04-23: multi-select priority (planificador necesita P3+P4 juntos) */}
          <div className="flex items-center gap-1">
            {['P1','P2','P3','P4'].map(p => {
              const selected = Array.isArray(priorityFilter) ? priorityFilter.includes(p) : priorityFilter === p;
              return (
                <button key={p} type="button"
                  onClick={() => {
                    const arr = Array.isArray(priorityFilter) ? [...priorityFilter] : (priorityFilter ? [priorityFilter] : []);
                    const idx = arr.indexOf(p);
                    if (idx >= 0) arr.splice(idx, 1); else arr.push(p);
                    setPriorityFilter(arr);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-bold border ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {p}
                </button>
              );
            })}
          </div>

          {/* Jorge SF-547 (2026-04-24): selectores Desde/Hasta removidos del listado
              de avisos — duplicaban el filtro "Last 30 Days/7 Days/etc" del header
              global. Queda sólo el del header. SAP fecha-blanco se accede via
              el dropdown del header. */}
          {(search || statusFilter.length > 0 || (Array.isArray(priorityFilter) ? priorityFilter.length > 0 : priorityFilter) || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(''); setStatusFilter([]); setPriorityFilter([]); setLocationFilter(''); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-gray-500 hover:text-red-500 px-2 py-2 border border-gray-200 rounded-lg">Clear</button>
          )}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('created_at')}>
                    DATE {sortField === 'created_at' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
                  </th>
                  {/* Jorge 2026-04-23 17:38: columnas separadas Aviso# | Título | Ubic. Técnica / TAG */}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Aviso #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Título OT
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ubic. Técnica / TAG
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('priority_requested')}>
                    {t('common.priority')} {sortField === 'priority_requested' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                    {t('common.status')} {sortField === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    WO
                  </th>
                  {/* Jorge 2026-04-23 (reunión 17:38): columna AI Reliability ocultada para ceder espacio */}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      {t('common.noData')}
                    </td>
                  </tr>
                )}
                {paged.map((req) => {
                  const priorityChanged = req.priority_requested !== req.priority_suggested;
                  const isPending = ['PENDING_VALIDATION', 'PENDIENTE'].includes(req.status);
                  const truncatedDesc =
                    req.failure_description.length > 60
                      ? req.failure_description.slice(0, 60) + '...'
                      : req.failure_description;
                  const hasDuplicates = findDuplicates(req, requests.filter(r => !['CANCELLED', 'CANCELADO', 'CLOSED', 'CERRADO', 'REJECTED', 'RECHAZADO'].includes(r.status))).length > 0;

                  const isFastTrackWR = ['P1', 'P2'].includes(req.priority_requested);

                  return (
                    <tr key={req.id} className={`hover:bg-muted/30 transition-colors ${isFastTrackWR && isPending ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      {/* Fecha */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">{req.created_at ? new Date(req.created_at).toLocaleDateString('es-CL') : '-'}</span>
                      </td>

                      {/* Jorge 2026-04-23 17:38 — 3 columnas separadas: Aviso# | Título OT | TL/TAG */}
                      {/* Aviso # */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {hasDuplicates && (
                            <span title={t('workRequests.duplicateWarning')} className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          )}
                          {/* Jorge 2026-04-23 17:38: quitar prefijo "WR-" del número de aviso */}
                          <p className="font-mono text-xs text-muted-foreground">{String(req.id || '').replace(/^WR-?/i, '')}</p>
                          {isFastTrackWR && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                              <Zap size={8} /> FT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Título OT (wo_title viene del aviso y se arrastra a la OT) */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-foreground text-xs truncate" title={req.wo_title || req.equipment_name}>{req.wo_title || req.equipment_name || '—'}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{truncatedDesc}</p>
                      </td>

                      {/* Ubicación Técnica / TAG */}
                      <td className="px-4 py-3">
                        {req.technical_location && (
                          <p className="text-[11px] text-blue-600"><span className="font-semibold">TL:</span> {req.technical_location}</p>
                        )}
                        {req.equipment_tag && !/^\d{8,}$/.test(req.equipment_tag) && (
                          <p className="font-mono text-[11px] text-gray-600"><span className="font-semibold">TAG:</span> {req.equipment_tag}</p>
                        )}
                        {!req.technical_location && !req.equipment_tag && <span className="text-[10px] text-gray-300">—</span>}
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

                      {/* WO Number */}
                      <td className="px-4 py-3">
                        {req.wo_number ? (
                          <button onClick={() => onNavigateTab && onNavigateTab('planning', null, req.wo_number)}
                            className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
                            {req.wo_number}
                          </button>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* Columna AI Reliability ocultada (Jorge 2026-04-23 17:38) */}

                                            {/* Actions -- SF-108 contextual status buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => handleOpenDetail(req)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title={t('common.details')}
                          >
                            <Eye size={16} />
                          </button>
                          {/* All actions moved to detail modal — user must open the WR to take action (Jorge feedback) */}
                          {/* Jorge 2026-04-23 — SAP: no delete. Cancelar con motivo desde el detalle. */}
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
            <div className="flex items-center gap-3">
              <span>{t('workRequests.showingOf', { shown: paged.length, total: sorted.length })}</span>
              <button onClick={handleExportWRs} disabled={!sorted.length}
                className="flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-30 text-xs font-medium">
                <Download size={12} /> Excel
              </button>
            </div>
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

      {/* Deleted WRs Panel */}
      {showDeleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleted(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Avisos Eliminados</h2>
                <p className="text-xs text-gray-500">{deletedWRs.length} aviso{deletedWRs.length !== 1 ? 's' : ''} en papelera</p>
              </div>
              <button onClick={() => setShowDeleted(false)} className="p-2 hover:bg-gray-200 rounded-lg"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {deletedWRs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Trash2 size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay avisos eliminados</p>
                </div>
              ) : deletedWRs.map((wr) => (
                <div key={wr.request_id} className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition-colors overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-gray-600">{wr.request_id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wr.priority_code === 'P1' ? 'bg-red-100 text-red-700' : wr.priority_code === 'P2' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{wr.priority_code}</span>
                          {wr.work_class && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{wr.work_class}</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-800">{wr.equipment_name || wr.equipment_tag}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{wr.equipment_tag}</p>
                        {wr.failure_description && <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{wr.failure_description}</p>}
                        {(wr.failure_category || wr.failure_symptom) && (
                          <div className="flex gap-2 mt-1.5">
                            {wr.failure_category && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">{wr.failure_category}</span>}
                            {wr.failure_symptom && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{wr.failure_symptom}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={async () => {
                          try { await api.restoreWR(wr.request_id); setDeletedWRs(prev => prev.filter(d => d.request_id !== wr.request_id)); toast.success('Restaurado: ' + wr.request_id); api.listWorkRequests({ plant_id: plantId }).then(data => setRequests((Array.isArray(data) ? data : []).map(normalizeWR))).catch(() => {}); } catch { toast.error('Error restaurando'); }
                        }} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Restaurar</button>
                        {['admin', 'ceo'].includes(user?.role) && (
                          <button onClick={async () => { if (!window.confirm('¿Eliminar PERMANENTEMENTE?')) return; try { await api.permanentDeleteWR(wr.request_id); setDeletedWRs(prev => prev.filter(d => d.request_id !== wr.request_id)); toast.success('Eliminado permanente'); } catch { toast.error('Error'); } }}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
                        )}
                      </div>
                    </div>
                  </div>
                  {wr.delete_reason && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                      <p className="text-[10px] text-amber-800"><span className="font-semibold">Motivo:</span> {wr.delete_reason}</p>
                    </div>
                  )}
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-red-600">
                      <span>Eliminado: {wr.deleted_at ? new Date(wr.deleted_at).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                      <span>Por: {wr.deleted_by || '—'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Creado: {wr.created_at ? new Date(wr.created_at).toLocaleDateString('es') : '—'} {wr.created_by ? 'por ' + wr.created_by : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('workRequests.deleteTitle') || 'Delete Request'}</h3>
            <p className="text-sm text-gray-500 mb-1">{t('workRequests.confirmDelete') || 'Are you sure you want to delete this work request?'}</p>
            <p className="text-xs font-mono text-gray-400 mb-3">{deleteConfirm}</p>
            <div className="text-left mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1">{t('workRequests.deleteReason') || 'Reason for deletion *'}</label>
              <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                rows={2} placeholder={t('workRequests.deleteReasonPlaceholder') || 'e.g.: Duplicate, Capture error, Test...'}
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                {t('common.cancel') || 'Cancel'}
              </button>
              <button onClick={confirmDelete} disabled={!deleteReason.trim()}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {t('workRequests.confirmDeleteBtn') || 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jorge 2026-04-23: modal Cancelar Aviso con textarea para motivo */}
      {cancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => { setCancelModal(null); setCancelReason(''); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Cancelar aviso</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              El aviso quedará <b>CERRADO</b> con el motivo registrado. No se puede revertir.
            </p>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea autoFocus value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              rows={4}
              placeholder="Ej.: Duplicado del WR-2026-00123 · trabajo ya cubierto por la OT-2026-50000…"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Volver
              </button>
              <button onClick={() => { confirmCancel(cancelReason); setCancelReason(''); }}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal — 3D carousel of current + duplicates */}
      {selected && (() => {
        const dups = findDuplicates(selected, requests);
        const allItems = [selected, ...dups.filter(d => !dismissedDups.includes(d.id))];
        const hasDups = allItems.length > 1;
        const carIdx = carouselIdx;
        const setCarIdx = setCarouselIdx;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-5xl px-4" onClick={e => e.stopPropagation()}>
              {/* 3D Carousel */}
              <div className="relative flex items-center justify-center" style={{ perspective: '1200px', minHeight: '80vh' }}>
                {allItems.map((wrItem, idx) => {
                  const offset = idx - carIdx;
                  const absOff = Math.abs(offset);
                  const isCenter = offset === 0;
                  const translateX = offset * 320;
                  const translateZ = isCenter ? 0 : -150 - absOff * 50;
                  const rotateY = offset * -15;
                  const scale = isCenter ? 1 : Math.max(0.7, 0.85 - absOff * 0.08);
                  const opacity = absOff > 2 ? 0 : isCenter ? 1 : 0.6;
                  const zIndex = 10 - absOff;

                  return (
                    <div key={wrItem.id || idx}
                      className="absolute transition-all duration-500 ease-out"
                      style={{
                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        opacity,
                        zIndex,
                        width: 'min(520px, 85vw)',
                        pointerEvents: isCenter ? 'auto' : 'none',
                      }}>
                      {/* Badge */}
                      {idx > 0 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg">DUPLICADO #{idx}</span>
                          {isCenter && (
                            <button onClick={(e) => { e.stopPropagation(); setDismissedDups(prev => [...prev, wrItem.id]); setCarouselIdx(prev => Math.max(0, prev - 1)); }}
                              className="w-6 h-6 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      )}
                      {idx === 0 && hasDups && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg">
                          ACTUAL
                        </div>
                      )}
                      <div className={`rounded-2xl shadow-2xl overflow-hidden ${isCenter ? '' : 'pointer-events-none'}`}>
                        <DetailModal
                          item={wrItem}
                          critScore={idx === 0 ? critScore : null}
                          duplicates={[]}
                          onOpenDuplicate={() => {}}
                          onClose={() => setSelected(null)}
                          onValidate={handleValidate}
                          onReject={handleReject}
                          onCancel={handleCancel}
                          onStart={handleStart}
                          onComplete={handleComplete}
                          onCloseWR={handleClose}
                          onSaveEdit={handleSaveEdit}
                          onPlannerCreateOT={handlePlannerCreateOT}
                          onGoToOT={() => navigate('/work-orders', { state: { openOtByWrId: wrItem.id } })}
                          userRole={user?.role}
                          t={t}
                          _isInCarousel={true}
                          _isDuplicate={idx > 0}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation arrows */}
              {hasDups && (
                <>
                  <button onClick={() => setCarIdx(Math.max(0, carIdx - 1))} disabled={carIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 rounded-full shadow-xl border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all disabled:opacity-30">
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  <button onClick={() => setCarIdx(Math.min(allItems.length - 1, carIdx + 1))} disabled={carIdx >= allItems.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 rounded-full shadow-xl border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all disabled:opacity-30">
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots */}
              {hasDups && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                  {allItems.map((_, i) => (
                    <button key={i} onClick={() => setCarIdx(i)}
                      className={`w-3 h-3 rounded-full transition-all shadow-sm ${i === carIdx ? 'bg-emerald-500 scale-125' : i === 0 ? 'bg-blue-400' : 'bg-red-400 opacity-60'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* SF-355 — OT Created Modal (centrado, estilo aviso creado) */}
      {otCreatedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOtCreatedModal(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Work Order creada</h3>
            <p className="text-sm text-gray-500 mb-1">Número OT:</p>
            <p className="text-lg font-mono font-bold text-emerald-700 mb-6">{otCreatedModal.woNumber}</p>
            <div className="flex gap-3">
              <button onClick={() => setOtCreatedModal(null)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                Cerrar
              </button>
              <button onClick={() => {
                const target = otCreatedModal.woNumber || otCreatedModal.woId;
                setOtCreatedModal(null);
                if (onNavigateTab && target) onNavigateTab('planning', null, target);
              }}
                className="flex-1 py-2.5 px-4 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                Ver OT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative z-10 bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Reject Notification</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{rejectModal.title}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[80px] mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={confirmReject} disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-40">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
