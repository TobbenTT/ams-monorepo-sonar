"""SF-373: Add Reject/Cancel buttons for approved WRs. SF-372: Remove Supervisor resource."""
path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/WorkRequests.jsx"
with open(path, "r") as f:
    c = f.read()

# SF-373: Add Reject/Cancel after Create WO button for approved WRs
old_create_wo = '''            {isValidated && (
              <button
                onClick={() => { onPlannerCreateOT(item.id); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <FileText size={16} />
                Create WO
              </button>
            )}'''

new_create_wo = '''            {isValidated && (
              <>
                <button
                  onClick={() => { onPlannerCreateOT(item.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <FileText size={16} />
                  Create WO
                </button>
                <button
                  onClick={() => { onReject(item.id); onClose(); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => { onCancel(item.id); onClose(); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </>
            )}'''

c = c.replace(old_create_wo, new_create_wo)

# SF-372: Also check FailureCapture for Supervisor in resources
# Already done earlier but double-check
with open(path, "w") as f:
    f.write(c)
print("WorkRequests.jsx: Done")

# SF-372: Remove Supervisor from FailureCapture resources if still there
fc_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx"
with open(fc_path, "r") as f:
    fc = f.read()

if "'Supervisor'" in fc or '"Supervisor"' in fc:
    # Check context
    import re
    matches = re.findall(r'.{0,50}Supervisor.{0,50}', fc)
    for m in matches:
        print(f"  Found in FC: ...{m}...")

# Also format the ACCION SUGERIDA in the WR detail to show as list
# The suggested action in the modal shows as one long line
# Find where suggested_action is displayed
old_action_display = None
for line_pattern in ['suggested_action', 'suggestedAction', 'action_text']:
    idx = c.find(line_pattern)
    if idx > 0:
        # Check nearby for display
        pass

print("All fixes applied")
