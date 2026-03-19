import { lazy, Suspense } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { LoadingSpinner } from '../components/Shared';

const Dashboard = lazy(() => import('./Dashboard'));
const MobileHome = lazy(() => import('./mobile/MobileHome'));

export default function HomeRouter() {
    const isMobile = useIsMobile();

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {isMobile ? <MobileHome /> : <Dashboard />}
        </Suspense>
    );
}
