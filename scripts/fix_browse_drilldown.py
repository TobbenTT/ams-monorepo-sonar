"""Replace Browse All modal with drill-down hierarchy navigation."""

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx', 'r') as f:
    jsx = f.read()

# 1. Replace state variables
old_states = '''const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseType, setBrowseType] = useState("");
  const [browseResults, setBrowseResults] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);'''

new_states = '''const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseResults, setBrowseResults] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browsePath, setBrowsePath] = useState([]);  // [{node_id, name, node_type}]'''

jsx = jsx.replace(old_states, new_states)

# 2. Replace browse functions
old_funcs = '''  // Browse all locations - server-side search with filters
  const openBrowseModal = () => {
    setShowBrowseModal(true);
    setBrowseSearch('');
    setBrowseType('');
    loadBrowseResults('', '');
  };
  const loadBrowseResults = (search, type) => {
    setBrowseLoading(true);
    const params = { limit: 200 };
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
  };'''

new_funcs = '''  // Browse all locations - drill-down navigation
  const openBrowseModal = () => {
    setShowBrowseModal(true);
    setBrowseSearch('');
    setBrowsePath([]);
    loadBrowseChildren(null, '');
  };
  const loadBrowseChildren = (parentId, search) => {
    setBrowseLoading(true);
    const params = { limit: 500 };
    if (parentId) params.parent_node_id = parentId;
    else params.node_type = 'PLANT';
    if (search) params.search = search;
    api.listNodes(params).then(res => {
      const nodes = Array.isArray(res) ? res : res?.items || [];
      setBrowseResults(nodes);
      setBrowseLoading(false);
    }).catch(() => { setBrowseResults([]); setBrowseLoading(false); });
  };
  const drillDown = (node) => {
    setBrowsePath(prev => [...prev, { node_id: node.node_id, name: node.name, node_type: node.node_type }]);
    setBrowseSearch('');
    loadBrowseChildren(node.node_id, '');
  };
  const drillUp = (index) => {
    if (index < 0) {
      setBrowsePath([]);
      loadBrowseChildren(null, '');
    } else {
      const newPath = browsePath.slice(0, index + 1);
      setBrowsePath(newPath);
      loadBrowseChildren(newPath[newPath.length - 1].node_id, '');
    }
  };
  useEffect(() => {
    if (!showBrowseModal) return;
    const timer = setTimeout(() => {
      const parentId = browsePath.length > 0 ? browsePath[browsePath.length - 1].node_id : null;
      loadBrowseChildren(parentId, browseSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [browseSearch]);
  const selectBrowseLocation = (node) => {
    selectLocation(node);
    setShowBrowseModal(false);
  };'''

jsx = jsx.replace(old_funcs, new_funcs)

# 3. Replace the modal JSX
old_modal = '''      {/* Browse All Locations Modal */}
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
              <span>Showing {browseResults.length} results {browseResults.length >= 200 ? '(limit 200 — refine search)' : ''}</span>
              <button onClick={() => setShowBrowseModal(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}'''

new_modal = '''      {/* Browse All Locations Modal - Drill Down */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBrowseModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Browse Locations</h3>
              <button onClick={() => setShowBrowseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Breadcrumb */}
            <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-1 text-sm flex-wrap">
              <button onClick={() => drillUp(-1)} className={"font-medium hover:underline " + (browsePath.length === 0 ? "text-emerald-700" : "text-blue-600")}>
                All Plants
              </button>
              {browsePath.map((p, i) => (
                <span key={p.node_id} className="flex items-center gap-1">
                  <span className="text-gray-400">/</span>
                  <button onClick={() => drillUp(i)} className={"font-medium hover:underline " + (i === browsePath.length - 1 ? "text-emerald-700" : "text-blue-600")}>
                    {p.name}
                  </button>
                </span>
              ))}
            </div>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={browseSearch} onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Filter..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
            </div>
            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {browseLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : browseResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No items at this level</div>
              ) : (
                <div className="divide-y">
                  {browseResults.map((node, i) => {
                    const hasChildren = ['PLANT','AREA','SYSTEM','EQUIPMENT'].includes(node.node_type);
                    const typeColors = {
                      PLANT: 'bg-purple-100 text-purple-700',
                      AREA: 'bg-blue-100 text-blue-700',
                      SYSTEM: 'bg-cyan-100 text-cyan-700',
                      EQUIPMENT: 'bg-amber-100 text-amber-700',
                      SUB_ASSEMBLY: 'bg-orange-100 text-orange-700',
                      MAINTAINABLE_ITEM: 'bg-gray-100 text-gray-600',
                    };
                    return (
                      <div key={node.node_id || i} className="flex items-center px-4 py-3 hover:bg-gray-50 group">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => hasChildren ? drillDown(node) : selectBrowseLocation(node)}>
                          <div className="flex items-center gap-2">
                            <span className={"text-xs font-mono px-1.5 py-0.5 rounded " + (typeColors[node.node_type] || 'bg-gray-100 text-gray-600')}>
                              {node.node_type}
                            </span>
                            <span className="text-sm font-bold text-gray-900 truncate">{node.name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-mono text-gray-500">{node.sap_func_loc || node.code || ''}</span>
                            {node.tag && <span className="text-xs text-gray-400">TAG: {node.tag}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button onClick={() => selectBrowseLocation(node)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </button>
                          {hasChildren && (
                            <button onClick={() => drillDown(node)}
                              className="text-gray-400 hover:text-gray-600">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-3 border-t text-xs text-gray-500 flex justify-between items-center">
              <span>{browseResults.length} items</span>
              <button onClick={() => setShowBrowseModal(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}'''

jsx = jsx.replace(old_modal, new_modal)

# Make sure ChevronRight is imported
if 'ChevronRight' not in jsx.split('from')[0]:
    # Check if it's already imported from lucide-react
    if 'ChevronRight' not in jsx:
        jsx = jsx.replace(
            "} from 'lucide-react';",
            ", ChevronRight } from 'lucide-react';"
        )

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx', 'w') as f:
    f.write(jsx)
print('Done')
