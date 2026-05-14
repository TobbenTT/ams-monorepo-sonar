import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Target, ExternalLink } from 'lucide-react';

export default function ImprovementPanel({ onActionClick }) {
  const actions = [
    {
      id: 'ACT-2024-045',
      description: 'Implement torque specification training program for technicians',
      source: 'Rework',
      sourceDetail: 'WO-2024-1245',
      owner: 'John Martinez',
      dueDate: '2024-04-15',
      status: 'In Progress',
      priority: 'High',
      progress: 65,
    },
    {
      id: 'ACT-2024-042',
      description: 'Review and update spare parts supplier quality requirements',
      source: 'Rework',
      sourceDetail: 'WO-2024-1232',
      owner: 'Sarah Chen',
      dueDate: '2024-04-30',
      status: 'In Progress',
      priority: 'High',
      progress: 40,
    },
    {
      id: 'ACT-2024-038',
      description: 'Conduct failure mode analysis on heat exchanger HX-401',
      source: 'Failure',
      sourceDetail: 'WO-2024-1218',
      owner: 'Mike Johnson',
      dueDate: '2024-03-25',
      status: 'Overdue',
      priority: 'Critical',
      progress: 80,
    },
    {
      id: 'ACT-2024-035',
      description: 'Optimize spare parts inventory for critical components',
      source: 'Delay',
      sourceDetail: 'Multiple WOs',
      owner: 'Lisa Wang',
      dueDate: '2024-05-10',
      status: 'Not Started',
      priority: 'Medium',
      progress: 0,
    },
    {
      id: 'ACT-2024-031',
      description: 'Establish predictive maintenance program for pumps',
      source: 'Planning',
      sourceDetail: 'Reliability Plan',
      owner: 'David Rodriguez',
      dueDate: '2024-06-30',
      status: 'In Progress',
      priority: 'Medium',
      progress: 25,
    },
    {
      id: 'ACT-2024-028',
      description: 'Reduce planned maintenance backlog through resource optimization',
      source: 'Backlog',
      sourceDetail: 'KPI Dashboard',
      owner: 'Anna Kowalski',
      dueDate: '2024-04-20',
      status: 'In Progress',
      priority: 'High',
      progress: 55,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Rework': return 'bg-red-50 text-red-700';
      case 'Delay': return 'bg-orange-50 text-orange-700';
      case 'Failure': return 'bg-purple-50 text-purple-700';
      case 'Backlog': return 'bg-blue-50 text-blue-700';
      case 'Planning': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold">Improvement Actions & Reliability Plan</h3>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onActionClick({
            id: 'NEW',
            description: '',
            source: '',
            owner: '',
            dueDate: '',
            status: 'Draft',
            priority: 'Medium',
            progress: 0,
          })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Improvement Action
        </Button>
      </div>

      {/* Action Tracker Table */}
      <div className="mb-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Action ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow
                  key={action.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onActionClick(action)}
                >
                  <TableCell className="font-medium text-emerald-600">{action.id}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{action.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className={`text-xs px-2 py-1 rounded ${getSourceColor(action.source)}`}>
                      {action.source}
                      <div className="text-xs opacity-70 mt-0.5">{action.sourceDetail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{action.owner}</TableCell>
                  <TableCell className="text-sm">{action.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(action.status)}>
                      {action.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className={`h-2 rounded-full ${
                            action.progress === 100 ? 'bg-green-500' :
                            action.progress > 50 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${action.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10">{action.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick(action);
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
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div>
          <p className="text-sm text-emerald-600">Total Actions</p>
          <p className="text-2xl font-semibold text-emerald-700">{actions.length}</p>
        </div>
        <div>
          <p className="text-sm text-blue-600">In Progress</p>
          <p className="text-2xl font-semibold text-blue-700">
            {actions.filter(a => a.status === 'In Progress').length}
          </p>
        </div>
        <div>
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-semibold text-red-700">
            {actions.filter(a => a.status === 'Overdue').length}
          </p>
        </div>
        <div>
          <p className="text-sm text-green-600">Completed (30d)</p>
          <p className="text-2xl font-semibold text-green-700">8</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        💡 <strong>Workflow:</strong> Actions are automatically created from deviations and work orders. Click any action to view details, update progress, or close with verification.
      </p>
    </Card>
  );
}
