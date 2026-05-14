// ============================================================
// AMS Platform — Color Utility Functions
// ============================================================

export const criticalityColor = (level) => {
  switch (level) {
    case "AA": return "bg-red-100 text-red-800 border-red-200";
    case "A+": return "bg-orange-100 text-orange-800 border-orange-200";
    case "A": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "B": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const statusColor = (status) => {
  const map = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_VALIDATION: "bg-amber-100 text-amber-800",
    VALIDATED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    SCHEDULED: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    PENDIENTE: "bg-gray-100 text-gray-700",
    APROBADO: "bg-green-100 text-green-800",
    RECHAZADO: "bg-red-100 text-red-800",
    CANCELADO: "bg-red-50 text-red-700",
    CERRADO: "bg-emerald-200 text-emerald-900",
    CANCELLED: "bg-red-50 text-red-700",
    CLOSED: "bg-emerald-200 text-emerald-900",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    APPROVED: "bg-green-100 text-green-800",
    RUNNING: "bg-green-100 text-green-800",
    MAINTENANCE: "bg-orange-100 text-orange-800",
    STANDBY: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-green-100 text-green-800",
    IN_ANALYSIS: "bg-blue-100 text-blue-800",
    Alto: "bg-red-100 text-red-800",
    Moderado: "bg-amber-100 text-amber-800",
    Bajo: "bg-green-100 text-green-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
};

export const priorityColor = (p) => {
  const map = {
    P1: "bg-red-100 text-red-700 border-red-200",
    P2: "bg-orange-100 text-orange-700 border-orange-200",
    P3: "bg-blue-100 text-blue-700 border-blue-200",
    P4: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return map[p] ?? "bg-gray-100 text-gray-700";
};
