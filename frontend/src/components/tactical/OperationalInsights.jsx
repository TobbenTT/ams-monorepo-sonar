import { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import * as api from '../../api';

function computeInsights(workRequests) {
  const insights = [];
  if (!workRequests || workRequests.length === 0) return insights;

  // 1. Find recurring failures (same equipment with multiple WRs)
  const byEquip = {};
  workRequests.forEach(wr => {
    const tag = wr.equipment_tag || '';
    if (!tag) return;
    if (!byEquip[tag]) byEquip[tag] = [];
    byEquip[tag].push(wr);
  });
  const recurring = Object.entries(byEquip)
    .filter(([, wrs]) => wrs.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  recurring.forEach(([tag, wrs], i) => {
    insights.push({
      id: `recurring-${i}`,
      type: 'deviation',
      severity: wrs.length >= 3 ? 'critical' : 'warning',
      title: `Falla Recurrente: ${tag}`,
      description: `${tag} tiene ${wrs.length} solicitudes de trabajo en el período. Revisar causa raíz y estrategia de mantenimiento.`,
      recommendation: 'Realizar RCFA e implementar monitoreo de condición',
      area: (wrs[0].ai_classification || {}).plant_id || 'Planta',
      impact: wrs.length >= 3 ? 'Alto' : 'Medio',
      data: { type: 'Fallas Recurrentes', equipment: tag, count: wrs.length },
    });
  });

  // 2. Late/overdue WRs (past SLA)
  const now = new Date();
  const overdue = workRequests.filter(wr => {
    if (!wr.sla_deadline) return false;
    return new Date(wr.sla_deadline) < now && !['COMPLETED', 'CLOSED', 'REJECTED'].includes(wr.status);
  });
  if (overdue.length > 0) {
    insights.push({
      id: 'overdue',
      type: 'deviation',
      severity: overdue.length >= 5 ? 'critical' : 'warning',
      title: `${overdue.length} Solicitudes Vencidas (SLA)`,
      description: `Hay ${overdue.length} WRs que han superado su fecha límite SLA sin completarse. Priorityes: ${[...new Set(overdue.map(w => w.priority_code || 'P3'))].join(', ')}.`,
      recommendation: 'Revisar backlog y reprogramar con recursos adicionales',
      area: 'Todas',
      impact: 'Alto',
      data: { type: 'SLA Vencido', count: overdue.length },
    });
  }

  // 3. Status distribution insight
  const statusCounts = {};
  workRequests.forEach(wr => {
    statusCounts[wr.status] = (statusCounts[wr.status] || 0) + 1;
  });
  const draft = statusCounts['DRAFT'] || 0;
  const pending = statusCounts['PENDING_VALIDATION'] || 0;
  const bottleneck = draft + pending;
  if (bottleneck > 5) {
    insights.push({
      id: 'bottleneck',
      type: 'planning',
      severity: bottleneck > 15 ? 'critical' : 'warning',
      title: `Bottleneck: ${bottleneck} WRs Pendings de Validación`,
      description: `${draft} en DRAFT y ${pending} pendientes de validación. Posible retraso en la planificación.`,
      recommendation: 'Acelerar proceso de aprobación del supervisor',
      area: 'Planificación',
      impact: bottleneck > 15 ? 'Alto' : 'Medio',
      data: { type: 'Planificación', draft, pending },
    });
  }

  // 4. High priority P1/P2 count
  const urgent = workRequests.filter(wr =>
    ['P1', 'P2'].includes(wr.priority_code) && !['COMPLETED', 'CLOSED'].includes(wr.status)
  );
  if (urgent.length > 0) {
    insights.push({
      id: 'urgent',
      type: 'resource',
      severity: urgent.length >= 3 ? 'critical' : 'info',
      title: `${urgent.length} Trabajos de Active High Priority`,
      description: `Hay ${urgent.length} WRs con prioridad P1/P2 sin completar. Estos requieren atención inmediata.`,
      recommendation: 'Asignar recursos dedicados y monitorear avance diario',
      area: 'Operaciones',
      impact: 'Alto',
      data: { type: 'Alta Priority', count: urgent.length },
    });
  }

  return insights.length > 0 ? insights : [{
    id: 'ok',
    type: 'resource',
    severity: 'info',
    title: 'Sin Desviaciones Significativas',
    description: `Se analizaron ${workRequests.length} solicitudes de trabajo. No se detectaron patrones críticos.`,
    recommendation: 'Mantener las prácticas actuales y continuar monitoreo',
    area: 'General',
    impact: 'Bajo',
    data: { type: 'Estado Normal', count: workRequests.length },
  }];
}

export default function OperationalInsights({ selectedArea, selectedPlant, onInsightClick }) {
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    api.listWorkRequests(selectedPlant ? { plant_id: selectedPlant } : {})
      .then(data => setWorkRequests(Array.isArray(data) ? data : []))
      .catch(() => setWorkRequests([]));
  }, [selectedPlant]);

  const insights = useMemo(() => computeInsights(workRequests), [workRequests]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return { bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', iconColor: 'text-red-600', icon: AlertCircle };
      case 'warning':
        return { bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800', iconColor: 'text-yellow-600', icon: TrendingUp };
      case 'info':
        return { bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', iconColor: 'text-blue-600', icon: Zap };
      default:
        return { bgColor: 'bg-gray-50 dark:bg-gray-800', borderColor: 'border-gray-200 dark:border-gray-700', iconColor: 'text-gray-600', icon: Lightbulb };
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold">Insights Operacionales</h3>
        <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
          Datos Reales
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {workRequests.length} WRs analizadas
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Análisis automático basado en datos reales de solicitudes de trabajo
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const config = getSeverityConfig(insight.severity);
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={`p-4 ${config.bgColor} border ${config.borderColor} rounded-lg cursor-pointer hover:shadow-md transition-all`}
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded border text-nowrap ml-2">
                      Impacto: {insight.impact}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{insight.description}</p>
                  <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded border">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Acción Recomendada:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
