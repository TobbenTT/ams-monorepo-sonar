import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wrench, Clock, AlertCircle, Plus, Calendar, User, Tag, FileText, MapPin, Printer } from 'lucide-react';
import { handlePrintWorkOrder } from "../PrintWorkOrder";

const PRIORITY_COLORS = {
  P1: 'bg-red-100 text-red-800',
  P2: 'bg-orange-100 text-orange-800',
  P3: 'bg-yellow-100 text-yellow-800',
  P4: 'bg-green-100 text-green-800',
};

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_VALIDATION: 'bg-blue-100 text-blue-700',
  VALIDATED: 'bg-indigo-100 text-indigo-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  IN_BACKLOG: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
};

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WorkOrderDetailDialog({
  workOrder,
  open,
  onClose,
  onCreateAction
}) {
  if (!workOrder) return null;

  const raw = workOrder._raw || {};
  const priority = raw.priority_code || raw.priority || 'P3';
  const description = raw.problem_description?.original_text || workOrder.description || '—';
  const aiClass = raw.ai_classification || {};
  const isOverdue = raw.sla_deadline && new Date(raw.sla_deadline) < new Date();
  const daysOld = workOrder.delayDays || 0;
  const isUrgent = priority === 'P1' || priority === 'P2' || isOverdue;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            Detalle del Aviso: {workOrder.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className={`p-4 rounded-lg border ${
            isUrgent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{raw.equipment_tag || '—'}</h3>
              <div className="flex items-center gap-2">
                <Badge className={PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'}>
                  {priority}
                </Badge>
                <Badge className={STATUS_COLORS[raw.status] || 'bg-gray-100 text-gray-700'}>
                  {raw.status?.replace(/_/g, ' ') || workOrder.status}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-600 text-white">VENCIDO</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1"><Tag className="w-3 h-3" /> Equipo</p>
                <p className="font-medium text-sm">{raw.equipment_id || raw.equipment_tag || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" /> Clase</p>
                <p className="font-medium text-sm">{raw.work_class || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> Creado</p>
                <p className="font-medium text-sm">{fmtDate(raw.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Antigüedad</p>
                <p className={`font-medium text-sm ${daysOld > 14 ? 'text-red-600' : ''}`}>{daysOld} días</p>
              </div>
            </div>
          </div>

          {/* Overdue Alert */}
          {isUrgent && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Atención requerida</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {isOverdue && `SLA vencido (límite: ${fmtDate(raw.sla_deadline)}). `}
                  {(priority === 'P1' || priority === 'P2') && `Priority alta (${priority}).`}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Description & SAP Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Descripción del Problema
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{description}</p>

                {raw.circumstances && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-1">Circunstancias</p>
                    <p className="text-sm text-gray-700">{raw.circumstances}</p>
                  </div>
                )}

                {raw.reported_by && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-1">Reportado por</p>
                    <p className="text-sm text-gray-700">{raw.reported_by}</p>
                  </div>
                )}
              </div>

              {/* SAP info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Tipo de Notificación</span>
                  <span className="text-sm font-medium">{raw.notification_type || 'A1'}</span>
                </div>
                {raw.sla_deadline && (
                  <div className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <span className="text-sm text-gray-600">Fecha SLA</span>
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>{fmtDate(raw.sla_deadline)}</span>
                  </div>
                )}
                {raw.created_by && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Creado por</span>
                    <span className="text-sm font-medium">{raw.created_by}</span>
                  </div>
                )}
                {workOrder.responsible && workOrder.responsible !== '—' && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1"><User className="w-3 h-3" /> Asignado a</span>
                    <span className="text-sm font-medium">{workOrder.responsible}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Classification & Validation */}
            <div>
              {Object.keys(aiClass).length > 0 && (
                <>
                  <h4 className="font-semibold mb-3">Clasificación AI</h4>
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2 mb-4">
                    {aiClass.failure_type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tipo de Falla</span>
                        <span className="font-medium">{aiClass.failure_type}</span>
                      </div>
                    )}
                    {aiClass.failure_class && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clase</span>
                        <span className="font-medium">{aiClass.failure_class}</span>
                      </div>
                    )}
                    {aiClass.failure_category && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Categoría</span>
                        <span className="font-medium">{aiClass.failure_category}</span>
                      </div>
                    )}
                    {aiClass.recommended_priority && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Priority Sugerida</span>
                        <Badge className={PRIORITY_COLORS[aiClass.recommended_priority] || 'bg-gray-100'}>
                          {aiClass.recommended_priority}
                        </Badge>
                      </div>
                    )}
                    {aiClass.confidence != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Confianza AI</span>
                        <span className="font-medium">{Math.round(aiClass.confidence * 100)}%</span>
                      </div>
                    )}
                    {aiClass.summary && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-700">{aiClass.summary}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Validation Info */}
              {raw.validation && (
                <>
                  <h4 className="font-semibold mb-3">Validación</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2 mb-4">
                    {raw.validation.validated_by && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Validado por</span>
                        <span className="font-medium">{raw.validation.validated_by}</span>
                      </div>
                    )}
                    {raw.validation.validated_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha</span>
                        <span className="font-medium">{fmtDate(raw.validation.validated_at)}</span>
                      </div>
                    )}
                    {raw.validation.comment && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-700">{raw.validation.comment}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Approval Info */}
              {raw.approved_at && (
                <>
                  <h4 className="font-semibold mb-3">Aprobación</h4>
                  <div className="p-4 bg-emerald-50 rounded-lg space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved por</span>
                      <span className="font-medium">{raw.approver_id || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha</span>
                      <span className="font-medium">{fmtDate(raw.approved_at)}</span>
                    </div>
                    {raw.approval_comment && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-700">{raw.approval_comment}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Rejection */}
              {raw.rejection_reason && (
                <div className="p-4 bg-red-50 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2 text-red-800">Motivo de Rechazo</h4>
                  <p className="text-sm text-red-700">{raw.rejection_reason}</p>
                </div>
              )}

              {/* Spare Parts */}
              {raw.spare_parts?.length > 0 && (
                <>
                  <h4 className="font-semibold mb-3">Spare parts Requeridos</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 font-medium">Material</th>
                          <th className="text-left p-2 font-medium">Cant.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {raw.spare_parts.map((sp, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-2">{sp.description || sp.code || sp.name || `Parte ${i + 1}`}</td>
                            <td className="p-2">{sp.quantity || sp.qty || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Support Equipment */}
          {raw.support_equipment?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Support Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {raw.support_equipment.map((eq, i) => (
                  <Badge key={i} variant="outline" className="text-sm">
                    {typeof eq === 'string' ? eq : `${eq.tag || ''} ${eq.description || ''}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Documents / Photos */}
          {raw.documents?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Adjuntos ({raw.documents.length})</h4>
              <div className="flex flex-wrap gap-2">
                {raw.documents.map((doc, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {doc.name || `Archivo ${i + 1}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="outline" onClick={() => handlePrintWorkOrder(workOrder)}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {isUrgent && onCreateAction && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onCreateAction(workOrder)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Acción de Mejora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
