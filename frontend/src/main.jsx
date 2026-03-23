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
import './styles/index.css';

// ── New Design Pages ──────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkOrdersPage = lazy(() => import('./pages/WorkOrdersPage'));
const WorkManagement = lazy(() => import('./pages/WorkManagement'));
const FailuresEvents = lazy(() => import('./pages/FailuresEvents'));
const ImprovementActionsPage = lazy(() => import('./pages/ImprovementActionsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// ── Existing Pages (secondary routes) ─────────────────────────
const Login = lazy(() => import('./pages/Login'));
const HomeRouter = lazy(() => import('./pages/HomeRouter'));
const MobileHome = lazy(() => import('./pages/mobile/MobileHome'));
const MobileCreateWR = lazy(() => import('./pages/mobile/MobileCreateWR'));
const MobileWorkRequests = lazy(() => import('./pages/mobile/MobileWorkRequests'));
const MobileTaskExecution = lazy(() => import('./pages/mobile/MobileTaskExecution'));
const MobileDashboard = lazy(() => import('./pages/mobile/MobileDashboard'));
const MobileWorkOrders = lazy(() => import('./pages/mobile/MobileWorkOrders'));
const MobileWRDetail = lazy(() => import('./pages/mobile/MobileWRDetail'));
const Hierarchy = lazy(() => import('./pages/Hierarchy'));
const Criticality = lazy(() => import('./pages/Criticality'));
const FMEA = lazy(() => import('./pages/FMEA'));
const FMECA = lazy(() => import('./pages/FMECA'));
const Strategy = lazy(() => import('./pages/Strategy'));
const WorkPackages = lazy(() => import('./pages/WorkPackages'));
const WorkRequests = lazy(() => import('./pages/WorkRequests'));
const Backlog = lazy(() => import('./pages/Backlog'));
const Scheduling = lazy(() => import('./pages/Scheduling'));
const Planner = lazy(() => import('./pages/Planner'));
const Planning = lazy(() => import('./pages/Planning'));
const FieldCapture = lazy(() => import('./pages/FieldCapture'));
const Reliability = lazy(() => import('./pages/Reliability'));
const RCA = lazy(() => import('./pages/RCA'));
const DefectElimination = lazy(() => import('./pages/DefectElimination'));
const SAPReview = lazy(() => import('./pages/SAPReview'));
const Admin = lazy(() => import('./pages/Admin'));
const AIAgents = lazy(() => import('./pages/AIAgents'));
const Profile = lazy(() => import('./pages/Profile'));
const Financial = lazy(() => import('./pages/Financial'));
const Troubleshooting = lazy(() => import('./pages/Troubleshooting'));
const EquipmentChat = lazy(() => import('./pages/EquipmentChat'));
const ExpertKnowledge = lazy(() => import('./pages/ExpertKnowledge'));
const ExecutionChecklists = lazy(() => import('./pages/ExecutionChecklists'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const Execution = lazy(() => import('./pages/Execution'));
const PostMaintenance = lazy(() => import('./pages/PostMaintenance'));

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
                                <Route path="login" element={<S><Login /></S>} />

                                <Route element={<P roles={ALL}><App /></P>}>
                                    {/* ── New Design Routes (primary navigation) ── */}
                                    <Route index element={<S><HomeRouter /></S>} />
                                    <Route path="work-management" element={<S><WorkManagement /></S>} />
                                    <Route path="work-orders" element={<S><WorkOrdersPage /></S>} />
                                    <Route path="failures-events" element={<S><FailuresEvents /></S>} />
                                    <Route path="improvement-actions" element={<S><ImprovementActionsPage /></S>} />
                                    <Route path="analytics" element={<S><AnalyticsPage /></S>} />
                                    <Route path="reports" element={<S><ReportsPage /></S>} />
                                    <Route path="team" element={<S><TeamPage /></S>} />
                                    <Route path="settings" element={<S><SettingsPage /></S>} />
                                    <Route path="feedback-admin" element={<S><FeedbackAdmin /></S>} />
                                    <Route path="execution" element={<S><Execution /></S>} />
                                    <Route path="post-maintenance" element={<S><PostMaintenance /></S>} />

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
                                    <Route path="rca" element={<P roles={ENGR}><S><RCA /></S></P>} />
                                    <Route path="defect-elimination" element={<P roles={ENGR}><S><DefectElimination /></S></P>} />
                                    <Route path="sap-review" element={<P roles={MGMT}><S><SAPReview /></S></P>} />
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
