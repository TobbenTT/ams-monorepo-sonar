/**
 * Weekly Operations Digest — 1 página A4 imprimible (Save as PDF).
 * Tanda 2026-04-27. Abre nueva ventana con Blob URL (HTML en memoria),
 * dispara window.print(); el usuario hace "Save as PDF".
 */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

const pct = (v) => (v == null ? '—' : `${v}%`);

const tone = (v, good = 80, ok = 60) => {
  if (v == null) return '#9ca3af';
  if (v >= good) return '#059669';
  if (v >= ok) return '#d97706';
  return '#dc2626';
};

export function openWeeklyDigest(data) {
  if (!data) return;

  const { plant_id, week_start, week_end, week_iso, generated_at, counts, kpis, top_equipment, overdue, priority_distribution } = data;

  const totalPlanned = counts?.total_planned || 0;
  const closedPct = totalPlanned ? Math.round((counts.closed / totalPlanned) * 100) : 0;

  const prioRows = Object.entries(priority_distribution || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([p, n]) => `<span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:3px 10px;margin-right:6px;font-size:11px;font-weight:600;"><b>${esc(p)}</b>: ${n}</span>`)
    .join('');

  const topEqRows = (top_equipment || []).map((e, i) => `
    <tr>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center;font-weight:600;">${i + 1}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-family:monospace;">${esc(e.tag)}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center;">${e.wo_count}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:right;font-weight:700;">${e.hh.toFixed(1)} h</td>
    </tr>`).join('');

  const overdueRows = (overdue?.top || []).map((o) => `
    <tr>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-family:monospace;font-weight:600;">${esc(o.wo_number)}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;font-family:monospace;">${esc(o.equipment_tag)}</td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center;"><span style="background:${o.priority === 'P1' ? '#fee2e2' : o.priority === 'P2' ? '#fed7aa' : '#fef3c7'};padding:1px 6px;border-radius:4px;font-weight:700;">${esc(o.priority || '')}</span></td>
      <td style="padding:5px 8px;border:1px solid #e5e7eb;text-align:center;color:#dc2626;font-weight:700;">+${o.days_overdue} d</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Weekly Digest ${esc(week_iso)} — ${esc(plant_id || 'Todas')}</title>
<style>
@page { size: A4; margin: 12mm; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display:none !important; } }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.4; }
h1 { font-size: 18px; }
h2 { font-size: 13px; margin-top: 12px; margin-bottom: 6px; color:#064e3b; border-bottom: 2px solid #059669; padding-bottom: 2px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0; }
.kpi { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; }
.kpi .l { font-size: 9px; text-transform: uppercase; color:#6b7280; font-weight:700; letter-spacing:0.04em; }
.kpi .v { font-size: 22px; font-weight: 800; }
.kpi .s { font-size: 10px; color:#6b7280; margin-top:2px; }
table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
th { background: #ecfdf5; padding: 5px 8px; border: 1px solid #d1fae5; font-weight: 700; color:#064e3b; text-align: left; }
.flex { display: flex; gap: 12px; }
.flex > div { flex: 1; }
</style>
</head><body>

<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #059669;padding-bottom:8px;margin-bottom:10px;">
  <div>
    <h1 style="color:#059669;font-weight:800;">AMS Industrial — Weekly Operations Digest</h1>
    <p style="font-size:11px;color:#6b7280;margin-top:2px;">Resumen semanal · ${esc(plant_id || 'Todas las plantas')}</p>
  </div>
  <div style="text-align:right;">
    <div style="font-size:14px;font-weight:800;">${esc(week_iso)}</div>
    <div style="font-size:10px;color:#6b7280;">${fmtDate(week_start)} → ${fmtDate(week_end)}</div>
  </div>
</div>

<h2>KPIs operativos</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">Adherencia</div><div class="v" style="color:${tone(kpis?.adherence_pct)};">${pct(kpis?.adherence_pct)}</div><div class="s">${kpis?.total_closed || 0} cerradas · ±4h del plan</div></div>
  <div class="kpi"><div class="l">Cumplimiento</div><div class="v" style="color:${tone(kpis?.compliance_pct, 90, 70)};">${pct(kpis?.compliance_pct)}</div><div class="s">ventana 7 días</div></div>
  <div class="kpi"><div class="l">HH Plan vs Real</div><div class="v">${kpis?.hh_actual ?? 0} / ${kpis?.hh_plan ?? 0}</div><div class="s">var. ${kpis?.hh_variance_pct == null ? '—' : (kpis.hh_variance_pct > 0 ? '+' : '') + kpis.hh_variance_pct + '%'}</div></div>
  <div class="kpi"><div class="l">% Cerradas</div><div class="v" style="color:${tone(closedPct, 70, 50)};">${closedPct}%</div><div class="s">${counts?.closed || 0} de ${totalPlanned} OTs</div></div>
</div>

<h2>Resumen del flujo</h2>
<table>
  <thead><tr><th>Estado</th><th style="text-align:center;width:90px;">Cantidad</th><th style="text-align:center;width:90px;">% del total</th></tr></thead>
  <tbody>
    <tr><td>Creadas en la semana</td><td style="text-align:center;font-weight:700;">${counts?.created || 0}</td><td style="text-align:center;">—</td></tr>
    <tr><td>Programadas</td><td style="text-align:center;font-weight:700;">${counts?.scheduled || 0}</td><td style="text-align:center;">${totalPlanned ? Math.round(counts.scheduled / totalPlanned * 100) : 0}%</td></tr>
    <tr><td>En ejecución</td><td style="text-align:center;font-weight:700;">${counts?.in_execution || 0}</td><td style="text-align:center;">${totalPlanned ? Math.round(counts.in_execution / totalPlanned * 100) : 0}%</td></tr>
    <tr style="background:#ecfdf5;"><td><b>Cerradas</b></td><td style="text-align:center;font-weight:700;color:#059669;">${counts?.closed || 0}</td><td style="text-align:center;">${closedPct}%</td></tr>
    <tr><td>Canceladas</td><td style="text-align:center;font-weight:700;color:#9ca3af;">${counts?.canceled || 0}</td><td style="text-align:center;">—</td></tr>
    <tr style="background:#f9fafb;"><td><b>TOTAL planificado</b></td><td style="text-align:center;font-weight:800;">${totalPlanned}</td><td style="text-align:center;">100%</td></tr>
  </tbody>
</table>
<div style="margin-top:6px;font-size:10px;color:#6b7280;"><b>Distribución por prioridad:</b> ${prioRows || '—'}</div>

<div class="flex" style="margin-top:8px;">
  <div>
    <h2>Top 5 equipos por HH consumida</h2>
    <table>
      <thead><tr><th style="width:30px;">#</th><th>Equipo / TAG</th><th style="width:60px;text-align:center;">OTs</th><th style="width:80px;text-align:right;">HH</th></tr></thead>
      <tbody>${topEqRows || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#9ca3af;">Sin datos</td></tr>'}</tbody>
    </table>
  </div>

  <div>
    <h2>OTs vencidas (top 5) <span style="color:#dc2626;font-weight:800;">[${overdue?.count || 0}]</span></h2>
    <table>
      <thead><tr><th>OT</th><th>Equipo</th><th style="width:50px;text-align:center;">P</th><th style="width:60px;text-align:center;">Atraso</th></tr></thead>
      <tbody>${overdueRows || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#059669;font-weight:700;">Sin OTs vencidas ✓</td></tr>'}</tbody>
    </table>
  </div>
</div>

<div style="margin-top:18px;padding-top:6px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:9px;color:#9ca3af;">
  <span>AMS Industrial — Sistema de Gestión de Mantenimiento</span>
  <span>Generado: ${new Date(generated_at).toLocaleString('es-CL')}</span>
  <span>Página 1 de 1</span>
</div>

<div class="no-print" style="position:fixed;top:14px;right:14px;z-index:9999;">
  <button onclick="window.print()" style="padding:9px 18px;background:#059669;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);">Imprimir / Guardar PDF</button>
  <button onclick="window.close()" style="margin-left:6px;padding:9px 16px;background:#6b7280;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">Cerrar</button>
</div>

</body></html>`;

  // Blob URL (evita document.write — más seguro y compatible con CSP).
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'width=900,height=900');
  if (w) {
    setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 800);
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 60000);
  }
}
