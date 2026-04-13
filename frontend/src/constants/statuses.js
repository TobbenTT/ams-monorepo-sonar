// Standardized status constants for WRs and WOs
// Based on client feedback #14 — pending final Status_avisos_ots.xlsx
// These are the values used in the DB and UI

export const WR_STATUSES = {
  DRAFT: { label: 'Draft', color: 'gray', phase: 'capture' },
  PENDIENTE: { label: 'Pending', color: 'amber', phase: 'identification' },
  APROBADO: { label: 'Approved', color: 'green', phase: 'planning' },
  OT_CREADA: { label: 'WO Created', color: 'blue', phase: 'planning' },
  RECHAZADO: { label: 'Rejected', color: 'red', phase: 'terminal' },
  CANCELADO: { label: 'Cancelled', color: 'orange', phase: 'terminal' },
  CERRADO: { label: 'Closed', color: 'emerald', phase: 'terminal' },
  ELIMINADO: { label: 'Deleted', color: 'red', phase: 'terminal' },
};

export const WO_STATUSES = {
  CREADO: { label: 'Created', color: 'gray', phase: 'planning' },
  PLANIFICADO: { label: 'Planned', color: 'blue', phase: 'planning' },
  PROGRAMADO: { label: 'Scheduled', color: 'indigo', phase: 'scheduling' },
  EN_EJECUCION: { label: 'In Execution', color: 'yellow', phase: 'execution' },
  COMPLETADO: { label: 'Completed', color: 'teal', phase: 'execution' },
  CERRADO: { label: 'Closed', color: 'emerald', phase: 'terminal' },
  CANCELADO: { label: 'Cancelled', color: 'orange', phase: 'terminal' },
};

export const WR_OPEN_STATUSES = ['DRAFT', 'PENDIENTE', 'APROBADO', 'PENDING_VALIDATION', 'VALIDATED', 'IN_PROGRESS'];
export const WO_OPEN_STATUSES = ['CREADO', 'PLANIFICADO', 'PROGRAMADO', 'EN_EJECUCION', 'DRAFT', 'PLANNED', 'RELEASED'];

export const normalizeWRStatus = (status) => {
  const map = {
    PENDING_VALIDATION: 'PENDIENTE',
    VALIDATED: 'APROBADO',
    REJECTED: 'RECHAZADO',
    CANCELLED: 'CANCELADO',
    CLOSED: 'CERRADO',
    DRAFT: 'PENDIENTE',
    ASSIGNED: 'APROBADO',
    IN_PROGRESS: 'APROBADO',
    COMPLETED: 'CERRADO',
  };
  return map[status] || status;
};

export const normalizeWOStatus = (status) => {
  const map = {
    DRAFT: 'CREADO',
    PLANNED: 'PLANIFICADO',
    RELEASED: 'PROGRAMADO',
    IN_PROGRESS: 'EN_EJECUCION',
    COMPLETED: 'COMPLETADO',
    CLOSED: 'CERRADO',
  };
  return map[status] || status;
};
