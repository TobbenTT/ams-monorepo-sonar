# REF-11: Neuro-Arquitectura Review — Integrated Design Principles for OCP MVP

## Source: Neuro-Arquitectura Organizacional (SRC-55) + All Project Learnings
## Date: 2026-02-20

---

## 1. EXECUTIVE SUMMARY

The Neuro-Arquitectura document provides the **behavioral science foundation** for our OCP MVP. After cross-referencing with GECAMIN competitive intelligence, ISO 55002 requirements, client pain points, and our technical architecture, this review translates the document's 15 academic principles into **concrete implementation specifications** for each of our 4 modules.

**Core thesis**: Enterprise maintenance software fails not because of technical inadequacy, but because of **cognitive-social fractures** in the organizations that use it. Our software must be a "cognitive prosthesis" — designed to align with human biology, not just database schemas.

**GECAMIN validation**: Carlo Lobiano's SOMA implementation at Codelco confirms that change management (a core Neuro-Architecture concern) is the #1 challenge in maintenance system adoption. Patricio Ortiz's principle — "enhance specialists, don't replace them" — is the behavioral north star.

---

## 2. THE 6 PILLARS — MAPPED TO OUR MODULES

### Pillar 1: Shared Mental Models (SMM)

**Science**: Teams with aligned mental models achieve "implicit coordination" — acting in synchrony without verbal negotiation. In mining maintenance, engineers see systems through thermodynamic flows while maintenance managers see them through spare parts availability. This creates "communication noise" and operational errors.

**OCP Pain Point Addressed**: Heterogeneous workflows across 15 plants = 15 different mental models of "how maintenance works."

| Module | SMM Implementation | Specification |
|--------|-------------------|---------------|
| **M1: Field Capture** | Standardized input structure | Force consistent mental model: Equipment TAG → Failure Mode → Priority → Parts. Same structure across all 15 plants. |
| **M2: Planner Assistant** | Holistic context view | Show planner the FULL context: equipment hierarchy position, work history, available parts, workforce, shutdown schedule — all in ONE view. Eliminates "cognitive search" overhead. |
| **M3: Backlog Optimization** | Interdependency visualization | Don't show flat task lists. Show how each backlog item connects to equipment criticality, shutdown windows, and resource availability. Visualize the "puzzle" each task fits into. |
| **M4: Strategy Development** | RCM decision tree as shared framework | The 16-path RCM decision tree IS a shared mental model. When all engineers follow the same Hidden/Evident → CBM/FT/RTF/FFI/Redesign logic, strategies become consistent across plants. |

**Anti-Pattern to Avoid**: Flat task lists with no context (the current state at OCP — unstructured emails with no standardization).

---

### Pillar 2: Transactive Memory Systems (TMS)

**Science**: No single person can know everything. TMS maps "who knows what" — reducing cognitive load by routing questions to the right expert. In temporary project teams, this normally takes years to develop. Software can accelerate it.

**OCP Pain Point Addressed**: Reliance on tribal knowledge = undocumented TMS that breaks when people leave.

| Module | TMS Implementation | Specification |
|--------|-------------------|---------------|
| **M1: Field Capture** | Expert Cards on equipment | When a technician selects equipment, show who the designated expert is (maintenance engineer, reliability engineer). "Tarjeta de Experto" pattern. |
| **M2: Planner Assistant** | Resolution history visibility | When AI recommends resources, show who previously worked on similar tasks. Link expertise to track record. |
| **M3: Backlog Optimization** | Skill-based assignment | When grouping work packages, surface which labour specialties are available and who has experience with each equipment type. |
| **M4: Strategy Development** | Expert review attribution | When an engineer approves an FMEA or strategy decision, their name and expertise are linked to the record. Builds visible knowledge map over time. |

**Design Rule**: Transform user directory from administrative list → **living map of cognitive assets**. Every task assignment and problem resolution enriches the knowledge network.

---

### Pillar 3: Self-Determination Theory (SDT)

**Science**: Sustainable motivation comes from three innate needs: **Autonomy** (feeling in control), **Competence** (feeling effective), **Relatedness** (feeling connected to a larger purpose).

**OCP Pain Point Addressed**: 50% priority misclassification = technicians who don't feel competent or empowered in the current system.

| Need | Implementation | Anti-Pattern |
|------|---------------|-------------|
| **Autonomy** | Allow planners to customize dashboard views, choose task execution order, configure notification preferences. Use "bounded choice" — AI suggests but user decides. | Rigid wizard flows that force a single path. Auto-submit without human approval. |
| **Competence** | Immediate feedback on every action (inline validation, confidence scores). When a technician submits a field capture, show them how their input was structured — make the AI transparent. | Slow systems with delayed feedback. Cryptic error messages. |
| **Relatedness** | Show how individual work requests contribute to plant availability KPIs. "Your work package contributed to 3% availability improvement this month." | Isolated task views disconnected from plant performance. |

**GECAMIN Validation**: O4R (Operate for Reliability) at BHP uses this exact framework — awareness → monitoring → feedback → training — to motivate operators toward reliable equipment operation.

---

### Pillar 4: Cognitive Load Theory (CLT)

**Science**: Working memory processes 5-9 items simultaneously. Mining maintenance dashboards typically show 50+ metrics, inducing cognitive overload → errors, tunnel vision, fatigue.

**OCP Pain Point Addressed**: Planners spend 30-45 minutes per work request because they must mentally juggle information from multiple SAP screens.

| Load Type | Problem | Solution in Our MVP |
|-----------|---------|-------------------|
| **Intrinsic** (task difficulty) | RCM decisions are complex by nature | Our RCM Decision Engine automates the 16-path tree — reduces cognitive load to approve/reject |
| **Extraneous** (UI friction) | Navigating between SAP screens, spreadsheets, emails | Single-view Planner Assistant that consolidates ALL context in one screen |
| **Germane** (learning) | Understanding failure patterns and strategies | Progressive disclosure: 5 categories → expandable detail → full FMEA view |

**Key Design Rules**:
1. **Chunking**: Maximum 5 top-level categories in any dashboard view
2. **Progressive Disclosure**: Start with summary, expand on demand — never show everything at once
3. **Visual Hierarchy**: Size, color, position guide the eye to the most critical decision point
4. **"If everything is urgent, nothing is urgent"**: Never make the entire screen red/bold

---

### Pillar 5: Psychological Safety

**Science**: Amy Edmondson's research proves psychological safety is the #1 predictor of team performance. Traditional enterprise software acts as "blame machines" — recording every error and presenting accusatory failure messages. This induces "impression management" — users hide errors and delay negative reports.

**OCP Pain Point Addressed**: 50% priority misclassification may partly be driven by fear — technicians default to "Priority 1" because downgrading seems risky.

| Principle | Implementation in Our MVP |
|-----------|--------------------------|
| **Non-punitive language** | "Oportunidad de Aprendizaje" not "Incumplimiento." "Hallazgo Operativo" not "Error." |
| **Universal Undo + Draft Mode** | Every AI output enters as DRAFT. Every human input can be modified. No permanent mistakes until explicit approval. |
| **Ipsative feedback** | Compare planner to their OWN past performance, never to peers. "You improved task completion rate by 10% this week." |
| **Anonymous near-miss reporting** | Allow confidential error/near-miss reports with identity protected by design. |
| **Constructive error messages** | Pattern: What happened + Why it happened + How to fix it. Never "Error 500." |

**GECAMIN Validation**: SOMA implementation at Codelco showed that change management resistance is the primary challenge. Our Neuro-Architecture directly addresses this through psychological safety design.

---

### Pillar 6: Behavioral Nudges

**Science**: Nudges are subtle design interventions that guide behavior without restricting choice. More effective than coercion for sustained adoption.

| Nudge | Implementation | Module |
|-------|---------------|--------|
| **Smart Defaults** | Pre-fill forms with AI suggestions. Technicians can override but start from intelligent baseline. | M1, M2 |
| **Completion Progress** | "Asset Data Profile: 80% complete" — Zeigarnik effect motivates closing the gap. | M4 |
| **Social Proof** | "85% of planners have approved their packages this week" | M2, M3 |
| **Active Commitment** | "I accept this maintenance strategy" button (not passive assignment) | M4 |
| **Draft Mode** | Label new entries as "Draft — Only visible to you" until user publishes | All |
| **Error Reframing** | When validation fails, offer "Auto-fix" button or link to micro-guide | M4 |
| **Temporal Salience** | Subtle color shifts for approaching deadlines — no alarm fatigue | M3 |

---

## 3. BIAS MITIGATION — SPECIFIC TO OCP MVP

### 3.1 Hidden Profile Bias (Most Critical for OCP)

**Risk**: In multi-plant meetings, risks known only to one site's maintenance team get lost when dashboard aggregates data. A "green" KPI can hide a degrading trend at one plant.

**Solution in Our MVP**:
- **Variance Visualization**: Show outlier plants, not just averages
- **Dissent Channels**: Allow any user to "annotate" a green KPI with a "Caution Note"
- **Contextual Disaggregation**: Executive summary always shows per-plant breakdown beneath aggregate

### 3.2 Confirmation Bias

**Risk**: If a planner believes equipment is stable, they'll ignore weak failure signals.

**Solution in Our MVP**:
- **Devil's Advocate Digital**: When AI classifies priority as "Low," automatically show counter-evidence (recent failure trends, age-based risk)
- **Trend History**: Show the derivative (change rate) alongside the current state

### 3.3 Anchoring Bias

**Risk**: First information presented acts as anchor for subsequent judgments. Overly optimistic start screens hide degradation.

**Solution in Our MVP**:
- **Balanced Start Screen**: Lead with "Needs Attention" items alongside successes
- **No single metric on landing page**: Show balanced scorecard (availability + backlog + overdue + upcoming)

---

## 4. DATA STRUCTURE PRINCIPLES — FROM NEURO-ARCHITECTURE

### 4.1 Entity-Centered Design (Not Table-Centered)

Users update "Things" (Pump P-101), not "Tables" (SAP_MAINTENANCE_ITEM). When interacting with an asset, the user should see and edit ALL relevant data (specs, tasks, risks, documents) in a unified view.

**Our Implementation**:
- `PlantHierarchyNode` → unified entity that links to `Equipment`, `FailureMode`, `MaintenanceTask`, `WorkPackage`, `SAPUploadPackage`
- UI shows "Equipment Card" with all connected data, not separate table views

### 4.2 State-Based Progression

Every data object has a visible state: **Draft → Reviewed → Approved**. Users are motivated to "move" objects to the next state (completion bias).

**Our Implementation**:
- `StateMachine` with 6 entity workflows already implemented
- States: DRAFT → IN_REVIEW → APPROVED → EXPORTED (for SAP upload)

### 4.3 Micro-Task Disaggregation

Instead of "Update Monthly Report," generate specific micro-tasks: "Is the estimated date for Milestone X still valid?" Reduces activation energy, combats procrastination.

**Our Implementation**:
- Quality Validator generates specific, actionable micro-tasks: "Missing failure mechanism for FM-003," "Frequency not set for Task T-012"
- Each task is a focused, completable action — not a vague assignment

---

## 5. INTEGRATION WITH ISO 55002

The Neuro-Arquitectura principles directly address several ISO 55002 gaps identified in REF-09:

| ISO Gap | Neuro-Architecture Solution |
|---------|----------------------------|
| §4.2 Stakeholder Registry (GAP) | TMS "Expert Cards" create a living stakeholder map |
| §5.3 RASCI Matrix (PARTIAL) | Expert attribution in strategy approvals builds role clarity |
| §7.3 Awareness (GAP) | Progress bars, social proof nudges, and ipsative feedback build awareness organically |
| §7.4 Communication (PARTIAL) | Trilingual support + visual SMM reduces communication friction |
| §9.3 Management Review (GAP) | Balanced start screen with per-plant breakdown = mini management review |
| §10.4 Continuous Improvement (GAP) | Completion progress + micro-tasks + error reframing = PDCA in UX |

---

## 6. INTEGRATION WITH GECAMIN FINDINGS

| GECAMIN Finding | Neuro-Architecture Response |
|----------------|---------------------------|
| myRIAM has no UX differentiation | Our 15 evidence-based design principles are a **moat** |
| Patricio Ortiz: "Enhance specialists, not replace" | Maps directly to SDT Autonomy + Competence needs |
| SOMA at Codelco: change management is #1 challenge | Our psychological safety + nudge design directly mitigates this |
| SQM Asset Health Index: multi-variable visualization | CLT chunking + progressive disclosure ensures it doesn't overwhelm |
| O4R behavioral monitoring | Our nudge taxonomy provides the software-side framework for behavior change |

---

## 7. IMPLEMENTATION CHECKLIST — PER MODULE

### Module 1: Intelligent Field Capture
- [ ] Smart Default pre-fill for equipment TAG, failure mode, priority
- [ ] Immediate feedback: show structured output alongside raw input
- [ ] Expert Card: who is the designated equipment specialist
- [ ] Non-punitive language: "Your input will help improve plant availability"
- [ ] Draft mode: "Draft — visible only to you until you submit"

### Module 2: AI Planner Assistant
- [ ] Single-view consolidation: equipment + history + parts + workforce + schedule
- [ ] Ipsative feedback: "You planned 15% faster than your average this week"
- [ ] Social proof: "85% of planners have approved their packages"
- [ ] Devil's Advocate: counter-evidence for AI priority suggestions
- [ ] Bounded choice: AI recommends, planner adjusts and approves

### Module 3: Backlog Optimization
- [ ] 5-category chunking: by blocking reason, not flat list
- [ ] Progressive disclosure: summary → category → individual items
- [ ] Temporal salience: subtle color shifts for approaching deadlines
- [ ] Variance visualization: per-plant comparison, not just aggregate
- [ ] Interdependency visualization: show how tasks connect

### Module 4: Strategy Development
- [ ] RCM decision tree as visual shared mental model
- [ ] Completion progress bar: "Strategy Development: 72% complete"
- [ ] Active commitment: "I accept this maintenance strategy" button
- [ ] Error reframing: "3 validation findings detected → Auto-fix available"
- [ ] Expert attribution: link each approval to the responsible engineer

---

## 8. THE NORTH STAR QUOTE

> "El software empresarial no debe ser un mero repositorio pasivo de datos, sino una prótesis cognitiva activa diseñada para alinearse con la biología del comportamiento humano."

> "The software must evolve from being a control tool to being a cognitive and emotional support environment, fostering organizational 'flow' where technology amplifies, not obstructs, human collective intelligence."

This is our UX north star. Every design decision should be tested against it.

---

## CHANGELOG
| Date | Change | Author |
|------|--------|--------|
| 2026-02-20 | Initial Neuro-Architecture review with all learnings integrated | System |
