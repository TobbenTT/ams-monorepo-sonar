"""Wire 3 agentic solutions: Auto-Scheduler, Smart Backlog, KPI Watchdog."""

# ═══ 1. Add API calls to api.js ═══
api_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/api.js"
with open(api_path, "r") as f:
    c = f.read()

# Add agentic endpoints before the last export or at end of exports
agentic_apis = """
// ── Agentic Solutions ──
export const agenticAutoSchedule = (d) => post('/agentic/auto-schedule', d);
export const agenticSmartBacklog = (d) => post('/agentic/smart-backlog', d);
export const agenticKpiWatchdog = (d) => post('/agentic/kpi-watchdog', d);
export const agenticStatus = () => get('/agentic/status');
"""

if 'agenticAutoSchedule' not in c:
    # Add before the last line or after last export
    c = c.rstrip() + "\n" + agentic_apis + "\n"
    with open(api_path, "w") as f:
        f.write(c)
    print("api.js: Added 3 agentic endpoints")
else:
    print("api.js: Already has agentic endpoints")

# ═══ 2. Wire Auto-Scheduler to Scheduling page ═══
sched_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Scheduling.jsx"
with open(sched_path, "r") as f:
    s = f.read()

# Find existing AI Auto-Schedule button and handler
if 'agenticAutoSchedule' not in s:
    # Check if there's already an AI Auto-Schedule button
    if 'AI Auto-Schedule' in s or 'handleAiAutoSchedule' in s:
        # Find the handler and replace with agentic call
        old_handler = "const handleAiAutoSchedule = async () => {"
        if old_handler in s:
            # Find the end of this function and replace
            idx = s.find(old_handler)
            if idx > 0:
                # Find closing of the function (look for next const or function)
                end_markers = ["\n  const ", "\n  function ", "\n  useEffect"]
                end_idx = len(s)
                for marker in end_markers:
                    mi = s.find(marker, idx + 100)
                    if mi > 0 and mi < end_idx:
                        end_idx = mi

                old_fn = s[idx:end_idx]
                new_fn = """const handleAiAutoSchedule = async () => {
    setAiScheduling(true);
    setAiResult(null);
    try {
      const result = await api.agenticAutoSchedule({
        plant_id: plant,
        week_number: currentWeek,
        year: new Date().getFullYear(),
        include_preventive: true,
        respect_shutdowns: true,
      });
      setAiResult(result);
      toast.success('AI Auto-Schedule complete: ' + (result.output_result?.scheduled_count || 0) + ' OTs scheduled');
      fetchData();
    } catch (e) {
      toast.error('Auto-Schedule failed: ' + (e.message || ''));
    } finally {
      setAiScheduling(false);
    }
  };

"""
                s = s[:idx] + new_fn + s[end_idx:]
                print("Scheduling.jsx: Replaced handleAiAutoSchedule with agentic call")
        else:
            print("Scheduling.jsx: No handleAiAutoSchedule found, skipping")
    else:
        print("Scheduling.jsx: No AI Auto-Schedule button found")

    # Make sure api import includes agenticAutoSchedule
    if "import * as api from '../api'" not in s:
        # Check current import
        if "from '../api'" in s:
            print("Scheduling.jsx: api already imported")

    with open(sched_path, "w") as f:
        f.write(s)
else:
    print("Scheduling.jsx: Already wired")

# ═══ 3. Wire Smart Backlog to Planning page (add button) ═══
plan_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(plan_path, "r") as f:
    p = f.read()

if 'agenticSmartBacklog' not in p:
    # Add a "AI Prioritize" button next to the existing "+ New Preventive WO" button
    old_new_wo = """+ New Preventive WO</button>"""
    new_buttons = """+ New Preventive WO</button>
            <button onClick={async () => {
              try {
                toast.success('AI analyzing backlog priorities...');
                const result = await api.agenticSmartBacklog({ plant_id: plant, strategy: 'risk_weighted' });
                const out = result.output_result || result;
                toast.success('Backlog prioritized: ' + (out.reprioritized_count || out.total_analyzed || 0) + ' OTs analyzed');
                fetchData();
              } catch (e) { toast.error('Error: ' + (e.message || '')); }
            }} className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1">
              AI Prioritize</button>"""

    if old_new_wo in p:
        p = p.replace(old_new_wo, new_buttons)
        print("Planning.jsx: Added AI Prioritize button")
    else:
        print("Planning.jsx: Could not find New Preventive WO button")

    with open(plan_path, "w") as f:
        f.write(p)
else:
    print("Planning.jsx: Already has smart backlog")

# ═══ 4. Wire KPI Watchdog to Dashboard ═══
# Add a button in the KpiControlPanel or ExecutiveView to trigger watchdog
exec_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/components/views/ExecutiveView.jsx"
with open(exec_path, "r") as f:
    e = f.read()

if 'agenticKpiWatchdog' not in e:
    # Add KPI Watchdog trigger near the Root Cause Analysis section
    old_rca = """<h3 className="font-bold text-blue-900">{t('executive.rootCauseTitle')}</h3>"""

    if old_rca in e:
        new_rca = """<h3 className="font-bold text-blue-900">{t('executive.rootCauseTitle')}</h3>
              <button onClick={async () => {
                try {
                  const result = await api.agenticKpiWatchdog({ plant_id: selectedPlant, thresholds: { availability: 85, mtbf: 10, mttr: 8 } });
                  const out = result.output_result || result;
                  const alerts = out.alerts_triggered || out.anomalies_found || 0;
                  if (alerts > 0) {
                    alert('KPI Watchdog: ' + alerts + ' anomalies detected!');
                  } else {
                    alert('KPI Watchdog: All KPIs within normal parameters');
                  }
                } catch (e) { console.error(e); }
              }} className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Run Watchdog
              </button>"""
        e = e.replace(old_rca, new_rca)
        print("ExecutiveView.jsx: Added KPI Watchdog button")
    else:
        print("ExecutiveView.jsx: Could not find rootCauseTitle")

    with open(exec_path, "w") as f:
        f.write(e)
else:
    print("ExecutiveView.jsx: Already has KPI watchdog")

print("\nAll 3 agentic solutions wired!")
