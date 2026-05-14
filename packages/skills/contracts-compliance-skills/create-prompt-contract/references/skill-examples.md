# Examples - create-prompt-contract

*Extracted from CLAUDE.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

**Example 1: Contract for SOP Generation Prompt**
```
Command: create-prompt-contract new --name "generate-sop" --purpose "Generate standard operating procedures"

Contract: PC-001-generate-sop
Version: 1.0.0
Status: Tested

INPUT SPECIFICATION:
| Field | Type | Required | Default | Valid Values |
|-------|------|----------|---------|-------------|
| plant_area | string | yes | N/A | Area name (e.g., "Area 100 - Evaporation") |
| process_name | string | yes | N/A | Specific process (e.g., "Startup Sequence") |
| sop_type | enum | yes | N/A | normal_operation | startup | shutdown | emergency |
| equipment_list | list<string> | yes | N/A | 1-50 equipment tags |
| safety_requirements | list<string> | no | [] | HSE requirements |
| template_reference | file_reference | no | "SOP-TEMPLATE-001" | Client SOP template |
| language | enum | no | "en" | en | es |

Validation Rules:
- equipment_list must contain at least 1 item
- If sop_type = "emergency", safety_requirements is required

OUTPUT SPECIFICATION:
  Fixed structure following SOP template:
  - Header (title, number, revision, area, author)
  - Purpose (1 paragraph)
  - Scope (1 paragraph)
  - Safety Requirements (bulleted list)
  - Required Tools and Materials (table)
  - Prerequisites (numbered list)
  - Procedure Steps (numbered, with sub-steps, cautions, notes)
  - Post-Operation Checks (numbered list)
  - References (bulleted list)

AMBIGUITY HANDLING:
  Missing safety_requirements -> Use generic PPE requirements and flag for HSE review
  Ambiguous equipment tag -> Flag with "[VERIFY: equipment_tag]" and continue
  Unknown process details -> Generate structure with "[TO BE COMPLETED BY OPERATOR]" placeholders

TEST CASE 1 (Happy Path):
  Input: plant_area="Area 100", process_name="Evaporator Startup", sop_type="startup",
         equipment_list=["EV-101","PU-102","HX-103"], safety_requirements=["LOTO required"]
  Expected: Complete SOP with 15-25 procedure steps, all equipment referenced, LOTO in safety section
  Validation: All equipment tags appear in procedure, safety section non-empty, steps are sequential

TEST CASE 2 (Edge Case):
  Input: plant_area="Area 100", process_name="Emergency Brine Spill", sop_type="emergency",
         equipment_list=["EV-101"], safety_requirements omitted
  Expected: Error message: "safety_requirements is required for emergency SOPs"
```

**Example 2: Reverse-Engineering a Contract from Existing Prompt**
```
Command: create-prompt-contract from-prompt --prompt "You are an expert OR consultant.
  Given a list of equipment, analyze their criticality using a risk matrix.
  Consider safety, environment, production, and cost impacts.
  Output a table with equipment, risk score, and recommended maintenance strategy."

Reverse-Engineered Contract: PC-012-analyze-criticality

IDENTIFIED INPUTS:
  equipment_list: list<object{tag, name, type}>, required
  risk_categories: enum[], default=["safety","environment","production","cost"]
  risk_matrix_type: enum, default="5x5", values=["3x3","4x4","5x5"]

IDENTIFIED OUTPUTS:
  criticality_table: table with columns [equipment_tag, equipment_name, safety_score,
    environment_score, production_score, cost_score, overall_risk, criticality_rank,
    recommended_strategy]

GAPS IDENTIFIED:
  1. No scoring scale defined (what is 1 vs 5?)
  2. No weighting specified for risk categories
  3. No threshold for criticality ranking
  4. No ambiguity handling for missing equipment data
  5. Output format underspecified (what does "table" mean exactly?)

RECOMMENDATION: Complete the contract by defining scoring scales, weights, thresholds,
  and exact output format before deploying as a skill.
```

**Example 3: Generating SKILL.md from Contract**
```
Command: create-prompt-contract to-skill --contract "PC-001-generate-sop.md"

Generated: skills/generate-sop.md
  - Input Requirements table populated from contract input specification
  - Output Specification populated from contract output specification
  - Step-by-Step Execution generated from prompt template logic
  - Examples generated from test cases
  - Quality Criteria generated from output validation rules

Mapping:
  Contract Input Spec -> Skill Input Requirements
  Contract Output Spec -> Skill Output Specification
  Contract Prompt Template -> Skill Step-by-Step Execution
  Contract Ambiguity Rules -> Skill Error Handling notes
  Contract Test Cases -> Skill Examples section
  Contract Version -> Skill Version
```
