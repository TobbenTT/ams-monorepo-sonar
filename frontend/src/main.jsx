import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingSpinner } from './components/Shared';
import { installOfflineSync } from './offlineSync';
import './styles/index.css';

// Install offline queue drainer — triggered on 'online' event + periodic checks.
installOfflineSync();

// Jorge 2026-04-23: cache-bust one-shot. Si la versión guardada no coincide,
// limpiamos Cache Storage + Service Worker + localStorage efímero y forzamos
// hard reload una sola vez por versión. Dispara al cargar la app.
const CACHE_BUST_VERSION = '2026-04-27-tandaA';
(async () => {
  try {
    const prev = localStorage.getItem('ocp_cache_version');
    if (prev === CACHE_BUST_VERSION) return; // ya refrescó esta versión
    // 1. Purga Cache Storage (service workers, fetch cache)
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch {}
    }
    // 2. Desregistra service workers si los hay
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      } catch {}
    }
    // 3. Limpia localStorage efímero (NO tocar auth ni settings del user)
    const keepKeys = ['ocp_token', 'ocp_user', 'ocp_settings', 'selected_plant'];
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys) {
      if (!keepKeys.includes(k)) {
        try { localStorage.removeItem(k); } catch {}
      }
    }
    // 4. Marca la versión ANTES de recargar para no hacer loop
    localStorage.setItem('ocp_cache_version', CACHE_BUST_VERSION);
    // 5. Hard reload con cache-bust
    const url = new URL(window.location.href);
    url.searchParams.set('_cb', String(Date.now()));
    window.location.replace(url.toString());
  } catch (e) {
    // Si algo falla, al menos marcamos la versión para no quedar colgados
    try { localStorage.setItem('ocp_cache_version', CACHE_BUST_VERSION); } catch {}
  }
})();

// Wrapper: if a lazy chunk fails (stale deploy), auto-reload once
function lazyRetry(importFn) {
    return lazy(() =>
        importFn().catch(() => {
            const key = 'chunk_reload_ts';
            const last = sessionStorage.getItem(key);
            const now = Date.now();
            if (!last || now - Number(last) > 10000) {
                sessionStorage.setItem(key, String(now));
                window.location.reload();
            }
            return importFn(); // 2nd attempt after potential reload
        })
    );
}

// ── New Design Pages ──────────────────────────────────────────
const Dashboard = lazyRetry(() => import('./pages/Dashboard'));
const WorkOrdersPage = lazyRetry(() => import('./pages/WorkOrdersPage'));
const WorkManagement = lazyRetry(() => import('./pages/WorkManagement'));
const FailuresEvents = lazyRetry(() => import('./pages/FailuresEvents'));
const ImprovementActionsPage = lazyRetry(() => import('./pages/ImprovementActionsPage'));
const AnalyticsPage = lazyRetry(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazyRetry(() => import('./pages/ReportsPage'));
const TeamPage = lazyRetry(() => import('./pages/TeamPage'));
const SettingsPage = lazyRetry(() => import('./pages/SettingsPage'));
const ContractorsPage = lazyRetry(() => import('./pages/ContractorsPage'));

// ── Existing Pages (secondary routes) ─────────────────────────
const Login = lazyRetry(() => import('./pages/Login'));
const HomeRouter = lazyRetry(() => import('./pages/HomeRouter'));
const MobileHome = lazyRetry(() => import('./pages/mobile/MobileHome'));
const MobileCreateWR = lazyRetry(() => import('./pages/mobile/MobileCreateWR'));
const MobileWorkRequests = lazyRetry(() => import('./pages/mobile/MobileWorkRequests'));
const MobileTaskExecution = lazyRetry(() => import('./pages/mobile/MobileTaskExecution'));
const MobileDashboard = lazyRetry(() => import('./pages/mobile/MobileDashboard'));
const MobileWorkOrders = lazyRetry(() => import('./pages/mobile/MobileWorkOrders'));
const MobileWRDetail = lazyRetry(() => import('./pages/mobile/MobileWRDetail'));
const Hierarchy = lazyRetry(() => import('./pages/Hierarchy'));
const Criticality = lazyRetry(() => import('./pages/Criticality'));
const FMEA = lazyRetry(() => import('./pages/FMEA'));
const FMECA = lazyRetry(() => import('./pages/FMECA'));
const Strategy = lazyRetry(() => import('./pages/Strategy'));
const WorkPackages = lazyRetry(() => import('./pages/WorkPackages'));
const WorkRequests = lazyRetry(() => import('./pages/WorkRequests'));
const Backlog = lazyRetry(() => import('./pages/Backlog'));
const Scheduling = lazyRetry(() => import('./pages/Scheduling'));
const Planner = lazyRetry(() => import('./pages/Planner'));
const Planning = lazyRetry(() => import('./pages/Planning'));
const FieldCapture = lazyRetry(() => import('./pages/FieldCapture'));
const Reliability = lazyRetry(() => import('./pages/Reliability'));
const Shutdowns = lazyRetry(() => import('./pages/Shutdowns'));
const SpareParts = lazyRetry(() => import('./pages/SpareParts'));
const NotificationsCenter = lazyRetry(() => import('./pages/NotificationsCenter'));
const RCA = lazyRetry(() => import('./pages/RCA'));
const DefectElimination = lazyRetry(() => import('./pages/DefectElimination'));
const SAPReview = lazyRetry(() => import('./pages/SAPReview'));
const SapPmPage = lazyRetry(() => import("./pages/SapPmPage"));
const Admin = lazyRetry(() => import('./pages/Admin'));
const AIAgents = lazyRetry(() => import('./pages/AIAgents'));
const Profile = lazyRetry(() => import('./pages/Profile'));
const Financial = lazyRetry(() => import('./pages/Financial'));
const Troubleshooting = lazyRetry(() => import('./pages/Troubleshooting'));
const EquipmentChat = lazyRetry(() => import('./pages/EquipmentChat'));
const ExpertKnowledge = lazyRetry(() => import('./pages/ExpertKnowledge'));
const ExecutionChecklists = lazyRetry(() => import('./pages/ExecutionChecklists'));
// Jorge 2026-04-23: feedback-admin removido del nav (módulo en desuso).
// const FeedbackAdmin = lazyRetry(() => import('./pages/FeedbackAdmin'));
const Execution = lazyRetry(() => import('./pages/Execution'));
const PostMaintenance = lazyRetry(() => import('./pages/PostMaintenance'));
const DataImport = lazyRetry(() => import('./pages/DataImport'));

const LandingPage = lazyRetry(() => import('./pages/LandingPage'));
const StatusPage = lazyRetry(() => import('./pages/StatusPage'));
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const SecurityCompliancePage = lazyRetry(() => import('./pages/SecurityCompliancePage'));
const UserGuidePage = lazyRetry(() => import('./pages/UserGuidePage'));
const AuditLogPage = lazyRetry(() => import('./pages/AuditLogPage'));
const WSDebugPage = lazyRetry(() => import('./pages/WSDebugPage'));

const ALL = ['admin', 'manager', 'planner', 'tecnico', 'engineer'];
const MGMT = ['admin', 'manager'];
const PLAN = ['admin', 'manager', 'planner', 'engineer'];
const FIELD = ['admin', 'tecnico'];
const ENGR = ['admin', 'manager', 'engineer'];

function P({ roles, children }) {
    return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

function S({ children }) {
    return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <LanguageProvider>
            <AuthProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route index element={<S><LandingPage /></S>} />
                                <Route path="landing" element={<S><LandingPage /></S>} />
                                <Route path="login" element={<S><Login /></S>} />
                                <Route path="status" element={<S><StatusPage /></S>} />
                                <Route path="contact" element={<S><ContactPage /></S>} />
                                <Route path="security" element={<S><SecurityCompliancePage /></S>} />
                                <Route path="security-compliance" element={<S><SecurityCompliancePage /></S>} />

                                <Route element={<P roles={ALL}><App /></P>}>
                                    {/* ── New Design Routes (primary navigation) ── */}
                                    <Route path="dashboard" element={<S><HomeRouter /></S>} />
                                    <Route path="work-management" element={<S><WorkManagement /></S>} />
                                    <Route path="work-orders" element={<S><WorkOrdersPage /></S>} />
                                    <Route path="failures-events" element={<S><FailuresEvents /></S>} />
                                    <Route path="improvement-actions" element={<S><ImprovementActionsPage /></S>} />
                                    <Route path="analytics" element={<P roles={MGMT}><S><AnalyticsPage /></S></P>} />
                                    <Route path="reports" element={<S><ReportsPage /></S>} />
                                    <Route path="team" element={<P roles={['admin', 'manager', 'planner']}><S><TeamPage /></S></P>} />
                                    <Route path="settings" element={<S><SettingsPage /></S>} />
                                    {/* Route feedback-admin removida 2026-04-23 */}
                                    <Route path="execution" element={<P roles={['admin', 'planner', 'tecnico']}><S><Execution /></S></P>} />
                                    <Route path="post-maintenance" element={<P roles={PLAN}><S><PostMaintenance /></S></P>} />
                                    <Route path="data-import" element={<P roles={MGMT}><S><DataImport /></S></P>} />
                                    <Route path="user-guide" element={<S><UserGuidePage /></S>} />
                                    <Route path="audit-log" element={<P roles={MGMT}><S><AuditLogPage /></S></P>} />
                                    <Route path="ws-debug" element={<P roles={MGMT}><S><WSDebugPage /></S></P>} />
                                    <Route path="contractors" element={<P roles={['admin', 'manager', 'planner']}><S><ContractorsPage /></S></P>} />

                                    {/* ── Mobile routes ── */}
                                    <Route path="m/tareas" element={<S><MobileWorkOrders /></S>} />
                                    <Route path="m/crear-wr" element={<S><MobileCreateWR /></S>} />
                                    <Route path="m/avisos" element={<S><MobileWorkRequests /></S>} />
                                    <Route path="m/wr/:id" element={<S><MobileWRDetail /></S>} />
                                    <Route path="m/tarea/:id" element={<S><MobileTaskExecution /></S>} />
                                    <Route path="m/dashboard" element={<S><MobileDashboard /></S>} />

                                    {/* ── Existing operational routes (accessible via search/URL) ── */}
                                    <Route path="field-capture" element={<P roles={FIELD}><S><FieldCapture /></S></P>} />
                                    <Route path="work-requests" element={<S><WorkRequests /></S>} />
                                    <Route path="work-packages" element={<P roles={PLAN}><S><WorkPackages /></S></P>} />
                                    <Route path="backlog" element={<P roles={PLAN}><S><Backlog /></S></P>} />
                                    <Route path="scheduling" element={<P roles={PLAN}><S><Scheduling /></S></P>} />
                                    <Route path="planner" element={<P roles={PLAN}><S><Planner /></S></P>} />
                                    <Route path="planning" element={<P roles={PLAN}><S><Planning /></S></P>} />
                                    <Route path="hierarchy" element={<S><Hierarchy /></S>} />
                                    <Route path="criticality" element={<P roles={PLAN}><S><Criticality /></S></P>} />
                                    <Route path="fmea" element={<P roles={PLAN}><S><FMEA /></S></P>} />
                                    <Route path="fmeca" element={<P roles={PLAN}><S><FMECA /></S></P>} />
                                    <Route path="strategy" element={<P roles={PLAN}><S><Strategy /></S></P>} />
                                    <Route path="reliability" element={<P roles={ENGR}><S><Reliability /></S></P>} />
                                    <Route path="shutdowns" element={<P roles={PLAN}><S><Shutdowns /></S></P>} />
                                    <Route path="spare-parts" element={<P roles={PLAN}><S><SpareParts /></S></P>} />
                                    <Route path="notifications" element={<P roles={ALL}><S><NotificationsCenter /></S></P>} />
                                    <Route path="rca" element={<P roles={ENGR}><S><RCA /></S></P>} />
                                    <Route path="defect-elimination" element={<P roles={ENGR}><S><DefectElimination /></S></P>} />
                                    <Route path="sap-review" element={<P roles={MGMT}><S><SAPReview /></S></P>} />
                                    <Route path="sap-pm" element={<P roles={['admin', 'manager', 'planner']}><S><SapPmPage /></S></P>} />
                                    <Route path="financial" element={<P roles={MGMT}><S><Financial /></S></P>} />
                                    <Route path="troubleshooting" element={<P roles={ALL}><S><Troubleshooting /></S></P>} />
                                    <Route path="equipment-chat" element={<P roles={ALL}><S><EquipmentChat /></S></P>} />
                                    <Route path="expert-knowledge" element={<P roles={ENGR}><S><ExpertKnowledge /></S></P>} />
                                    <Route path="execution-checklists" element={<P roles={FIELD}><S><ExecutionChecklists /></S></P>} />
                                    <Route path="admin" element={<P roles={['admin']}><S><Admin /></S></P>} />
                                    <Route path="ai-agents" element={<P roles={ENGR}><S><AIAgents /></S></P>} />
                                    <Route path="profile" element={<S><Profile /></S>} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ConfirmProvider>
                </ToastProvider>
            </AuthProvider>
        </LanguageProvider>
    </StrictMode>
);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
