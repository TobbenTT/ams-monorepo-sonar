path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

old = """            + New Preventive WO
          </button>
        )}"""

new = """            + New Preventive WO
          </button>
          <button onClick={() => {
            toast.success('AI analyzing backlog...');
            api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' })
              .then(r => { toast.success('Backlog prioritized'); fetchData(); })
              .catch(e => toast.error('Error: ' + (e.message || '')));
          }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
            AI Prioritize
          </button>
        )}"""

c = c.replace(old, new)

with open(path, "w") as f:
    f.write(c)
print("Fixed")
