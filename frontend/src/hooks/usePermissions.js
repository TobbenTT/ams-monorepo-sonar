/**
 * usePermissions — Role-based access control hook
 *
 * View tiers:
 *   executive  → manager (high-level KPIs, no operational detail)
 *   tactical   → planner, engineer, tecnico (full detail, edit own section)
 *   admin      → everything
 *
 * Edit scopes:
 *   planning    → planner  (work-requests, work-packages, backlog, scheduling, planning, planner)
 *   reliability → engineer (hierarchy, criticality, fmea, strategy, reliability, rca, defect-elimination)
 *   execution   → tecnico  (field-capture, troubleshooting)
 *   all         → admin
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

/* ── Module → { view: roles[], edit: roles[] } ── */

const ALL_ROLES = ['admin', 'manager', 'planner', 'engineer', 'tecnico', 'supervisor'];
const TACTICAL = ['admin', 'planner', 'engineer', 'tecnico'];

const PERMISSIONS = {
    // ─── Operations / Planning ───
    'dashboard':          { view: ALL_ROLES, edit: ['admin'] },
    'work-requests':      { view: ALL_ROLES, edit: ['admin', 'planner'] },
    'work-packages':      { view: TACTICAL,  edit: ['admin', 'planner'] },
    'backlog':            { view: TACTICAL,  edit: ['admin', 'planner'] },
    'scheduling':         { view: TACTICAL,  edit: ['admin', 'planner'] },
    'planner':            { view: ['admin', 'planner'], edit: ['admin', 'planner'] },
    'planning':           { view: TACTICAL,  edit: ['admin', 'planner'] },

    // ─── Reliability / Engineering ───
    'hierarchy':          { view: ALL_ROLES, edit: ['admin', 'engineer'] },
    'criticality':        { view: TACTICAL,  edit: ['admin', 'engineer'] },
    'fmea':               { view: TACTICAL,  edit: ['admin', 'engineer'] },
    'strategy':           { view: TACTICAL,  edit: ['admin', 'engineer'] },
    'reliability':        { view: TACTICAL,  edit: ['admin', 'engineer'] },
    'rca':                { view: TACTICAL,  edit: ['admin', 'engineer'] },
    'defect-elimination': { view: TACTICAL,  edit: ['admin', 'engineer'] },

    // ─── Work Orders & Execution ───
    'work-management':    { view: ALL_ROLES, edit: ['admin', 'planner', 'tecnico'] },
    'work-orders':        { view: ALL_ROLES, edit: ['admin', 'planner'] },
    'execution':          { view: ['admin', 'planner', 'tecnico'], edit: ['admin', 'planner', 'tecnico'] },
    'post-maintenance':   { view: ['admin', 'manager', 'engineer'], edit: ['admin', 'engineer'] },
    'field-capture':      { view: TACTICAL,  edit: ['admin', 'tecnico'] },
    'troubleshooting':    { view: TACTICAL,  edit: ['admin', 'tecnico'] },

    // ─── Analytics & Reports ───
    'analytics':          { view: ['admin', 'manager'], edit: ['admin'] },
    'executive':          { view: ['admin', 'manager'], edit: ['admin'] },
    'failures-events':    { view: ALL_ROLES, edit: ['admin', 'engineer'] },
    'improvement-actions': { view: TACTICAL,  edit: ['admin', 'engineer', 'planner'] },
    'reports':            { view: ALL_ROLES, edit: ['admin', 'manager'] },
    'sap-review':         { view: ['admin', 'manager', 'planner'], edit: ['admin'] },

    // ─── System ───
    'admin':              { view: ['admin'], edit: ['admin'] },
    'ai-agents':          { view: ['admin', 'manager', 'engineer'], edit: ['admin'] },
    'team':               { view: ['admin', 'manager', 'planner'], edit: ['admin', 'manager'] },
    'settings':           { view: ALL_ROLES, edit: ALL_ROLES },
    'feedback':           { view: ALL_ROLES, edit: ALL_ROLES },
    'data-import':        { view: ['admin', 'manager'], edit: ['admin'] },
    'profile':            { view: ALL_ROLES, edit: ALL_ROLES },
};

/* ── Role → edit scope label ── */
const EDIT_SCOPE = {
    admin:    'all',
    manager:  'executive',
    planner:  'planning',
    engineer: 'reliability',
    tecnico:  'execution',
};

/* ── Role → view tier ── */
const VIEW_TIER = {
    admin:    'admin',
    manager:  'executive',
    planner:  'tactical',
    engineer: 'tactical',
    tecnico:  'tactical',
};

export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role || 'tecnico';

    return useMemo(() => {
        const viewTier = VIEW_TIER[role] || 'tactical';
        const editScope = EDIT_SCOPE[role] || 'execution';
        const isAdmin = role === 'admin';
        const isExecutive = viewTier === 'executive' || viewTier === 'admin';
        const isTactical = viewTier === 'tactical' || viewTier === 'admin';

        /** Can this role see the module at all? */
        function canView(module) {
            const perm = PERMISSIONS[module];
            if (!perm) return isAdmin;
            return perm.view.includes(role);
        }

        /** Can this role edit/interact in the module? */
        function canEdit(module) {
            const perm = PERMISSIONS[module];
            if (!perm) return isAdmin;
            return perm.edit.includes(role);
        }

        /** Is this module read-only for the current user? */
        function isReadOnly(module) {
            return canView(module) && !canEdit(module);
        }

        /** Get all modules this role can view */
        function viewableModules() {
            return Object.keys(PERMISSIONS).filter(m => canView(m));
        }

        /** Get all modules this role can edit */
        function editableModules() {
            return Object.keys(PERMISSIONS).filter(m => canEdit(m));
        }

        return {
            role,
            viewTier,
            editScope,
            isAdmin,
            isExecutive,
            isTactical,
            canView,
            canEdit,
            isReadOnly,
            viewableModules,
            editableModules,
        };
    }, [role]);
}

export { PERMISSIONS, ALL_ROLES, TACTICAL, EDIT_SCOPE, VIEW_TIER };
