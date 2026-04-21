// MAGEAM scheduler sample data.
// Plant: Los Andes — Concentrator 1. Week: W14 · Mar 31 — Apr 06.

const DAYS = [
  { key: 'mon', short: 'Mon', date: 'Mar 31' },
  { key: 'tue', short: 'Tue', date: 'Apr 01' },
  { key: 'wed', short: 'Wed', date: 'Apr 02' },
  { key: 'thu', short: 'Thu', date: 'Apr 03' },
  { key: 'fri', short: 'Fri', date: 'Apr 04' },
  { key: 'sat', short: 'Sat', date: 'Apr 05' },
  { key: 'sun', short: 'Sun', date: 'Apr 06' },
];

// Work centers + their color accents + icon
const WORK_CENTERS = [
  { key: 'MEC', name: 'Mechanical',      icon: 'Wrench',       accent: 'emerald', nominalPerDay: 96 }, // 8 techs × 12h
  { key: 'ELEC', name: 'Electrical',     icon: 'Zap',          accent: 'amber',   nominalPerDay: 60 },
  { key: 'INST', name: 'Instrumentation',icon: 'Radio',        accent: 'sky',     nominalPerDay: 48 },
  { key: 'CIV',  name: 'Civil',          icon: 'Hammer',       accent: 'stone',   nominalPerDay: 36 },
  { key: 'LUB',  name: 'Lubrication',    icon: 'Droplet',      accent: 'indigo',  nominalPerDay: 24 },
];

// Capacity consumed per work center × day (HH)
// Percent = consumed / nominal. > 100% = red. 80-100% = amber. < 80% = green.
const CAPACITY = {
  MEC:  [72,  84,  120, 88,  76,  40,  24],   // Wed = 120/96 = 125% → red
  ELEC: [42,  54,  58,  48,  50,  18,  12],
  INST: [30,  36,  40,  44,  32,  12,   8],
  CIV:  [20,  28,  24,  32,  30,  10,   6],
  LUB:  [14,  18,  22,  18,  16,   8,   4],
};

// Technicians grouped by work center
const TECHS = {
  MEC: [
    { id: 't-mec-1', name: 'R. Gutiérrez',   role: 'Mech. Lead',  shift: '7x7', avatar: 'RG' },
    { id: 't-mec-2', name: 'S. Navarro',     role: 'Mechanic',    shift: '7x7', avatar: 'SN' },
    { id: 't-mec-3', name: 'J. Pizarro',     role: 'Mechanic',    shift: '14x14',avatar: 'JP' },
    { id: 't-mec-4', name: 'M. Fuentes',     role: 'Mechanic',    shift: '7x7', avatar: 'MF' },
  ],
  ELEC: [
    { id: 't-ele-1', name: 'C. Rojas',       role: 'Elec. Lead',  shift: '7x7', avatar: 'CR' },
    { id: 't-ele-2', name: 'A. Vega',        role: 'Electrician', shift: '14x14',avatar: 'AV' },
    { id: 't-ele-3', name: 'P. Aravena',     role: 'Electrician', shift: '7x7', avatar: 'PA' },
  ],
  INST: [
    { id: 't-ins-1', name: 'D. Contreras',   role: 'I&C Tech',    shift: '7x7', avatar: 'DC' },
    { id: 't-ins-2', name: 'N. Herrera',     role: 'I&C Tech',    shift: '14x14',avatar: 'NH' },
  ],
  CIV: [
    { id: 't-civ-1', name: 'E. Mora',        role: 'Civil Tech',  shift: '7x7', avatar: 'EM' },
  ],
  LUB: [
    { id: 't-lub-1', name: 'O. Salinas',     role: 'Lube Tech',   shift: '14x14',avatar: 'OS' },
  ],
};

// Scheduled WO tiles placed on the grid. Each tile is {wo, day, techId, start, end, status}
// status: 'assigned' | 'in-progress' | 'done' | 'needs-review'
const SCHEDULED = [
  // Mechanical row
  { id: 's1', wo: 'WO-24871', title: 'SAG Mill 01 — liner inspection',     priority: 'P1', hh: 12, crew: 3, techId: 't-mec-1', day: 'mon', start: '08:00', end: '20:00', status: 'in-progress', specialty: 'MEC' },
  { id: 's2', wo: 'WO-24904', title: 'Conv. CV-103 — pulley alignment',    priority: 'P2', hh: 6,  crew: 2, techId: 't-mec-1', day: 'tue', start: '08:00', end: '14:00', status: 'assigned',   specialty: 'MEC' },
  { id: 's3', wo: 'WO-24912', title: 'Pump P-205 — mechanical seal',        priority: 'P2', hh: 8,  crew: 2, techId: 't-mec-2', day: 'mon', start: '09:00', end: '17:00', status: 'assigned',   specialty: 'MEC' },
  { id: 's4', wo: 'WO-24918', title: 'Ball Mill 02 — trunnion grease',     priority: 'P3', hh: 4,  crew: 1, techId: 't-mec-2', day: 'tue', start: '13:00', end: '17:00', status: 'assigned',   specialty: 'MEC' },
  // The expanded one — Wednesday, J. Pizarro
  { id: 's5', wo: 'WO-24877', title: 'Crusher HP-800 — cone change-out', priority: 'P1', hh: 16, crew: 4, techId: 't-mec-3', day: 'wed', start: '07:00', end: '19:00', status: 'in-progress', specialty: 'MEC', expanded: true,
    ops: [
      { op: '0010', text: 'Lock-out / tag-out + safety perimeter',        specialty: 'MEC',  hh: 1.5, qty: 2 },
      { op: '0020', text: 'Hydraulic cone lift + rigging',                specialty: 'MEC',  hh: 4,   qty: 3 },
      { op: '0030', text: 'Electrical disconnect of drive cabinet',       specialty: 'ELEC', hh: 1,   qty: 1 },
      { op: '0040', text: 'Instrumentation recalibration + startup',     specialty: 'INST', hh: 2.5, qty: 1 },
    ],
  },
  { id: 's6', wo: 'WO-24925', title: 'Thickener rake drive bearing',      priority: 'P2', hh: 8,  crew: 2, techId: 't-mec-3', day: 'thu', start: '09:00', end: '17:00', status: 'assigned', specialty: 'MEC' },
  { id: 's7', wo: 'WO-24902', title: 'Stockpile feeder belt retension',   priority: 'P3', hh: 5,  crew: 2, techId: 't-mec-4', day: 'wed', start: '08:00', end: '13:00', status: 'assigned', specialty: 'MEC' },
  { id: 's8', wo: 'WO-24931', title: 'Flotation cell 05 — impeller swap', priority: 'P2', hh: 10, crew: 3, techId: 't-mec-4', day: 'fri', start: '08:00', end: '18:00', status: 'assigned', specialty: 'MEC' },

  // Electrical
  { id: 's9',  wo: 'WO-24880', title: 'MCC-04 — thermographic survey',     priority: 'P2', hh: 5,  crew: 2, techId: 't-ele-1', day: 'mon', start: '10:00', end: '15:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's10', wo: 'WO-24891', title: 'Sub-station SE-12 — relay test',    priority: 'P1', hh: 7,  crew: 2, techId: 't-ele-1', day: 'wed', start: '08:00', end: '15:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's11', wo: 'WO-24908', title: 'VFD CV-103 — firmware upgrade',     priority: 'P3', hh: 4,  crew: 1, techId: 't-ele-2', day: 'tue', start: '09:00', end: '13:00', status: 'assigned', specialty: 'ELEC' },
  { id: 's12', wo: 'WO-24929', title: 'Motor M-401 — insulation test',     priority: 'P3', hh: 3,  crew: 1, techId: 't-ele-3', day: 'thu', start: '14:00', end: '17:00', status: 'assigned', specialty: 'ELEC' },

  // Instrumentation
  { id: 's13', wo: 'WO-24895', title: 'Flow transmitter FT-210 — cal.',    priority: 'P2', hh: 4,  crew: 1, techId: 't-ins-1', day: 'tue', start: '08:30', end: '12:30', status: 'assigned', specialty: 'INST' },
  { id: 's14', wo: 'WO-24919', title: 'SAG PI loop tuning',                priority: 'P3', hh: 6,  crew: 2, techId: 't-ins-2', day: 'thu', start: '09:00', end: '15:00', status: 'assigned', specialty: 'INST' },

  // Civil
  { id: 's15', wo: 'WO-24867', title: 'Tailings line — anchor repair',     priority: 'P2', hh: 8,  crew: 3, techId: 't-civ-1', day: 'wed', start: '08:00', end: '16:00', status: 'assigned', specialty: 'CIV' },

  // Lubrication
  { id: 's16', wo: 'WO-24884', title: 'Weekly lube route — Concentrator',  priority: 'P3', hh: 6,  crew: 1, techId: 't-lub-1', day: 'mon', start: '08:00', end: '14:00', status: 'done', specialty: 'LUB' },
  { id: 's17', wo: 'WO-24915', title: 'Lube route — Crushing area',        priority: 'P3', hh: 5,  crew: 1, techId: 't-lub-1', day: 'thu', start: '09:00', end: '14:00', status: 'assigned', specialty: 'LUB' },
];

// Unscheduled backlog (left rail)
const UNSCHEDULED = [
  { id: 'u1', wo: 'WO-24940', title: 'SAG discharge chute — wear plate',  equip: 'SAG-01',   tag: 'MEC-3201-CHT', priority: 'P1', hh: 14, crew: 4, impact: 92, specialty: 'MEC',  aiNote: 'High impact · recurrent failure' },
  { id: 'u2', wo: 'WO-24941', title: 'HV breaker 13.8kV — overhaul',       equip: 'SE-08-BRK', tag: 'ELE-1108-BRK', priority: 'P1', hh: 10, crew: 2, impact: 88, specialty: 'ELEC', aiNote: 'Protection scheme review pending' },
  { id: 'u3', wo: 'WO-24942', title: 'Conveyor CV-207 — return roller set', equip: 'CV-207',   tag: 'MEC-2207-RLR', priority: 'P2', hh: 8,  crew: 2, impact: 74, specialty: 'MEC', dragging: true, },
  { id: 'u4', wo: 'WO-24943', title: 'Flotation pH sensor — replacement',   equip: 'FLT-05',   tag: 'INS-4505-PH',  priority: 'P2', hh: 3,  crew: 1, impact: 68, specialty: 'INST' },
  { id: 'u5', wo: 'WO-24944', title: 'Thickener underflow pump — seal',     equip: 'P-308',    tag: 'MEC-3308-SEA', priority: 'P2', hh: 6,  crew: 2, impact: 71, specialty: 'MEC' },
  { id: 'u6', wo: 'WO-24945', title: 'Substation SE-02 — IR scan',          equip: 'SE-02',    tag: 'ELE-1102-IR',  priority: 'P3', hh: 4,  crew: 1, impact: 55, specialty: 'ELEC' },
  { id: 'u7', wo: 'WO-24946', title: 'Screen 03 — deck panel replacement',  equip: 'SCR-03',   tag: 'MEC-2303-PNL', priority: 'P3', hh: 5,  crew: 2, impact: 52, specialty: 'MEC' },
  { id: 'u8', wo: 'WO-24947', title: 'Weigh feeder calibration',            equip: 'WF-11',    tag: 'INS-4211-CAL', priority: 'P3', hh: 2,  crew: 1, impact: 41, specialty: 'INST' },
  { id: 'u9', wo: 'WO-24948', title: 'Tank T-402 — ultrasonic thickness',   equip: 'T-402',    tag: 'CIV-5402-UTT', priority: 'P4', hh: 3,  crew: 1, impact: 28, specialty: 'CIV' },
];

// Materials readiness for scheduled WOs (right rail). Keyed by wo code.
const MATERIALS = [
  { wo: 'WO-24877', title: 'Crusher HP-800 cone change-out', status: 'ready',   reservation: 'RES-778214', items: '12 / 12', note: 'Cone liner + rigging kit staged at warehouse gate 3' },
  { wo: 'WO-24871', title: 'SAG Mill 01 liner inspection',   status: 'ready',   reservation: 'RES-778180', items: '5 / 5',   note: 'Boroscope kit checked out to RG' },
  { wo: 'WO-24891', title: 'SE-12 relay test',               status: 'ready',   reservation: 'RES-778225', items: '3 / 3',   note: 'Omicron set in calibration lab' },
  { wo: 'WO-24931', title: 'Flotation cell 05 impeller',     status: 'partial', reservation: 'RES-778241', items: '7 / 9',   note: '2 gaskets missing — ETA Thu 04' },
  { wo: 'WO-24925', title: 'Thickener rake bearing',         status: 'partial', reservation: 'RES-778198', items: '4 / 6',   note: 'SKF 23248 ETA Wed 02 · 14:00' },
  { wo: 'WO-24867', title: 'Tailings line anchor repair',    status: 'blocked', reservation: 'RES-778155', items: '1 / 5',   note: 'Anchor bolts M42 — supplier delay, escalated' },
];

// Floating taskbar: minimized open WOs
const MINIMIZED = [
  { wo: 'WO-24877', title: 'Crusher HP-800 cone change-out', priority: 'P1', unread: 3 },
  { wo: 'WO-24940', title: 'SAG discharge chute — wear plate', priority: 'P1', unread: 0 },
  { wo: 'WO-24925', title: 'Thickener rake bearing',          priority: 'P2', unread: 1 },
  { wo: 'WO-24867', title: 'Tailings line anchor repair',     priority: 'P2', unread: 0, flagged: true },
];

Object.assign(window, {
  DAYS, WORK_CENTERS, CAPACITY, TECHS, SCHEDULED, UNSCHEDULED, MATERIALS, MINIMIZED,
});
