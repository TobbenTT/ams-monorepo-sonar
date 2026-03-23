import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { ArrowDown, TrendingDown } from 'lucide-react';

export default function TacticalOperationsView({ selectedPlant, selectedTimeRange, selectedArea }) {

  // Production Context Data (12 weeks)
  const productionData = [
    { week: 'Week 1', planned: 280, actual: 250, meta: 300 },
    { week: 'Week 2', planned: 300, actual: 320, meta: 300 },
    { week: 'Week 3', planned: 280, actual: 280, meta: 300 },
    { week: 'Week 4', planned: 320, actual: 310, meta: 300 },
    { week: 'Week 5', planned: 300, actual: 280, meta: 300 },
    { week: 'Week 6', planned: 320, actual: 340, meta: 300 },
    { week: 'Week 7', planned: 300, actual: 320, meta: 300 },
    { week: 'Week 8', planned: 280, actual: 280, meta: 300 },
    { week: 'Week 9', planned: 300, actual: 280, meta: 300 },
    { week: 'Week 10', planned: 280, actual: 300, meta: 300 },
    { week: 'Week 11', planned: 320, actual: 310, meta: 300 },
    { week: 'Week 12', planned: 300, actual: 320, meta: 300 },
  ];

  // Operational Discipline - Late Notifications (12 weeks)
  const lateNotificationsData = [
    { week: '12', value: 8 },
    { week: 'W', value: 9 },
    { week: '14', value: 11 },
    { week: 'W', value: 10 },
    { week: '16', value: 12 },
    { week: '17', value: 13 },
    { week: '18', value: 11 },
    { week: '19', value: 10 },
    { week: '10', value: 12 },
    { week: '11', value: 14 },
    { week: '11', value: 13 },
    { week: '12', value: 12 },
  ];

  // Operational Discipline - Late Work Orders (12 weeks)
  const lateWorkOrdersData = [
    { week: '12', value: 8 },
    { week: 'W', value: 9 },
    { week: '14', value: 11 },
    { week: 'W', value: 10 },
    { week: '16', value: 12 },
    { week: '17', value: 13 },
    { week: '18', value: 14 },
    { week: '19', value: 12 },
    { week: '10', value: 11 },
    { week: '11', value: 13 },
    { week: '11', value: 12 },
    { week: '12', value: 12 },
  ];

  // Operational Discipline - Schedule Compliance (12 weeks)
  const scheduleComplianceData = [
    { week: '12', value: 92 },
    { week: 'W', value: 91 },
    { week: '14', value: 93 },
    { week: 'W', value: 94 },
    { week: '16', value: 92 },
    { week: '17', value: 93 },
    { week: '18', value: 94 },
    { week: '19', value: 92 },
    { week: '10', value: 93 },
    { week: '11', value: 94 },
    { week: '11', value: 93 },
    { week: '12', value: 93 },
  ];

  // Top 5 Failing Assets
  const top5FailingAssets = [
    { asset: 'Mill 1', failures: 21 },
    { asset: 'Crusher A', failures: 15 },
    { asset: 'Pump 4', failures: 9 },
    { asset: 'Crusher A-2', failures: 5 },
    { asset: 'Mill 2', failures: 1 },
  ];

  // Asset Reliability Trend (MTBF)
  const mtbfTrendData = [
    { week: 'Wk 1', grinding: 800, flotation: 1000, thickening: 1200 },
    { week: 'Wk 2', grinding: 900, flotation: 1100, thickening: 1100 },
    { week: 'Wk 4', grinding: 1000, flotation: 1000, thickening: 1300 },
    { week: 'Wk 5', grinding: 850, flotation: 1050, thickening: 1100 },
    { week: 'Wk 6', grinding: 900, flotation: 1100, thickening: 1400 },
    { week: 'Wk 7', grinding: 950, flotation: 1000, thickening: 1200 },
    { week: 'Wk 8', grinding: 1100, flotation: 1200, thickening: 1500 },
    { week: 'Wk 10', grinding: 1000, flotation: 1100, thickening: 1300 },
    { week: 'Wk 11', grinding: 1200, flotation: 1300, thickening: 1600 },
    { week: 'Wk 12', grinding: 1100, flotation: 1200, thickening: 1400 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* SECTION I - PRODUCTION CONTEXT */}
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">I. Production Context (Tons/Day-Hour)</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">View by:</span>
              <span className="ml-2 font-medium">Production Type (Daily, Hourly)</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600 font-medium">Plant Production Trend (Tons)</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Current rolling 12-week average:</span>
                <span className="font-bold text-gray-900">[X Tons]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Last Hour:</span>
                <span className="font-bold text-gray-900">[Y Tons]</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <ArrowDown className="w-4 h-4" />
                <span className="font-medium">Real vs. Plan Variance</span>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={productionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 400]} />
            <Tooltip />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              payload={[
                { value: 'Planned Tons (Bar)', type: 'rect', color: '#10b981' },
                { value: 'Actual Tons (Line)', type: 'line', color: '#374151' },
                { value: 'Meta line', type: 'line', color: '#ef4444' }
              ]}
            />
            <Bar dataKey="planned" fill="#10b981" name="Planned Tons (Bar)" />
            <Line type="monotone" dataKey="actual" stroke="#374151" strokeWidth={2} name="Actual Tons (Line)" />
            <Line type="monotone" dataKey="meta" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Meta line" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* SECTION II - OPERATIONAL DISCIPLINE */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">II. Operational Discipline</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Late Notifications Card */}
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Late Notifications (%)</p>
              <p className="text-xs text-gray-500">Late Notifications (Accumulated % over 12 weeks)</p>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-bold text-gray-900">12%</p>
              <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mt-1">
                12-Week Rolling Trend
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={lateNotificationsData}>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 20]} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>12</span>
              <span>W</span>
              <span>14</span>
              <span>W</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
          </Card>

          {/* Late Work Orders Card */}
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Late Work Orders (%)</p>
              <p className="text-xs text-gray-500">Late Work Orders (Accumulated % over 12 weeks)</p>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-bold text-gray-900">12%</p>
              <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mt-1">
                12-Week Rolling Trend
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={lateWorkOrdersData}>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 20]} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>12</span>
              <span>W</span>
              <span>14</span>
              <span>W</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
          </Card>

          {/* Schedule Compliance Card */}
          <Card className="p-6 bg-white">
            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Schedule Compliance (%)</p>
              <p className="text-xs text-gray-500">Schedule Compliance (%)</p>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-bold text-gray-900">93%</p>
              <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded mt-1">
                12-Week Rolling Trend
              </div>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={scheduleComplianceData}>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>12</span>
              <span>W</span>
              <span>14</span>
              <span>W</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION III - RELIABILITY & ASSET HEALTH */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">III. Reliability & Asset Health (Focus: Confiabilidad)</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Top 5 Failing Assets */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Top 5 Failing Assets (Last 30 Days)</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>ÓRDENES ATRASADAS</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-emerald-600 font-medium">% 3.2%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={top5FailingAssets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 25]} />
                <YAxis type="category" dataKey="asset" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="failures" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Asset Reliability Trend (MTBF) */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Asset Reliability Trend (MTBF)</h4>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                  <span>Grinding</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Flotation</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span>Thickening</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mtbfTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 2000]} />
                <Tooltip />
                <Line type="monotone" dataKey="grinding" stroke="#10b981" strokeWidth={2} name="Grinding" />
                <Line type="monotone" dataKey="flotation" stroke="#3b82f6" strokeWidth={2} name="Flotation" />
                <Line type="monotone" dataKey="thickening" stroke="#8b5cf6" strokeWidth={2} name="Thickening" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
