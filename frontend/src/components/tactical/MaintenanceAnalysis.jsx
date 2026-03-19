import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AlertTriangle, Filter, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';

export default function MaintenanceAnalysis({ selectedArea, onDeviationClick, onWorkOrderClick }) {
  const [filterArea, setFilterArea] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Deviation trend data
  const deviationTrendData = [
    { month: 'Oct', rework: 12, delays: 18, unplanned: 35 },
    { month: 'Nov', rework: 15, delays: 22, unplanned: 38 },
    { month: 'Dec', rework: 18, delays: 25, unplanned: 42 },
    { month: 'Jan', rework: 14, delays: 20, unplanned: 36 },
    { month: 'Feb', rework: 16, delays: 23, unplanned: 40 },
    { month: 'Mar', rework: 19, delays: 28, unplanned: 45 },
  ];

  // Heatmap data by area
  const areaDeviationData = [
    { area: 'Prod Line 1', rework: 8, delays: 12, total: 20 },
    { area: 'Prod Line 2', rework: 6, delays: 9, total: 15 },
    { area: 'Utilities', rework: 3, delays: 4, total: 7 },
    { area: 'Packaging', rework: 2, delays: 3, total: 5 },
  ];

  // Work order review data
  const workOrders = [
    {
      id: 'WO-2024-1245',
      type: 'Unplanned',
      equipment: 'Pump P-101',
      delay: 12,
      rework: true,
      area: 'Production Line 1',
      rootCause: 'Improper torque specification',
      criticality: 'High',
      status: 'Completed',
      completedDate: '2024-03-15',
    },
    {
      id: 'WO-2024-1238',
      type: 'Planned',
      equipment: 'Motor M-205',
      delay: 0,
      rework: false,
      area: 'Production Line 2',
      rootCause: 'N/A',
      criticality: 'Medium',
      status: 'Completed',
      completedDate: '2024-03-14',
    },
    {
      id: 'WO-2024-1232',
      type: 'Unplanned',
      equipment: 'Conveyor CV-301',
      delay: 24,
      rework: true,
      area: 'Packaging',
      rootCause: 'Spare part quality issue',
      criticality: 'High',
      status: 'Completed',
      completedDate: '2024-03-12',
    },
    {
      id: 'WO-2024-1225',
      type: 'Planned',
      equipment: 'Compressor C-102',
      delay: 4,
      rework: false,
      area: 'Utilities',
      rootCause: 'Parts delivery delay',
      criticality: 'Low',
      status: 'Completed',
      completedDate: '2024-03-10',
    },
    {
      id: 'WO-2024-1218',
      type: 'Unplanned',
      equipment: 'Heat Exchanger HX-401',
      delay: 18,
      rework: true,
      area: 'Production Line 1',
      rootCause: 'Inadequate failure analysis',
      criticality: 'Critical',
      status: 'Completed',
      completedDate: '2024-03-08',
    },
    {
      id: 'WO-2024-1210',
      type: 'Planned',
      equipment: 'Valve VLV-502',
      delay: 2,
      rework: false,
      area: 'Production Line 2',
      rootCause: 'N/A',
      criticality: 'Low',
      status: 'Completed',
      completedDate: '2024-03-05',
    },
  ];

  const filteredWorkOrders = workOrders.filter(wo => {
    if (filterArea !== 'all' && wo.area !== filterArea) return false;
    if (filterCriticality !== 'all' && wo.criticality !== filterCriticality) return false;
    if (filterStatus !== 'all' && wo.status !== filterStatus) return false;
    return true;
  });

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold">Maintenance Execution Analysis</h3>
      </div>

      {/* A. Deviation Analysis Panel */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">Deviation Analysis</h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Deviation Trend (Last 6 Months)</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={deviationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line key="rework-line" type="monotone" dataKey="rework" stroke="#ef4444" strokeWidth={2} name="Rework" />
                <Line key="delays-line" type="monotone" dataKey="delays" stroke="#f59e0b" strokeWidth={2} name="Delays" />
                <Line key="unplanned-line" type="monotone" dataKey="unplanned" stroke="#6366f1" strokeWidth={2} name="Unplanned Work" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Heatmap */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">Deviations by Plant Area</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={areaDeviationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar key="rework-bar" dataKey="rework" fill="#ef4444" name="Rework" />
                <Bar key="delays-bar" dataKey="delays" fill="#f59e0b" name="Delays" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div
            className="cursor-pointer hover:bg-red-100 p-3 rounded transition-colors"
            onClick={() => onDeviationClick({
              type: 'High Rework Zone',
              description: 'Production Line 1 showing 8 rework incidents',
              area: 'Production Line 1',
              count: 8
            })}
          >
            <p className="text-sm font-medium text-red-800">🔴 High Rework Zone</p>
            <p className="text-xs text-red-600 mt-1">Production Line 1: 8 incidents</p>
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              Click to investigate <ExternalLink className="w-3 h-3" />
            </p>
          </div>
          <div
            className="cursor-pointer hover:bg-orange-100 p-3 rounded transition-colors"
            onClick={() => onDeviationClick({
              type: 'Execution Delays',
              description: 'Increasing delay trend in last 3 months',
              trend: 'increasing',
              count: 28
            })}
          >
            <p className="text-sm font-medium text-orange-800">⚠️ Execution Delays</p>
            <p className="text-xs text-orange-600 mt-1">+40% increase in delays</p>
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              Click to investigate <ExternalLink className="w-3 h-3" />
            </p>
          </div>
          <div
            className="cursor-pointer hover:bg-blue-100 p-3 rounded transition-colors"
            onClick={() => onDeviationClick({
              type: 'Unplanned Work Growth',
              description: 'Unplanned work ratio increasing',
              current: '35%',
              target: '20%'
            })}
          >
            <p className="text-sm font-medium text-blue-800">📊 Unplanned Work Growth</p>
            <p className="text-xs text-blue-600 mt-1">Current: 35% (Target: 20%)</p>
            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
              Click to investigate <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* B. Work Order Review Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-700">Work Order Review & Root Cause Analysis</h4>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="Production Line 1">Production Line 1</SelectItem>
                <SelectItem value="Production Line 2">Production Line 2</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Criticality</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Work Order ID</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Delay (hrs)</TableHead>
                <TableHead>Rework</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Root Cause</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((wo) => (
                <TableRow
                  key={wo.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onWorkOrderClick(wo)}
                >
                  <TableCell className="font-medium text-emerald-600">{wo.id}</TableCell>
                  <TableCell>{wo.equipment}</TableCell>
                  <TableCell>
                    <Badge variant={wo.type === 'Planned' ? 'secondary' : 'destructive'}>
                      {wo.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={wo.delay > 10 ? 'text-red-600 font-semibold' : ''}>
                      {wo.delay}
                    </span>
                  </TableCell>
                  <TableCell>
                    {wo.rework ? (
                      <Badge className="bg-red-100 text-red-800 border-red-300">Yes</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 border-green-300">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{wo.area}</TableCell>
                  <TableCell>
                    <Badge className={getCriticalityColor(wo.criticality)}>
                      {wo.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{wo.rootCause}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{wo.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkOrderClick(wo);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-gray-600 mt-3">
          💡 <strong>Workflow:</strong> Click any work order to see full details and create improvement actions from root causes
        </p>
      </div>
    </Card>
  );
}
