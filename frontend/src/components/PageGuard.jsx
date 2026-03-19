/**
 * PageGuard — wraps page content with read-only banner + provides context
 *
 * Usage:
 *   <PageGuard module="work-requests">
 *     <WorkRequestsContent />
 *   </PageGuard>
 *
 * Inside children:
 *   const { readOnly } = usePageGuard();
 *   if (readOnly) hide edit buttons
 */

import { createContext, useContext } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import ReadOnlyBanner from './ReadOnlyBanner';

const PageGuardContext = createContext({ readOnly: false });

export function usePageGuard() {
    return useContext(PageGuardContext);
}

export default function PageGuard({ module, children }) {
    const { isReadOnly } = usePermissions();
    const readOnly = isReadOnly(module);

    return (
        <PageGuardContext.Provider value={{ readOnly }}>
            {readOnly && <ReadOnlyBanner />}
            {children}
        </PageGuardContext.Provider>
    );
}
