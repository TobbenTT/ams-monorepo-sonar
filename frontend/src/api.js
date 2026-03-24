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
async function patch(path, data) { return request('PATCH', path, data || {}); }
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
export const getAnalyticsPageData = (plantId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const qs = params.toString();
  return get(`/analytics/page-data/${plantId}${qs ? '?' + qs : ''}`);
};

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
export const approveWorkRequest = (id, d) => put(`/work-requests/${id}/approve`, d);
export const rejectWorkRequest = (id, d) => put(`/work-requests/${id}/reject`, d);
export const getEquipmentHistory = (tag, excludeId) => get(`/work-requests/equipment-history/${encodeURIComponent(tag)}`, { exclude_id: excludeId });
export const checkDuplicates = (d) => post('/work-requests/check-duplicates', d);
export const createWRFromHierarchy = (d) => post('/work-requests/from-hierarchy', d);
export const cancelWorkRequest = (id, d) => put(`/work-requests/${id}/validate`, { action: 'CANCEL', ...(d || {}) });
export const updateWorkRequest = (id, d) => put(`/work-requests/${id}`, d);
export const deleteWorkRequest = (id) => del(`/work-requests/${id}`);
export const ocrWorkOrderClosure = (d) => post('/work-requests/ocr-closure', d);
export const startWorkRequest = (id) => put(`/work-requests/${id}/start`);
export const completeWorkRequest = (id, d) => put(`/work-requests/${id}/complete`, d);
export const closeWorkRequest = (id, d) => put(`/work-requests/${id}/close`, d);
export const createWRManual = (d) => post('/work-requests/manual', d);

// ── Managed Work Orders (Jorge Phase 2 — OT lifecycle) ──
export const listManagedWOs = (p) => get('/managed-work-orders/', p);
export const getManagedWO = (id) => get(`/managed-work-orders/${id}`);
export const createManagedWO = (d) => post('/managed-work-orders/', d);
export const createWOFromWR = (d) => post('/managed-work-orders/from-wr', d);
export const updateManagedWO = (id, d) => put(`/managed-work-orders/${id}`, d);
export const planManagedWO = (id) => put(`/managed-work-orders/${id}/plan`);
export const releaseManagedWO = (id) => put(`/managed-work-orders/${id}/release`);
export const scheduleManagedWO = (id, d) => put(`/managed-work-orders/${id}/schedule`, d);
export const startManagedWO = (id) => put(`/managed-work-orders/${id}/start`);
export const completeManagedWO = (id, d) => put(`/managed-work-orders/${id}/complete`, d);
export const closeManagedWO = (id) => put(`/managed-work-orders/${id}/close`);
export const addManagedWONote = (id, d) => post(`/managed-work-orders/${id}/notes`, d);
export const updateManagedWOProgress = (id, d) => put(`/managed-work-orders/${id}/progress`, d);
export const getManagedWOStats = (p) => get('/managed-work-orders/stats', p);

// ── Detailed Feedback ──
export const submitFeedback = (d) => post('/feedback/', d);
export const listFeedback = (p) => get('/feedback/', p);
export const getFeedback = (id) => get(`/feedback/${id}`);
export const updateFeedback = (id, d) => put(`/feedback/${id}`, d);
export const exportFeedbackJSON = () => get('/feedback/export/json');
export const uploadFeedbackAttachment = async (feedbackId, file, caption = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);
  const token = getToken();
  const res = await fetch(`${BASE}/feedback/${feedbackId}/attachments`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.statusText);
  return res.json();
};

// ── Execution (Jorge Phase 4) ──
export const assignExecutionTask = (d) => post('/execution/tasks', d);
export const listExecutionTasks = (p) => get('/execution/tasks', p);
export const getExecutionTask = (id) => get(`/execution/tasks/${id}`);
export const getMyTasks = () => get('/execution/my-tasks');
export const updateTaskProgress = (id, d) => put(`/execution/tasks/${id}/progress`, d);
export const partialNotification = (id, d) => post(`/execution/tasks/${id}/partial`, d);
export const completeExecutionTask = (id) => put(`/execution/tasks/${id}/complete`);
export const confirmTaskUnderstood = (id) => put(`/execution/tasks/${id}/confirm-understood`);
export const createHandover = (d) => post('/execution/handovers', d);
export const listHandovers = (p) => get('/execution/handovers', p);

// ── Post-Maintenance (Jorge Phase 5) ──
export const createPMReview = (d) => post('/post-maintenance/reviews', d);
export const listPMReviews = (p) => get('/post-maintenance/reviews', p);
export const getPMReview = (id) => get(`/post-maintenance/reviews/${id}`);
export const updatePMReview = (id, d) => put(`/post-maintenance/reviews/${id}`, d);
export const completePMReview = (id) => put(`/post-maintenance/reviews/${id}/complete`);
export const getPMAnalysis = (p) => get('/post-maintenance/analysis', p);

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
// Phase 3 — Scheduling improvements
export const publishProgram = (id) => put(`/scheduling/programs/${id}/publish`);
export const materialCheck = (id) => get(`/scheduling/programs/${id}/material-check`);
export const hhBalance = (id) => get(`/scheduling/programs/${id}/hh-balance`);
export const getGanttManaged = (p) => get('/scheduling/gantt', p);

// ── SAP BOM / Materials ──
export const searchBOM = (query) => get('/sap/mock/MM60', { search: query });

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
export const getExecutiveDashboard = (plantId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const qs = params.toString();
  return get(`/dashboard/executive/${plantId}${qs ? '?' + qs : ''}`);
};
export const getKpiSummary = (plantId) => get(`/dashboard/kpi-summary/${plantId}`);
export const getDashboardAlerts = (plantId) => get(`/dashboard/alerts/${plantId}`);
// Phase 6 — Work Management KPIs
export const getWorkManagementKpis = (plantId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const qs = params.toString();
  return get(`/dashboard/work-management-kpis/${plantId}${qs ? '?' + qs : ''}`);
};

// ── RCA ──
export const createRca = (d) => post('/rca/analyses', d);
export const listRcas = (p) => get('/rca/analyses', p);
export const getRca = (id) => get(`/rca/analyses/${id}`);
export const updateRca = (id, d) => put(`/rca/analyses/${id}`, d);
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
export const equipmentChat = (d) => post('/ai/equipment-chat', d);

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
export const recordTestResult = (id, d) => post(`/troubleshooting/sessions/${id}/tests`, d);
export const completeTroubleshooting = (id, d) => put(`/troubleshooting/sessions/${id}/finalize`, d);

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
export const updateChecklist = (id, d) => patch(`/execution-checklists/${id}`, d);

// ── Deliverables (GAP-W10) ──
export const listDeliverables = (p) => get('/deliverables/', p);
export const getDeliverable = (id) => get(`/deliverables/${id}`);

// ── Assignments (GAP-W09) ──
export const listTechnicians = (p) => get('/assignments/technicians', p);
export const assignWorkRequest = (id, d) => put(`/work-requests/${id}/assign`, d);
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

// ── OR Projects (CORTEX OR System) ──
export const createORProject = (d) => post('/or/projects', d);
export const listORProjects = () => get('/or/projects');
export const getORProject = (id) => get(`/or/projects/${id}`);
export const updateORProject = (id, d) => put(`/or/projects/${id}`, d);
export const advanceORGate = (id) => post(`/or/projects/${id}/advance-gate`);
export const listORProjectDeliverables = (id) => get(`/or/projects/${id}/deliverables`);
export const listORDeliverables = () => get('/or/deliverables');

// ── Improvement Actions ──
export const listImprovementActions = (p) => get('/improvement-actions/', p);
export const getImprovementAction = (id) => get(`/improvement-actions/${id}`);
export const createImprovementAction = (d) => post('/improvement-actions/', d);
export const updateImprovementAction = (id, d) => put(`/improvement-actions/${id}`, d);
export const deleteImprovementAction = (id) => del(`/improvement-actions/${id}`);
export const getImprovementActionsSummary = (p) => get('/improvement-actions/summary', p);
export const analyzeDeviations = (plantId) => post(`/improvement-actions/analyze-deviations?plant_id=${plantId || 'OCP-JFC1'}`);

// ── SAP PM Catalogs (Planillas de Carga) ──
export const getFailureCategories = () => get('/catalogs/failure-categories');
export const getFailureProfiles = (search) => get('/catalogs/failure-profiles', search ? { search } : {});
export const getFailureProfile = (code) => get(`/catalogs/failure-profile/${code}`);
export const getEquipmentTypes = (search) => get('/catalogs/equipment-types', search ? { search } : {});
export const getCatalogTaxonomy = (p) => get('/catalogs/taxonomy', p);
export const getCatalogCriticality = (tag) => get('/catalogs/criticality', tag ? { tag } : {});
