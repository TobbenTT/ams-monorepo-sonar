path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

# The current structure is:
# {isPlanner && (
#   <button>+ New Preventive WO</button>
# )}
# Change to:
# {isPlanner && (<>
#   <button>+ New Preventive WO</button>
#   <button>AI Prioritize</button>
# </>)}

old = """        {isPlanner && (
          <button onClick={async () => {
            try {
              const wo = await api.createManagedWO({
                plant_id: 'OCP-JFC1',
                wo_type: 'PM02',
                priority_code: 'P3',
                description: 'New Preventive WO',
                estimated_hours: 4,
              });
              toast.success('OT Preventiva ' + (wo.wo_number || wo.wo_id || '') + ' creada');
              fetchData();
            } catch (e) { toast.error('Error: ' + (e.message || '')); }
          }} className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
            + New Preventive WO
          </button>
        )}"""

new = """        {isPlanner && (<>
          <button onClick={async () => {
            try {
              const wo = await api.createManagedWO({
                plant_id: plant || 'OCP-JFC1',
                wo_type: 'PM02',
                priority_code: 'P3',
                description: 'New Preventive WO',
                estimated_hours: 4,
              });
              toast.success('OT Preventiva ' + (wo.wo_number || wo.wo_id || '') + ' creada');
              fetchData();
            } catch (e) { toast.error('Error: ' + (e.message || '')); }
          }} className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
            + New Preventive WO
          </button>
          <button onClick={() => {
            toast.success('AI analyzing backlog...');
            api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' })
              .then(() => { toast.success('Backlog prioritized'); fetchData(); })
              .catch(e => toast.error('Error: ' + (e.message || '')));
          }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
            AI Prioritize
          </button>
        </>)}"""

if old in c:
    c = c.replace(old, new)
    with open(path, "w") as f:
        f.write(c)
    print("Done")
else:
    print("Pattern not found - checking...")
    idx = c.find("+ New Preventive WO")
    print(f"  'New Preventive WO' at index: {idx}")
