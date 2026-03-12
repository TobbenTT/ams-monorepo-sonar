---
name: manage-design-review-comments
description: "Manage the lifecycle of design review comments from capture through response, resolution, and close-out verification. Triggers: 'design review comments', 'review comment tracking', 'comment register', 'comentarios de revision de diseno', 'registro de comentarios', 'seguimiento de observaciones de ingenieria'."
---

# Manage Design Review Comments

## Skill ID: ENGD-17

## Version: 1.0.0

## Category: D - Monitoring

## Priority: P2 - High

---

## Purpose

Manages the complete lifecycle of design review comments from initial capture during review sessions through formal response by the engineering team, resolution tracking, implementation verification, and final close-out. This skill ensures that every comment from every reviewer -- whether from client, owner's engineer, internal interdisciplinary review, HAZOP, constructability review, or operability review -- is formally registered, assigned, responded to with technical adequacy, and verified as implemented in the design before the deliverable is issued for construction.

Design reviews are the primary quality gate in engineering. They bring multiple perspectives -- operations, maintenance, construction, safety, commercial -- to bear on engineering deliverables before those deliverables become the basis for procurement and construction. However, the value of design reviews is entirely dependent on the rigor of comment follow-up. Industry data consistently shows that 15-25% of design review comments are "lost" -- raised in a review session but never formally recorded, or recorded but never adequately addressed, or addressed in documentation but never verified as implemented in the actual design.

The cost of lost design review comments manifests as construction rework, commissioning delays, operational workarounds, and in the worst case, safety incidents. A constructability comment not addressed becomes a field problem. An operability comment not addressed becomes an operational limitation. A safety comment not addressed becomes a risk. The systematic management of every comment through its lifecycle is therefore not administrative overhead -- it is a critical safety and quality control function.

This skill provides the structured framework for comment lifecycle management: standardized capture during review sessions, formal response coding (Accepted / Partially Accepted / Rejected with Justification), response quality validation, action tracking for accepted comments, implementation verification in the updated design, and final close-out with reviewer acknowledgment. It also provides management visibility through aging analysis, closure rate metrics, and escalation of overdue or contested comments.

---

## Intent & Specification

The AI agent MUST understand that:

1. **Every Comment Deserves a Formal Response**: No comment may be ignored, dismissed informally, or silently dropped. Every registered comment must receive a formal coded response with technical justification. Even comments that are rejected must explain why with specific technical reasoning.
2. **Response Codes Must Be Standardized**: The system uses a defined set of response codes: A (Accepted -- comment will be fully incorporated), B (Partially Accepted -- comment partially incorporated with explanation), C (Rejected -- comment not incorporated with detailed technical justification), D (Noted -- information acknowledged, no design change required), E (Transferred -- comment applicable to different discipline or deliverable). Consistency in coding is essential for metrics and audit.
3. **Close-Out Requires Verification, Not Just Response**: A comment is NOT closed when the engineering team responds to it. A comment is closed only when the accepted changes have been verified as implemented in the updated design deliverable and the reviewer (or reviewer's delegate) has confirmed closure. This two-step process (response + verification) prevents the common failure mode of comments being "addressed in response" but never actually implemented.
4. **Comment Aging is a Leading Indicator of Problems**: Comments that remain open beyond their target response date are a leading indicator of engineering bottlenecks, scope disputes, or resource constraints. Aging analysis and escalation protocols are essential management tools.
5. **Safety Comments Have Elevated Priority**: Comments originating from HAZOP reviews, safety reviews, or HSE stakeholders must be flagged as safety-related and given elevated priority in the response and close-out process. Safety comments require HSE agent concurrence before close-out.

---

## Trigger / Invocation

```
/manage-design-review-comments
```

### Natural Language Triggers
- "Track design review comments for [deliverable/review]"
- "Show me open comments status for [discipline/project]"
- "Close out design review comments for [deliverable]"
- "Dar seguimiento a comentarios de revision de diseno para [entregable]"
- "Mostrar estado de comentarios abiertos para [disciplina/proyecto]"
- "Cerrar comentarios de revision para [entregable]"

---

## Input Requirements

### Required Inputs

| Input | Description | Format | Source |
|-------|-------------|--------|--------|
| `review_comments_raw` | Comments captured during design review sessions (formal review meeting minutes, marked-up documents, comment forms) | .xlsx / .docx / .pdf | Review session facilitator / manage-design-reviews (ENGD skill) |
| `deliverable_register` | EDDR identifying which deliverables are under review and their current revision | .xlsx | Engineering Management / Doc Control |
| `reviewer_list` | List of reviewers with their organization, role, and discipline | .xlsx | Engineering Management |
| `comment_register_existing` | Current comment register with all previously logged comments and their status | .xlsx | Engineering Management / Doc Control |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `previous_review_comments` | Comments from earlier review stages of the same deliverable (for continuity tracking) | Assume first review if not provided |
| `hazop_action_register` | HAZOP actions that translate into design review comments | Tracked separately unless explicitly linked |
| `response_deadline_policy` | Project-specific response time requirements by comment severity | Use VSC standard: Critical 5 days, Major 10 days, Minor 15 days |

### Context Enrichment

The agent should automatically:
- Cross-reference new comments against previously raised comments to identify repeat issues or comments not adequately addressed in prior review cycles
- Classify comments by discipline affected to enable proper routing to the responsible discipline engineer
- Flag any comments that reference safety, HAZOP actions, or regulatory requirements for elevated priority processing
- Calculate reviewer satisfaction metrics: ratio of accepted vs. rejected comments per reviewer to identify potential review quality or relationship issues
- Retrieve the deliverable revision history to verify that close-out verification is performed against the correct updated revision

---

## Output Specification

### Document: Design Review Comment Register (.xlsx)

**Filename**: `VSC_CommentReg_{ProjectCode}_{ReviewID}_{Rev}_{Date}.xlsx`

### Structure

#### Section 1: Comment Register Dashboard
- Total comments: by status (Open, Responded, Verified, Closed), by severity (Critical, Major, Minor), by discipline
- Closure rate trend chart (% closed over time)
- Aging analysis: distribution of open comments by age bracket (0-7 days, 8-14 days, 15-30 days, >30 days)
- Overdue comments summary with responsible parties

#### Section 2: Comment Detail Register
- Complete register with columns: Comment ID, Review ID, Deliverable, Discipline, Reviewer, Date Raised, Severity, Category (Technical / Safety / Constructability / Operability / Commercial), Comment Text, Response Code (A/B/C/D/E), Response Text, Responder, Response Date, Action Required, Action Owner, Target Close Date, Verification Method, Verified By, Close Date, Status
- Filterable by any column for targeted analysis
- Conditional formatting: Red for overdue, Amber for approaching deadline, Green for closed

#### Section 3: Response Quality Audit
- Sample assessment of response quality: was the response technically adequate?
- Response code distribution analysis (percentage A/B/C/D/E) per reviewer and per discipline
- Rejected comments requiring management review (all Code C responses)

#### Section 4: Comment-to-Action Tracking
- Actions derived from accepted comments (Code A and B)
- Action completion status linked to deliverable revision updates
- Verification evidence (marked-up drawings, revised calculations, updated specifications showing the change)

#### Section 5: Aging and Escalation Report
- Open comments sorted by age, oldest first
- Overdue comments with days overdue and responsible party
- Escalation history for previously escalated items
- Projected close-out dates based on current closure rate

#### Section 6: Close-Out Verification Log
- Comments verified as implemented in the design
- Verification method (document review, drawing mark-up check, calculation update confirmation)
- Verifier name and date
- Reviewer acknowledgment status

### Key Metrics

| Metric | Description | Target | Measurement |
|--------|-------------|--------|-------------|
| Comment Response Rate | % of comments with formal response within target timeline | >95% within deadline | Comment register date analysis |
| Comment Closure Rate | % of total comments formally closed and verified | >90% before IFC issue | Comment register status tracking |
| Average Response Time | Mean days from comment raised to formal response issued | <10 working days | Comment register date calculation |
| Average Close-Out Time | Mean days from comment raised to verified close-out | <25 working days | Comment register date calculation |
| Overdue Comment Count | Number of comments past target response or close-out date | <5% of total open | Aging analysis report |

---

## Procedure

### Step 1: Capture and Register All Comments

- Receive raw comment input from the design review session: review meeting minutes, marked-up documents, comment forms, email correspondence, or verbal comments documented by the facilitator
- Assign a unique Comment ID to every individual comment using the project numbering convention (e.g., CR-{ReviewID}-{SequenceNumber})
- Classify each comment by severity: Critical (affects safety, code compliance, or fundamental design intent), Major (affects equipment sizing, specification accuracy, or performance), Minor (formatting, editorial, minor clarification, preference)
- Classify each comment by category: Technical, Safety, Constructability, Operability, Maintainability, Commercial, Regulatory, Documentation
- Route each comment to the responsible discipline engineer based on the deliverable and comment content; if the comment affects multiple disciplines, create linked entries for each
- Set target response dates based on severity and project policy: Critical within 5 working days, Major within 10 working days, Minor within 15 working days
- Distribute the registered comments to all discipline leads with their assigned comments highlighted, and to the reviewers confirming that their comments have been captured accurately

### Step 2: Manage Engineering Response Process

- Monitor response progress against target dates; send automated reminders at 50% and 80% of response deadline elapsed
- Review each engineering response for adequacy: Code A (Accepted) must include a description of the design change that will be made; Code B (Partially Accepted) must explain what is accepted and what is not, with technical rationale; Code C (Rejected) must provide specific, defensible technical justification -- vague responses like "not applicable" or "noted" without explanation are returned for improvement
- For safety-related comments (flagged during registration), require HSE Agent review and concurrence with any Code B (partial) or Code C (rejection) response before the response is issued to the reviewer
- Compile all responses into a formal response document organized by comment number, maintaining the full thread (original comment + response)
- Issue the response document to all original reviewers, inviting them to confirm acceptance of the response or raise concerns
- If a reviewer contests a Code C (rejection) response, escalate to Engineering Manager for resolution conference with the reviewer; document the outcome and revise the response code if necessary
- Track all accepted responses (Code A and B) as actions requiring implementation in the next revision of the deliverable

### Step 3: Track Implementation of Accepted Changes

- For each Code A and Code B response, create an implementation action item linked to the specific deliverable and revision that will incorporate the change
- Monitor the deliverable revision process: when the updated revision is issued, cross-reference it against the pending action items to confirm the accepted changes are reflected in the new revision
- For comments requiring design calculation changes (e.g., re-sizing, re-analysis), track the calculation update through the validate-engineering-calculations (ENGD-16) process to ensure the revised calculation is also checked and approved
- For comments requiring specification changes, verify the specification has been updated and re-issued at the correct revision
- For comments requiring drawing changes, verify the drawing mark-up has been incorporated and the drawing re-issued with updated revision
- Maintain a comment-to-action traceability matrix showing: Comment ID, Action Description, Deliverable Affected, Planned Revision, Actual Revision, Implementation Status
- Flag any actions where the deliverable has been re-issued but the action item has not been confirmed as implemented (potential oversight)

### Step 4: Verify Close-Out and Obtain Reviewer Acknowledgment

- For each implemented action, perform close-out verification: compare the original comment against the updated deliverable to confirm the change has been correctly and completely implemented
- Document the verification evidence: reference the specific section, drawing area, calculation page, or specification clause where the change is visible in the updated document
- For safety-related comments, obtain HSE Agent sign-off on the verification that the safety concern has been adequately addressed in the design
- Issue close-out notifications to the original reviewers, providing the verification evidence and requesting acknowledgment that their comment has been satisfactorily addressed
- If the reviewer does not respond within 10 working days, issue a second notification; after 15 working days, the comment is closed with "reviewer acknowledgment requested, no response received" documented
- Update the comment register to "Closed" status with the close-out date, verifier name, and reviewer acknowledgment status
- For comments remaining open at the time of deliverable IFC issue, document the status and justify why IFC is proceeding with open comments (must have Engineering Manager approval for any Critical or Major comments)

### Step 5: Report and Analyze Comment Metrics

- Generate weekly comment status reports showing: total comments, comments by status (Open/Responded/Verified/Closed), new comments raised, comments closed this period, overdue comments
- Calculate and trend the comment closure rate over time; plot against the engineering schedule to show whether closure is tracking with the deliverable completion trajectory
- Perform aging analysis: identify comments open longer than 30 days; investigate root causes (engineering overload, scope dispute, vendor data dependency, interdisciplinary coordination)
- Analyze response code distribution: a high proportion of Code C (rejected) comments from a specific reviewer may indicate review scope misalignment; a high proportion of Code A (accepted) comments from a specific discipline may indicate design quality issues
- Compile lessons learned: identify recurring comment themes that indicate systematic issues (e.g., constructability comments consistently raised on pipe routing -- suggests insufficient constructability input during design development)
- Prepare comment metrics for the generate-engineering-status-report (ENGD-15) consolidation
- At project engineering close-out, compile the complete comment statistics for the project lessons learned database

---

## Failure Modes & Common Pitfalls

| Failure Mode | Root Cause | Prevention Strategy |
|-------------|-----------|-------------------|
| Comments raised in review but not registered | Facilitator notes incomplete; verbal comments not documented; marked-up documents not transcribed | Standardized capture template; mandatory post-review transcription within 48 hours; facilitator sign-off on completeness |
| Generic or inadequate engineering responses | Engineer treats response as administrative burden; insufficient time allocated; no response quality review | Response quality review by lead engineer; template for adequate response format; time budgeted in manhour plan |
| Accepted changes not implemented in design revision | No tracking mechanism linking comment to deliverable revision; implementation assumed but not verified | Comment-to-action traceability matrix; mandatory verification step before close-out; deliverable revision cross-check |
| Safety comments given same priority as editorial comments | No severity classification; safety comments not flagged during registration | Mandatory severity classification at registration; automatic flagging of safety keywords; HSE Agent notification for safety comments |
| Comment register becomes stale and unmanaged | No dedicated owner; reporting not enforced; register treated as historical record | Dedicated comment coordinator role; weekly reporting cycle; management review of overdue comments |
| Reviewer disputes not escalated or resolved | Reviewer contests response but no mechanism for resolution; dispute left unresolved | Formal escalation protocol; Engineering Manager arbitration; documented resolution outcome |

---

## Escalation Protocols

| Trigger | Timeline | Escalation Path |
|---------|----------|----------------|
| Critical comment not responded to within 5 working days | Immediate at deadline | Discipline Engineer --> Lead Discipline Engineer --> Engineering Manager |
| Safety comment response (Code B or C) not reviewed by HSE within 3 working days | 24 hours past deadline | HSE Agent --> HSE Manager with Engineering Manager visibility |
| Reviewer formally contests a Code C (rejected) response | 5 working days to resolve | Engineering Manager organizes resolution meeting; documents outcome |
| Major comment overdue >20 working days without response progress | Weekly | Lead Discipline Engineer --> Engineering Manager with explanation and recovery plan |
| >10% of comments overdue for any single discipline | At occurrence | Lead Discipline Engineer --> Engineering Manager for resource assessment |
| IFC issue requested with open Critical comments | Block IFC | Engineering Manager must formally approve IFC with open Critical comments; document risk acceptance |
| Comment closure rate below 70% with IFC milestone within 30 days | 1 week | Engineering Manager --> Project Manager for close-out recovery plan |

---

## Quality Criteria

| Dimension | Weight | Target | Measurement |
|-----------|--------|--------|-------------|
| Technical Accuracy | 30% | Engineering responses are technically sound and adequately justified | Response quality audit: >90% of responses rated "adequate" by lead engineer review |
| Completeness | 25% | 100% of review comments registered; 100% receive formal response; >90% verified closed before IFC | Comment register metrics |
| Consistency | 15% | Response codes applied consistently; close-out verification method standardized | Cross-discipline audit of response coding and verification practices |
| Format | 10% | Comment register follows standard structure; reports generated on schedule | Template compliance; reporting schedule adherence |
| Actionability | 10% | Every Code A/B response has a specific implementation action with owner and date | Action completeness audit: >95% of accepted comments have implementation actions |
| Traceability | 10% | Every closed comment traceable from original comment through response, action, implementation, and verification | End-to-end traceability audit on sample of closed comments |

---

## Inter-Agent Dependencies

### Inputs From

| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `manage-design-reviews` (ENGD skill) | Review session outputs: minutes, marked-up documents, attendee lists | Critical |
| All Reviewers (Operations, HSE, Maintenance, Construction, Client) | Review comments from their domain perspective | Critical |
| `agent-hse` | Safety-specific review comments; HAZOP action items requiring design changes | High |
| All Engineering Disciplines | Responses to comments assigned to their deliverables | Critical |
| `validate-engineering-calculations` (ENGD-16) | Confirmation that revised calculations (from accepted comments) have been checked and approved | High |

### Outputs Consumed By

| Agent/Skill | Output Consumed | Usage |
|-------------|----------------|-------|
| All Engineering Disciplines | Assigned comments requiring response and design changes | Design updates and revisions |
| `agent-execution` | Comment closure status for project milestone tracking | Engineering milestone (IFC) readiness confirmation |
| `agent-orchestrator` | Comment closure metrics for consolidated project reporting | Weekly/monthly project status |
| `generate-engineering-status-report` (ENGD-15) | Comment metrics: open, closed, overdue, aging distribution | Engineering status report section on review management |
| `create-engineering-dossier` (ENGD-18) | Complete closed comment register as handover documentation | Permanent project record in engineering dossier |

---

## References

### Methodology References
- VSC OR Playbook -- Design Review Management and Quality Assurance sections
- VSC Engineering Management Procedures -- Design Review Comment Management Guide
- VSC Standard Comment Register Template v2.0
- VSC Response Code Definitions and Adequacy Criteria

### Industry Standards
- ISO 9001:2015 -- Quality Management Systems (Clause 8.3 Design and Development, specifically 8.3.4 Design and Development Controls)
- ISO 19650 -- Organization and digitization of information about buildings and civil engineering works (BIM review workflows)
- CII (Construction Industry Institute) -- Design Review Best Practices (RS 210-1)
- AACE International -- Review and Comment Management in Project Engineering

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-25 | VSC OR System | Initial creation -- Wave 3 |
