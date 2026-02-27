/* API Client — OCP Maintenance AI MVP */
const BASE = '/api/v1';

async function get(path, params) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function post(path, data) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}) });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json();
}

async function put(path, data) {
  const r = await fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}) });
  if (!r.ok) throw new Error(`PUT ${path} → ${r.status}`);
  return r.json();
}

// ── Hierarchy ──
export const listPlants = () => get('/hierarchy/plants');
export const listNodes = (p) => get('/hierarchy/nodes', p);
export const getNode = (id) => get(`/hierarchy/nodes/${id}`);
export const getSubtree = (id) => get(`/hierarchy/nodes/${id}/tree`);
export const createNode = (d) => post('/hierarchy/nodes', d);
export const buildFromVendor = (d) => post('/hierarchy/build-from-vendor', d);
export const getNodeStats = (plantId) => get('/hierarchy/stats', { plant_id: plantId });

// ── Criticality ──
export const assessCriticality = (d) => post('/criticality/assess', d);
export const getCriticality = (id) => get(`/criticality/${id}`);
export const approveCriticality = (id) => put(`/criticality/${id}/approve`);

// ── FMEA ──
export const listFunctions = (nodeId) => get('/fmea/functions', { node_id: nodeId });
export const createFunction = (d) => post('/fmea/functions', d);
export const listFunctionalFailures = (fid) => get('/fmea/functional-failures', { function_id: fid });
export const createFunctionalFailure = (d) => post('/fmea/functional-failures', d);
export const createFailureMode = (d) => post('/fmea/failure-modes', d);
export const getFailureMode = (id) => get(`/fmea/failure-modes/${id}`);
export const listFailureModes = (ffid) => get('/fmea/failure-modes', { functional_failure_id: ffid });
export const validateFmCombo = (m, c) => get('/fmea/validate-fm', { mechanism: m, cause: c });
export const getFmCombinations = (m) => get('/fmea/fm-combinations', { mechanism: m });
export const rcmDecide = (d) => post('/fmea/rcm-decide', d);

// ── Tasks ──
export const createTask = (d) => post('/tasks', d);
export const getTask = (id) => get(`/tasks/${id}`);
export const listTasks = (p) => get('/tasks', p);

// ── Work Packages ──
export const createWorkPackage = (d) => post('/work-packages', d);
export const getWorkPackage = (id) => get(`/work-packages/${id}`);
export const listWorkPackages = (p) => get('/work-packages', p);
export const approveWorkPackage = (id) => put(`/work-packages/${id}/approve`);
export const groupTasks = (d) => post('/work-packages/group', d);
export const generateWorkInstruction = (id, d) => post(`/work-packages/${id}/work-instruction`, d);

// ── SAP ──
export const listSapUploads = (p) => get('/sap/uploads', p);
export const approveSapUpload = (id) => put(`/sap/uploads/${id}/approve`);
export const getSapMock = (t) => get(`/sap/mock/${t}`);

// ── Analytics ──
export const calculateHealthScore = (d) => post('/analytics/health-score', d);
export const calculateKpis = (d) => post('/analytics/kpis', d);
export const fitWeibull = (d) => post('/analytics/weibull-fit', d);
export const predictFailure = (d) => post('/analytics/weibull-predict', d);
export const getVarianceAlerts = () => get('/analytics/variance-alerts');

// ── Admin ──
export const seedDatabase = () => post('/admin/seed-database');
export const getStats = () => get('/admin/stats');
export const getAuditLog = (p) => get('/admin/audit-log', p);

// ── Capture ──
export const submitCapture = (d) => post('/capture/', d);
export const listCaptures = () => get('/capture/');
export const getCapture = (id) => get(`/capture/${id}`);

// ── Work Requests ──
export const listWorkRequests = (p) => get('/work-requests', p);
export const getWorkRequest = (id) => get(`/work-requests/${id}`);
export const validateWorkRequest = (id, d) => put(`/work-requests/${id}/validate`, d);

// ── Planner ──
export const generateRecommendation = (id) => post(`/planner/recommend/${id}`);
export const getRecommendation = (id) => get(`/planner/recommendations/${id}`);

// ── Backlog ──
export const listBacklog = (p) => get('/backlog', p);
export const addToBacklog = (id) => post(`/backlog/add/${id}`);
export const optimizeBacklog = (d) => post('/backlog/optimize', d);
export const getSchedule = () => get('/backlog/schedule');

// ── Scheduling ──
export const createProgram = (d) => post('/scheduling/programs', d);
export const listPrograms = (p) => get('/scheduling/programs', p);
export const getProgram = (id) => get(`/scheduling/programs/${id}`);
export const finalizeProgram = (id) => put(`/scheduling/programs/${id}/finalize`);
export const getGantt = (id) => get(`/scheduling/programs/${id}/gantt`);

// ── Reliability ──
export const analyzeSpare = (d) => post('/reliability/spare-parts/analyze', d);
export const createShutdown = (d) => post('/reliability/shutdowns', d);
export const listMocs = (p) => get('/reliability/mocs', p);

// ── Reporting ──
export const generateWeeklyReport = (d) => post('/reporting/reports/weekly', d);
export const generateMonthlyReport = (d) => post('/reporting/reports/monthly', d);
export const listReports = (p) => get('/reporting/reports', p);
export const getReport = (id) => get(`/reporting/reports/${id}`);
export const listNotifications = (p) => get('/reporting/notifications', p);
export const acknowledgeNotification = (id) => put(`/reporting/notifications/${id}/ack`);
export const exportData = (d) => post('/reporting/export', d);

// ── Dashboard ──
export const getExecutiveDashboard = (plantId) => get(`/dashboard/executive/${plantId}`);
export const getKpiSummary = (plantId) => get(`/dashboard/kpi-summary/${plantId}`);
export const getDashboardAlerts = (plantId) => get(`/dashboard/alerts/${plantId}`);

// ── RCA ──
export const createRca = (d) => post('/rca/analyses', d);
export const listRcas = (p) => get('/rca/analyses', p);
export const getRca = (id) => get(`/rca/analyses/${id}`);
export const getRcaSummary = (p) => get('/rca/analyses/summary', p);
export const run5w2h = (id, d) => post(`/rca/analyses/${id}/5w2h`, d);
export const advanceRca = (id, d) => put(`/rca/analyses/${id}/advance`, d);
export const listPlanningKpis = (p) => get('/rca/planning-kpis', p);
export const listDeKpis = (p) => get('/rca/de-kpis', p);

// ── Health check ──
export const healthCheck = () => fetch('/health').then(r => r.json());
