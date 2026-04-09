path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

# Remove the broken button insertion
old = """          </button>
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

new = """          </button>
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

c = c.replace(old, new)

with open(path, "w") as f:
    f.write(c)
print("Fixed")
