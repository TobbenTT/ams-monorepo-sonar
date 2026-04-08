"""Wire remaining: Auto-Scheduler fallback to agentic, Smart Backlog button."""

# ═══ 1. Make aiAutoSchedule try agentic first, fallback to old ═══
api_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/api.js"
with open(api_path, "r") as f:
    c = f.read()

old_ai = "export const aiAutoSchedule = (d) => post('/scheduling/ai-auto-schedule', d || {});"
new_ai = "export const aiAutoSchedule = (d) => post('/agentic/auto-schedule', d || {}).catch(() => post('/scheduling/ai-auto-schedule', d || {}));"
c = c.replace(old_ai, new_ai)

with open(api_path, "w") as f:
    f.write(c)
print("api.js: aiAutoSchedule now uses agentic endpoint with fallback")

# ═══ 2. Add Smart Backlog button to Planning ═══
plan_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(plan_path, "r") as f:
    p = f.read()

# Find the "New Preventive WO" text to locate the button
if 'agenticSmartBacklog' not in p and 'AI Prioritize' not in p:
    # Search for the actual button text
    import re
    match = re.search(r'New Preventive WO\s*</button>', p)
    if match:
        insert_point = match.end()
        ai_btn = """
            <button onClick={async () => {
              try {
                toast.success('AI analyzing backlog...');
                const result = await api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' });
                const out = result.output_result || result;
                toast.success('Backlog analyzed: ' + (out.reprioritized_count || out.total_analyzed || 'done'));
                fetchData();
              } catch (e) { toast.error('Error: ' + (e.message || '')); }
            }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
              AI Prioritize
            </button>"""
        p = p[:insert_point] + ai_btn + p[insert_point:]
        print("Planning.jsx: Added AI Prioritize button")
    else:
        # Try alternate pattern
        idx = p.find('New Preventive WO')
        if idx > 0:
            # Find the closing </button> after it
            close = p.find('</button>', idx)
            if close > 0:
                insert_point = close + len('</button>')
                ai_btn = """
            <button onClick={async () => {
              try {
                toast.success('AI analyzing backlog...');
                const result = await api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' });
                toast.success('Backlog prioritized');
                fetchData();
              } catch (e) { toast.error('Error: ' + (e.message || '')); }
            }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
              AI Prioritize
            </button>"""
                p = p[:insert_point] + ai_btn + p[insert_point:]
                print("Planning.jsx: Added AI Prioritize (alt pattern)")
            else:
                print("Planning.jsx: Could not find button close")
        else:
            print("Planning.jsx: 'New Preventive WO' not found at all")

    with open(plan_path, "w") as f:
        f.write(p)
else:
    print("Planning.jsx: Already has AI Prioritize")

print("Done!")
