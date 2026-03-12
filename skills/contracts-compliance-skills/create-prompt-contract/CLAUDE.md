---
name: create-prompt-contract
description: "Create prompt contracts that treat prompts as APIs with fixed I/O specifications. Triggers: 'prompt contract', 'prompt specification', 'prompt API'."
---

# Create Prompt Contract

## Skill ID: F-010
## Version: 1.0.0
## Category: F. New - Intent & Specs
## Priority: High

## Purpose

Create prompt contracts that treat AI prompts as formal API contracts with fixed input/output formats, explicit validation rules, and deterministic behavior boundaries. Based on Nate B Jones' Principle 3 (Treat Prompts as APIs), this skill produces a structured specification document for each prompt that defines exactly what goes in, exactly what comes out, what values are valid, how ambiguity is handled, and what happens when inputs are out of range. Prompt contracts are the foundation for creating SKILL.md files, CLAUDE.md system prompts, and any reusable prompt that must produce consistent results across different sessions, agents, and operators.

## Intent & Specification

**Problem:** Most prompts are written as natural language paragraphs -- vague, open to interpretation, and producing different results every time they are run. When a prompt works well once, there is no way to reliably reproduce that quality because the implicit contract between the user and the AI is not documented. Teams share prompts informally ("here is my prompt for generating SOPs") but without specifying what inputs are expected, what the output format must be, what values are valid, or what happens when the AI encounters an edge case. This leads to: inconsistent output quality across sessions, prompt drift as people modify prompts without understanding the contract, inability to test or validate prompts systematically, and knowledge loss when the prompt creator is unavailable.

**Success Criteria:**
- Every reusable prompt has a formal contract document defining I/O specification
- Contracts are precise enough that two different operators get substantially similar outputs
- Input fields are typed with valid ranges, required/optional status, and defaults
- Output format is fixed with explicit structure, sections, and expected content
- Ambiguity handling rules prevent the AI from guessing when inputs are unclear
- Contracts are versioned and managed alongside the skills and agent specifications
- Prompt contracts reduce output variance by >60% compared to uncontracted prompts
- Contracts serve as the authoritative source for SKILL.md and CLAUDE.md file creation

**Constraints:**
- Must be usable by non-technical team members (not just prompt engineers)
- Must support any AI platform (Claude, GPT, Gemini, Windsurf, Cursor)
- Must be compatible with the OR multi-agent system architecture
- Must handle both simple prompts (one input, one output) and complex prompts (multi-step, conditional)
- Must produce contracts that are machine-readable (for automated validation) and human-readable
- Must include test cases for contract verification
- Must integrate with github-prompt-manager for versioning and deployment

## Trigger / Invocation

**Manual Triggers:**
- `create-prompt-contract new --name [name] --purpose [description]`
- `create-prompt-contract from-prompt --prompt [existing-prompt-text]` (reverse-engineer contract from an existing prompt)
- `create-prompt-contract validate --contract [file]` (check contract completeness)
- `create-prompt-contract test --contract [file] --inputs [test-inputs]` (run contract test cases)
- `create-prompt-contract to-skill --contract [file]` (generate SKILL.md from contract)
- `create-prompt-contract to-claude --contract [file]` (generate CLAUDE.md from contract)

**Automatic Triggers:**
- New skill identified during workflow audit -> create prompt contract before SKILL.md
- Agent specification requires a new capability -> contract defines the capability's prompt
- Prompt quality validation fails -> inspect and tighten the contract
- github-prompt-manager detects uncontracted prompt in repository

**Recommended Invocation Points:**
- Before creating any new SKILL.md file
- Before creating any new CLAUDE.md agent specification
- When standardizing an ad-hoc prompt that has proven useful
- When a prompt produces inconsistent results and needs tightening
- During vibe working sessions focused on prompt engineering

## Input Requirements

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Prompt Name | User | Yes | Identifier for the prompt contract |
| Purpose Statement | User | Yes | What this prompt produces and why |
| Existing Prompt Text | User | No | An existing prompt to reverse-engineer into a contract |
| Domain Context | Knowledge Base | No | Industry and project context for the prompt |
| Example Inputs | User | Recommended | Sample inputs to define the input specification |
| Example Outputs | User | Recommended | Sample outputs to define the output specification |
| Quality Criteria | User / Standards | No | Standards the output must meet |
| Target AI Platform | User / Config | No | Which AI system will execute this prompt |
| Related Contracts | System | No | Existing contracts for related prompts |

## Output Specification

**Primary Output: Prompt Contract Document**

```markdown
# Prompt Contract: {Name}
## Contract ID: {PC-NNN}
## Version: {Major.Minor.Patch}
## Created: {Date}
## Author: {Name}
## Status: {Draft / Tested / Approved / Deployed}
## Target Platform: {Claude / GPT / Any}

---

## 1. PURPOSE
{One paragraph describing what this prompt does, who uses it, and why it exists}

## 2. INPUT SPECIFICATION

### 2.1 Input Fields
| Field | Type | Required | Default | Valid Values | Description |
|-------|------|----------|---------|-------------|-------------|
| {field_name} | {string/number/enum/list/object} | {yes/no} | {default or N/A} | {range or options} | {what this field is} |

### 2.2 Input Validation Rules
- {Rule 1: e.g., "If field_a is provided, field_b must also be provided"}
- {Rule 2: e.g., "date_start must be before date_end"}
- {Rule 3: e.g., "items list must contain at least 1 and no more than 50 entries"}

### 2.3 Input Template
```
{field_1}: {placeholder}
{field_2}: {placeholder}
...
```

## 3. OUTPUT SPECIFICATION

### 3.1 Output Format
{Exact structure the output must follow}

### 3.2 Output Fields
| Section/Field | Type | Required | Description | Validation |
|---------------|------|----------|-------------|------------|
| {section} | {type} | {yes/no} | {what it contains} | {how to verify} |

### 3.3 Output Template
```
{Exact output structure with placeholders}
```

### 3.4 Output Constraints
- Minimum length: {value}
- Maximum length: {value}
- Language: {language}
- Tone: {formal/technical/conversational}
- Prohibited content: {list}

## 4. AMBIGUITY HANDLING

### 4.1 When Input is Missing
| Missing Input | Behavior |
|--------------|----------|
| {field} | {use default X / ask user / skip section / fail with message} |

### 4.2 When Input is Ambiguous
| Ambiguity Type | Behavior |
|---------------|----------|
| {scenario} | {how to resolve: choose conservative interpretation / ask / flag} |

### 4.3 When Output Cannot Be Fully Generated
| Scenario | Behavior |
|----------|----------|
| {scenario} | {partial output with flags / error message / fallback template} |

## 5. PROMPT TEMPLATE
{The actual prompt text with variable placeholders that implements this contract}

## 6. TEST CASES

### Test Case 1: {Happy Path}
**Input:**
{Complete valid input}
**Expected Output Pattern:**
{What the output should look like}
**Validation:**
{How to verify the output is correct}

### Test Case 2: {Edge Case}
**Input:**
{Unusual or boundary input}
**Expected Output Pattern:**
{Expected behavior}
**Validation:**
{Verification method}

### Test Case 3: {Error Case}
**Input:**
{Invalid or missing input}
**Expected Behavior:**
{How the prompt should handle the error}

## 7. VERSION HISTORY
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | {Date} | {Author} | Initial contract |

## 8. DEPLOYMENT
- Deployed as: {SKILL.md / CLAUDE.md / standalone prompt}
- Repository: {github location}
- Used by: {list of agents or workflows}
```

**Compact Contract Format (for simple prompts):**
```markdown
# Contract: {Name} (PC-{NNN})
**Purpose:** {one sentence}

**Inputs:**
| Field | Type | Required | Valid Values |
|-------|------|----------|-------------|
| {field} | {type} | {yes/no} | {values} |

**Output:** {format description}

**Ambiguity Rule:** {default behavior}

**Prompt:** {the prompt text}

**Test:** Input={sample} -> Expected={pattern}
```

## Methodology & Standards

- **Prompts as APIs Principle:** A prompt is a function. It takes inputs and produces outputs. Like any API, it must have a contract that specifies: what inputs are accepted (type, range, required/optional), what output is produced (format, structure, content), what happens with invalid inputs (error handling), and what guarantees are made (consistency, quality). Without a contract, a prompt is a hope, not a tool.

- **Input Typing System:**
  - **string:** Free text with optional length constraints and content rules
  - **number:** Numeric value with range (min, max, precision)
  - **enum:** One of a fixed set of values (e.g., "high | medium | low")
  - **list:** Ordered collection of typed items with count constraints
  - **object:** Structured data with named fields (recursive typing)
  - **boolean:** True/false flag
  - **date:** Date value with format specification (e.g., YYYY-MM-DD)
  - **file_reference:** Path or ID to an external document

- **Output Determinism Levels:**
  - **Fixed:** Output structure is 100% deterministic (same inputs = same structure every time)
  - **Semi-Fixed:** Structure is fixed, content varies within defined ranges
  - **Guided:** Structure is recommended but content is creative within constraints
  - Use Fixed for data extraction, reports, and templates. Semi-Fixed for analysis and plans. Guided for creative and strategic content.

- **Ambiguity Handling Hierarchy:**
  1. Use the explicit default value (if defined in the contract)
  2. Infer from context (if inference rules are defined)
  3. Ask the user (if interactive mode is available)
  4. Flag and proceed with conservative interpretation (if non-interactive)
  5. Fail with descriptive error message (if ambiguity is critical)

  The contract must specify which level applies to each input field. Never let the AI silently guess.

- **Contract Testing Protocol:**
  - Every contract must have at least 3 test cases: happy path, edge case, error case
  - Tests are executable: provide inputs, run prompt, validate output against expected pattern
  - Re-test when contract is updated (regression testing)
  - Test across platforms if multi-platform deployment is intended

- **Contract Versioning:**
  - Semantic versioning: MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes to input or output format
  - MINOR: New optional inputs or output sections added
  - PATCH: Prompt text refinement without I/O changes
  - All versions tracked in github-prompt-manager

## Step-by-Step Execution

### Step 1: Define Contract Purpose and Scope
1. Name the prompt contract following convention: PC-{NNN}-{descriptive-name}
2. Write a one-paragraph purpose statement answering:
   - What does this prompt produce?
   - Who uses the output?
   - Why does this prompt exist (what problem does it solve)?
3. Determine the output determinism level: Fixed, Semi-Fixed, or Guided
4. Identify the target AI platform(s)
5. If reverse-engineering from existing prompt: parse the prompt to extract implicit contract elements

### Step 2: Define Input Specification
1. List all inputs the prompt needs
2. For each input, define:
   - Name (following naming convention: snake_case)
   - Type (string, number, enum, list, object, boolean, date, file_reference)
   - Required or optional
   - Default value (if optional)
   - Valid values or range
   - Description (what this input represents)
3. Define input validation rules:
   - Cross-field dependencies (if A then B required)
   - Range constraints (min/max for numbers, length for strings)
   - Format constraints (date formats, naming patterns)
4. Create the input template showing all fields with placeholders
5. Validate: can someone fill in this template without ambiguity?

### Step 3: Define Output Specification
1. Design the exact output structure:
   - Sections and their order
   - Fields within each section
   - Tables, lists, or other structured elements
2. For each output element, define:
   - Type and format
   - Required or conditional (depends on input)
   - Validation criteria (how to verify correctness)
3. Set output constraints:
   - Length limits (minimum and maximum)
   - Language and tone requirements
   - Prohibited content
4. Create the output template with placeholders
5. Validate: does this template match what the intent specification requires?

### Step 4: Define Ambiguity Handling Rules
1. For each input field:
   - What happens if it is missing? (default / ask / skip / fail)
   - What happens if it is ambiguous? (rule-based resolution / ask / flag)
2. For the output:
   - What happens if the AI cannot fully generate a section? (partial / flag / fallback)
   - What happens if inputs conflict? (priority rules / ask / fail)
3. Document every ambiguity scenario and its resolution
4. Ensure no scenario leads to silent guessing by the AI

### Step 5: Write the Prompt Template
1. Construct the actual prompt text that implements the contract:
   - Start with role/context setting
   - Include input field placeholders: `{field_name}`
   - Specify output format explicitly (reproduce the output template in the prompt)
   - Include ambiguity handling instructions
   - Include quality criteria from the contract
2. Review prompt against contract:
   - Does the prompt reference all required inputs?
   - Does the prompt enforce the output format?
   - Does the prompt include ambiguity handling rules?
3. Ensure prompt is platform-appropriate (token limits, formatting capabilities)

### Step 6: Create Test Cases
1. **Happy Path Test:** Complete, valid inputs -> full, correct output
   - Provide realistic sample inputs
   - Define what the output pattern should look like
   - Define specific validation checks
2. **Edge Case Test:** Unusual but valid inputs -> correct handling
   - Minimum valid inputs (only required fields)
   - Maximum valid inputs (all fields at limits)
   - Unusual but valid values
3. **Error Case Test:** Invalid or missing inputs -> proper error handling
   - Missing required fields
   - Out-of-range values
   - Conflicting inputs
4. Document expected behavior for each test case

### Step 7: Validate the Contract
1. Completeness check: all sections of the contract template populated
2. Consistency check: input spec, output spec, prompt template, and test cases all align
3. Ambiguity check: no undefined scenarios for missing or unclear inputs
4. Executability check: run test cases through the prompt and verify outputs
5. Peer review: have another person execute the contract and compare results
6. Revise until two independent operators produce substantially similar outputs

### Step 8: Generate SKILL.md or CLAUDE.md (if applicable)
1. If the contract is for a skill:
   - Map contract sections to SKILL.md template
   - Input Specification -> Input Requirements table
   - Output Specification -> Output Specification section
   - Prompt Template -> becomes the core of Step-by-Step Execution
   - Test Cases -> Examples section
2. If the contract is for an agent:
   - Map contract to CLAUDE.md template
   - Input Specification -> Tools & Capabilities
   - Output Specification -> Output Standards
   - Ambiguity Handling -> Error Handling
   - Prompt Template -> Role & Scope + Rules
3. Deploy via github-prompt-manager or github-skill-deployer

### Step 9: Version and Deploy
1. Assign version 1.0.0 to the initial contract
2. File in the prompt contracts directory
3. Register in the prompt library (build-second-brain)
4. If deploying as SKILL.md or CLAUDE.md: follow deployment pipeline
5. Set up monitoring: track output consistency across executions
6. Schedule review: monthly for active contracts, quarterly for stable contracts

## Quality Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Contract Completeness | All required sections populated | 100% |
| Input Specification Clarity | Inputs typed with valid ranges | 100% of fields |
| Output Determinism | Same inputs produce structurally identical outputs | > 90% |
| Ambiguity Coverage | Scenarios with defined handling rules | 100% |
| Test Case Coverage | Happy path + edge + error cases | >= 3 per contract |
| Cross-Operator Consistency | Different operators get similar results | > 80% structural match |
| Reverse-Engineering Accuracy | Contracts from existing prompts capture all implicit rules | > 85% |
| Deployment Success | Contracts successfully converted to SKILL.md/CLAUDE.md | > 95% |

## MCP Integrations

| MCP Server | Purpose |
|------------|---------|
| `mcp-github` | Store prompt contracts with version control, manage contract deployment pipeline |
| `mcp-sharepoint` | Archive finalized contract documentation and link to related SKILL.md/CLAUDE.md files |

## Inter-Agent Dependencies

| Agent | Dependency Type | Description |
|-------|----------------|-------------|
| `define-intent-specification` | Upstream | Intent spec provides the requirements the contract must fulfill |
| `create-agent-specification` | Downstream | Agent specs are built from prompt contracts |
| `github-prompt-manager` | Downstream | Contracts versioned and managed in repository |
| `github-skill-deployer` | Downstream | SKILL.md files generated from contracts are deployed |
| `validate-output-quality` | Downstream | Quality validation uses contract output spec as reference |
| `build-second-brain` | Downstream | Contracts stored in prompt library for reuse |
| `vibe-working-session` | Consumer | Vibe sessions use contracted prompts for consistent results |
| `design-quality-gate` | Sibling | Quality gates reference contract output specifications |

## Templates & References

**Input Field Quick Reference:**
```yaml
field_types:
  string:
    constraints: [min_length, max_length, pattern, allowed_chars]
    example: "project_name: string, required, 1-100 chars, alphanumeric+spaces"
  number:
    constraints: [min, max, precision, unit]
    example: "budget_usd: number, required, 0-10000000, precision=2, unit=USD"
  enum:
    constraints: [values]
    example: "priority: enum, required, values=[critical|high|medium|low]"
  list:
    constraints: [item_type, min_count, max_count]
    example: "team_members: list<string>, required, 1-50 items"
  object:
    constraints: [fields]
    example: "address: object{street: string, city: string, country: enum}"
  boolean:
    constraints: []
    example: "include_appendix: boolean, optional, default=true"
  date:
    constraints: [format, min, max]
    example: "start_date: date, required, format=YYYY-MM-DD, min=today"
```

**Contract Naming Convention:**
```
PC-{NNN}-{descriptive-name}
  NNN: sequential number
  descriptive-name: lowercase-hyphenated

Examples:
  PC-001-generate-sop
  PC-002-analyze-criticality
  PC-003-create-weekly-report
```

## Examples

See [`references/skill-examples.md`](references/skill-examples.md) for detailed examples.
