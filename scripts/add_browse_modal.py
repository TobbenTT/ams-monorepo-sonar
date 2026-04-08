"""Add Browse All Locations modal to FailureCapture.jsx"""

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx', 'r') as f:
    jsx = f.read()

# 1. Add state for browse modal
jsx = jsx.replace(
    'const [selectedLoc, setSelectedLoc] = useState(null);',
    'const [selectedLoc, setSelectedLoc] = useState(null);\n'
    '  const [showBrowseModal, setShowBrowseModal] = useState(false);\n'
    '  const [browseSearch, setBrowseSearch] = useState("");\n'
    '  const [browseType, setBrowseType] = useState("");\n'
    '  const [browseResults, setBrowseResults] = useState([]);\n'
    '  const [browseLoading, setBrowseLoading] = useState(false);'
)

# 2. Add browse functions
browse_func = '''
  // Browse all locations - server-side search with filters
  const openBrowseModal = () => {
    setShowBrowseModal(true);
    setBrowseSearch('');
    setBrowseType('');
    loadBrowseResults('', '');
  };
  const loadBrowseResults = (search, type) => {
    setBrowseLoading(true);
    const params = { limit: 50 };
    if (search) params.search = search;
    if (type) params.node_type = type;
    api.listNodes(params).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setBrowseResults(nodes);
      setBrowseLoading(false);
    }).catch(() => { setBrowseResults([]); setBrowseLoading(false); });
  };
  useEffect(() => {
    if (!showBrowseModal) return;
    const timer = setTimeout(() => loadBrowseResults(browseSearch, browseType), 300);
    return () => clearTimeout(timer);
  }, [browseSearch, browseType, showBrowseModal]);
  const selectBrowseLocation = (node) => {
    selectLocation(node);
    setShowBrowseModal(false);
  };

'''

marker = '  // Auto-detect equipment tag from description'
jsx = jsx.replace(marker, browse_func + marker)

# 3. Add "Browse All" button after the dropdown
old_dd = '''                  </div>
                )}
              </div>
            ) : ('''

new_dd = '''                  </div>
                )}
                <button type="button" onClick={openBrowseModal}
                  className="mt-2 w-full text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1.5 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors">
                  Browse All Locations...
                </button>
              </div>
            ) : ('''

jsx = jsx.replace(old_dd, new_dd)

# 4. Add the modal JSX
modal = '''
      {/* Browse All Locations Modal */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBrowseModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Browse All Locations</h3>
              <button onClick={() => setShowBrowseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Search by name, code, or SAP func loc..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  autoFocus />
              </div>
              <select value={browseType} onChange={e => setBrowseType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">All Types</option>
                <option value="PLANT">Plant</option>
                <option value="AREA">Area</option>
                <option value="SYSTEM">System</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="SUB_ASSEMBLY">Sub-Assembly</option>
                <option value="MAINTAINABLE_ITEM">Maintainable Item</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {browseLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : browseResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No results found</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Code / SAP Func Loc</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Tag</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {browseResults.map((node, i) => (
                      <tr key={node.node_id || i} className="border-b hover:bg-emerald-50 cursor-pointer" onClick={() => selectBrowseLocation(node)}>
                        <td className="px-3 py-2">
                          <span className={"text-xs font-mono px-1.5 py-0.5 rounded " + (
                            node.node_type === 'PLANT' ? 'bg-purple-100 text-purple-700' :
                            node.node_type === 'AREA' ? 'bg-blue-100 text-blue-700' :
                            node.node_type === 'SYSTEM' ? 'bg-cyan-100 text-cyan-700' :
                            node.node_type === 'EQUIPMENT' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          )}>{node.node_type}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-700">{node.sap_func_loc || node.code || '-'}</td>
                        <td className="px-3 py-2 text-gray-900">{node.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{node.tag || '-'}</td>
                        <td className="px-3 py-2">
                          <span className="text-emerald-600 text-xs font-medium">Select</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-3 border-t text-xs text-gray-500 flex justify-between items-center">
              <span>Showing {browseResults.length} results {browseResults.length >= 50 ? '(limit 50 — refine search)' : ''}</span>
              <button onClick={() => setShowBrowseModal(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
'''

# Insert before the final closing div
jsx = jsx.replace(
    '    </div>\n  );\n}',
    modal + '\n    </div>\n  );\n}'
)

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx', 'w') as f:
    f.write(jsx)
print('Done - Browse All modal added')
