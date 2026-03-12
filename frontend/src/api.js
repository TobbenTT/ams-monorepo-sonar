/* API Client — OCP Maintenance AI MVP */
const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('access_token');
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) headers['X-API-Key'] = apiKey;
  return headers;
}

let isRefreshing = false;
let refreshPromise = null;

async function tryRefresh() {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    const rt = localStorage.getItem('refresh_token');
    if (!rt) return null;
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request(method, path, data, params) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });

  const opts = { method, headers: authHeaders() };
  if (data !== undefined && method !== 'GET') opts.body = JSON.stringify(data);

  let r = await fetch(url, opts);

  if (r.status === 401 && getToken()) {
    const newToken = await tryRefresh();
    if (newToken) {
      opts.headers = authHeaders();
      r = await fetch(url, opts);
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Sesion expirada');
    }
  }

  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`);
  return r.json();
}

async function get(path, params) { return request('GET', path, undefined, params); }
async function post(path, data) { return request('POST', path, data || {}); }
async function put(path, data) { return request('PUT', path, data || {}); }
async function del(path) { return request('DELETE', path); }

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

// ── FMECA ──
export const listFmecaWorksheets = (p) => get('/fmea/fmeca/worksheets', p);
export const getFmecaWorksheet = (id) => get(`/fmea/fmeca/worksheets/${id}`);
export const createFmecaWorksheet = (d) => post('/fmea/fmeca/worksheets', d);
export const calculateRPN = (d) => post('/fmea/fmeca/rpn', d);
export const getFmecaSummary = (id) => get(`/fmea/fmeca/worksheets/${id}/summary`);
export const addFmecaRow = (id, d) => post(`/fmea/fmeca/worksheets/${id}/rows`, d);
export const runFmecaDecisions = (id) => put(`/fmea/fmeca/worksheets/${id}/run-decisions`);
export const generateFmecaTasks = (id) => post(`/fmea/fmeca/worksheets/${id}/generate-tasks`);

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
export const generateSapUpload = (d) => post('/sap/generate-upload', d);

// ── Analytics ──
export const calculateHealthScore = (d) => post('/analytics/health-score', d);
export const calculateKpis = (d) => post('/analytics/kpis', d);
export const fitWeibull = (d) => post('/analytics/weibull-fit', d);
export const predictFailure = (d) => post('/analytics/weibull-predict', d);
export const getVarianceAlerts = () => get('/analytics/variance-alerts');
export const getAssetHealth = (p) => get('/analytics/asset-health', p);
export const getAnalyticsPageData = (plantId) => get(`/analytics/page-data/${plantId}`);

// ── Admin ──
export const seedDatabase = () => post('/admin/seed-database');
export const getStats = () => get('/admin/stats');
export const getAuditLog = (p) => get('/admin/audit-log', p);

// ── Capture ──
export const submitCapture = (d) => post('/capture/', d);
export const listCaptures = () => get('/capture/');
export const getCapture = (id) => get(`/capture/${id}`);
export const deleteCapture = (id) => del(`/capture/${id}`);

// ── Work Requests ──
export const listWorkRequests = (p) => get('/work-requests/', p);
export const getWorkRequest = (id) => get(`/work-requests/${id}`);
export const validateWorkRequest = (id, d) => put(`/work-requests/${id}/validate`, d);
export const checkDuplicates = (d) => post('/work-requests/check-duplicates', d);
export const createWRFromHierarchy = (d) => post('/work-requests/from-hierarchy', d);
export const deleteWorkRequest = (id) => del(`/work-requests/${id}`);
export const ocrWorkOrderClosure = (d) => post('/work-requests/ocr-closure', d);

// ── Planner ──
export const generateRecommendation = (id) => post(`/planner/recommend/${id}`);
export const getRecommendation = (id) => get(`/planner/recommendations/${id}`);
export const applyRecommendationAction = (id, d) => put(`/planner/recommendations/${id}/action`, d);

// ── Backlog ──
export const listBacklog = (p) => get('/backlog/', p);
export const addToBacklog = (id) => post(`/backlog/add/${id}`);
export const optimizeBacklog = (d) => post('/backlog/optimize', d);
export const getSchedule = () => get('/backlog/schedule');

// ── Scheduling ──
export const createProgram = (d) => post('/scheduling/programs', d);
export const listPrograms = (p) => get('/scheduling/programs', p);
export const getProgram = (id) => get(`/scheduling/programs/${id}`);
export const finalizeProgram = (id) => put(`/scheduling/programs/${id}/finalize`);
export const activateProgram = (id) => put(`/scheduling/programs/${id}/activate`);
export const completeProgram = (id) => put(`/scheduling/programs/${id}/complete`);
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

// ── Auth ──
export const authLogin = (d) => post('/auth/login', d);
export const authRefresh = (d) => post('/auth/refresh', d);
export const authMe = () => get('/auth/me');
export const authUpdateProfile = (d) => put('/auth/me', d);
export const authRegister = (d) => post('/auth/register', d);
export const authChangePassword = (d) => put('/auth/change-password', d);
export const authListUsers = (p) => get('/auth/users', p);
export const authUpdateRole = (id, d) => put(`/auth/users/${id}/role`, d);
export const authDeactivate = (id) => put(`/auth/users/${id}/deactivate`);
export const authActivate = (id) => put(`/auth/users/${id}/activate`);

// ── AI Agents (CORTEX) ──
export const getAiStatus = () => get('/ai/status');
export const listAiTools = () => get('/ai/tools');
export const callAiTool = (d) => post('/ai/tools/call', d);
export const createAiSession = (d) => post('/ai/sessions', d);
export const listAiSessions = (p) => get('/ai/sessions', p);
export const getAiSession = (id) => get(`/ai/sessions/${id}`);
export const advanceAiMilestone = (id) => post(`/ai/sessions/${id}/advance`);
export const milestoneAction = (sid, mNum, d) => post(`/ai/sessions/${sid}/milestone/${mNum}/action`, d);
export const runTroubleshooting = (d) => post('/ai/troubleshoot', d);
export const listDiagnostics = (p) => get('/ai/troubleshoot', p);
export const generateChecklist = (d) => post('/ai/checklists', d);
export const getAiChecklist = (id) => get(`/ai/checklists/${id}`);
export const updateChecklistItem = (id, d) => put(`/ai/checklists/${id}/items`, d);

// ── Financial / ROI (GAP-W04) ──
export const calculateRoi = (d) => post('/financial/roi', d);
export const compareRoiScenarios = (d) => post('/financial/roi/compare', d);
export const getFinancialSummary = (p) => get('/financial/summary', p);
export const getBudgetStatus = (p) => get('/financial/budget', p);

// ── Troubleshooting (GAP-W02) ──
export const createTroubleshootingSession = (d) => post('/troubleshooting/sessions', d);
export const getTroubleshootingSession = (id) => get(`/troubleshooting/sessions/${id}`);
export const listTroubleshootingSessions = (p) => get('/troubleshooting/sessions', p);
export const addSymptom = (id, d) => post(`/troubleshooting/sessions/${id}/symptoms`, d);
export const getDiagnosticTests = (id) => get(`/troubleshooting/sessions/${id}/tests`);
export const recordTestResult = (id, d) => post(`/troubleshooting/sessions/${id}/test-results`, d);
export const completeTroubleshooting = (id, d) => put(`/troubleshooting/sessions/${id}/complete`, d);

// ── Expert Knowledge (GAP-W13) ──
export const listExperts = (p) => get('/expert-knowledge/experts', p);
export const getExpert = (id) => get(`/expert-knowledge/experts/${id}`);
export const createConsultation = (d) => post('/expert-knowledge/consultations', d);
export const listConsultations = (p) => get('/expert-knowledge/consultations', p);
export const respondConsultation = (id, d) => put(`/expert-knowledge/consultations/${id}/respond`, d);
export const listContributions = (p) => get('/expert-knowledge/contributions', p);
export const promoteContribution = (id) => put(`/expert-knowledge/contributions/${id}/promote`);

// ── Execution Checklists (GAP-W06) ──
export const createChecklist = (d) => post('/execution-checklists/', d);
export const listChecklists = (p) => get('/execution-checklists/', p);
export const getChecklist = (id) => get(`/execution-checklists/${id}`);
export const completeChecklistStep = (id, d) => put(`/execution-checklists/${id}/steps`, d);
export const closeChecklist = (id, d) => put(`/execution-checklists/${id}/close`, d);

// ── Deliverables (GAP-W10) ──
export const listDeliverables = (p) => get('/deliverables/', p);
export const getDeliverable = (id) => get(`/deliverables/${id}`);

// ── Assignments (GAP-W09) ──
export const optimizeAssignments = (d) => post('/assignments/optimize', d);
export const getAssignmentSummary = (p) => get('/assignments/summary', p);

// ── Workflow (G-17) ──
export const startWorkflow = (d) => post('/workflow/sessions', d);
export const getWorkflowSession = (id) => get(`/workflow/sessions/${id}`);
export const advanceWorkflow = (id) => post(`/workflow/sessions/${id}/advance`);

// ── Imports (G-18) ──
export const importFile = (d) => post('/imports/upload', d);
export const listImportHistory = (p) => get('/imports/history', p);

// ── Health check ──
export const healthCheck = () => fetch('/health').then(r => r.json());
