# Agentic Layer Test Report

**Date**: 2026-02-25
**Scope**: Multi-agent orchestration layer (`agents/` directory)
**Author**: Automated analysis + test suite creation

---

## 1. Coverage Summary

| Component | File | Existing Tests | New Tests | Total |
|-----------|------|:--------------:|:---------:|:-----:|
| MilestoneGate + SessionState | test_milestones.py | 29 | — | 29 |
| Agent prompts keywords | test_agent_prompts.py | 37 | — | 37 |
| Tool registry + loaded tools | test_agent_tools.py | ~40 | — | ~40 |
| Tool registry mechanism | test_tool_registry_mechanism.py | 0 | 10 | 10 |
| SessionState extended | test_session_state_extended.py | 0 | 10 | 10 |
| Agent tool access control | test_agent_tool_access.py | 0 | 8 | 8 |
| Agent base loop (mocked API) | test_agent_base.py | 0 | 12 | 12 |
| Orchestrator delegation | test_orchestrator_agent.py | 0 | 8 | 8 |
| Skill YAML loading | test_skill_loading.py | 0 | 8 | 8 |
| Tool wrapper integration | test_tool_wrappers_integration.py | 0 | 8 | 8 |
| Workflow simulation | test_workflow_simulation.py | 0 | 8 | 8 |
| Workflow edge cases | test_workflow_edge_cases.py | 0 | 7 | 7 |
| **TOTAL** | | **~106** | **80** | **~186** |

---

## 2. Critical Bugs Found

### BUG-001: Modify Path Completely Broken — Recursion + State Conflict (CRITICAL)

- **File**: `agents/orchestration/workflow.py`, line 167 + `milestones.py`, line 111
- **Description**: `_execute_milestone()` has TWO compounding bugs that make the "modify" path completely non-functional:
  1. **Recursion**: On "modify", it calls itself recursively (line 167) with no depth limit
  2. **State conflict**: `modify()` sets gate status to `IN_PROGRESS` (line 111), but the recursive `_execute_milestone()` calls `gate.start()` (line 138) which **only accepts `PENDING`** status — causing an immediate `ValueError: Cannot start milestone N: status is MilestoneStatus.IN_PROGRESS`
- **Impact**: The "modify" workflow path has **never worked**. Any human requesting modifications crashes the entire session with `ValueError`. This means the human approval gate has only two functional actions: approve or reject — no iterative refinement is possible.
- **Reproduction**:
  - `test_workflow_edge_cases.py::TestWorkflowModifyLoop::test_modify_crashes_with_value_error`
  - `test_workflow_edge_cases.py::TestWorkflowModifyLoop::test_modify_sets_feedback_before_crash`
  - `test_workflow_edge_cases.py::TestWorkflowModifyLoop::test_modify_state_is_in_progress_after_crash`
- **Recommended Fix**: Replace the recursive call on line 167 with an iterative `while` loop, and guard `start()` to only call when status is `PENDING`:
  ```python
  def _execute_milestone(self, gate, max_retries=5):
      for attempt in range(max_retries + 1):
          if gate.status == MilestoneStatus.PENDING:
              gate.start()
          instruction = self._build_milestone_instruction(gate)
          response = self.orchestrator.run(instruction)
          self.session.record_interaction(...)
          validation = _run_validation(self.session)
          gate.present(validation)
          summary = _format_gate_summary(gate, self.session, validation)
          action, feedback = self.human_approval_fn(gate.number, summary)
          if action == "approve":
              gate.approve(feedback)
              return
          elif action == "modify":
              gate.modify(feedback)
              continue
          elif action == "reject":
              gate.reject(feedback)
              return
      raise MaxRetriesExceeded(f"Milestone {gate.number} exceeded {max_retries} retries")
  ```

### BUG-004: Stale Import — core.skills.loader Deleted (HIGH)

- **File**: `agents/definitions/base.py`, line 21
- **Description**: `from core.skills.loader import (load_skills_for_agent, load_shared_skills, format_skills_block)` references the deleted `core/` package. This causes `ModuleNotFoundError` on any import of `base.py`.
- **Impact**: Any code importing `Agent` or `AgentConfig` from `agents.definitions.base` crashes at import time.
- **Status**: Fixed during test development — replaced with try/except fallback to `agents._shared.loader`.

### BUG-002: Approval Allowed Despite Validation Errors (HIGH)

- **File**: `agents/orchestration/workflow.py`, lines 162-163
- **Description**: After presenting validation results to the human, if the human says "approve", the milestone is approved regardless of whether `validation.has_errors` is `True`. There is no guard to prevent propagating invalid data.
- **Impact**: Invalid data (broken hierarchy references, unvalidated failure modes, incomplete work packages) can propagate to downstream milestones and ultimately to SAP export, potentially corrupting the maintenance strategy.
- **Reproduction**: `test_workflow_edge_cases.py::TestWorkflowValidationErrors::test_approval_despite_validation_errors`
- **Recommended Fix**: Add a `strict_validation=True` parameter to `StrategyWorkflow`. When strict, override "approve" to "modify" if `validation.has_errors`:
  ```python
  if action == "approve":
      if self.strict_validation and validation.has_errors:
          gate.modify("Cannot approve: validation has errors")
          continue
      gate.approve(feedback)
  ```

### BUG-003: modify() Does Not Clear Validation (LOW)

- **File**: `agents/orchestration/milestones.py`, lines 106-111
- **Description**: `modify()` sets status back to `IN_PROGRESS` and records feedback, but does NOT clear the `validation` field. In contrast, `reject()` explicitly sets `self.validation = None` (line 119).
- **Impact**: Low — validation is re-run on the next `present()` call, but stale validation data persists in memory, which could confuse debugging and audit trail analysis.
- **Fix**: Add `self.validation = None` to `modify()`, matching the pattern in `reject()`.

---

## 3. Risk Analysis

### RISK-001: Silent Tool Failures
| Attribute | Detail |
|-----------|--------|
| **File** | `agents/tool_wrappers/registry.py:41` |
| **Description** | `call_tool()` catches ALL exceptions and returns `{"error": "..."}` as a JSON string. The agent receives this error JSON as a normal tool result and may continue reasoning with it. |
| **Impact** | Agent could produce invalid analysis based on error data. |
| **Solution** | Add `call_tool_strict()` that raises `ToolExecutionError`. Add `tool_error_policy` config (`"raise"` / `"warn"` / `"ignore"`) to AgentConfig. Update Agent.run() to detect `"error"` key in tool results. |

### RISK-002: Missing Tools Silently Skipped
| Attribute | Detail |
|-----------|--------|
| **File** | `agents/tool_wrappers/server.py:137` |
| **Description** | `get_tools_for_agent()` uses `if name in TOOL_REGISTRY` — tools listed in AGENT_TOOL_MAP but not registered are silently excluded. |
| **Impact** | Agent loses capabilities without warning if a tool module is removed. |
| **Solution** | Add `validate_tool_map()` startup check that logs WARNING for missing tools. Test coverage: `test_agent_tool_access.py::test_silently_skips_missing_tools` |

### RISK-003: No API Call Timeout
| Attribute | Detail |
|-----------|--------|
| **File** | `agents/definitions/base.py:175` |
| **Description** | `_call_api()` calls `self.client.messages.create()` without a timeout. A hung API call blocks the workflow indefinitely. |
| **Impact** | Entire workflow hangs with no recovery mechanism. |
| **Solution** | Add `timeout=httpx.Timeout(300.0)` to client init. Wrap with `try/except anthropic.APITimeoutError` + retry logic. |

### RISK-004: Unbounded Agent History
| Attribute | Detail |
|-----------|--------|
| **File** | `agents/definitions/base.py:103` |
| **Description** | `Agent.history` grows with every turn. A 40-turn reliability agent accumulates large Message objects. |
| **Impact** | Memory pressure in long sessions. |
| **Solution** | Add `max_history` config with sliding window pruning. |

### RISK-005: Public Mutable State
| Attribute | Detail |
|-----------|--------|
| **File** | `agents/orchestration/session_state.py:29-41` |
| **Description** | SessionState lists (`hierarchy_nodes`, `failure_modes`, etc.) are public and mutable. Any code can modify them without validation. |
| **Impact** | State corruption bypassing quality gates. |
| **Documented in** | `test_session_state_extended.py::test_shared_reference_mutation` |
| **Solution** | Add accessor methods (`add_hierarchy_node()`, `get_hierarchy_nodes()`) that return copies. |

### RISK-006: Dual Agent Base Classes
| Attribute | Detail |
|-----------|--------|
| **Files** | `agents/definitions/base.py` vs `agents/_shared/base.py` |
| **Description** | Two separate Agent base class implementations exist. `definitions/base.py` has the Anthropic API loop. `_shared/base.py` has milestone-aware skill loading. |
| **Impact** | Developer confusion; inconsistent behavior if wrong class used. |
| **Solution** | Consolidate into single class or deprecate `_shared/base.py`. |

---

## 4. Opportunities

### OPP-001: Iterative Modify Loop
Replace recursive `_execute_milestone()` with `while` loop + `max_retries`. See BUG-001 fix.

### OPP-002: Structured Tool Error Propagation
Define `ToolResult` dataclass with `success`, `data`, `error` fields. Replace raw JSON strings.

### OPP-003: Lazy Tool Loading
Replace 27 eager imports in `server.py` with lazy `importlib.import_module()` on first access.

### OPP-004: Automatic Session Checkpointing
Call `session.to_json()` after each milestone approval for crash recovery.

### OPP-005: Observability Hooks
Add `on_event` callback to Agent for real-time monitoring (progress, cost, errors).

### OPP-006: Validation Gate Enforcement
Block approval when `validation.has_errors` with `strict_validation` flag. See BUG-002 fix.

---

## 5. Test Architecture

### Mock Strategy
All agent tests use `unittest.mock` to avoid real API calls:
- `AgentConfig.load_system_prompt` → patched to return "Test prompt"
- `AgentConfig.get_tools_schema` → patched to return minimal tool list
- `Anthropic().messages.create` → MagicMock with `side_effect` returning synthetic `Message` objects
- `call_tool` → patched to intercept tool invocations

### Synthetic Message Factories
Located in `tests/conftest_agents.py`:
- `make_text_message(text)` — Single TextBlock response
- `make_tool_use_message(tool_name, input)` — Single ToolUseBlock response
- `make_mixed_message(text, tool_name, input)` — Text + Tool combined
- `make_multi_tool_message(tools)` — Multiple ToolUseBlocks

### Running Tests
```bash
# All new agentic tests
pytest tests/test_agent_base.py tests/test_orchestrator_agent.py tests/test_tool_registry_mechanism.py tests/test_agent_tool_access.py tests/test_session_state_extended.py tests/test_skill_loading.py tests/test_tool_wrappers_integration.py tests/test_workflow_simulation.py tests/test_workflow_edge_cases.py -v

# Full suite
pytest tests/ -v

# No ANTHROPIC_API_KEY needed
```

---

## 6. Architectural Observations

1. **Single Writer Ownership** is well-enforced via AGENT_TOOL_MAP (each entity type can only be written by one agent). Tests validate this boundary in `test_agent_tool_access.py`. Four orphan tools exist (`get_all_entity_states`, `validate_hierarchy`, `validate_functions`, `validate_criticality_data`) — utility tools not assigned to any specific agent.

2. **Deterministic Engines** (37 engines in `tools/engines/`) are already well-tested (1,208 existing tests). The agentic layer wraps these engines via tool wrappers, creating a clean separation of concerns.

3. **4-Milestone State Machine** in `milestones.py` has correct state guards, but the `modify` transition is broken at the workflow level (BUG-001). The state machine itself is sound — the bug is in `workflow.py` which doesn't account for the IN_PROGRESS state after modify.

4. **Agent Tool-Use Loop** in `base.py` correctly implements the Anthropic canonical pattern. The main risks are in error handling (RISK-001, RISK-003) rather than core logic. BUG-004 (stale `core.skills.loader` import) was fixed with a try/except fallback.

5. **Session State Accumulation** works correctly for the happy path. The main risk is RISK-005 (public mutable state) which could cause subtle bugs if multiple agents share state references.

6. **Tool Counts by Agent**: orchestrator=13, reliability=48, planning=58, spare_parts=3 (total 122 mapped, 126 registered, 4 orphans).

---

## 7. Fixes Applied During Testing

| Fix | File | Description |
|-----|------|-------------|
| FIX-001 | `agents/definitions/base.py:21` | Wrapped stale `core.skills.loader` import with try/except fallback to `agents._shared.loader` |
| FIX-002 | `tests/__init__.py` | Created package init to enable `from tests.conftest_agents import ...` |

---

## 8. All Tests Passing

```
80 passed in 6.07s — No ANTHROPIC_API_KEY needed
```
