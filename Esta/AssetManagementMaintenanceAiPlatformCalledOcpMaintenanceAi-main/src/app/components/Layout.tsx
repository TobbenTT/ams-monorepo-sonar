import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard, Mic, ClipboardList, Archive, Calendar,
  BrainCircuit, BarChart3, GitBranch, Gauge, Beaker, TrendingUp,
  Activity, Database, Settings, Shield, FileText, Bug, ChevronLeft,
  ChevronRight, Bell, Search, User, Factory, AlertTriangle
} from "lucide-react";

const navItems = [
  { section: "OPERACIONES", items: [
    { path: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { path: "/field-capture", icon: Mic, label: "Captura en Campo", badge: 3 },
    { path: "/work-requests", icon: ClipboardList, label: "Solicitudes de Trabajo", badge: 8 },
    { path: "/backlog", icon: Archive, label: "Gestión de Backlog" },
    { path: "/scheduling", icon: Calendar, label: "Planificación" },
    { path: "/planner", icon: BrainCircuit, label: "Asistente IA" },
  ]},
  { section: "CONFIABILIDAD", items: [
    { path: "/hierarchy", icon: GitBranch, label: "Jerarquía de Activos" },
    { path: "/criticality", icon: Gauge, label: "Análisis Criticidad" },
    { path: "/fmea", icon: Beaker, label: "FMEA" },
    { path: "/fmeca", icon: Shield, label: "FMECA" },
    { path: "/strategy", icon: TrendingUp, label: "Estrategia Mantenimiento" },
    { path: "/reliability", icon: Activity, label: "Ingeniería Confiabilidad" },
    { path: "/defect-elimination", icon: Bug, label: "Eliminación de Defectos" },
  ]},
  { section: "ANALÍTICA & REPORTES", items: [
    { path: "/analytics", icon: BarChart3, label: "Analítica" },
    { path: "/executive", icon: AlertTriangle, label: "Dashboard Ejecutivo" },
    { path: "/reports", icon: FileText, label: "Reportes & Datos" },
    { path: "/sap-review", icon: Database, label: "Integración SAP" },
  ]},
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-[#1B5E20] text-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"} flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-green-700 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Factory className="w-5 h-5 text-[#1B5E20]" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold leading-tight">OCP Maintenance</div>
              <div className="text-xs text-green-300 leading-tight">AI Platform</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {navItems.map((section) => (
            <div key={section.section} className="mb-2">
              {!collapsed && (
                <div className="px-4 py-2 text-xs font-bold text-green-400 tracking-widest">
                  {section.section}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 group relative ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-green-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                    {!collapsed && (
                      <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full"></span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-green-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors text-green-300 hover:text-white"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="ml-2 text-xs">Colapsar</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar equipo, OT, TAG..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>API Conectada · JFC-1</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-800">Hassan Filali</div>
                <div className="text-xs text-gray-500">Planificador · JFC-1</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
