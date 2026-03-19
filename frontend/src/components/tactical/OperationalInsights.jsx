import { Card } from '../ui/card';
import { Lightbulb, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { Button } from '../ui/button';

export default function OperationalInsights({ selectedArea, onInsightClick }) {
  const insights = [
    {
      id: 1,
      type: 'deviation',
      severity: 'critical',
      title: 'Recurring Failure Pattern Detected',
      description: 'Pump P-101 has failed 3 times in the last 60 days with similar root causes (seal failure). Pattern suggests inadequate failure analysis or part quality issues.',
      recommendation: 'Conduct comprehensive RCFA and implement condition monitoring',
      area: 'Production Line 1',
      impact: 'High',
      data: {
        type: 'Recurring Failures',
        equipment: 'Pump P-101',
        count: 3,
        rootCause: 'Seal failure'
      }
    },
    {
      id: 2,
      type: 'planning',
      severity: 'warning',
      title: 'Planning Inefficiency: High Rework Rate',
      description: 'Production Line 1 shows 8.5% rework rate, significantly above plant average of 3%. Primary causes: incomplete job plans (45%) and improper torque specs (30%).',
      recommendation: 'Review and standardize job planning procedures, implement peer review',
      area: 'Production Line 1',
      impact: 'Medium',
      data: {
        type: 'Planning Quality',
        currentRate: 8.5,
        targetRate: 3,
      }
    },
    {
      id: 3,
      type: 'resource',
      severity: 'info',
      title: 'Resource Optimization Opportunity',
      description: 'Analysis shows 25% of corrective maintenance could be prevented with enhanced condition monitoring on critical rotating equipment.',
      recommendation: 'Expand vibration monitoring program to cover 15 additional assets',
      area: 'All Areas',
      impact: 'High',
      data: {
        type: 'Resource Optimization',
        potentialSavings: '$45K/year'
      }
    },
    {
      id: 4,
      type: 'deviation',
      severity: 'warning',
      title: 'Spare Parts Stock-out Impact',
      description: 'Stock-out events caused 45% of all maintenance delays in the last 30 days. Critical items: bearings (SKU-2401), seals (SKU-3156).',
      recommendation: 'Adjust reorder points for critical spares and establish backup suppliers',
      area: 'Utilities',
      impact: 'Medium',
      data: {
        type: 'Inventory Management',
        delaysCaused: 12,
        criticalItems: ['SKU-2401', 'SKU-3156']
      }
    },
  ];

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: TrendingUp,
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          icon: Zap,
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          icon: Lightbulb,
        };
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold">AI-Powered Operational Insights</h3>
        <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
          Smart Analytics
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Pattern detection and predictive recommendations based on maintenance execution data
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const config = getSeverityConfig(insight.severity);
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={`p-4 ${config.bgColor} border ${config.borderColor} rounded-lg cursor-pointer hover:shadow-md transition-all`}
              onClick={() => onInsightClick(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white ${config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-white rounded border">
                      Impact: {insight.impact}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-white rounded border">
                      📍 {insight.area}
                    </span>
                  </div>

                  <div className="bg-white/70 p-3 rounded border mb-3">
                    <p className="text-xs font-medium text-emerald-700 mb-1">
                      💡 Recommended Action:
                    </p>
                    <p className="text-xs text-gray-700">{insight.recommendation}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-white hover:bg-emerald-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsightClick(insight);
                    }}
                  >
                    Investigate & Create Action
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-white/70 rounded-lg border border-emerald-200">
        <p className="text-xs text-gray-600">
          <strong>🤖 How it works:</strong> The system analyzes patterns in work orders, failures, and deviations to identify:
          (1) High rework zones, (2) Recurring failures, (3) Planning inefficiencies, (4) Resource optimization opportunities.
          Click any insight to drill down and create preventive actions.
        </p>
      </div>
    </Card>
  );
}
