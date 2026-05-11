/**
 * Política transversal "antes del punto de ejecución"
 * (Jornada VSC 2026-05-08 — hallazgos QA #26, #27, #28).
 *
 * Algunas acciones (cambio de prioridad por IA, botón Reset, edición de scope)
 * SOLO deben estar habilitadas mientras la OT no haya entrado a ejecución.
 *
 * ✅ Estados pre-ejecución (acción permitida):
 *    Created → Released → Planned → In Scheduling → Scheduled
 *    (incluye Rescheduled, Pending, Approved — equivalentes legacy)
 *
 * ❌ Estados post-ejecución / terminales (acción bloqueada):
 *    In Execution → Completed → Closed → Cancelled
 *
 * Aplica a OTs. Para WRs, ver `isWRPreExecution` abajo.
 */

const PRE_EXECUTION_WO_STATUSES = new Set([
    'CREADO',
    'LIBERADO',
    'PLANIFICADO',
    'EN_PROGRAMACION',
    'PROGRAMADO',
    'REPROGRAMADO',
    // Legacy / equivalentes
    'PENDIENTE',
    'APROBADO',
    'CREATED',
    'RELEASED',
    'PLANNED',
    'SCHEDULED',
]);

const POST_EXECUTION_WO_STATUSES = new Set([
    'EN_EJECUCION',
    'EN_PROGRESO',
    'COMPLETADO',
    'CERRADO',
    'CANCELADO',
    'IN_EXECUTION',
    'IN_PROGRESS',
    'COMPLETED',
    'CLOSED',
    'CANCELLED',
]);

/**
 * @param {string} status - WO status (CREADO, EN_EJECUCION, etc.)
 * @returns {boolean} true si la OT aún no entró a ejecución
 */
export function isPreExecution(status) {
    if (!status) return true; // sin status → asumir pre-ejecución (modo creación)
    return PRE_EXECUTION_WO_STATUSES.has(String(status).toUpperCase());
}

/**
 * @param {string} status - WO status
 * @returns {boolean} true si la OT ya entró a ejecución o está terminada
 */
export function isPostExecution(status) {
    if (!status) return false;
    return POST_EXECUTION_WO_STATUSES.has(String(status).toUpperCase());
}

/**
 * Para WRs (Work Requests): una vez que la WR creó OT o quedó cerrada/rechazada/
 * cancelada, las acciones de priorización IA y edición de scope ya no deben
 * permitirse — el cambio iría contra una OT en curso o ya finalizada.
 */
const WR_LOCKED_STATUSES = new Set([
    'OT_CREADA',
    'CERRADO',
    'RECHAZADO',
    'CANCELADO',
    'CLOSED',
    'REJECTED',
    'CANCELLED',
]);

export function isWRPreExecution(status) {
    if (!status) return true;
    return !WR_LOCKED_STATUSES.has(String(status).toUpperCase());
}

/**
 * Mensaje uniforme cuando una acción está bloqueada por la política.
 */
export const PRE_EXECUTION_LOCK_MSG =
    'Esta acción solo está disponible antes de que la OT entre en ejecución (Created → Scheduled).';
