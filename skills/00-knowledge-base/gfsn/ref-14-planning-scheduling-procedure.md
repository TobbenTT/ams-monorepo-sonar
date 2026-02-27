# REF-14: Planning & Scheduling Procedure — GFSN01-DD-EM-0000-PT-00006

## Source: Procedimiento para la Planificación y Programación del Mantenimiento (34 pages)

---

## 1. Process Overview

The planning & scheduling cycle follows a **weekly cadence** with 6 stages:

```
1. PRIORITIZATION → Risk matrix (Equipment Criticality × Consequence)
   ↓
2. PLANNING → Identify resources (workforce, materials, tools, support tasks)
   ↓
3. SCHEDULING → Weekly pre-program → Scheduling meeting → Final program
   ↓
4. EXECUTION → Work package distribution → Daily progress feedback
   ↓
5. CLOSURE → SAP notification (IW41/IW44) → Material returns
   ↓
6. KPI ANALYSIS → Weekly indicators → Continuous improvement
```

---

## 2. Work Sources (Two Input Streams)

### 2.1 Preventive/Predictive (Before Failure)
- Generated from **Plan Matriz de Mantenimiento** (Master Maintenance Plan) in SAP
- Arrive as work orders in SAP-PM with status "Liberado" (Released)
- Planners validate and release for execution
- Key SAP transactions: IW38, IW49N, IP24, IP19

### 2.2 Corrective (After Failure)
- Generated via **Avisos de mantenimiento** (Maintenance Notifications) in SAP-PM
- Originated by operations, maintenance, projects, HSE, etc.
- Flow: MEAB (Open) → METR (In Treatment) → ORAS (WO Created) → MECE (Closed)
- Key SAP transactions: IW21, IW22, IW23, IW28

---

## 3. Priority Matrix

**Axes:** Equipment Criticality (rows) × Maximum Consequence if not addressed (columns)

**Risk Levels:**
| Level | Action | Timeline | Managed By |
|-------|--------|----------|------------|
| **Alto (High)** | Immediate execution | Now | Execution Supervisor |
| **Moderado (Medium)** | Execute within 2 weeks | <14 days | Planner |
| **Bajo (Low)** | Can wait >2 weeks | >14 days | Planner |

**Important:** Priority matrix MUST be configured in SAP-PM so the identifier (originator) can do initial assessment, confirmed by the approver (maintenance).

---

## 4. Planning Phase

### 4.1 Minimum Planning Requirements
For each work order, the planner must define:
- **Work specialties** (mechanical, electrical, instrumentation, etc.)
- **Duration per operation** + number of workers
- **Materials** with required quantities
- **Pre-execution activities:** electrical/mechanical lockout (LOTO), scaffolding erection, guard removal, material preparation
- **Post-execution activities:** housekeeping, commissioning support, scaffold dismantling

### 4.2 Material & Service Procurement
- Prioritize imported spare parts orders well in advance
- Confirm specialized services/consultancies
- Coordinate with SAP-MM for purchase requisitions (SolPed)

### 4.3 Cross-Functional Communication Matrix
| Partner Area | Planning Responsibilities |
|-------------|--------------------------|
| **Materials & Services (MM)** | Spare parts valuation, delivery tracking, material alternatives, contract bidding |
| **Execution** | Available internal/external resources, WO execution feedback for plan improvement |
| **Reliability Engineering** | Maintenance strategy definition, up-to-date technical information |
| **Operations** | Equipment availability coordination, activity priority confirmation |

### 4.4 SAP Work Order Status Flow
```
PLN → Planning in progress
FMA → Waiting for materials
LPE → Planning complete, ready to execute
LIB → Released for execution
IMPR → Printed
NOTP → Partially notified
NOTI → Fully notified
CTEC → Technically closed
```

---

## 5. Scheduling Phase

### 5.1 Weekly Pre-Program
- Based on: priority, spare parts availability, man-hour capacity per work center
- Includes: dates, hours, sequence, work groups
- Must consider: multi-crew work on same equipment/area (avoid interference), external contractor availability, support equipment (cranes, manlifts, etc.)
- Includes overdue orders (status LIB or NOTP with past dates)
- Pre-program prepared in **Excel templates** for review

### 5.2 Weekly Scheduling Meeting (60 min)
| # | Activity | Responsible | Time |
|---|----------|-------------|------|
| 1 | Safety moment | HSE | 5 min |
| 2 | Previous week KPI presentation | Scheduler | 15 min |
| 3 | Preliminary weekly program | Scheduler | 15 min |
| 4 | Program validation + additional operational requests | All | 10 min |
| 5 | Comments & miscellaneous | All | 15 min |

**Key considerations:** Safety/Environment, Cost, Budget, Resource limitations, Production requirements

### 5.3 Weekly Cycle Timeline
```
Monday:    Weekly scheduling meeting
Tuesday:   Program adjustments & resource leveling
Wednesday: Send final program for next week
Thursday:  Start next week's program
...
Sunday:    End current week's program
```

### 5.4 Program Finalization
- In SAP: set orders to status "PLAN" + populate review field
- Review field format: `[Plant][Type][Year][Week]` (e.g., SNR21S01 = Salares Norte, Routine, 2021, Week 01)
- SAP transaction CM25 for capacity adjustment and resource leveling

### 5.5 Work Package Creation
Each work package must contain:
- Work permit
- Energy isolation certificate (LOTO)
- Material withdrawal request (if applicable)
- Checklists (scaffolding, heights, confined spaces, etc.)
- Job risk analysis (ATS/ART)
- Activity execution procedure
- Work order

---

## 6. Execution Phase

- Execute per approved weekly program + high-priority emergent work
- Daily progress feedback to scheduler
- Notify scheduler if any activity needs rescheduling
- Safety aspects verified before each activity

---

## 7. Closure Phase (SAP Notification)

### 7.1 Minimum Notification Requirements
- Actual start and end dates
- Actual duration and man-hours
- Execution comments must describe:
  - **Pre-condition:** How was the equipment found?
  - **Activities:** What was done? (with detail)
  - **Post-condition:** How was the equipment returned?
- SAP transactions: IW41 (individual), IW44 (mass notification)
- Return unused materials to warehouse

---

## 8. KPI Framework (11 Indicators)

| # | Indicator | Formula | Target |
|---|-----------|---------|--------|
| 1 | **WO Completion** | Completed WOs / Scheduled WOs × 100 | ≥90% |
| 2 | **Man-hour Compliance** | Actual hours / Planned hours × 100 | 85-115% |
| 3 | **PM Plan Compliance** | Completed PM WOs / Scheduled PM WOs × 100 | ≥95% |
| 4 | **Backlog (weeks)** | Open WO hours / Weekly capacity | ≤4 weeks |
| 5 | **Reactive Work** | Emergency WOs / Total WOs × 100 | ≤20% |
| 6 | **Schedule Adherence** | WOs executed per schedule / Total scheduled × 100 | ≥85% |
| 7 | **Release Horizon** | Average days between WO creation and release | ≤7 days |
| 8 | **Pending Notices** | Open notices / Total notices × 100 | ≤15% |
| 9 | **Scheduled Capacity** | Scheduled hours / Available hours × 100 | 80-95% |
| 10 | **Proactive Work** | PM+PdM WOs / Total WOs × 100 | ≥70% |
| 11 | **Planning Efficiency** | Planned hours accuracy (actual vs planned) | ±15% |

---

## 9. Roles & Responsibilities

### 9.1 IRM — Requirements Identifier (Operations/Maintenance)
- Create maintenance notifications in SAP-PM with sufficient detail
- Set preliminary execution dates and responsible groups
- Preliminary priority assessment

### 9.2 CON — Reliability (Confiabilidad)
- Create PM/PdM maintenance plans (maintenance strategy owner)
- Create notifications from RCA recommendations / bad actor analysis
- Train identifiers on reliability data capture (failure codes, causes)
- Audit notification quality in SAP-PM

### 9.3 ARQ — Requirements Approver
- Validate and approve notifications (MEAB → METR)
- Check for duplicates
- Confirm priority assessment

### 9.4 PLN — Planners
- Plan all work (resources, materials, tools, support activities)
- Manage preventive plan WOs from SAP
- Track materials with 1-2 year horizon
- Update maintenance plans based on reliability feedback
- Create purchase requisitions (SolPed) in SAP
- Budget projection and control

### 9.5 SMA — Execution Supervisor
- Review preliminary program by area/work center
- Confirm support equipment
- Safety risk assessment approval
- Work quality control

### 9.6 MAN — Maintainers
- Prepare materials, tools, work permits
- Execute maintenance tasks per procedures
- Notify work orders in SAP with quality feedback

### 9.7 JOP — Operations
- Participate in weekly scheduling meeting
- Validate program against production plan
- Provide equipment for maintenance (LOTO, cleaning, handover)

---

## 10. SAP-PM Standard Flows (Annexes)

### 10.1 Preventive WO Flow
```
Maintenance Plan → Auto-generate WO → Planner validates →
Release (LIB) → Schedule → Execute → Notify → Technical close (CTEC)
```

### 10.2 Corrective WO Flow
```
Notification (MEAB) → Approve (METR) → Create WO (ORAS) →
Plan → Release (LIB) → Schedule → Execute → Notify → Close notification (MECE)
```
