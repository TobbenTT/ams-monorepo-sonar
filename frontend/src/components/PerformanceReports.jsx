/**
 * Performance Reports — 3 PDFs derivados de los datos de Tanda C-EXT.
 *
 * Tanda C-EXT post-meeting 2026-04-28 12:32. Cierra el ciclo:
 *   ejecución → notificación HH → análisis cruzado → REPORTE para gestión.
 *
 * Patrón: cada `openXxxReport(data)` abre nueva ventana con HTML A4
 * imprimible y dispara window.print(). Usuario hace "Save as PDF".
 *
 * Reportes:
 *   1. Plan vs Real         · desviaciones HH plan/real, top overruns/underruns
 *   2. Bad Actors           · equipos con fallas recurrentes ≥3, candidatos FMECA
 *   3. Adherencia/Cumplim.  · 4 KPIs supervisor (cumplimiento + adherencia +
 *                              avisos atrasados + OTs atrasadas)
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

function commonStyles() {
  return `
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
table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 4px; }
th { background: #ecfdf5; padding: 5px 8px; border: 1px solid #d1fae5; font-weight: 700; color:#064e3b; text-align: left; }
td { padding: 5px 8px; border: 1px solid #e5e7eb; }
.footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
.section-note { font-size: 9.5px; color: #6b7280; font-style: italic; margin-top: 4px; }
.print-btn { background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; margin: 16px 8px; }
`;
}

function header(title, subtitle, plantId, periodLabel) {
  return `
<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #059669;padding-bottom:8px;margin-bottom:10px;">
  <div>
    <h1 style="color:#059669;font-weight:800;">MAGEAM — ${esc(title)}</h1>
    <p style="font-size:11px;color:#6b7280;margin-top:2px;">${esc(subtitle)} · ${esc(plantId || 'Todas las plantas')}</p>
  </div>
  <div style="text-align:right;">
    <div style="font-size:14px;font-weight:800;">${esc(periodLabel)}</div>
    <div style="font-size:10px;color:#6b7280;">Generado ${fmtDate(new Date().toISOString())}</div>
  </div>
</div>
`;
}

function footer() {
  return `
<div class="footer">
  AMS Industrial · Sistema de Gestión de Mantenimiento · Generado por MAGEAM
  <br/>Reporte interno — uso autorizado
</div>
<div class="no-print" style="text-align:center;">
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Save as PDF</button>
  <button class="print-btn" style="background:#6b7280;" onclick="window.close()">Cerrar</button>
</div>
`;
}

function openInNewWindow(html, title) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, title, 'width=900,height=1200');
  if (win) {
    setTimeout(() => {
      try { win.focus(); } catch {}
      // No auto-print: usuario decide cuando imprimir
    }, 500);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─────────────────────────────────────────────────────────────────────
// 1. Plan vs Real Report
// ─────────────────────────────────────────────────────────────────────
export function openPlanVsRealReport(data) {
  if (!data) return;
  const { plant_id, period_label, generated_at, stats, overruns, underruns } = data;

  const overrunRows = (overruns || []).map(o => `
    <tr>
      <td style="font-family:monospace;color:#1d4ed8;">${esc(o.wo)}</td>
      <td>${esc(o.op)}</td>
      <td><span style="background:#f3f4f6;padding:1px 6px;border-radius:4px;font-size:10px;">${esc(o.specialty || '—')}</span></td>
      <td style="text-align:right;font-family:monospace;">${o.planHH.toFixed(1)} h</td>
      <td style="text-align:right;font-family:monospace;font-weight:700;">${o.actualHH.toFixed(1)} h</td>
      <td style="text-align:right;color:#dc2626;font-weight:800;">+${Math.round(o.variance * 100)}%</td>
    </tr>`).join('');

  const underrunRows = (underruns || []).map(o => `
    <tr>
      <td style="font-family:monospace;color:#1d4ed8;">${esc(o.wo)}</td>
      <td>${esc(o.op)}</td>
      <td><span style="background:#f3f4f6;padding:1px 6px;border-radius:4px;font-size:10px;">${esc(o.specialty || '—')}</span></td>
      <td style="text-align:right;font-family:monospace;">${o.planHH.toFixed(1)} h</td>
      <td style="text-align:right;font-family:monospace;font-weight:700;">${o.actualHH.toFixed(1)} h</td>
      <td style="text-align:right;color:#d97706;font-weight:800;">${Math.round(o.variance * 100)}%</td>
      <td style="font-size:9.5px;color:#6b7280;">${esc(o.notes || '')}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Plan vs Real — ${esc(plant_id || '')}</title>
<style>${commonStyles()}</style></head><body>
${header('Plan vs Real (HH por Operación)', 'Cruce planificación vs ejecución desde notificación', plant_id, period_label || 'Período')}

<h2>Resumen ejecutivo</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">HH Planificadas</div><div class="v" style="color:#1d4ed8;">${Math.round(stats?.totalPlannedHH || 0)} h</div><div class="s">${stats?.opsCount || 0} operaciones</div></div>
  <div class="kpi"><div class="l">HH Reales (notif.)</div><div class="v" style="color:#7c3aed;">${Math.round(stats?.totalActualHH || 0)} h</div><div class="s">${stats?.opsNotified || 0} ops notif. (${stats?.coveragePct || 0}%)</div></div>
  <div class="kpi"><div class="l">Desviación promedio</div><div class="v" style="color:${Math.abs(stats?.avgVariancePct || 0) > 20 ? '#dc2626' : Math.abs(stats?.avgVariancePct || 0) > 10 ? '#d97706' : '#059669'};">${(stats?.avgVariancePct || 0) >= 0 ? '+' : ''}${stats?.avgVariancePct || 0}%</div><div class="s">desviación HH real vs plan</div></div>
  <div class="kpi"><div class="l">OTs analizadas</div><div class="v">${stats?.otsAnalyzed || 0}</div><div class="s">con operations definidas</div></div>
</div>
<p class="section-note">Cobertura ${stats?.coveragePct || 0}%: el indicador es válido si ≥70%. Cobertura baja indica que el supervisor / mantenedor no cargó la notificación HH real por operación.</p>

<h2>Top operaciones con OVERRUN (&gt;25% más HH del plan)</h2>
${overruns && overruns.length > 0 ? `
<table>
  <thead><tr>
    <th>WO</th><th>Operación</th><th>Spec</th><th style="text-align:right;">Plan</th><th style="text-align:right;">Real</th><th style="text-align:right;">Var.</th>
  </tr></thead>
  <tbody>${overrunRows}</tbody>
</table>
<p class="section-note">Acción sugerida: revisar planificación de operaciones similares · evaluar cambio estrategia · discutir en próximo sprint review.</p>
` : `<p class="section-note">Sin overruns significativos en este período. ✓</p>`}

<h2>Top operaciones con UNDERRUN (&lt;60% del plan — ¿se omitió trabajo?)</h2>
${underruns && underruns.length > 0 ? `
<table>
  <thead><tr>
    <th>WO</th><th>Operación</th><th>Spec</th><th style="text-align:right;">Plan</th><th style="text-align:right;">Real</th><th style="text-align:right;">Var.</th><th>Notas</th>
  </tr></thead>
  <tbody>${underrunRows}</tbody>
</table>
<p class="section-note">Underruns severos pueden indicar trabajo omitido (no se hizo y no se reprogramó) o sobreestimación crónica del planificador. Revisar caso por caso.</p>
` : `<p class="section-note">Sin underruns significativos en este período. ✓</p>`}

${footer()}
</body></html>`;

  openInNewWindow(html, 'plan-vs-real');
}

// ─────────────────────────────────────────────────────────────────────
// 2. Bad Actors Report
// ─────────────────────────────────────────────────────────────────────
export function openBadActorsReport(data) {
  if (!data) return;
  const { plant_id, period_label, equipments } = data;

  const rows = (equipments || []).map((e, i) => `
    <tr>
      <td style="text-align:center;font-weight:700;">${i + 1}</td>
      <td style="font-family:monospace;color:#1d4ed8;font-weight:600;">${esc(e.equipment)}</td>
      <td style="text-align:center;"><span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:6px;font-weight:800;">${e.count}</span></td>
      <td style="text-align:center;">${e.span_days} d</td>
      <td style="text-align:center;font-weight:700;">${e.mtbf_local != null ? e.mtbf_local + ' d' : '—'}</td>
      <td>
        ${(e.modes || []).length > 0
          ? e.modes.map(m => `<span style="background:#f3f4f6;padding:1px 6px;border-radius:4px;font-size:10px;margin-right:3px;">${esc(m)}</span>`).join('')
          : '<span style="color:#9ca3af;font-style:italic;">sin clasificar</span>'}
      </td>
      <td style="font-size:10px;color:#6b7280;">${e.lastDate ? new Date(e.lastDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}</td>
    </tr>`).join('');

  const totalFailures = (equipments || []).reduce((s, e) => s + e.count, 0);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Bad Actors — ${esc(plant_id || '')}</title>
<style>${commonStyles()}</style></head><body>
${header('Bad Actors (Equipos con Fallas Recurrentes)', 'Candidatos a estudio FMECA / RCA · cambio de estrategia', plant_id, period_label || 'Período')}

<h2>Resumen</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">Equipos detectados</div><div class="v" style="color:#dc2626;">${(equipments || []).length}</div><div class="s">≥3 reportes de falla en el período</div></div>
  <div class="kpi"><div class="l">Total fallas</div><div class="v">${totalFailures}</div><div class="s">acumuladas en estos equipos</div></div>
  <div class="kpi"><div class="l">MTBF medio</div><div class="v" style="color:#d97706;">${(equipments || []).filter(e => e.mtbf_local).length > 0 ? Math.round((equipments || []).filter(e => e.mtbf_local).reduce((s, e) => s + e.mtbf_local, 0) / (equipments || []).filter(e => e.mtbf_local).length) : 0} d</div><div class="s">entre fallas (días)</div></div>
  <div class="kpi"><div class="l">Acción</div><div class="v" style="font-size:14px;color:#dc2626;">FMECA / RCA</div><div class="s">recomendado</div></div>
</div>

<h2>Detalle por equipo</h2>
${(equipments || []).length > 0 ? `
<table>
  <thead><tr>
    <th style="text-align:center;">#</th>
    <th>Equipo</th>
    <th style="text-align:center;">Fallas</th>
    <th style="text-align:center;">Período</th>
    <th style="text-align:center;">MTBF</th>
    <th>Modos detectados</th>
    <th>Última falla</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
` : `<p class="section-note">Sin equipos con ≥3 fallas en el período. La flota está estable. ✓</p>`}

<h2>Recomendación de acción</h2>
<ul style="font-size:11px;line-height:1.7;color:#374151;padding-left:20px;">
  <li><b>Top 3 equipos</b>: abrir estudio FMECA inmediatamente. Listar modos de falla potenciales y criticidad.</li>
  <li><b>Equipos con MTBF &lt;15 días</b>: candidatos prioritarios a Análisis de Causa Raíz (RCA).</li>
  <li><b>Modos repetitivos</b>: si un mismo modo aparece &gt;2 veces en el mismo equipo, evaluar cambio de estrategia (correctivo → preventivo o predictivo).</li>
  <li><b>Modos sin clasificar</b>: pedir al equipo de mantenimiento clasificar el modo de falla en futuros avisos para análisis más rico.</li>
</ul>

<p class="section-note">
Jorge transcript 2026-04-28 12:32: "el sistema va a leer, esta falla, ¿cuándo fue la última vez que se asentó?".
Equipos con &ge;3 fallas en el período son candidatos automáticos a estudio FMECA + RCA.
</p>

${footer()}
</body></html>`;

  openInNewWindow(html, 'bad-actors');
}

// ─────────────────────────────────────────────────────────────────────
// 3. Adherencia + Cumplimiento Report
// ─────────────────────────────────────────────────────────────────────
export function openAdherenceComplianceReport(data) {
  if (!data) return;
  const { plant_id, period_label, kpis, weekly_history, top_offenders } = data;

  const historyRows = (weekly_history || []).map(w => `
    <tr>
      <td style="font-weight:700;">${esc(w.week)}</td>
      <td style="text-align:right;font-family:monospace;color:${tone(w.cumplimiento_pct, 85, 70)};font-weight:700;">${w.cumplimiento_pct}%</td>
      <td style="text-align:right;font-family:monospace;color:${tone(w.adherencia_pct, 80, 60)};font-weight:700;">${w.adherencia_pct}%</td>
      <td style="text-align:right;">${w.hh_plan} h</td>
      <td style="text-align:right;">${w.hh_real} h</td>
      <td style="text-align:right;font-weight:700;color:${Math.abs(w.hh_var_pct) > 15 ? '#dc2626' : '#1a1a1a'};">${w.hh_var_pct >= 0 ? '+' : ''}${w.hh_var_pct}%</td>
      <td style="text-align:center;">${w.cerradas} / ${w.programadas}</td>
    </tr>`).join('');

  const offendersRows = (top_offenders || []).map(o => `
    <tr>
      <td style="font-family:monospace;color:#1d4ed8;">${esc(o.wo_number)}</td>
      <td>${esc(o.equipment_tag || '—')}</td>
      <td style="text-align:center;"><span style="background:${o.priority === 'P1' ? '#fee2e2' : o.priority === 'P2' ? '#fed7aa' : '#fef3c7'};padding:1px 6px;border-radius:4px;font-weight:700;">${esc(o.priority || '')}</span></td>
      <td style="text-align:center;color:#dc2626;font-weight:700;">+${o.days_late} d</td>
      <td style="font-size:10px;color:#6b7280;">${esc(o.reason || '—')}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Adherencia &amp; Cumplimiento — ${esc(plant_id || '')}</title>
<style>${commonStyles()}</style></head><body>
${header('Adherencia + Cumplimiento del Programa', 'KPIs operacionales del supervisor', plant_id, period_label || 'Período')}

<h2>KPIs del período</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">Cumplimiento programa</div><div class="v" style="color:${tone(kpis?.cumplimiento_pct, 85, 70)};">${pct(kpis?.cumplimiento_pct)}</div><div class="s">${kpis?.hh_real || 0}h / ${kpis?.hh_plan || 0}h · meta 85%</div></div>
  <div class="kpi"><div class="l">Adherencia programa</div><div class="v" style="color:${tone(kpis?.adherencia_pct, 80, 60)};">${pct(kpis?.adherencia_pct)}</div><div class="s">${kpis?.adherentes || 0} en día / ${kpis?.cerradas_total || 0} cerradas · meta 80%</div></div>
  <div class="kpi"><div class="l">Avisos atrasados</div><div class="v" style="color:${(kpis?.avisos_atrasados || 0) === 0 ? '#059669' : (kpis?.avisos_atrasados || 0) < 3 ? '#d97706' : '#dc2626'};">${kpis?.avisos_atrasados || 0}</div><div class="s">pendientes &gt;24h sin validar</div></div>
  <div class="kpi"><div class="l">OTs atrasadas</div><div class="v" style="color:${(kpis?.ots_atrasadas || 0) === 0 ? '#059669' : (kpis?.ots_atrasadas || 0) < 3 ? '#d97706' : '#dc2626'};">${kpis?.ots_atrasadas || 0}</div><div class="s">vencidas &gt;24h sin notificar</div></div>
</div>

<h2>Histórico semanal (últimas 8 semanas)</h2>
${weekly_history && weekly_history.length > 0 ? `
<table>
  <thead><tr>
    <th>Semana</th>
    <th style="text-align:right;">Cumplim.</th>
    <th style="text-align:right;">Adheren.</th>
    <th style="text-align:right;">HH Plan</th>
    <th style="text-align:right;">HH Real</th>
    <th style="text-align:right;">Var. HH</th>
    <th style="text-align:center;">OTs cerr/prog</th>
  </tr></thead>
  <tbody>${historyRows}</tbody>
</table>
<p class="section-note">Tendencia favorable: cumplimiento + adherencia sobre meta de manera consistente. Retroceso prolongado &gt;3 semanas amerita acción de mejora formal.</p>
` : `<p class="section-note">Sin histórico suficiente para mostrar tendencia.</p>`}

${(top_offenders || []).length > 0 ? `
<h2>OTs con mayor desviación al programa</h2>
<table>
  <thead><tr>
    <th>WO</th>
    <th>Equipo</th>
    <th style="text-align:center;">Prio.</th>
    <th style="text-align:center;">Días atraso</th>
    <th>Motivo (si registrado)</th>
  </tr></thead>
  <tbody>${offendersRows}</tbody>
</table>
` : ''}

<h2>Definiciones y criterios</h2>
<ul style="font-size:11px;line-height:1.7;color:#374151;padding-left:20px;">
  <li><b>Cumplimiento del programa</b>: HH ejecutadas / HH planificadas (en el período). Mide si el supervisor realmente entregó el volumen comprometido.</li>
  <li><b>Adherencia al programa</b>: % de OTs ejecutadas en el día/turno planificado vs total cerradas. Mide disciplina al programa, no si se hizo el trabajo.</li>
  <li><b>Avisos atrasados</b>: avisos &gt;24h sin que el supervisor los apruebe/rechace. Bottleneck de identificación.</li>
  <li><b>OTs atrasadas</b>: OTs vencidas &gt;24h sin notificar. Bottleneck de cierre.</li>
</ul>

${footer()}
</body></html>`;

  openInNewWindow(html, 'adherencia-cumplimiento');
}


// ─────────────────────────────────────────────────────────────────────
// Post-Mantenimiento (todo en uno, Jorge 2026-04-28 17:56)
// Combina Bad Actors x criticidad + Retrabajos + Pareto + KPIs Resultados +
// Fallas crónicas + Prioridades + Disciplina + Close-the-loop + Estrategia.
// ─────────────────────────────────────────────────────────────────────
export function openPostMaintenanceReport(data) {
  if (!data) return;
  const { plant_id, period_label, badActors, retrabajos, pareto, equipKpis, chronic, priorityIssues, discipline, closeTheLoop, strategy, dotacion } = data;

  const sect = (title, rows, headers) => `
    <h2>${esc(title)}</h2>
    ${rows.length === 0 ? '<p style="color:#9ca3af;font-style:italic;">Sin data disponible.</p>' :
      `<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;">
         <thead><tr style="background:#f3f4f6;">${headers.map(h => `<th style="padding:6px;text-align:left;border:1px solid #e5e7eb;">${esc(h)}</th>`).join('')}</tr></thead>
         <tbody>${rows.map(r => `<tr>${r.map(c => `<td style="padding:6px;border:1px solid #e5e7eb;">${esc(String(c))}</td>`).join('')}</tr>`).join('')}</tbody>
       </table>`
    }`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte Post-Mantenimiento — ${esc(plant_id)}</title>
${commonStyles()}
</head><body>
${header('Reporte Post-Mantenimiento — Análisis de Desempeño', 'Generado por la IA según especificación Jorge 2026-04-28 17:56', plant_id, period_label)}

<div class="kpi-grid">
  <div class="kpi"><div class="l">Bad Actors críticos</div><div class="v">${(badActors || []).filter(b => ['A', 'B'].includes(b.criticality)).length}</div></div>
  <div class="kpi"><div class="l">Retrabajos &lt;24h</div><div class="v">${(retrabajos || []).length}</div></div>
  <div class="kpi"><div class="l">Fallas crónicas</div><div class="v">${(chronic || []).length}</div></div>
  <div class="kpi"><div class="l">Prioridades inconsistentes</div><div class="v">${(priorityIssues || []).length}</div></div>
  <div class="kpi"><div class="l">Acciones vencidas</div><div class="v">${closeTheLoop?.overdue || 0}</div></div>
  <div class="kpi"><div class="l">Cadencias desviadas (estrategia)</div><div class="v">${(strategy || []).length}</div></div>
</div>

${sect('Bad Actors × Equipos críticos',
  (badActors || []).slice(0, 10).map(b => [b.criticality || '—', b.equipment, b.count, b.span_days + 'd', (b.modes || []).join(', ').slice(0, 60)]),
  ['Crit.', 'Equipo', 'Fallas', 'Período', 'Modos'])}

${sect('Retrabajos / Reprocesos detectados',
  (retrabajos || []).slice(0, 10).map(r => [r.equipment, r.previous_wo, (r.new_wr || '').slice(0, 10), r.hours_gap + 'h', r.new_priority || '—', (r.new_description || '').slice(0, 60)]),
  ['Equipo', 'OT cerrada', 'Aviso nuevo', 'Δ horas', 'Pri.', 'Descripción'])}

${sect('Pareto modos de falla (80/20)',
  (pareto || []).slice(0, 10).map(p => [p.mode, p.count, p.pct + '%', p.cumPct + '%', p.inTop20 ? '✓ TOP' : '']),
  ['Modo', 'N°', '%', 'Cum %', 'Top 80'])}

${sect('KPIs Resultados (Disp · MTBF · MTTR)',
  (equipKpis || []).slice(0, 10).map(k => [k.criticality, k.equipment, k.failures, (k.mtbf != null ? k.mtbf + 'h' : '—'), (k.mttr > 0 ? k.mttr + 'h' : '—'), (k.availability != null ? k.availability + '%' : '—')]),
  ['Crit.', 'Equipo', 'Fallas (30d)', 'MTBF', 'MTTR', 'Disp.'])}

${sect('Fallas crónicas (≥3 reps en 7d)',
  (chronic || []).slice(0, 10).map(c => [c.criticality, c.equipment, c.failure_mode, c.count_in_window, c.total_count]),
  ['Crit.', 'Equipo', 'Modo', 'En 7d', 'Total'])}

${sect('Prioridades inconsistentes',
  (priorityIssues || []).slice(0, 10).map(p => [p.aviso, p.equipment, p.actual_priority, p.issue, p.suggestion]),
  ['ID', 'Equipo', 'Pri.', 'Inconsistencia', 'Sugerencia IA'])}

<h2>Disciplina · tiempos entre estados</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">Aviso → Aprobado (avg)</div><div class="v">${discipline?.avg_wr_to_approve_h || 0}h</div></div>
  <div class="kpi"><div class="l">OT lifecycle (avg)</div><div class="v">${discipline?.avg_ot_lifecycle_d || 0}d</div></div>
  <div class="kpi"><div class="l">Avisos analizados</div><div class="v">${discipline?.wrs_with_data || 0}</div></div>
  <div class="kpi"><div class="l">OTs cerradas</div><div class="v">${discipline?.wos_with_data || 0}</div></div>
</div>

${sect('Acciones de mejora vencidas (close-the-loop)',
  (closeTheLoop?.overdue_actions || []).slice(0, 10).map(a => [a.title.slice(0, 60), a.category, a.equipment, a.days_overdue + 'd', a.priority]),
  ['Acción', 'Categoría', 'Equipo', 'Días vencida', 'Pri.'])}

${sect('Cruce con estrategia (cadencia real vs esperada)',
  (strategy || []).slice(0, 10).map(s => [s.equipment, s.description, s.executions, s.avg_interval_days + 'd', s.suggestion]),
  ['Equipo', 'Trabajo', 'Ejec.', 'Cadencia real', 'Sugerencia'])}

<h2>Análisis de Dotación</h2>
<p style="font-size:11px;line-height:1.6;">
  HH en críticos A/B: <b>${dotacion?.usedCritical || 0}h</b> (${dotacion?.pctCritical || 0}% del total).
  HH en no-críticos C/D: <b>${dotacion?.usedNonCritical || 0}h</b>.
  Total HH ejecutadas en período: <b>${dotacion?.totalUsed || 0}h</b>.
</p>
${sect('HH por especialidad',
  (dotacion?.bySpec || []).map(([s, h]) => [s, Math.round(h) + 'h', dotacion.totalUsed > 0 ? Math.round(h / dotacion.totalUsed * 100) + '%' : '—']),
  ['Especialidad', 'HH', '% del total'])}

<h2 style="margin-top:24px;">Conclusiones y acciones recomendadas</h2>
<ul style="font-size:11px;line-height:1.8;padding-left:20px;color:#374151;">
  ${(badActors || []).filter(b => ['A', 'B'].includes(b.criticality)).slice(0, 3).map(b =>
    `<li>📍 <b>${esc(b.equipment)}</b> (crítico ${esc(b.criticality)}) tiene ${b.count} fallas en ${b.span_days}d → abrir RCA prioritario.</li>`
  ).join('')}
  ${(retrabajos || []).slice(0, 2).map(r =>
    `<li>🔁 Retrabajo en <b>${esc(r.equipment)}</b> (${r.hours_gap}h tras intervención previa) → revisar calidad del proceso.</li>`
  ).join('')}
  ${(closeTheLoop?.overdue || 0) > 0 ?
    `<li>⚠ Hay <b>${closeTheLoop.overdue}</b> acciones de mejora vencidas — equipos siguen expuestos a recurrencia. Escalar al ingeniero de confiabilidad.</li>` : ''}
  ${(priorityIssues || []).filter(p => p.severity === 'high').slice(0, 2).map(p =>
    `<li>⚖️ <b>${esc(p.aviso)}</b> tiene prioridad inconsistente → ${esc(p.suggestion)}.</li>`
  ).join('')}
</ul>

${footer()}
</body></html>`;

  openInNewWindow(html, 'post-mantenimiento');
}

