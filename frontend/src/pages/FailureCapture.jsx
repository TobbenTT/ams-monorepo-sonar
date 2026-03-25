import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Loader2, ArrowRight, X } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as api from '../api';

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical', color: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' },
  { value: 'HIGH', label: 'High', color: 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { value: 'LOW', label: 'Low', color: 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' },
];

const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Night'];

const SEVERITY_TO_PRIORITY = { CRITICAL: 'P1', HIGH: 'P2', MEDIUM: 'P3', LOW: 'P4' };

export default function FailureCapture({ onNavigateTab }) {
  const { plant } = useOutletContext();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  // Form state
  const [form, setForm] = useState({
    equipment_tag: '',
    location: '',
    failure_type: '',
    severity: '',
    description: '',
    reported_by: user?.name || user?.username || 'Reliability Eng.',
    date_time: new Date().toISOString().slice(0, 16),
    area: '',
    shift: '',
    notes: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Lookup data
  const [equipment, setEquipment] = useState([]);
  const [locations, setLocations] = useState([]);
  const [failureTypes, setFailureTypes] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.listNodes({ plant_id: plant, node_type: 'EQUIPMENT' }),
      api.listNodes({ plant_id: plant, node_type: 'AREA' }),
      api.getFailureCategories(),
    ]).then(([eqRes, areaRes, catRes]) => {
      const eqList = eqRes.status === 'fulfilled' ? (Array.isArray(eqRes.value) ? eqRes.value : []) : [];
      setEquipment(eqList);
      // Build locations from equipment parent systems
      const locs = [...new Set(eqList.map(e => e.parent_node_id || '').filter(Boolean))];
      setLocations(locs);
      const areaList = areaRes.status === 'fulfilled' ? (Array.isArray(areaRes.value) ? areaRes.value : []) : [];
      setAreas(areaList);
      const cats = catRes.status === 'fulfilled' ? (Array.isArray(catRes.value) ? catRes.value : []) : [];
      setFailureTypes(cats);
    });
  }, [plant]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB per file'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB per file'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.equipment_tag) { toast.error('Asset/Equipment is required'); return; }
    if (!form.location) { toast.error('Location is required'); return; }
    if (!form.failure_type) { toast.error('Failure Type is required'); return; }
    if (!form.severity) { toast.error('Severity is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }

    setSubmitting(true);
    try {
      const eqObj = equipment.find(e => e.tag === form.equipment_tag || e.code === form.equipment_tag);
      const result = await api.createWRManual({
        equipment_tag: form.equipment_tag,
        equipment_name: eqObj?.name || form.equipment_tag,
        plant_id: plant || 'OCP-JFC1',
        problem_description: form.description,
        priority: SEVERITY_TO_PRIORITY[form.severity] || 'P3',
        failure_category: form.failure_type,
        suggested_action: form.notes || '',
        estimated_duration: form.severity === 'CRITICAL' ? 8 : form.severity === 'HIGH' ? 6 : 4,
        reported_by: form.reported_by,
        circumstances: `Location: ${form.location} | Area: ${form.area} | Shift: ${form.shift}`,
        created_by: user?.user_id || user?.username || '',
        materials: [],
        resources: [],
        documents: attachments.map(att => ({ name: att.name, data: att.data, type: "photo" })),
      });



      const wrId = result?.work_request_id || result?.request_id || '';
      toast.success(`Failure Report submitted — WR ${wrId.slice(0, 8)} created`);

      // Reset form
      setForm({
        equipment_tag: '', location: '', failure_type: '', severity: '',
        description: '', reported_by: form.reported_by,
        date_time: new Date().toISOString().slice(0, 16),
        area: '', shift: '', notes: '',
      });
      setAttachments([]);

      // Navigate to Identification tab
      if (onNavigateTab) onNavigateTab('identification');
    } catch (e) {
      toast.error('Error: ' + (e.message || 'Failed to submit'));
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setForm({
      equipment_tag: '', location: '', failure_type: '', severity: '',
      description: '', reported_by: form.reported_by,
      date_time: new Date().toISOString().slice(0, 16),
      area: '', shift: '', notes: '',
    });
    setAttachments([]);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Failure Report</h2>
            <p className="text-sm text-gray-500 mt-1">Complete all required fields to generate a Work Request</p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            WR will be created automatically
          </span>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-6">
          {/* Row 1: Asset + Reported By */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Asset/Equipment *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.equipment_tag}
                onChange={e => set('equipment_tag', e.target.value)}
              >
                <option value="">Select asset...</option>
                {equipment.map((eq, i) => (
                  <option key={i} value={eq.tag || eq.code}>
                    {eq.tag || eq.code} — {eq.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reported By</label>
              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
                  value={form.reported_by}
                  onChange={e => set('reported_by', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Location + Date/Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              >
                <option value="">Select location...</option>
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
                {/* Fallback if no locations loaded */}
                {locations.length === 0 && areas.map((a, i) => (
                  <option key={i} value={a.name || a.code}>{a.name || a.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.date_time}
                onChange={e => set('date_time', e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Failure Type + Area/Shift */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Failure Type *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={form.failure_type}
                onChange={e => set('failure_type', e.target.value)}
              >
                <option value="">Select type...</option>
                {failureTypes.map((ft, i) => (
                  <option key={i} value={ft.category || ft.code}>{ft.label || ft.category || ft.name}</option>
                ))}
                {failureTypes.length === 0 && (
                  <>
                    <option value="MECANICO">Mechanical</option>
                    <option value="ELECTRICO">Electrical</option>
                    <option value="INSTRUMENTACION">Instrumentation</option>
                    <option value="PROCESO">Process</option>
                  </>
                )}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={form.area}
                  onChange={e => set('area', e.target.value)}
                >
                  <option value="">Select...</option>
                  {areas.map((a, i) => (
                    <option key={i} value={a.name || a.code}>{a.name || a.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={form.shift}
                  onChange={e => set('shift', e.target.value)}
                >
                  <option value="">Select...</option>
                  {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Severity + Attachments */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Severity *</label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('severity', opt.value)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.severity === opt.value
                        ? opt.color + ' ring-2 ring-offset-1 ring-current'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Attachments</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drop files here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, PDF (max 10MB)</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                      <span className="truncate">{att.name}</span>
                      <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Description + Notes */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Describe the failure in detail..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400">* Required fields</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : <>Submit Failure Report <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
