import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wrench, Clock, AlertCircle, Plus } from 'lucide-react';

export default function WorkOrderDetailDialog({
  workOrder,
  open,
  onClose,
  onCreateAction
}) {
  if (!workOrder) return null;

  const isDeviated = workOrder.rework || workOrder.delay > 8;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            Work Order Detail: {workOrder.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className={`p-4 rounded-lg border ${
            isDeviated
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{workOrder.equipment}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={workOrder.type === 'Planned' ? 'secondary' : 'destructive'}>
                  {workOrder.type}
                </Badge>
                {workOrder.rework && (
                  <Badge className="bg-red-600 text-white">REWORK</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="font-medium">{workOrder.area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Criticality</p>
                <Badge className={
                  workOrder.criticality === 'Critical' ? 'bg-red-100 text-red-800' :
                  workOrder.criticality === 'High' ? 'bg-orange-100 text-orange-800' :
                  workOrder.criticality === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {workOrder.criticality}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium">{workOrder.completedDate}</p>
              </div>
            </div>
          </div>

          {/* Deviation Alert */}
          {isDeviated && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Deviation Detected</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {workOrder.rework && 'This work order required rework. '}
                  {workOrder.delay > 8 && `Execution delay of ${workOrder.delay} hours exceeds threshold.`}
                </p>
              </div>
            </div>
          )}

          {/* Work Order Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Execution Metrics</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planned Duration</span>
                    <span className="font-semibold">8 hours</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actual Duration</span>
                    <span className="font-semibold">{8 + workOrder.delay} hours</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  workOrder.delay > 8 ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Delay
                    </span>
                    <span className={`font-semibold ${
                      workOrder.delay > 8 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {workOrder.delay} hours
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Labor Cost</span>
                    <span className="font-semibold">$1,240</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Parts Cost</span>
                    <span className="font-semibold">$2,850</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Root Cause Analysis</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Identified Root Cause:</p>
                <p className="text-sm text-gray-800 mb-4">{workOrder.rootCause}</p>

                {workOrder.rework && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-2">Why Rework Was Required:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Initial repair did not address root cause</li>
                      <li>Improper installation procedure followed</li>
                      <li>Part specification mismatch discovered</li>
                    </ul>
                  </>
                )}

                {workOrder.delay > 8 && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-2 mt-3">Delay Contributing Factors:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Spare part not in stock (6 hours)</li>
                      <li>Additional scaffolding required (4 hours)</li>
                      <li>Specialist technician unavailable (2 hours)</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Maintenance History */}
          <div>
            <h4 className="font-semibold mb-3">Equipment Maintenance History</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Work Order</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">2024-03-15</td>
                    <td className="p-3 text-emerald-600 font-medium">{workOrder.id}</td>
                    <td className="p-3">{workOrder.type}</td>
                    <td className="p-3">Seal replacement</td>
                    <td className="p-3">
                      {workOrder.rework ? (
                        <Badge className="bg-red-100 text-red-800">Rework</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Success</Badge>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">2024-02-10</td>
                    <td className="p-3 text-emerald-600 font-medium">WO-2024-0892</td>
                    <td className="p-3">Planned</td>
                    <td className="p-3">Preventive maintenance</td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-800">Success</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">2024-01-18</td>
                    <td className="p-3 text-emerald-600 font-medium">WO-2024-0445</td>
                    <td className="p-3">Unplanned</td>
                    <td className="p-3">Seal failure repair</td>
                    <td className="p-3">
                      <Badge className="bg-red-100 text-red-800">Rework</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Pattern detected: Recurring seal failures (3 times in 60 days)
            </p>
          </div>

          {/* Recommended Actions */}
          {isDeviated && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold mb-3 text-emerald-800">Recommended Improvement Actions</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-600 font-semibold">1.</span>
                  <p>Conduct detailed failure mode analysis to identify true root cause</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-600 font-semibold">2.</span>
                  <p>Review spare parts quality and consider alternative suppliers</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-600 font-semibold">3.</span>
                  <p>Update job plan with improved procedures and torque specifications</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-600 font-semibold">4.</span>
                  <p>Implement condition monitoring to predict future failures</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isDeviated && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onCreateAction(workOrder)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Improvement Action
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
