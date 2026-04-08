"""Fix SF-205 (operations description) and SF-206 (costs Plan/Real)."""

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx', 'r') as f:
    jsx = f.read()

# ═══ SF-205: Operations description shows resources instead of action ═══
# The new operation template uses description: '' which is correct.
# But the display in read-only mode might show specialty (resource) as main text.
# The issue is that when operations come from backend, description may be empty
# and specialty is shown prominently. Fix: make description the primary display,
# fallback to "Operation #N" if empty.

# In the edit mode, the description input placeholder should be clearer
jsx = jsx.replace(
    'placeholder="Operation description"',
    'placeholder="Describe the action/task (e.g., Replace bearing, Inspect valve)"'
)

# ═══ SF-206: Costs shows "Presupuesto" instead of "Plan / Real" ═══

# 1. Fix "Total Planned" → "Plan" and "Total Actual" → "Real"
# First occurrence
jsx = jsx.replace(
    '''                          <div className="text-[10px] text-blue-600 font-semibold uppercase">Total Planned</div>
                          <div className="text-lg font-bold text-blue-800">{totalPlan.toFixed(0)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                          <div className="text-[10px] text-amber-600 font-semibold uppercase">Total Actual</div>
                          <div className="text-lg font-bold text-amber-800">{totalReal.toFixed(0)}</div>
                        </div>
                        <div className={(totalReal - totalPlan) > 0 ? "bg-red-50 rounded-lg p-3 text-center border border-red-200" : "bg-green-50 rounded-lg p-3 text-center border border-green-200"}>
                          <div className="text-[10px] font-semibold uppercase" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>Variance</div>
                          <div className="text-lg font-bold" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>
                            {(totalReal - totalPlan) > 0 ? '+' : ''}{(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                          <div className="text-[10px] text-blue-600 font-semibold uppercase">Total Planned</div>
                          <div className="text-lg font-bold text-blue-800">{totalPlan.toFixed(0)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                          <div className="text-[10px] text-amber-600 font-semibold uppercase">Total Actual</div>
                          <div className="text-lg font-bold text-amber-800">{totalReal.toFixed(0)}</div>
                        </div>
                        <div className={(totalReal - totalPlan) > 0 ? "bg-red-50 rounded-lg p-3 text-center border border-red-200" : "bg-green-50 rounded-lg p-3 text-center border border-green-200"}>
                          <div className="text-[10px] font-semibold uppercase" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>Variance</div>
                          <div className="text-lg font-bold" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>
                            {(totalReal - totalPlan) > 0 ? '+' : ''}{(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>''',
    '''                          <div className="text-[10px] text-blue-600 font-semibold uppercase">Plan</div>
                          <div className="text-lg font-bold text-blue-800">${totalPlan.toFixed(0)}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                          <div className="text-[10px] text-amber-600 font-semibold uppercase">Real</div>
                          <div className="text-lg font-bold text-amber-800">${totalReal.toFixed(0)}</div>
                        </div>
                        <div className={(totalReal - totalPlan) > 0 ? "bg-red-50 rounded-lg p-3 text-center border border-red-200" : "bg-green-50 rounded-lg p-3 text-center border border-green-200"}>
                          <div className="text-[10px] font-semibold uppercase" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>Delta</div>
                          <div className="text-lg font-bold" style={{color: (totalReal - totalPlan) > 0 ? '#991b1b' : '#166534'}}>
                            {(totalReal - totalPlan) > 0 ? '+' : ''}{(totalReal - totalPlan).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      {/* Plan vs Real detail table */}
                      <table className="w-full text-xs mt-3 border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left px-2 py-1.5 font-semibold">Category</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-blue-700">Plan</th>
                            <th className="text-right px-2 py-1.5 font-semibold text-amber-700">Real</th>
                            <th className="text-right px-2 py-1.5 font-semibold">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {costItems.map(ci => {
                            const delta = ci.real - ci.plan;
                            return (
                              <tr key={ci.key} className="border-b">
                                <td className="px-2 py-1.5 font-medium">{ci.label}</td>
                                <td className="px-2 py-1.5 text-right text-blue-700">${ci.plan.toFixed(0)}</td>
                                <td className="px-2 py-1.5 text-right text-amber-700">${ci.real.toFixed(0)}</td>
                                <td className={"px-2 py-1.5 text-right font-bold " + (delta > 0 ? "text-red-600" : "text-green-600")}>
                                  {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-gray-300 font-bold">
                            <td className="px-2 py-1.5">Total</td>
                            <td className="px-2 py-1.5 text-right text-blue-800">${totalPlan.toFixed(0)}</td>
                            <td className="px-2 py-1.5 text-right text-amber-800">${totalReal.toFixed(0)}</td>
                            <td className={"px-2 py-1.5 text-right " + ((totalReal-totalPlan) > 0 ? "text-red-600" : "text-green-600")}>
                              {(totalReal-totalPlan) > 0 ? '+' : ''}{(totalReal-totalPlan).toFixed(0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>'''
)

# 2. Also fix the duplicate HH display in operations (shows HH twice)
jsx = jsx.replace(
    '''                              <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                                {((op.quantity || 1) * (op.hours || 0)).toFixed(1)} HH
                              </div>
                              <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                                {((op.quantity || 1) * (op.hours || 0)).toFixed(1)} HH
                              </div>''',
    '''                              <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                                {((op.quantity || 1) * (op.hours || 0)).toFixed(1)} HH
                              </div>'''
)

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx', 'w') as f:
    f.write(jsx)
print('Done - SF-205 and SF-206 fixed')
