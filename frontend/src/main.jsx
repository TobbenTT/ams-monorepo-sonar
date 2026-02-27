import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { LoadingSpinner } from './components/Shared';
import './index.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Hierarchy = lazy(() => import('./pages/Hierarchy'));
const Criticality = lazy(() => import('./pages/Criticality'));
const FMEA = lazy(() => import('./pages/FMEA'));
const WorkPackages = lazy(() => import('./pages/WorkPackages'));
const Planning = lazy(() => import('./pages/Planning'));
const FieldCapture = lazy(() => import('./pages/FieldCapture'));
const Analytics = lazy(() => import('./pages/Analytics'));
const RCA = lazy(() => import('./pages/RCA'));
const Reports = lazy(() => import('./pages/Reports'));
const Admin = lazy(() => import('./pages/Admin'));

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <ConfirmProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<App />}>
                            <Route index element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                            <Route path="hierarchy" element={<Suspense fallback={<LoadingSpinner />}><Hierarchy /></Suspense>} />
                            <Route path="criticality" element={<Suspense fallback={<LoadingSpinner />}><Criticality /></Suspense>} />
                            <Route path="fmea" element={<Suspense fallback={<LoadingSpinner />}><FMEA /></Suspense>} />
                            <Route path="work-packages" element={<Suspense fallback={<LoadingSpinner />}><WorkPackages /></Suspense>} />
                            <Route path="planning" element={<Suspense fallback={<LoadingSpinner />}><Planning /></Suspense>} />
                            <Route path="field-capture" element={<Suspense fallback={<LoadingSpinner />}><FieldCapture /></Suspense>} />
                            <Route path="analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
                            <Route path="rca" element={<Suspense fallback={<LoadingSpinner />}><RCA /></Suspense>} />
                            <Route path="reports" element={<Suspense fallback={<LoadingSpinner />}><Reports /></Suspense>} />
                            <Route path="admin" element={<Suspense fallback={<LoadingSpinner />}><Admin /></Suspense>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ConfirmProvider>
        </ToastProvider>
    </StrictMode>
);