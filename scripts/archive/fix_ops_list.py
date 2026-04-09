"""Fix operations display - show numbered steps as vertical list when expanded."""
path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

# Replace the truncated description in header with short preview
old_header = '''<span className="flex-1 text-sm font-medium text-gray-800 truncate">{op.description || <span className="text-gray-400 italic">No description</span>}</span>'''

new_header = '''<span className="flex-1 text-sm font-medium text-gray-800 truncate">{op.description ? op.description.substring(0, 80) + (op.description.length > 80 ? '...' : '') : <span className="text-gray-400 italic">No description</span>}</span>'''

c = c.replace(old_header, new_header)

# Replace the text input in expanded view with textarea + formatted list
old_input = '''<input value={op.description || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], description: e.target.value}; setEditOps(n); }}
                                    className="flex-1 text-sm border rounded px-2 py-1" placeholder="Describe the action/task" />'''

new_input = '''<textarea value={op.description || ''} onChange={e => { const n = [...editOps]; n[idx] = {...n[idx], description: e.target.value}; setEditOps(n); }}
                                    className="flex-1 text-sm border rounded px-2 py-1 min-h-[60px]" placeholder="Describe the action/task" rows={3} />
                                </div>
                                {op.description && /\\d+[\\.\\)]/.test(op.description) && (
                                  <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                                    {op.description.split(/(?=\\d+[\\.\\)])/).filter(s => s.trim()).map((step, si) => (
                                      <div key={si} className="flex gap-2 text-xs text-gray-700">
                                        <span className="font-bold text-emerald-600 min-w-[18px]">{si+1}.</span>
                                        <span>{step.replace(/^\\d+[\\.\\)]\\s*/, '').trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="hidden">'''

c = c.replace(old_input, new_input)

with open(path, "w") as f:
    f.write(c)
print("Done")
