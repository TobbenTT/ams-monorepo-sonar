import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Target, Save, Calendar, User, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ActionDetailDialog({
  action,
  open,
  onClose,
  onSave
}) {
  const [formData, setFormData] = useState({
    id: action?.id || 'NEW',
    description: action?.description || '',
    source: action?.source || '',
    sourceDetail: action?.sourceDetail || '',
    owner: action?.owner || '',
    dueDate: action?.dueDate || '',
    status: action?.status || 'Draft',
    priority: action?.priority || 'Medium',
    progress: action?.progress || 0,
    rootCause: action?.rootCause || '',
    correctiveAction: action?.correctiveAction || '',
    preventiveAction: action?.preventiveAction || '',
    verification: action?.verification || '',
  });

  const isNew = formData.id === 'NEW';

  const handleSave = () => {
    onSave({
      ...formData,
      id: isNew ? `ACT-2024-${Math.floor(Math.random() * 1000)}` : formData.id,
    });
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            {isNew ? 'Create New Improvement Action' : `Action: ${formData.id}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Header */}
          {!isNew && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Badge className={
                formData.status === 'Completed' ? 'bg-green-100 text-green-800' :
                formData.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                formData.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {formData.status}
              </Badge>
              <Badge className={
                formData.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                formData.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                formData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {formData.priority} Priority
              </Badge>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                  <div
                    className={`h-2 rounded-full ${
                      formData.progress === 100 ? 'bg-green-500' :
                      formData.progress > 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{formData.progress}%</span>
              </div>
            </div>
          )}

          {/* Source Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Source Type
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger id="source" className="mt-1">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rework">Rework</SelectItem>
                  <SelectItem value="Delay">Delay</SelectItem>
                  <SelectItem value="Failure">Failure</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="Planning">Planning Inefficiency</SelectItem>
                  <SelectItem value="KPI">KPI Deviation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sourceDetail">Source Reference</Label>
              <Input
                id="sourceDetail"
                value={formData.sourceDetail}
                onChange={(e) => setFormData({ ...formData, sourceDetail: e.target.value })}
                placeholder="e.g., WO-2024-1245"
                className="mt-1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Action Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the improvement action to be taken..."
              className="mt-1 min-h-24"
            />
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner
              </Label>
              <Select
                value={formData.owner}
                onValueChange={(value) => setFormData({ ...formData, owner: value })}
              >
                <SelectTrigger id="owner" className="mt-1">
                  <SelectValue placeholder="Assign owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Martinez">John Martinez</SelectItem>
                  <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  <SelectItem value="Lisa Wang">Lisa Wang</SelectItem>
                  <SelectItem value="David Rodriguez">David Rodriguez</SelectItem>
                  <SelectItem value="Anna Kowalski">Anna Kowalski</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <h4 className="font-semibold text-blue-800">Root Cause & Corrective Actions</h4>

            <div>
              <Label htmlFor="rootCause">Root Cause Analysis</Label>
              <Textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Describe the root cause identified through analysis..."
                className="mt-1 min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="correctiveAction">Corrective Action (Fix Current Issue)</Label>
              <Textarea
                id="correctiveAction"
                value={formData.correctiveAction}
                onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                placeholder="What will be done to address the current problem..."
                className="mt-1 min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="preventiveAction">Preventive Action (Prevent Recurrence)</Label>
              <Textarea
                id="preventiveAction"
                value={formData.preventiveAction}
                onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
                placeholder="What will be done to prevent this from happening again..."
                className="mt-1 min-h-20"
              />
            </div>
          </div>

          {/* Verification */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h4 className="font-semibold text-emerald-800 mb-3">Action Verification</h4>
            <Label htmlFor="verification">How will effectiveness be verified?</Label>
            <Textarea
              id="verification"
              value={formData.verification}
              onChange={(e) => setFormData({ ...formData, verification: e.target.value })}
              placeholder="Define metrics or criteria to verify action effectiveness (e.g., 'Rework rate reduced to <3% within 60 days')..."
              className="mt-1 min-h-20"
            />
          </div>

          {/* Workflow Guide */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>🔄 Workflow:</strong> This action is linked to {formData.source} event.
              Progress updates will automatically reflect in KPI dashboard. Upon completion,
              verification evidence should be attached and reviewed before closure.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            {isNew ? 'Create Action' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
