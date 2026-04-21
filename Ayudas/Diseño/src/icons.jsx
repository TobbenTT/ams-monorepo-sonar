// Inline SVG icons matching lucide-react naming. Stroke-based, currentColor.
// Usage: <Icon name="Search" className="w-4 h-4" />
const ICON_PATHS = {
  Search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  ChevronLeft: <path d="m15 18-6-6 6-6"/>,
  ChevronRight: <path d="m9 18 6-6-6-6"/>,
  ChevronDown: <path d="m6 9 6 6 6-6"/>,
  ChevronUp: <path d="m18 15-6-6-6 6"/>,
  Calendar: <><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  Bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  Settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
  AlertTriangle: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></>,
  Wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>,
  Zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>,
  Package: <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></>,
  Droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>,
  Hammer: <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9m7-7 3 3-1.5 1.5a2.121 2.121 0 0 1-3-3L19 2zM9.293 6.707 14 2l6 6-4.707 4.707-6-6z"/>,
  Cable: <><path d="M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z"/><path d="M3 5V3M7 5V3M19 15V13M23 15V13M16 15V11a4 4 0 0 0-4-4 4 4 0 0 1-4-4"/><path d="M20 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z"/></>,
  User: <><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
  Users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  Clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  GripVertical: <><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></>,
  Filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>,
  Plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
  Minus: <path d="M5 12h14"/>,
  X: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  Sparkles: <><path d="M9.94 14.34 6 18.28l3.94-3.94-3.94-3.94L9.94 14.34Z" opacity=".0"/><path d="M12 3 13.91 7.78 19 9.69l-5.09 1.91L12 16.38l-1.91-4.78L5 9.69l5.09-1.91L12 3z"/><path d="M5 18l1.5 3 3-1.5-3-1.5L5 18z"/><path d="M19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/></>,
  CheckCircle2: <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>,
  CircleAlert: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>,
  Circle: <circle cx="12" cy="12" r="10"/>,
  Ban: <><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></>,
  Maximize2: <><path d="M15 3h6v6"/><path d="m10 14-7 7"/><path d="M9 21H3v-6"/><path d="m14 10 7-7"/></>,
  Minimize2: <><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="m14 10 7-7"/><path d="m3 21 7-7"/></>,
  ArrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  ArrowUpRight: <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
  MoreHorizontal: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  FlaskConical: <><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7M7 16h10"/></>,
  Mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>,
  Sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  Moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  MapPin: <><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  PanelRightClose: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18M10 15l-3-3 3-3"/></>,
  FileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
  Radio: <><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/><circle cx="12" cy="12" r="2"/></>,
  Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
};

function Icon({ name, className = 'w-4 h-4', strokeWidth = 2, style }) {
  const path = ICON_PATHS[name];
  if (!path) return <span className={className} />;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

window.Icon = Icon;
