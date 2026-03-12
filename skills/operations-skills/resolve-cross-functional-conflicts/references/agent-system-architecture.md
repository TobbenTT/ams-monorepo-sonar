# Agent System Architecture Reference
## VSC Operational Readiness - Multi-Agent System Design

**Source Documents:**
- `docs/architecture/_legacy/multi-agent-architecture.md`
- `agents/*/skills.yaml` (per-agent skill assignments) (Sections 4, 5)
- `agents/orchestrator/CLAUDE.md`
- `agents/operations/CLAUDE.md`
- `agents/asset-management/CLAUDE.md`
- `agents/hse/CLAUDE.md`
- `agents/contracts-compliance/CLAUDE.md`
- `agents/execution/CLAUDE.md`

**Applicable Skills:**
- orchestrate-or-program
- create-agent-specification (general/)
- sync-memory-agents (general/)
- All skills (understanding system context)

---

## Table of Contents

| Section | Topic |
|---------|-------|
| 1 | System Overview (v2.0 Consolidated) |
| 2 | Agent Roles & Skill Groups |
| 3 | Communication Patterns |
| 4 | Engineering Principles |
| 5 | Memory & State Persistence |

---

## 1. System Overview (v2.0 Consolidated)

### Architecture: 6 Entities (1 Orchestrator + 5 Domain Agents)
- Previous v1.0: 15 agents → 91 Metcalfe connections → 46.3% reliability
- Current v2.0: 6 entities → 10 connections → 73.5% reliability (+59% improvement)

### Technology
- **Lead Model**: Claude Opus 4.6 (Orchestrator)
- **Teammate Model**: Claude Sonnet 4.5 (Domain agents)
- **Communication**: Shared Task List + Inbox messaging (Agent Teams)
- **Context**: ~200K tokens per agent window

---

## 2. Agent Roles & Skill Groups

| Agent | Role | Skill Groups | Model |
|-------|------|-------------|-------|
| **Orchestrator** | Team Lead + Governance + DocControl + Comms | orchestration, governance, document_management, communications | Opus 4.6 |
| **Operations** | SOPs, Operating Model, Ramp-up, Workforce, Training | operations, workforce, culture_hris | Sonnet 4.5 |
| **Asset Management** | RCM, FMECA, PM, Spare Parts, SAP, Turnarounds | maintenance_strategy, work_management, sap_implementation, spare_parts_inventory, turnaround | Sonnet 4.5 |
| **HSE** | Safety, Environment, HAZOP, PSM, Permits | process_safety, environmental, permits_safety_environmental | Sonnet 4.5 |
| **Contracts & Compliance** | Procurement, Legal, T&C, Regulatory Permits | procurement, legal_compliance, permits_regulatory | Sonnet 4.5 |
| **Execution** | Project Mgmt, Controls, Finance, Construction, Commissioning | project_management, project_controls, finance, construction, commissioning | Sonnet 4.5 |

---

## 3. Communication Patterns

| Pattern | % | Description |
|---------|---|-------------|
| Draft-and-Review | 60% | Agent generates draft, requests peer review |
| Request-Response | 25% | Async request via Shared Task List |
| Human Escalation | 10% | RFI to consultant for missing info |
| Quality Gate | 5% | Automated validation checkpoint |

---

## 4. Engineering Principles (12)

1. Reduce human's job to one action (define intent)
2. Separate Memory, Compute, Interface
3. Treat Prompts like APIs
4. Build trust mechanisms (audit trails)
5. Default to safe behavior (RFIs over assumptions)
6. Make output small and actionable
7. Use next action as unit of execution
8. Prefer routing over organizing
9. Keep categories and fields small
10. Design for restart (state persistence)
11. Build core loop, then modules
12. Optimize for maintainability over cleverness

---

## 5. Memory & State Persistence

### State File Location
`clients/{client}/projects/{project}/state/agent-states/{agent}-state.md`

### State File Updated At
- End of every work session
- After each deliverable completion
- When blockers are identified

### Memory Promotion Flow
Session Memory → Project Memory → Cross-Project Methodology

---

## Changelog
### v1.0 (February 2026)
- Initial agent system architecture reference
