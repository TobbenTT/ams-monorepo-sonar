# Quality Assurance Framework Reference
## VSC Operational Readiness - AI-Generated Deliverable Quality

**Source Documents:**
- `docs/architecture/_legacy/knowledge-base.md` (Chapter 17)
- `docs/architecture/_legacy/multi-agent-architecture.md` (Section 13)
- `agents/*/skills.yaml` (per-agent skill assignments) (Sections 6, 11)

**Applicable Skills:**
- validate-output-quality
- design-quality-gate
- audit-ai-workflow
- certify-system-readiness
- All skills (every skill references quality validation in its workflow)

---

## Table of Contents

| Section | Topic |
|---------|-------|
| 1 | The SME-Grade Standard |
| 2 | Seven Quality Dimensions |
| 3 | Multi-Layer Quality Model |
| 4 | Quality Gate Implementation |
| 5 | Deliverable-Specific Quality Criteria |
| 6 | Quality Metrics Dashboard |

---

## 1. The SME-Grade Standard

VSC's quality target: **>91% SME validation score**

This means a Subject Matter Expert reviewing the deliverable would rate it as usable with only minor adjustments.

### Scoring Scale
| Score Range | Rating | Action |
|-------------|--------|--------|
| >91% | Approved | Deliverable accepted with minor edits |
| 75-91% | Revision | Specific improvements required, resubmit |
| <75% | Rejected | Major rework needed, respecify |

---

## 2. Seven Quality Dimensions

| Dimension | Weight | Description | Measurement Method |
|-----------|--------|-------------|-------------------|
| Technical Accuracy | 25% | Content is technically correct per industry standards | SME technical review |
| Completeness | 20% | All required sections present with adequate depth | Checklist against spec |
| Consistency | 15% | No contradictions within document or across deliverables | Cross-reference check |
| Format & Professionalism | 10% | Proper formatting, branding, language quality | Visual review |
| Actionability | 10% | Content can be used directly without rework | Practical usability test |
| Traceability | 10% | Sources cited, decisions documented, assumptions stated | Audit trail review |
| Intent Alignment | 10% | Output respects client trade-off priorities, decision boundaries, and cultural preferences from Intent Profile | Intent Profile cross-check |

> **v3.1 Backward Compatibility:** When no `intent-profile.yaml` exists, the framework operates in 6-dimension mode with original weights (Technical Accuracy 30%, Completeness 25%, others unchanged). Intent Alignment is excluded from scoring.

### Scoring Per Dimension
Each dimension scored 1-5:
| Score | Level | Description |
|-------|-------|-------------|
| 1 | Unacceptable | Major errors, missing content |
| 2 | Poor | Significant gaps or inaccuracies |
| 3 | Acceptable | Meets minimum requirements |
| 4 | Good | Above average, minor improvements needed |
| 5 | Excellent | Publication-ready, no improvements needed |

**Weighted Score** = Sum of (Dimension Score × Weight) / 5 × 100

---

## 3. Multi-Layer Quality Model

```
Layer 1: Agent Self-Check (Automatic - TaskCompleted hook)
    → File exists? Content minimum? Structure matches spec?

Layer 2: Peer Agent Review (Draft-and-Review pattern)
    → HSE reviews SOPs for safety
    → Operations reviews Maintenance for context

Layer 3: Cross-Deliverable Consistency (OR-PMO / Orchestrator)
    → Roles match across documents?
    → Costs consistent between OPEX and contracts?
    → Timeline aligned with project schedule?

Layer 4: Specification Compliance (Quality Validator Agent)
    → 7-dimension scoring (6-dimension when no Intent Profile)
    → >91% threshold check

Layer 5: Human SME Validation (VSC Consultant)
    → Final approval
    → Feedback loops to agent memory
```

---

## 4. Quality Gate Implementation

### Gate 1: Agent Self-Check
Automated verification before marking task complete:
- Output file exists and has content (>1KB)
- Required sections present (matched against spec template)
- No placeholder text remaining ([TODO], [INSERT], [TBD])
- Cross-references satisfied (referenced documents exist)

### Gate 2: Peer Agent Review
For critical deliverables, automatic peer review:
- HSE reviews Operations SOPs for safety content
- Operations reviews Maintenance strategies for operational context
- OR-PMO reviews all for strategic alignment

### Gate 3: Cross-Deliverable Consistency
Orchestrator verifies:
- Roles in staffing plan match those in SOPs and maintenance procedures
- Costs in OPEX model match contract scopes and spare parts lists
- Timeline in OR plan aligns with project master schedule
- Equipment counts consistent across all deliverables
- Terminology consistent (same abbreviations, naming conventions)

### Gate 4: Human Validation
Final SME review:
- Score each quality dimension (1-5)
- Calculate weighted score
- Accept (>91%), Revise (75-91%), Reject (<75%)
- Provide specific feedback for improvements
- Feedback recorded in agent memory for learning

---

## 5. Deliverable-Specific Quality Criteria

| Deliverable | Critical Quality Criteria |
|-------------|--------------------------|
| Operating Procedures (SOPs) | Step sequences executable, safety precautions present, interlocks referenced, emergency procedures included |
| Maintenance Strategy | Criticality justified with methodology, RCM analysis complete for AA items, PM frequencies reasonable per industry data |
| Staffing Plan | All operational positions covered, competencies defined and measurable, recruitment timeline feasible |
| OPEX Budget | Bottom-up calculation traceable, assumptions documented, contingency included and justified |
| Risk Assessment | All critical risks identified, bow-tie analysis complete, mitigations assigned to owners |
| Contract Scope | Technical requirements specific and measurable, KPIs defined with targets, penalties and incentives balanced |
| OR Strategy | Aligned with project execution strategy, budget within 3-8% of CAPEX, governance framework clear |
| OR Plan 360 | All workstreams covered, dependencies mapped, schedule realistic and back-calculated |

---

## 6. Quality Metrics Dashboard

### Project-Level Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| First-Pass Quality Rate | >75% | % deliverables passing Gate 4 on first attempt |
| SME Validation Score (avg) | >91% | Average weighted score from human validation |
| Cross-Consistency Score | >95% | % of cross-references that match across documents |
| Spec Compliance | 100% | % of deliverables with associated intent-spec |
| RFI Response Time | <24h | Average time from RFI creation to response |
| Revision Cycle Time | <48h | Average time from revision request to resubmission |

---

## Changelog
### v1.1 (February 2026)
- Added 7th dimension: Intent Alignment (10%)
- Redistributed weights: Technical Accuracy 30%→25%, Completeness 25%→20%
- Added v3.1 backward compatibility note (6-dimension mode when no Intent Profile)
- Updated Layer 4 reference to reflect 7-dimension scoring

### v1.0 (February 2026)
- Initial quality assurance framework reference
- Compiled from Knowledge Base v2.0, Architecture v2, Mapa Estrategico v2
