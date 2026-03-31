import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ArrowLeft, ArrowUp, Calendar } from 'lucide-react';

export default function LateWorkOrdersDetail({ onBack }) {
  // Daily Late Work Orders data (October)
  const dailyLateWOData = Array.from({ length: 20 }, (_, i) => ({
    day: (12 + i).toString(),
    latePercentage: 8 + Math.random() * 8,
    rolling30Day: 12,
    metaLine: 5,
  }));

  // Top Root Causes
  const rootCausesData = [
    { cause: 'Spare Parts', count: 32 },
    { cause: 'Asset Unavailable', count: 28 },
    { cause: 'Workforce', count: 24 },
    { cause: 'Pending Approval', count: 19 },
    { cause: 'Poor Planning', count: 13 },
    { cause: 'Coordination', count: 11 },
    { cause: 'Documentation', count: 10 },
    { cause: 'Access Issues', count: 9 },
  ];

  // Delays by Shift
  const delaysByShiftData = [
    { shift: 'Shift A', count: 66 },
    { shift: 'Shift B', count: 20 },
  ];

  // Delays by Maintenance Type
  const delaysByTypeData = [
    { type: 'Corrective', count: 70 },
    { type: 'Preventive', count: 47 },
  ];

  // Work Orders Table Data
  const workOrdersData = [
    {
      id: '80000001',
      description: 'Spare Parts',
      area: 'Grinding',
      criticality: 'Alto',
      delayDays: 23,
      responsible: 'J. Cortinat',
      status: 'Alto',
    },
    {
      id: '80000002',
      description: 'Asset Unavailable',
      area: 'Flotation',
      criticality: 'Medio',
      delayDays: 22,
      responsible: 'J. Cortinat',
      status: 'Alto',
    },
    {
      id: '80000003',
      description: 'Workforce',
      area: 'Grinding',
      criticality: 'Bajo',
      delayDays: 20,
      responsible: 'J. Cortinat',
      status: 'Preventivo',
    },
    {
      id: '80000004',
      description: 'Pending Approval',
      area: 'Flotation',
      criticality: 'Medio',
      delayDays: 19,
      responsible: 'J. Cortinat',
      status: 'Bajo',
    },
    {
      id: '80000005',
      description: 'Poor Planning',
      area: 'Flotation',
      criticality: 'Medio',
      delayDays: 16,
      responsible: 'J. Cortinat',
      status: 'Estado',
    },
  ];

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Bajo':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium text-emerald-600">Late Work Orders Detail</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          DETALLE: ORDENES DE TRABAJO ATRASADAS (LATE WORK ORDERS)
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Time period:</span>
          <Button variant="outline" size="sm" className="border-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last Month
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            Custom
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - KPI Card */}
        <div className="col-span-3">
          <Card className="p-6 bg-white border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">KPI</h3>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">JC</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">12%</span>
                <ArrowUp className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Meta:</span> 5%
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column - Daily Chart */}
        <div className="col-span-9">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Late Work Orders (%) (Octubre)
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span>Late Work Orders (%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-emerald-600 rounded"></div>
                    <span>Rolling 30 day (me)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-400 rounded"></div>
                    <span>Meta line</span>
                  </div>
                </div>
              </div>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">JC</AvatarFallback>
              </Avatar>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={dailyLateWOData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: '20%', position: 'top', offset: 10 }}
                  domain={[0, 20]}
                />
                <Tooltip />
                <Bar dataKey="latePercentage" fill="#10b981" name="Late Work Orders (%)" />
                <Line
                  type="monotone"
                  dataKey="rolling30Day"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  name="Rolling 30 day"
                />
                <Line
                  type="monotone"
                  dataKey="metaLine"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Meta"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Second Row - Root Causes and Side Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Root Causes Chart */}
        <div className="col-span-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Principales Causas de Atraso (Top Root Causes)
              </h3>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">JC</AvatarFallback>
              </Avatar>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rootCausesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 35]} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="cause"
                  width={120}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" label={{ position: 'right', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Side Charts */}
        <div className="col-span-4 space-y-6">
          {/* Delays by Shift */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Atrasos por Turno<br/>
                <span className="text-sm font-normal text-gray-600">(Shift A, Shift B)</span>
              </h3>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">JC</AvatarFallback>
              </Avatar>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={delaysByShiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="shift" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 80]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" label={{ position: 'top', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Delays by Maintenance Type */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Atrasos por Tipo de Mantenimiento<br/>
                <span className="text-sm font-normal text-gray-600">(Corrective vs Preventive)</span>
              </h3>
              <Avatar className="w-10 h-10 bg-red-500">
                <AvatarFallback className="bg-red-500 text-white text-sm">JC</AvatarFallback>
              </Avatar>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={delaysByTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 80]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" label={{ position: 'top', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Work Orders Table */}
      <Card className="p-6 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">ID de Orden</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Area</TableHead>
                <TableHead className="font-semibold">Criticidad</TableHead>
                <TableHead className="font-semibold">Dias de Atraso</TableHead>
                <TableHead className="font-semibold">Responsable</TableHead>
                <TableHead className="font-semibold">Estado Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrdersData.map((wo) => (
                <TableRow key={wo.id} className="hover:bg-gray-50 cursor-pointer">
                  <TableCell className="font-medium">{wo.id}</TableCell>
                  <TableCell className="max-w-xs">{wo.description}</TableCell>
                  <TableCell>{wo.area}</TableCell>
                  <TableCell>
                    <Badge className={getCriticalityColor(wo.criticality)}>
                      {wo.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{wo.delayDays}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 bg-red-500">
                        <AvatarFallback className="bg-red-500 text-white text-xs">JC</AvatarFallback>
                      </Avatar>
                      {wo.responsible}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      {wo.status}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
