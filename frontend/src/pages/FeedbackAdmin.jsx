import { useState, useEffect } from 'react';
import * as api from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, Star, Bug, Lightbulb, Wrench, HelpCircle, ChevronDown, ChevronUp, Eye, Image, Paperclip, RefreshCw, Mail, Users, Repeat, Video } from 'lucide-react';

const FREQUENCY_LABELS = { always: 'Siempre', sometimes: 'A veces', rarely: 'Rara vez', first_time: 'Primera vez' };
const IMPACT_LABELS = { only_me: 'Solo yo', my_team: 'Mi equipo', everyone: 'Todos', unknown: 'No seguro' };

const TYPE_CONFIG = {
  bug: { label: 'Bug', icon: Bug, color: '#EF4444', bg: '#FEE2E2' },
  suggestion: { label: 'Sugerencia', icon: Lightbulb, color: '#F59E0B', bg: '#FEF3C7' },
  improvement: { label: 'Mejora', icon: Wrench, color: '#3B82F6', bg: '#DBEAFE' },
  question: { label: 'Pregunta', icon: HelpCircle, color: '#8B5CF6', bg: '#EDE9FE' },
  other: { label: 'Otro', icon: HelpCircle, color: '#6B7280', bg: '#F3F4F6' },
};

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-500',
};

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState({ type: '', status: '', priority: '' });
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.feedback_type = filter.type;
      if (filter.status) params.status = filter.status;
      const data = await api.listFeedback(params);
      setFeedback(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter.type, filter.status]);

  const handleDownloadJSON = async () => {
    setDownloading(true);
    try {
      const data = await api.exportFeedbackJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error al descargar');
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (fb, newStatus) => {
    try {
      await api.updateFeedback(fb.feedback_id, { status: newStatus });
      load();
    } catch (err) {
      alert(err.message || 'Error');
    }
  };

  // Stats
  const stats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'new').length,
    bugs: feedback.filter(f => f.feedback_type === 'bug').length,
    avgRating: feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Center</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona y descarga todo el feedback del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={handleDownloadJSON} disabled={downloading}>
            <Download className="w-4 h-4" />
            {downloading ? 'Descargando...' : 'Descargar JSON'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <div className="text-xs text-gray-500 uppercase font-semibold">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="text-xs text-blue-500 uppercase font-semibold">Nuevos</div>
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="text-xs text-red-500 uppercase font-semibold">Bugs</div>
          <div className="text-2xl font-bold text-red-600">{stats.bugs}</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="text-xs text-amber-500 uppercase font-semibold">Rating Promedio</div>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.avgRating}</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}
          className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">Todos los tipos</option>
          <option value="bug">Bug</option>
          <option value="suggestion">Sugerencia</option>
          <option value="improvement">Mejora</option>
          <option value="question">Pregunta</option>
          <option value="other">Otro</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="reviewed">Revisado</option>
          <option value="in_progress">En Progreso</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : feedback.length === 0 ? (
        <Card className="p-12 bg-white text-center text-gray-400">
          <p className="text-lg">No hay feedback todavia</p>
          <p className="text-sm mt-1">El feedback aparecera aqui cuando los usuarios lo envien</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedback.map(fb => {
            const typeConf = TYPE_CONFIG[fb.feedback_type] || TYPE_CONFIG.other;
            const TypeIcon = typeConf.icon;
            const isExpanded = expanded === fb.feedback_id;

            return (
              <Card key={fb.feedback_id} className="bg-white overflow-hidden">
                {/* Row header */}
                <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(isExpanded ? null : fb.feedback_id)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeConf.bg }}>
                    <TypeIcon className="w-4 h-4" style={{ color: typeConf.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{fb.title || 'Sin titulo'}</span>
                      <Badge className={PRIORITY_COLORS[fb.priority] || 'bg-gray-100'}>{fb.priority}</Badge>
                      <Badge className={STATUS_COLORS[fb.status] || 'bg-gray-100'}>{fb.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{fb.user_name}</span>
                      <span>{fb.page_name}{fb.section ? ` > ${fb.section}` : ''}</span>
                      <span>{fb.device_type}</span>
                      <span>{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}</span>
                      {fb.screenshots?.length > 0 && <span className="flex items-center gap-0.5"><Image className="w-3 h-3" /> {fb.screenshots.length}</span>}
                      {fb.attachments?.length > 0 && <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> {fb.attachments.length}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-gray-50/50">
                    {fb.description && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripcion</div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.description}</p>
                      </div>
                    )}

                    {/* Impact & frequency badges */}
                    {(fb.impact || fb.frequency || fb.contact_email) && (
                      <div className="flex flex-wrap gap-2">
                        {fb.impact && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            <Users className="w-3 h-3" /> Impacto: {IMPACT_LABELS[fb.impact] || fb.impact}
                          </span>
                        )}
                        {fb.frequency && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                            <Repeat className="w-3 h-3" /> Frecuencia: {FREQUENCY_LABELS[fb.frequency] || fb.frequency}
                          </span>
                        )}
                        {fb.contact_email && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                            <Mail className="w-3 h-3" /> {fb.contact_email}
                          </span>
                        )}
                      </div>
                    )}

                    {fb.feedback_type === 'bug' && (fb.steps_to_reproduce || fb.expected_behavior || fb.actual_behavior) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {fb.steps_to_reproduce && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Pasos</div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.steps_to_reproduce}</p>
                          </div>
                        )}
                        {fb.expected_behavior && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Esperado</div>
                            <p className="text-sm text-gray-700">{fb.expected_behavior}</p>
                          </div>
                        )}
                        {fb.actual_behavior && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Actual</div>
                            <p className="text-sm text-gray-700">{fb.actual_behavior}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Improvement: desired behavior */}
                    {fb.feedback_type === 'improvement' && (fb.actual_behavior || fb.desired_behavior) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fb.actual_behavior && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Comportamiento actual</div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.actual_behavior}</p>
                          </div>
                        )}
                        {fb.desired_behavior && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Comportamiento deseado</div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.desired_behavior}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggestion: expected benefit */}
                    {fb.feedback_type === 'suggestion' && fb.expected_benefit && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Beneficio esperado</div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.expected_benefit}</p>
                      </div>
                    )}

                    {fb.component && (
                      <div className="text-sm"><span className="text-gray-500">Componente:</span> <span className="font-medium">{fb.component}</span></div>
                    )}

                    {/* Context info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {fb.browser_info && <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 truncate max-w-xs" title={fb.browser_info}>
                        {fb.browser_info.slice(0, 60)}...
                      </span>}
                      {fb.screen_size && <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{fb.screen_size}</span>}
                      {fb.page_url && <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 truncate max-w-xs">{fb.page_url}</span>}
                    </div>

                    {/* Screenshots */}
                    {fb.screenshots?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Screenshots</div>
                        <div className="flex gap-2 overflow-x-auto">
                          {fb.screenshots.map((sc, i) => (
                            <a key={i} href={sc.url} target="_blank" rel="noreferrer" className="flex-shrink-0">
                              <img src={sc.url} alt={sc.caption || `Screenshot ${i+1}`}
                                className="h-24 rounded-lg border hover:shadow-md transition-shadow" />
                              {sc.caption && <div className="text-xs text-gray-500 mt-1 max-w-[120px] truncate">{sc.caption}</div>}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {fb.attachments?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Archivos</div>
                        <div className="flex flex-wrap gap-2">
                          {fb.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="truncate max-w-[150px]">{att.filename}</span>
                              <span className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)}KB</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className="text-xs text-gray-500 mr-2">Cambiar estado:</span>
                      {['new', 'reviewed', 'in_progress', 'resolved', 'closed'].map(s => (
                        <button key={s} onClick={() => handleStatusChange(fb, s)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${fb.status === s ? 'ring-2 ring-emerald-500' : 'hover:ring-1 hover:ring-gray-300'} ${STATUS_COLORS[s] || 'bg-gray-100'}`}>
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
