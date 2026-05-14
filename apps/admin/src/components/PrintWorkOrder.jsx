import { Printer } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '$0.00' : '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function handlePrintWorkOrder(workOrder) {
  if (!workOrder) return;

  const raw = workOrder._raw || {};
  const priority = raw.priority_code || raw.priority || workOrder.priority_code || 'P3';
  const status = raw.status || workOrder.status || '—';
  const description = raw.problem_description?.original_text || workOrder.description || '—';
  const woNumber = workOrder.wo_number || workOrder.id || '—';
  const woType = raw.wo_type || workOrder.wo_type || raw.work_class || '—';
  const equipTag = raw.equipment_tag || workOrder.equipment_tag || '—';
  const equipId = raw.equipment_id || workOrder.equipment_id || '—';
  const funcLoc = raw.functional_location || workOrder.functional_location || '—';
  const equipDesc = raw.equipment_description || workOrder.equipment_description || '—';
  const reportedBy = raw.reported_by || workOrder.reported_by || '—';
  const createdBy = raw.created_by || workOrder.created_by || '—';
  const responsible = workOrder.responsible || raw.assigned_to || '—';
  const circumstances = raw.circumstances || '';
  const plannedStart = workOrder.planned_start || raw.planned_start;
  const plannedEnd = workOrder.planned_end || raw.planned_end;
  const slaDeadline = raw.sla_deadline;
  const estimatedHours = workOrder.estimated_hours || raw.estimated_hours || '—';
  const aiClass = raw.ai_classification || {};
  const operations = workOrder.operations || raw.operations || [];
  const materials = workOrder.materials || raw.materials || raw.spare_parts || [];
  const laborCost = workOrder.labor_cost || raw.labor_cost || 0;
  const materialCost = workOrder.material_cost || raw.material_cost || 0;
  const externalCost = workOrder.external_cost || raw.external_cost || 0;
  const totalCost = workOrder.actual_total_cost || (parseFloat(laborCost) + parseFloat(materialCost) + parseFloat(externalCost)) || 0;
  const budgetAmount = workOrder.budget_amount || raw.budget_amount || 0;
  const priorityLabel = { P1: 'P1 - Emergencia', P2: 'P2 - Urgente', P3: 'P3 - Normal', P4: 'P4 - Planificada' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let opsHTML = '';
  if (Array.isArray(operations) && operations.length > 0) {
    const rows = operations.map((op, i) => {
      const desc = esc(op.description || op.name || op.text || 'Operacion ' + (i + 1));
      const hrs = esc(op.hours || op.estimated_hours || op.duration || '—');
      const craft = esc(op.craft || op.trade || op.resource || '—');
      return '<tr><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">' + (i+1) + '</td><td style="padding:6px 8px;border:1px solid #ddd;">' + desc + '</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">' + craft + '</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">' + hrs + '</td></tr>';
    }).join('');
    opsHTML = '<div style="margin-top:20px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">OPERACIONES</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f3f4f6;"><th style="padding:6px 8px;border:1px solid #ddd;width:40px;">#</th><th style="padding:6px 8px;border:1px solid #ddd;">Descripción</th><th style="padding:6px 8px;border:1px solid #ddd;width:100px;">Especialidad</th><th style="padding:6px 8px;border:1px solid #ddd;width:60px;">Horas</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  let matsHTML = '';
  if (Array.isArray(materials) && materials.length > 0) {
    const rows = materials.map((m, i) => {
      const desc = esc(m.description || m.name || m.code || 'Material ' + (i+1));
      const qty = esc(m.quantity || m.qty || '—');
      const sapId = esc(m.sapId || m.sap_id || m.material_number || '—');
      return '<tr><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">' + (i+1) + '</td><td style="padding:6px 8px;border:1px solid #ddd;">' + sapId + '</td><td style="padding:6px 8px;border:1px solid #ddd;">' + desc + '</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">' + qty + '</td></tr>';
    }).join('');
    matsHTML = '<div style="margin-top:20px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">MATERIALES / REPUESTOS</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f3f4f6;"><th style="padding:6px 8px;border:1px solid #ddd;width:40px;">#</th><th style="padding:6px 8px;border:1px solid #ddd;width:120px;">Código SAP</th><th style="padding:6px 8px;border:1px solid #ddd;">Descripción</th><th style="padding:6px 8px;border:1px solid #ddd;width:60px;">Cant.</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  let aiHTML = '';
  if (aiClass && Object.keys(aiClass).length > 0) {
    let aiRows = '';
    if (aiClass.failure_type) aiRows += '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600;width:160px;">Failure Type</td><td style="padding:4px 8px;border:1px solid #ddd;">' + esc(aiClass.failure_type) + '</td></tr>';
    if (aiClass.failure_class) aiRows += '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600;">Clase</td><td style="padding:4px 8px;border:1px solid #ddd;">' + esc(aiClass.failure_class) + '</td></tr>';
    if (aiClass.failure_category) aiRows += '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600;">Categoria</td><td style="padding:4px 8px;border:1px solid #ddd;">' + esc(aiClass.failure_category) + '</td></tr>';
    if (aiClass.recommended_priority) aiRows += '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600;">Suggested Priority</td><td style="padding:4px 8px;border:1px solid #ddd;">' + esc(aiClass.recommended_priority) + '</td></tr>';
    if (aiClass.summary) aiRows += '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600;">Resumen AI</td><td style="padding:4px 8px;border:1px solid #ddd;">' + esc(aiClass.summary) + '</td></tr>';
    if (aiRows) aiHTML = '<div style="margin-top:20px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">CLASIFICACIÓN AI</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody>' + aiRows + '</tbody></table></div>';
  }

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>OT ' + esc(woNumber) + '</title><style>@page{size:A4;margin:15mm 12mm}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1a1a1a;line-height:1.4;padding:0}</style></head><body>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #059669;padding-bottom:10px;margin-bottom:16px;"><div><h1 style="font-size:20px;font-weight:800;color:#059669;margin:0;">AMS Industrial</h1><p style="font-size:11px;color:#666;margin-top:2px;">Sistema de Gestion de Mantenimiento</p></div><div style="text-align:right;"><h2 style="font-size:18px;font-weight:700;color:#1a1a1a;margin:0;">ORDEN DE TRABAJO</h2><p style="font-size:14px;font-weight:700;color:#059669;margin-top:2px;">' + esc(woNumber) + '</p></div></div>' +
    '<div style="display:flex;gap:0;border:2px solid #059669;border-radius:6px;overflow:hidden;margin-bottom:16px;"><div style="flex:1;padding:8px 12px;background:#ecfdf5;border-right:1px solid #d1d5db;"><span style="font-size:10px;color:#666;display:block;">TIPO</span><span style="font-weight:700;font-size:13px;">' + esc(woType) + '</span></div><div style="flex:1;padding:8px 12px;background:#ecfdf5;border-right:1px solid #d1d5db;"><span style="font-size:10px;color:#666;display:block;">PRIORIDAD</span><span style="font-weight:700;font-size:13px;">' + esc(priorityLabel[priority] || priority) + '</span></div><div style="flex:1;padding:8px 12px;background:#ecfdf5;border-right:1px solid #d1d5db;"><span style="font-size:10px;color:#666;display:block;">ESTADO</span><span style="font-weight:700;font-size:13px;">' + esc(status.replace(/_/g, ' ')) + '</span></div><div style="flex:1;padding:8px 12px;background:#ecfdf5;"><span style="font-size:10px;color:#666;display:block;">HORAS EST.</span><span style="font-weight:700;font-size:13px;">' + esc(estimatedHours) + '</span></div></div>' +
    '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">INFORMACIÓN DEL EQUIPO</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;width:160px;background:#f9fafb;">Tag Equipo</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(equipTag) + '</td><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;width:160px;background:#f9fafb;">ID Equipo</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(equipId) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Ubicación Técnica</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(funcLoc) + '</td><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Descripción Equipo</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(equipDesc) + '</td></tr></tbody></table></div>' +
    '<div style="margin-bottom:16px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">DESCRIPCIÓN DEL PROBLEMA</h3><div style="padding:10px;background:#f9fafb;border:1px solid #ddd;border-radius:4px;min-height:60px;white-space:pre-wrap;">' + esc(description) + '</div>' + (circumstances ? '<div style="margin-top:8px;"><span style="font-weight:600;font-size:11px;color:#666;">CIRCUNSTANCIAS:</span><div style="padding:8px 10px;background:#f9fafb;border:1px solid #ddd;border-radius:4px;margin-top:4px;">' + esc(circumstances) + '</div></div>' : '') + '</div>' +
    '<div style="display:flex;gap:16px;margin-bottom:16px;"><div style="flex:1;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">FECHAS</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Inicio Planificado</td><td style="padding:5px 8px;border:1px solid #ddd;">' + fmtDate(plannedStart) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Fin Planificado</td><td style="padding:5px 8px;border:1px solid #ddd;">' + fmtDate(plannedEnd) + '</td></tr>' + (slaDeadline ? '<tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Vencimiento SLA</td><td style="padding:5px 8px;border:1px solid #ddd;">' + fmtDate(slaDeadline) + '</td></tr>' : '') + '</tbody></table></div>' +
    '<div style="flex:1;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">PERSONAL</h3><table style="width:100%;border-collapse:collapse;font-size:12px;"><tbody><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Reportado Por</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(reportedBy) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Creado Por</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(createdBy) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Asignado A</td><td style="padding:5px 8px;border:1px solid #ddd;">' + esc(responsible) + '</td></tr></tbody></table></div></div>' +
    opsHTML + matsHTML + aiHTML +
    '<div style="margin-top:20px;"><h3 style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">RESUMEN DE COSTOS</h3><table style="width:50%;border-collapse:collapse;font-size:12px;"><tbody><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Mano de Obra</td><td style="padding:5px 8px;border:1px solid #ddd;text-align:right;">' + fmtCurrency(laborCost) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Materiales</td><td style="padding:5px 8px;border:1px solid #ddd;text-align:right;">' + fmtCurrency(materialCost) + '</td></tr><tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Servicios Externos</td><td style="padding:5px 8px;border:1px solid #ddd;text-align:right;">' + fmtCurrency(externalCost) + '</td></tr><tr style="background:#ecfdf5;"><td style="padding:6px 8px;border:1px solid #059669;font-weight:700;">TOTAL</td><td style="padding:6px 8px;border:1px solid #059669;text-align:right;font-weight:700;">' + fmtCurrency(totalCost) + '</td></tr>' + (parseFloat(budgetAmount) > 0 ? '<tr><td style="padding:5px 8px;border:1px solid #ddd;font-weight:600;background:#f9fafb;">Presupuesto</td><td style="padding:5px 8px;border:1px solid #ddd;text-align:right;">' + fmtCurrency(budgetAmount) + '</td></tr>' : '') + '</tbody></table></div>' +
    '<div style="margin-top:40px;page-break-inside:avoid;"><h3 style="font-size:14px;font-weight:700;margin-bottom:20px;color:#1a1a1a;border-bottom:2px solid #059669;padding-bottom:4px;">FIRMAS</h3><div style="display:flex;justify-content:space-between;gap:24px;"><div style="flex:1;text-align:center;"><div style="border-bottom:1px solid #333;height:50px;margin-bottom:6px;"></div><p style="font-size:11px;font-weight:600;">Preparado Por</p><p style="font-size:10px;color:#666;">Nombre / Fecha</p></div><div style="flex:1;text-align:center;"><div style="border-bottom:1px solid #333;height:50px;margin-bottom:6px;"></div><p style="font-size:11px;font-weight:600;">Aprobado Por (Supervisor)</p><p style="font-size:10px;color:#666;">Nombre / Fecha</p></div><div style="flex:1;text-align:center;"><div style="border-bottom:1px solid #333;height:50px;margin-bottom:6px;"></div><p style="font-size:11px;font-weight:600;">Ejecutado Por</p><p style="font-size:10px;color:#666;">Nombre / Fecha</p></div></div></div>' +
    '<div style="margin-top:30px;padding-top:8px;border-top:1px solid #ddd;display:flex;justify-content:space-between;font-size:9px;color:#999;"><span>AMS Industrial — Sistema de Gestión de Mantenimiento</span><span>Impreso: ' + new Date().toLocaleString('es-CL') + '</span><span>Página 1 de 1</span></div>' +
    '<div class="no-print" style="position:fixed;top:16px;right:16px;z-index:9999;"><button onclick="window.print()" style="padding:10px 20px;background:#059669;color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);">Print / PDF</button><button onclick="window.close()" style="margin-left:8px;padding:10px 20px;background:#6b7280;color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);">Close</button></div>' +
    '</body></html>';

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
  }
}

export default function PrintWorkOrderButton({ workOrder, className = '' }) {
  return (
    <button
      onClick={() => handlePrintWorkOrder(workOrder)}
      className={"inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors " + className}
      title="Print Work Order"
    >
      <Printer className="w-4 h-4" />
      Print
    </button>
  );
}
