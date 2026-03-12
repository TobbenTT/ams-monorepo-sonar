---
name: discover-company-intent
description: "Perform digital due diligence on a client company to generate an initial Intent Profile draft from public sources. Triggers: 'discover company intent', 'company research', 'client due diligence'."
---

# Discover Company Intent

## Skill ID: WI-001
## Version: 1.0.0
## Category: Web Intelligence
## Priority: Critical

## Purpose

Research a client company using publicly available information to generate a draft Intent Profile. This draft accelerates the Intent Profiling process by pre-populating fields that can be inferred from public data, reducing the consultant's manual research from days to hours. The draft includes confidence ratings per section and generates targeted validation questions for the consultant interview.

## Intent & Specification

**Problem:** Consultants spend 3-5 days manually researching client organizations before kickoff. Much of this research covers publicly available information (corporate structure, industry position, recent events, regulatory environment). This time could be dramatically reduced by automated research, freeing the consultant to focus on the high-value cultural and strategic questions that only human interaction can uncover.

**Success Criteria:**
- Company intent draft generated within 30 minutes of invocation
- Covers all 5 research domains (corporate, industry, financial, ESG, culture signals)
- Every data point has source URL, access date, and confidence rating
- Validation questions generated for every Medium/Low confidence inference
- Draft directly maps to `intent-profile.yaml` fields for easy population
- Confidence calibration: >30 quality sources = High, 10-30 = Medium, <10 = Low

**Constraints:**
- Public data only — no paywalled, private, or scraped personal data
- No personal contact information in outputs
- Source attribution mandatory for every data point
- Must handle companies with limited public footprint (flag as Low confidence)
- UTF-8 output, ES or EN based on project language setting

## Trigger / Invocation

**Command:**
`discover-company-intent --company {name} --industry {sector} --country {country}`

**Optional parameters:**
- `--urls {url1,url2,...}` — specific URLs to include in research
- `--language {es|en}` — output language (default: es)
- `--depth {quick|standard|deep}` — research depth

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Company name | User/Orchestrator | Yes | Full legal name or commonly known name |
| Industry | User/Orchestrator | Yes | mining, oil-gas, chemicals, energy, fertilizers |
| Country | User/Orchestrator | Yes | Primary country of operations |
| Additional URLs | User | No | Company website, LinkedIn page, specific reports |
| Project context | Orchestrator | No | Brief project description for targeted research |

## Output Specification

**Primary Output: `company-intent-draft.md`**

Structured markdown document with sections mapping to `intent-profile.yaml`:
1. Corporate Overview (maps to `intent_summary`)
2. Industry Context (maps to `full_context.industry_analysis`)
3. Leadership & Governance (maps to `full_context.stakeholder_dynamics`)
4. Financial Health Indicators (maps to domain budgets/constraints)
5. ESG & Sustainability Position (maps to `domain_intent.hse`)
6. Culture Signals (maps to `intent_summary.culture_type`, `culture_signals`)
7. Risk & Regulatory Environment (maps to `intent_summary.risk_appetite`)
8. Source Registry (all sources with URLs, dates, confidence)
9. Confidence Summary (per-section confidence ratings)

**Secondary Output: `validation-questions.md`**

Questions for the consultant to confirm or correct inferences:
- Organized by Intent Profile section
- Priority-ranked (critical assumptions first)
- Include the inference being validated and the source
- Suggest interview questions for the client

## Step-by-Step Execution

### Step 1: Initialize Research Scope
1. Parse company name, industry, and country.
2. Identify likely corporate website URL.
3. Set confidence thresholds for the industry and country context.
4. Load any prior research from session state.

### Step 2: Corporate Website Analysis
1. Fetch and analyze company website (about, values, team, products/services).
2. Extract: mission statement, corporate values, organizational structure.
3. Identify key executives and their public profiles.
4. Map findings to `intent_summary` fields.

### Step 3: Industry Context Research
1. Research industry trends for the company's sector and geography.
2. Identify regulatory environment and compliance landscape.
3. Assess competitive position and market dynamics.
4. Map findings to risk appetite and industry-specific intent fields.

### Step 4: Financial & Operational Research
1. Search for public financial information (annual reports, filings).
2. Assess company size, revenue range, and investment patterns.
3. Research recent capital projects and operational expansions.
4. Map findings to budget expectations and financial constraints.

### Step 5: ESG & Safety Research
1. Research sustainability reports and ESG ratings.
2. Search for environmental incidents or regulatory actions.
3. Assess safety culture indicators from public reporting.
4. Map findings to HSE domain intent and risk appetite.

### Step 6: Culture Signal Extraction
1. Analyze communication style from public materials (formal vs. pragmatic).
2. Assess decision-making patterns from published strategies.
3. Research union presence and labor relations history.
4. Identify technology adoption indicators.
5. Map findings to culture_type and culture_signals fields.

### Step 7: Synthesize and Generate Outputs
1. Compile all research into `company-intent-draft.md`.
2. Calculate per-section confidence ratings.
3. Generate `validation-questions.md` for all Medium/Low confidence inferences.
4. Store research cache in session state for future reference.

## Quality Criteria

| Criterion | Target |
|-----------|--------|
| Research coverage | All 5 domains populated |
| Source attribution | 100% of data points have source URL |
| Confidence calibration | Thresholds applied consistently |
| Validation questions | Generated for all Medium/Low inferences |
| Output completeness | Maps to >70% of intent-profile.yaml fields |
| Research time | <30 minutes for standard depth |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| Orchestrator (AG-001) | Upstream | Provides research scope and project context |
| All agents | Downstream | Intent draft feeds Intent Profile consumed by all agents |
| HR & Talent (AG-011) | Downstream | Labor relations and workforce culture findings |
| HSE (AG-004) | Downstream | Safety culture and regulatory findings |
| Finance (AG-010) | Downstream | Financial health and budget constraint signals |
