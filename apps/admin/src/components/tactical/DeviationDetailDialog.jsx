import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, TrendingUp, Plus } from 'lucide-react';

export default function DeviationDetailDialog({
  deviation,
  open,
  onClose,
  onCreateAction
}) {
  if (!deviation) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Deviation Analysis Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{deviation.type}</h3>
            <p className="text-gray-700">{deviation.description}</p>

            <div className="flex items-center gap-3 mt-3">
              {deviation.area && (
                <Badge className="bg-blue-100 text-blue-800">
                  📍 {deviation.area}
                </Badge>
              )}
              {deviation.count && (
                <Badge className="bg-red-100 text-red-800">
                  {deviation.count} incidents
                </Badge>
              )}
              {deviation.trend && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {deviation.trend}
                </Badge>
              )}
            </div>
          </div>

          {/* Analysis Details */}
          <div>
            <h4 className="font-semibold mb-3">Impact Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Affected Work Orders</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {deviation.count || 8}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Cost Impact</p>
                <p className="text-2xl font-semibold text-gray-800">
                  ${((deviation.count || 8) * 4500).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Downtime Hours</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {(deviation.count || 8) * 3.5}h
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Production Loss</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {(deviation.count || 8) * 12} units
                </p>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          <div>
            <h4 className="font-semibold mb-3">Contributing Factors</h4>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="font-medium text-sm">Inadequate Job Planning</p>
                <p className="text-xs text-gray-600 mt-1">45% of rework incidents</p>
              </div>
              <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="font-medium text-sm">Spare Parts Quality</p>
                <p className="text-xs text-gray-600 mt-1">30% of rework incidents</p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="font-medium text-sm">Insufficient Training</p>
                <p className="text-xs text-gray-600 mt-1">25% of rework incidents</p>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h4 className="font-semibold mb-3">Recommended Corrective Actions</h4>
            <div className="space-y-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-semibold">1.</span>
                <p className="text-sm">Implement mandatory peer review for all critical job plans</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-semibold">2.</span>
                <p className="text-sm">Establish supplier quality audit program for critical spare parts</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-semibold">3.</span>
                <p className="text-sm">Develop and deliver targeted training on proper maintenance procedures</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-semibold">4.</span>
                <p className="text-sm">Implement pre-job briefings for high-criticality work</p>
              </div>
            </div>
          </div>

          {/* Related Work Orders */}
          <div>
            <h4 className="font-semibold mb-3">Related Work Orders</h4>
            <div className="space-y-2">
              {['WO-2024-1245', 'WO-2024-1232', 'WO-2024-1218'].map((wo) => (
                <div key={wo} className="p-2 bg-gray-50 rounded flex items-center justify-between hover:bg-gray-100 cursor-pointer">
                  <span className="text-sm font-medium text-emerald-600">{wo}</span>
                  <Badge variant="destructive">Rework</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onCreateAction(deviation)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Improvement Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
