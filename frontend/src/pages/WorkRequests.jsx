import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Eye, Filter, Clock, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Users, User, Globe, ImageOff, Search,
  Wrench, Tag, MapPin, Gauge, Package, Calendar, FileText, Trash2, Zap,
  Save, Download
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
                  placeholder="Buscar material SAP..."
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

/* ─── Duplicate Carousel with Side-by-Side Comparison ─── */
function DuplicateWarning({ duplicates, onViewDuplicate, onDismiss, t, currentRequest }) {
  const [carouselIdx, setCarouselIdx] = React.useState(0);
  if (!duplicates || duplicates.length === 0) return null;
  const dup = duplicates[carouselIdx] || duplicates[0];
  const current = currentRequest || {};
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">
            {duplicates.length} Similar Open Request{duplicates.length > 1 ? 's' : ''} Found
          </span>
        </div>
        <div className="flex items-center gap-2">
          {duplicates.length > 1 && (
            <div className="flex items-center gap-1 bg-white rounded-lg border border-amber-200 px-2 py-1">
              <button onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))} disabled={carouselIdx === 0}
                className="p-0.5 rounded hover:bg-amber-100 disabled:opacity-30 text-amber-700">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-amber-800 min-w-[40px] text-center">{carouselIdx + 1} / {duplicates.length}</span>
              <button onClick={() => setCarouselIdx(Math.min(duplicates.length - 1, carouselIdx + 1))} disabled={carouselIdx >= duplicates.length - 1}
                className="p-0.5 rounded hover:bg-amber-100 disabled:opacity-30 text-amber-700">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button onClick={onDismiss} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold">
            Proceed Anyway
          </button>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Request */}
        <div className="bg-white rounded-lg border-2 border-blue-200 p-3">
          <div className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Current Request
          </div>
          <div className="space-y-1.5 text-xs">
            <div><span className="text-gray-500">ID:</span> <span className="font-mono font-bold">{current.id?.slice(0, 12) || '—'}</span></div>
            <div><span className="text-gray-500">Equipment:</span> <span className="font-semibold">{current.equipment_tag || '—'}</span></div>
            <div><span className="text-gray-500">Priority:</span> <span className={"font-bold " + (current.priority === 'P1' ? 'text-red-600' : current.priority === 'P2' ? 'text-orange-600' : 'text-gray-700')}>{current.priority || '—'}</span></div>
            <div><span className="text-gray-500">Status:</span> <span>{current.status || '—'}</span></div>
            <div className="pt-1 border-t border-gray-100">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-800 mt-0.5 line-clamp-3">{current.failure_description || current.description || '—'}</p>
            </div>
            <div><span className="text-gray-500">Created:</span> {current.created_at ? new Date(current.created_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        {/* Duplicate */}
        <div className="bg-amber-50 rounded-lg border-2 border-amber-300 p-3">
          <div className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Existing Duplicate
          </div>
          <div className="space-y-1.5 text-xs">
            <div><span className="text-gray-500">ID:</span> <span className="font-mono font-bold">{dup.id?.slice(0, 12) || '—'}</span></div>
            <div><span className="text-gray-500">Equipment:</span> <span className="font-semibold">{dup.equipment_tag || dup.equipment_name || '—'}</span></div>
            <div><span className="text-gray-500">Priority:</span> <span className={"font-bold " + (dup.priority === 'P1' ? 'text-red-600' : dup.priority === 'P2' ? 'text-orange-600' : 'text-gray-700')}>{dup.priority || '—'}</span></div>
            <div><span className="text-gray-500">Status:</span> <span>{dup.status || '—'}</span></div>
            <div className="pt-1 border-t border-amber-100">
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-800 mt-0.5 line-clamp-3">{dup.failure_description || dup.description || '—'}</p>
            </div>
            <div><span className="text-gray-500">Created:</span> {dup.created_at ? new Date(dup.created_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => onViewDuplicate(dup)} className="flex-1 text-xs px-3 py-2 rounded-lg bg-amber-200 text-amber-800 hover:bg-amber-300 font-semibold text-center">
          Open This Duplicate
        </button>
        {duplicates.length > 1 && (
          <div className="flex gap-1">
            {duplicates.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                className={"w-2 h-2 rounded-full transition-colors " + (i === carouselIdx ? "bg-amber-600" : "bg-amber-200 hover:bg-amber-300")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Detail Modal (expanded + editable for supervisor) ─── */
function DetailModal({ item, duplicates = [], onOpenDuplicate, onClose, onValidate, onReject, onCancel, onStart, onComplete, onCloseWR, onSaveEdit, onPlannerCreateOT, userRole, t }) {
  if (!item) return null;
  const isPending = ['PENDING_VALIDATION', 'PENDIENTE'].includes(item.status);
  const isValidated = ['VALIDATED', 'APROBADO'].includes(item.status);
  const canStart = ['VALIDATED', 'ASSIGNED', 'SCHEDULED', 'APROBADO'].includes(item.status);
  const canComplete = item.status === 'IN_PROGRESS';
  const canClose = item.status === 'COMPLETED';
  const isSupervisor = ['admin', 'manager'].includes(userRole);
  const isPlanner = userRole === 'planner';
  const canEdit = (isSupervisor || isPlanner) && !['COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED', 'CERRADO', 'CANCELADO', 'RECHAZADO'].includes(item.status);

  // Editable state (supervisor can edit before approving)
  const [editing, setEditing] = useState(false);
  const [dupIdx, setDupIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const CHECKLIST_COUNT = 4;
  const allChecked = checkedItems.size >= CHECKLIST_COUNT;
  const [editData, setEditData] = useState({
    failure_description: item.failure_description || '',
    priority_requested: item.priority_requested || 'P3',
    failure_mode: item.failure_mode || '',
    estimated_duration: item.estimated_duration || '',
    production_impact: item.production_impact || 'MEDIUM',
    suggested_action: item.suggested_action || '',
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
                  onClick={(e) => { e.stopPropagation(); navigate('/work-orders'); }}>
                  OT: {item.wo_number}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{item.equipment_name}</h2>
            <p className="text-xs font-mono text-muted-foreground">{item.equipment_tag}</p>
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
  <div class="section-title">Required Resources</div>
  <table><thead><tr><th>Specialty</th><th>Quantity</th><th>Hours</th></tr></thead><tbody>
  ${resources.map(r => typeof r === 'string' ? `<tr><td colspan="3">${r}</td></tr>` : `<tr><td>${r.type||''}</td><td>${r.quantity||1}</td><td>${r.hours||0}h</td></tr>`).join('')}
  </tbody></table>
</div>` : ''}

${materials.length ? `<div class="section">
  <div class="section-title">SAP Materials</div>
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
            <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-semibold hover:bg-amber-100 transition-colors">
                Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Photo Carousel */}
        {/* Duplicate Carousel */}
        {duplicates.length > 0 && (
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">{duplicates.length} Similar Request{duplicates.length > 1 ? 's' : ''} Found</span>
              </div>
              {duplicates.length > 1 && (
                <div className="flex items-center gap-1 bg-white rounded-lg border border-amber-200 px-2 py-0.5">
                  <button onClick={() => setDupIdx(Math.max(0, dupIdx - 1))} disabled={dupIdx === 0} className="text-amber-700 disabled:opacity-30"><ChevronLeft size={14} /></button>
                  <span className="text-xs font-bold text-amber-700 min-w-[30px] text-center">{dupIdx + 1}/{duplicates.length}</span>
                  <button onClick={() => setDupIdx(Math.min(duplicates.length - 1, dupIdx + 1))} disabled={dupIdx >= duplicates.length - 1} className="text-amber-700 disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border-2 border-blue-200 p-3">
                <div className="text-[10px] font-bold text-blue-600 uppercase mb-1.5">Current Request</div>
                <div className="text-xs space-y-1">
                  <div className="font-mono font-bold text-blue-700">{(item.id || '').slice(0,14)}</div>
                  <div className="font-semibold">{item.equipment_tag}</div>
                  <div className="text-gray-600 line-clamp-2">{item.failure_description || '—'}</div>
                  <div><span className="text-gray-400">Priority:</span> <span className={"font-bold " + (item.priority === 'P1' ? 'text-red-600' : item.priority === 'P2' ? 'text-orange-600' : '')}>{item.priority}</span> <span className="text-gray-400 ml-2">Status:</span> {item.status}</div>
                  <div className="text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg border-2 border-amber-300 p-3">
                <div className="text-[10px] font-bold text-amber-600 uppercase mb-1.5">Existing Duplicate</div>
                {(() => { const d = duplicates[dupIdx]; return d ? (
                  <div className="text-xs space-y-1">
                    <div className="font-mono font-bold text-amber-700">{(d.id || '').slice(0,14)}</div>
                    <div className="font-semibold">{d.equipment_tag}</div>
                    <div className="text-gray-600 line-clamp-2">{d.failure_description || '—'}</div>
                    <div><span className="text-gray-400">Priority:</span> <span className={"font-bold " + (d.priority === 'P1' ? 'text-red-600' : d.priority === 'P2' ? 'text-orange-600' : '')}>{d.priority}</span> <span className="text-gray-400 ml-2">Status:</span> {d.status}</div>
                    <div className="text-gray-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</div>
                    <button onClick={() => onOpenDuplicate && onOpenDuplicate(d)} className="mt-1 w-full text-[10px] py-1.5 bg-amber-200 text-amber-800 rounded-lg hover:bg-amber-300 font-semibold">View Full Duplicate</button>
                  </div>
                ) : null; })()}
              </div>
            </div>
            {duplicates.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {duplicates.map((_, i) => <button key={i} onClick={() => setDupIdx(i)} className={"w-2 h-2 rounded-full transition-all " + (i === dupIdx ? "bg-amber-600 scale-125" : "bg-amber-200")} />)}
              </div>
            )}
          </div>
        )}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('workRequests.photos')}</p>
          <PhotoCarousel photos={item.photos} t={t} />
        </div>

        {/* Detail Grid */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DetailCard icon={MapPin} label={t('workRequests.plantArea')} value={`${item.plant} / ${item.area}`} />
          <DetailCard icon={User} label="Created By" value={item.created_by || '-'} />
            <DetailCard icon={CheckCircle} label="Approved By" value={item.approver_id || (["Approved","APROBADO","VALIDATED"].includes(item.status) ? "Supervisor" : "—")} />
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
            <DetailCard icon={Wrench} label="Activity Class" value={item.activity_class} />
          )}
          {item.plant_condition && (
            <DetailCard icon={Zap} label="Equipment Condition" value={item.plant_condition} />
          )}
          {item.created_at && (
            <DetailCard icon={Calendar} label={t('workRequests.createdAt')} value={new Date(item.created_at).toLocaleDateString()} />
          )}
          {item.notification_type && (
            <DetailCard icon={FileText} label="Notification Type (SAP)" value={item.notification_type} />
          )}
          {item.work_class && (
            <DetailCard icon={Tag} label="Work Class" value={item.work_class} />
          )}
          {item.wo_number && (
            <DetailCard icon={Wrench} label="OT Vinculada" value={item.wo_number} />
          )}
          {item.assigned_to_name && (
            <DetailCard icon={Users} label="Asignado a" value={item.assigned_to_name} />
          )}
          {item.sla_deadline && (
            <DetailCard icon={Clock} label="SLA Deadline" value={new Date(item.sla_deadline).toLocaleDateString()} />
          )}
        </div>

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

        {/* Failure Classification */}
        {(item.failure_category || item.failure_symptom || item.failure_cause || editing) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clasificación de Falla</p>
            {editing ? (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Categoría:</span>
                  <input type="text" value={editData.failure_category} onChange={e => setEditData(d => ({ ...d, failure_category: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="MECANICO, ELECTRICO..." />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Síntoma:</span>
                  <input type="text" value={editData.failure_symptom} onChange={e => setEditData(d => ({ ...d, failure_symptom: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="Fuga, Vibración..." />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[80px]">Cause:</span>
                  <input type="text" value={editData.failure_cause} onChange={e => setEditData(d => ({ ...d, failure_cause: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1 border border-border rounded bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" placeholder="Desgaste, Corrosión..." />
                </div>
              </div>
            ) : (
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
                    <span className="text-xs text-muted-foreground min-w-[80px]">Cause:</span>
                    <span className="text-sm font-medium text-foreground">{item.failure_cause}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Suggested Action */}
        {(item.suggested_action || editing) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Acción Sugerida</p>
            {editing ? (
              <textarea value={editData.suggested_action || ''} onChange={e => setEditData(d => ({ ...d, suggested_action: e.target.value }))}
                rows={5} placeholder="¿Qué se debe hacer?"
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-y" />
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
        {(item.reported_by || item.circumstances || item.support_equipment) && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Datos del Aviso (SAP)</p>
            <div className="space-y-2 bg-muted/50 rounded-lg p-3 border border-border">
              {item.reported_by && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Notification Author:</span>
                  <span className="text-sm font-medium text-foreground">{item.reported_by}</span>
                </div>
              )}
              {item.circumstances && (
                <div>
                  <span className="text-xs text-muted-foreground">Circunstancias:</span>
                  <p className="text-sm text-foreground mt-0.5">{item.circumstances}</p>
                </div>
              )}
              {(item.support_equipment?.length > 0 || editing) && (
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
                      {(Array.isArray(item.support_equipment) ? item.support_equipment : []).map((eq, i) => (
                        <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                          {typeof eq === 'string' ? eq : eq.tag || eq.description || ''}
                        </span>
                      ))}
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resources</p>
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
                        <option value="Mecanico">Mechanical</option>
                        <option value="Electrico">Electrical</option>
                        <option value="Instrumentacion">Instrument Tech</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Soldador">Welder</option>
                        <option value="Rigger">Rigger</option>
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Materials</p>
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
        {(isPending || isValidated || canStart || canComplete || canClose || editing) && (
          <div className="px-6 py-4 border-t border-border flex flex-wrap gap-3 sticky bottom-0 bg-card rounded-b-2xl">
            {/* Save button (standalone, any status while editing) */}
            {editing && !isPending && (
              <button
                onClick={() => { onSaveEdit(item.id, editData); setEditing(false); }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save Cambios
              </button>
            )}
            {/* Supervisor: Approve + Reject + Cancel */}
            {isPending && (
              <>
                <button
                  onClick={handleSaveAndApprove}
                  disabled={!allChecked}
                  title={!allChecked ? 'Complete la lista de verificacion' : ''}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${allChecked ? 'bg-[#1B5E20] text-white hover:bg-[#2E7D32]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <CheckCircle size={16} />
                  {editing ? 'Save & Approve' : t('workRequests.validateRequest')}
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
                  Cancel
                </button>
              </>
            )}
            {/* Planner: Create WO from approved WR */}
            {isValidated && (
              <button
                onClick={() => { onPlannerCreateOT(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <FileText size={16} />
                Create WO
              </button>
            )}
            {canStart && (
              <button
                onClick={() => { onStart(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Wrench size={16} />
                Start Work
              </button>
            )}
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
    failure_description: desc.original_text || desc.structured_description || wr.failure_description || (typeof wr.problem_description === 'string' ? wr.problem_description : '') || '',
    failure_mode: desc.failure_mode_detected || desc.failure_mode_code || wr.failure_mode || '',
    production_impact: wr.production_impact || cls.production_impact || 'MEDIUM',
    estimated_duration: cls.estimated_duration_hours || wr.estimated_duration || 4,
    ai_confidence: Math.round(((cls.confidence ?? wr.equipment_confidence) ?? 0.85) * 100),
    spare_parts: wr.spare_parts || [],
    photos: wr.photos || wr.images || (wr.documents || []).filter(d => d.type === 'photo').map(d => d.data) || [],
    created_at: wr.created_at || new Date().toISOString(),
    // Classification fields (check both top-level, ai_classification, and problem_description)
    activity_class: wr.activity_class || cls.activity_class || '',
    work_class: wr.work_class || '',
    failure_category: wr.failure_category || cls.failure_category || desc.failure_mode_detected || '',
    failure_symptom: wr.failure_symptom || desc.failure_symptom || '',
    failure_cause: wr.failure_cause || desc.failure_cause || '',
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

export default function WorkRequests({ onNavigateTab, onRefreshCounts, autoOpenWrId, onClearAutoOpen, viewMode, isActive } = {}) {
  const [scope, setScope] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultQueue = user?.role === 'manager' ? 'supervisor' : user?.role === 'planner' ? 'planner' : 'all';
  const [priorityQueue, setPriorityQueue] = useState(defaultQueue); // 'all' | 'supervisor' (P1/P2) | 'planner' (P3/P4)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Default filter: always show ALL
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
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
  const [showDuplicates, setShowDuplicates] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [wrsWithOT, setWrsWithOT] = useState(new Set());

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

  // Refresh data when tab becomes active
  useEffect(() => {
    if (isActive) refreshList();
  }, [isActive]);

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
      const statusMap = { PENDING_VALIDATION: 'PENDIENTE', VALIDATED: 'APROBADO', REJECTED: 'RECHAZADO', CANCELLED: 'CANCELADO', CLOSED: 'CERRADO', DRAFT: 'PENDIENTE', ASSIGNED: 'APROBADO', IN_PROGRESS: 'APROBADO', COMPLETED: 'CERRADO' };
      const normalizedStatus = statusMap[r.status] || r.status;
      const matchesFilter = statusFilter === 'ALL' || normalizedStatus === statusFilter || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (r.id || r.request_id || '').toLowerCase().includes(q) ||
        (r.equipment_tag || '').toLowerCase().includes(q) ||
        (r.equipment_name || '').toLowerCase().includes(q) ||
        (r.failure_description || '').toLowerCase().includes(q);
      // Location filter
      const matchesLocation = !locationFilter ||
        (r.technical_location || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
        (r.equipment_tag || '').toLowerCase().includes(locationFilter.toLowerCase());
      // Date filter
      const rDate = r.created_at ? r.created_at.slice(0, 10) : '';
      const matchesDateFrom = !dateFrom || rDate >= dateFrom;
      const matchesDateTo = !dateTo || rDate <= dateTo;
      const matchesPriority = !priorityFilter || (r.priority_requested || r.priority_suggested || "") === priorityFilter;
      return matchesFilter && matchesSearch && matchesLocation && matchesDateFrom && matchesDateTo && matchesPriority;
    });
  }, [areaFiltered, statusFilter, search, locationFilter, dateFrom, dateTo, priorityFilter]);

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
            toast.success('FAST TRACK: OT ' + (wo.wo_number || '') + ' creada — abriendo en Planning...');
            if (onNavigateTab) onNavigateTab('planning', null, wo.wo_id || wo.wo_number);
          } catch {
            toast.success(t('workRequests.validatedNoOT') || 'Aviso aprobado. Error creating OT automática — créala manualmente.');
          }
        } else {
          toast.success(
            <span>
              {t('workRequests.validatedBacklog') || 'Aviso aprobado y agregado al Backlog'}
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
      .catch(() => toast.error(t('workRequests.errorValidate') || 'Error validating'))
      .finally(() => { onRefreshCounts?.(); refreshList(); });
  }

  function handleReject(id) {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'RECHAZADO', rejection_reason: reason } : r)));
    api.validateWorkRequest(id, { action: 'REJECT', rejection_reason: reason })
      .then(() => toast.success('Notification rejected. El creador será notificado.'))
      .catch(() => toast.error('Error al rechazar aviso'))
      .finally(() => { onRefreshCounts?.(); refreshList(); });
  }

  function handleReopen(id) {
    api.reopenWorkRequest(id)
      .then(() => { toast.success('Aviso reabierto'); onRefreshCounts?.(); refreshList(); })
      .catch(() => toast.error('Error reopening'));
  }

  function handleCancel(id) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'CANCELADO' } : r)));
    api.cancelWorkRequest(id)
      .then(() => toast.success(t('workRequests.cancelled') || 'Notification cancelled'))
      .finally(() => onRefreshCounts?.())
      .catch(() => toast.error(t('workRequests.errorCancel') || 'Error cancelling'));
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
    const msg = t('workRequests.confirmDelete');
    if (!window.confirm(msg !== 'workRequests.confirmDelete' ? msg : '¿Delete este aviso de trabajo?')) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    api.deleteWorkRequest(id).catch(() => {
      // Re-fetch on error to restore state
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: queueFiltered.filter(r => ['PENDING_VALIDATION', 'PENDIENTE'].includes(r.status)).length, borderColor: 'border-l-yellow-400', textColor: 'text-yellow-600' },
          { label: 'Approved', count: queueFiltered.filter(r => ['VALIDATED', 'APPROVED', 'ASSIGNED', 'APROBADO'].includes(r.status)).length, borderColor: '', textColor: 'text-gray-500' },
          { label: 'Rejected', count: queueFiltered.filter(r => r.status === 'REJECTED').length, borderColor: 'border-l-red-400', textColor: 'text-red-600' },
          { label: 'Cancelled', count: queueFiltered.filter(r => r.status === 'CANCELLED').length, borderColor: 'border-l-gray-400', textColor: 'text-gray-500' },
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

      {/* Duplicate Warning */}
      {showDuplicates.length > 0 && (
        <DuplicateWarning
          duplicates={showDuplicates}
          onViewDuplicate={handleViewDuplicate}
          onDismiss={handleDismissDuplicate}
          t={t}
          currentRequest={duplicateTarget}
        />
      )}

      {/* Filter Bar - Planning style */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('workRequests.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
          </div>
          <div className="flex gap-1">
            {STATUS_KEYS.map(key => {
              const colors = { ALL: 'bg-gray-600', PENDIENTE: 'bg-gray-500', APROBADO: 'bg-green-600', RECHAZADO: 'bg-red-600', CANCELADO: 'bg-red-500', CERRADO: 'bg-emerald-700' };
              const cnt = key === 'ALL' ? areaFiltered.length : areaFiltered.filter(r => {
                const sm = { PENDING_VALIDATION: 'PENDIENTE', VALIDATED: 'APROBADO', REJECTED: 'RECHAZADO', CANCELLED: 'CANCELADO', CLOSED: 'CERRADO', DRAFT: 'PENDIENTE', ASSIGNED: 'APROBADO', IN_PROGRESS: 'APROBADO', COMPLETED: 'CERRADO' };
                return (sm[r.status] || r.status) === key || r.status === key;
              }).length;
              return (
                <button key={key} onClick={() => setStatusFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${statusFilter === key ? (colors[key] || 'bg-gray-600') + ' text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {statusLabels[key] ?? key} <span className="ml-1 opacity-75">{cnt}</span>
                </button>
              );
            })}
          </div>
          <select value={priorityFilter || 'ALL'} onChange={e => setPriorityFilter(e.target.value === 'ALL' ? '' : e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/30">
            <option value="ALL">All Priority</option>
            <option value="P1">P1 - Immediate</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
          {(search || statusFilter !== 'ALL' || priorityFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter(''); setLocationFilter(''); setDateFrom(''); setDateTo(''); }}
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
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
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
                          {/* PENDIENTE: Validate + Reject */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenDetail(req)}
                                className="text-[10px] px-2 py-1 rounded bg-[#1B5E20] text-white hover:bg-[#2E7D32] font-medium transition-colors"
                                title="Validar aviso"
                              >
                                Validate
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors border border-red-200"
                                title="Rechazar aviso"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {/* VALIDATED/APROBADO: Create WO + Cancel */}
                          {['VALIDATED', 'ASSIGNED', 'SCHEDULED', 'APROBADO'].includes(req.status) && !wrsWithOT.has(req.id) && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    const wo = await api.createWOFromWR({ work_request_id: req.id });
                                    setWrsWithOT(prev => new Set([...prev, req.id]));
                                    onRefreshCounts?.();
                                    toast.success('OT ' + (wo.wo_number || '') + ' creada');
                                    if (onNavigateTab) onNavigateTab('planning', null, wo.wo_id || wo.wo_number);
                                  } catch (e) { toast.error('Error creando OT: ' + (e.message || '')); }
                                }}
                                className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
                                title="Create Work Order"
                              >
                                Create WO
                              </button>
                              <button
                                onClick={() => handleCancel(req.id)}
                                className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors border border-gray-300"
                                title="Cancelar aviso"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {['VALIDATED', 'ASSIGNED', 'SCHEDULED', 'APROBADO'].includes(req.status) && wrsWithOT.has(req.id) && (
                            <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                              OT Created
                            </span>
                          )}
                          {/* IN_PROGRESS: Complete + Cancel */}
                          {req.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleComplete(req.id)}
                                className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
                                title="Completar trabajo"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancel(req.id)}
                                className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors border border-gray-300"
                                title="Cancelar"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {/* COMPLETED: Close */}
                          {req.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleClose(req.id)}
                              className="text-[10px] px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 font-medium transition-colors"
                              title="Cierre tecnico"
                            >
                              Close
                            </button>
                          )}
                          {/* CANCELLED/REJECTED/CLOSED: Reopen (admin/manager only) */}
                          {['CANCELLED', 'CANCELADO', 'REJECTED', 'RECHAZADO', 'CERRADO', 'CLOSED'].includes(req.status) && ['admin', 'manager'].includes(user?.role) && (
                            <button
                              onClick={() => handleReopen(req.id)}
                              className="text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium transition-colors border border-amber-300"
                              title="Reabrir aviso"
                            >
                              Reopen
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title={t('common.delete') || 'Delete'}
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

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          item={selected}
          critScore={critScore}
          duplicates={findDuplicates(selected, requests)}
          onOpenDuplicate={(dup) => { fetchAndOpenDetail(dup); }}
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
