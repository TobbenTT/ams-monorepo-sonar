---
name: monitor-client-signals
description: "Monitor public signals from a client company during active projects and alert on material changes. Triggers: 'monitor client signals', 'client monitoring', 'signal monitoring'."
---

# Monitor Client Signals

## Skill ID: WI-002
## Version: 1.0.0
## Category: Web Intelligence
## Priority: Medium

## Purpose

Continuously monitor public information about a client company during an active OR project. Detect material changes that may affect the project (leadership transitions, M&A activity, HSE incidents, regulatory actions, financial events) and alert the project team. When significant signals are detected, recommend Intent Profile updates to keep agent behavior aligned with the evolving client reality.

## Intent & Specification

**Problem:** Client organizations change during the life of a project. A new CEO may shift priorities. An HSE incident may trigger regulatory scrutiny. An M&A announcement may change the project's strategic context. Without monitoring, the project team operates on stale assumptions, and the Intent Profile becomes outdated. This skill provides an early warning system for material changes.

**Success Criteria:**
- Monitoring scan completes within 15 minutes per cycle
- Material changes detected within 48 hours of public disclosure
- Signal classification covers all 5 alert categories
- Each alert includes impact assessment and recommended action
- False positive rate <20% (verified by consultant review)

**Constraints:**
- Public data only — same constraints as discover-company-intent
- No automated external communications — alerts go to consultant only
- Monitoring frequency configurable (daily/weekly/monthly)
- Must distinguish signal severity (routine vs. material vs. critical)

## Trigger / Invocation

**Command:**
`monitor-client-signals --company {name} --since {date}`

**Optional parameters:**
- `--keywords {kw1,kw2,...}` — additional monitoring keywords
- `--frequency {daily|weekly|monthly}` — scan frequency
- `--alert-threshold {routine|material|critical}` — minimum alert level

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Company name | User/Orchestrator | Yes | Company being monitored |
| Since date | User | Yes | Start date for monitoring window |
| Prior research | Session state | No | Previous company-intent-draft for baseline |
| Keywords | User | No | Additional keywords to monitor |
| Alert threshold | User | No | Minimum severity level for alerts (default: material) |

## Output Specification

**Primary Output: `signal-change-report.md`**

```markdown
# Client Signal Change Report — {Company Name}

**Period:** {from_date} to {to_date}
**Scan date:** {scan_date}
**Signals detected:** {count}

## Critical Signals
{If any — immediate attention required}

## Material Signals
{Signals that may affect project scope, timeline, or approach}

## Routine Signals
{Background information, no action required}

## Signal Detail

### Signal {N}: {Title}
- **Category:** {c-suite-change | hse-incident | m-and-a | regulatory-action | financial-event}
- **Severity:** {routine | material | critical}
- **Source:** {URL} (accessed {date})
- **Summary:** {description}
- **Potential project impact:** {assessment}
- **Recommended action:** {action}
- **Intent Profile update needed:** {yes/no — if yes, which fields}
```

## Alert Categories

| Category | Examples | Default Severity |
|----------|----------|-----------------|
| C-Suite Change | CEO/COO/CFO appointment or departure, board changes | Material |
| HSE Incident | Safety incident, environmental spill, regulatory fine | Critical |
| M&A Activity | Acquisition, merger, divestiture, JV announcement | Critical |
| Regulatory Action | New regulation, compliance order, license change | Material |
| Financial Event | Credit rating change, major contract, earnings surprise | Material |

## Step-by-Step Execution

### Step 1: Load Monitoring Context
1. Load company name and prior research baseline.
2. Set monitoring window (since_date to today).
3. Compile keyword list (company name + industry terms + custom keywords).
4. Load alert threshold configuration.

### Step 2: Scan News Sources
1. Search news for company mentions within the monitoring window.
2. Filter by relevance (company-specific vs. industry-general).
3. Classify each result by alert category.
4. Assess severity (routine/material/critical).

### Step 3: Scan Regulatory Sources
1. Check regulatory filings for the company's jurisdictions.
2. Look for compliance actions, permits, or regulatory changes.
3. Cross-reference with HSE domain intent from Intent Profile.

### Step 4: Assess Impact and Generate Alerts
1. For each material/critical signal, assess potential project impact.
2. Determine if Intent Profile updates are recommended.
3. Prioritize signals by severity and recency.

### Step 5: Generate Report
1. Compile signal-change-report.md with all detected signals.
2. Include source URLs and access dates for every signal.
3. Flag Intent Profile fields that may need updating.
4. Store report in session state for project record.

## Quality Criteria

| Criterion | Target |
|-----------|--------|
| Scan completeness | All 5 alert categories checked |
| Detection latency | <48 hours from public disclosure |
| Source attribution | 100% of signals have source URL |
| False positive rate | <20% |
| Impact assessment | Provided for all material/critical signals |
| Scan time | <15 minutes per cycle |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| Orchestrator (AG-001) | Upstream | Configures monitoring scope and frequency |
| All agents | Downstream | Signal alerts may trigger Intent Profile updates affecting all agents |
| HSE (AG-004) | Downstream | HSE incident signals may trigger safety review |
| Finance (AG-010) | Downstream | Financial event signals may affect budget assumptions |
| Contracts & Compliance (AG-005) | Downstream | Regulatory signals may affect compliance requirements |
