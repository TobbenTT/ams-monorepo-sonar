# Knowledge Management & Second Brain Reference
## VSC Operational Readiness - Knowledge Capture, Classification & Delivery

**Source Documents:**
- `docs/architecture/_legacy/knowledge-base.md` (Chapters 16, 18)
- `docs/architecture/_legacy/multi-agent-architecture.md` (Section 14)
- `agents/*/skills.yaml` (per-agent skill assignments) (Sections 2, 11)

**Applicable Skills:**
- capture-and-classify-knowledge
- curate-knowledge-flow
- deliver-contextual-knowledge
- maintain-knowledge-currency
- generate-daily-nudge
- generate-lessons-learned
- build-second-brain (general/)
- capture-expert-knowledge (general/)
- capture-knowledge-artifact (general/)
- sync-memory-agents (general/)
- track-document-currency
- research-deep-topic

---

## Table of Contents

| Section | Topic |
|---------|-------|
| 1 | The Knowledge Problem |
| 2 | AI-Powered Knowledge Loop |
| 3 | Eight Building Blocks |
| 4 | Knowledge Types for OR |
| 5 | Agent Memory Mechanisms |
| 6 | Memory Lifecycle |
| 7 | Memory Anti-Patterns |
| 8 | Second Brain Architecture |

---

## 1. The Knowledge Problem

Based on industry research:
- Human brains evolved for thinking, not storage
- Knowledge workers waste 1.8 hours/day searching for information (IDC)
- Traditional note-taking fails because it demands cognitive labor at inconvenient moments
- OR projects generate massive amounts of information that must be organized, accessible, and actionable
- Knowledge from Project A must be available for Project B without starting from zero

---

## 2. AI-Powered Knowledge Loop

VSC implements the Active AI Loop adapted for OR:

1. **Capture** (5-second frictionless input): Via Slack channel or Windsurf
2. **Classification** (AI auto-categorizes): By domain (Operations, Maintenance, HR, HSE, etc.) and project
3. **Routing** (directed to correct location): To correct project folder and agent memory
4. **Extraction** (relevant details parsed): Key data points extracted and structured
5. **Structuring** (written into databases): Stored in Notion databases and GitHub repo
6. **Nudging** (daily prompts): OR-PMO generates daily status with pending items

---

## 3. Eight Building Blocks

| Block | Name | Function | Implementation |
|-------|------|----------|----------------|
| 1 | The Dropbox | Single capture point | Slack channel "SBinbox" |
| 2 | The Sorter | AI classification | Claude classifies by domain, project, urgency |
| 3 | The Form | Standardized schema | Template per knowledge type |
| 4 | The Filing Cabinet | Persistent storage | GitHub repo + Notion databases |
| 5 | The Receipt | Audit trail | Log of every capture and action |
| 6 | The Bouncer | Confidence filter | Low confidence items flagged for human review |
| 7 | The Tap on the Shoulder | Daily nudges | Slack notifications from OR-PMO |
| 8 | The Fix Button | Correction mechanism | Simple way to fix misclassifications |

---

## 4. Knowledge Types for OR

| Knowledge Type | Source | Storage Location | Used By |
|----------------|--------|-----------------|---------|
| Project Technical Data | Client documents | `input/` folder | All technical agents |
| Methodology | VSC playbook, standards | `methodology/` | All agents |
| Client Context | Meetings, emails, RFIs | `clients/{client}/` | All project agents |
| Lessons Learned | Post-session reviews | `memories/` | Future projects |
| Agent Decisions | Agent state files | `state/` | Same agent, OR-PMO |
| Industry Benchmarks | Research, publications | `methodology/standards/` | Analysis agents |

---

## 5. Agent Memory Mechanisms

### 5.1 Auto-Memory (Claude Code Native)
- Records learnings automatically in `~/.claude/projects/{project}/memory/`
- First 200 lines of MEMORY.md loaded at session start
- Complemented with domain-specific memory files

### 5.2 Agent State Files
Each agent maintains `state/agent-states/{agent}-state.md`:

```markdown
# Agent State: [Agent Name]
## Session: [N] | Date: [YYYY-MM-DD]

### Completed
- [x] [Task description]

### In Progress
- [ ] [Task description with progress %]

### Blockers
- [Blocker description with RFI reference if applicable]

### Metrics
Completion: [%] | Deliverables: [N/Total] | RFIs: [N] pending

### Learnings
- [Key insight from this session]
```

### 5.3 Cross-Project Memory
Generic learnings stored in `methodology/lessons-learned/`:

```markdown
# Lesson: [Title]
## Context: [Project Name], [Date]
## Learning: [What was learned]
## Applicable To: [Which types of projects/situations]
```

---

## 6. Memory Lifecycle

1. **Session Start**: Agent loads CLAUDE.md + own state file + project context
2. **During Session**: Agent records decisions and progress in working memory
3. **Session End**: Agent updates state file with completions, blockers, learnings
4. **Cross-Session**: OR-PMO synthesizes learnings across agents
5. **Cross-Project**: Generic learnings promoted to `methodology/` folder

---

## 7. Memory Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Memory Bloat | State file grows too large | Archive completed items, keep active state lean |
| Stale Memory | Outdated info misleads agent | Date-stamp all entries, purge periodically |
| Contradictory Memory | Conflicting learnings | OR-PMO resolves conflicts, marks definitive version |
| Missing Memory | Agent restarts without context | Always check for state file before beginning work |

---

## 8. Second Brain Architecture

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Capture | Slack (private channel) | Frictionless input point |
| Intelligence | Claude (classification + extraction) | AI processing |
| Automation | Zapier/n8n (workflow orchestration) | Routing and triggers |
| Storage | GitHub (vsc-or-brain) + Notion | Persistent memory |
| Interface | Windsurf + Slack notifications | Human interaction |

### Repository Knowledge Structure
```
vsc-or-brain/
    methodology/          ← GENERIC KNOWLEDGE (all projects)
    agents/               ← AGENT KNOWLEDGE (configs + memories)
    clients/{client}/projects/{project}/
        input/            ← PROJECT-SPECIFIC DATA
        output/           ← GENERATED DELIVERABLES
        state/            ← AGENT STATES
        memory/           ← SESSION MEMORIES
        intent-specs/     ← SPECIFICATIONS
```

---

## Changelog
### v1.0 (February 2026)
- Initial knowledge management reference
- Compiled from Knowledge Base v2.0, Architecture v2, Mapa Estrategico v2
