"""Security tests — serialization safety and deserialization attacks.

Tests that JSON deserialization does not execute code, pickle is not used,
YAML is loaded safely, and large payloads are handled without OOM.
"""

import json
import re
from pathlib import Path

import pytest

from agents.orchestration.session_state import SessionState

pytestmark = pytest.mark.security

PROJECT_ROOT = Path(__file__).parent.parent


class TestSessionDeserialization:
    """SessionState.from_json() should be safe against injection."""

    def test_no_code_execution_with_class_key(self):
        """JSON with __class__ key should be treated as a data field, not code."""
        malicious = json.dumps({
            "session_id": "evil",
            "__class__": "os.system('rm -rf /')",
        })
        # Should raise TypeError for unexpected field, not execute code
        with pytest.raises(TypeError):
            SessionState.from_json(malicious)

    def test_rejects_extra_fields(self):
        """Unknown fields should raise TypeError."""
        data = json.dumps({
            "session_id": "s1",
            "equipment_tag": "Test",
            "plant_code": "OCP",
            "unknown_field": "malicious",
        })
        with pytest.raises(TypeError):
            SessionState.from_json(data)

    def test_type_mismatch_stored(self):
        """String where list expected is stored (Python dataclass doesn't validate types).

        This documents that dataclass does NOT validate types at construction.
        The wrong type is accepted but operations expecting a list will fail.
        """
        data = json.dumps({
            "session_id": "s1",
            "hierarchy_nodes": "not a list",
        })
        # Dataclass accepts it — no type validation at construction
        s = SessionState.from_json(data)
        assert s.hierarchy_nodes == "not a list"
        # String has no .append() — list-specific operations fail
        with pytest.raises(AttributeError):
            s.hierarchy_nodes.append({"new": "node"})


class TestNoUnsafeDeserialization:
    """Scan codebase for dangerous deserialization patterns."""

    def _scan_python_files(self, pattern: str) -> list[str]:
        """Scan all Python files for a regex pattern. Returns list of violations."""
        skip_dirs = {"venv", ".venv", "node_modules", "Libraries", "__pycache__", "tests"}
        violations = []
        for py_file in PROJECT_ROOT.rglob("*.py"):
            # Skip virtual envs, libraries, and test files (which contain pattern strings)
            parts = py_file.parts
            if any(p in parts for p in skip_dirs):
                continue
            try:
                content = py_file.read_text(encoding="utf-8")
            except (UnicodeDecodeError, PermissionError):
                continue
            matches = re.findall(pattern, content)
            if matches:
                rel_path = py_file.relative_to(PROJECT_ROOT)
                violations.append(f"{rel_path}: {matches}")
        return violations

    def test_no_pickle_usage(self):
        """No Python file should use pickle.load or pickle.loads."""
        violations = self._scan_python_files(r'pickle\.loads?\s*\(')
        assert not violations, f"Pickle usage found: {violations}"

    def test_no_yaml_unsafe_load(self):
        """yaml.load() should always use SafeLoader."""
        skip_dirs = {"venv", ".venv", "node_modules", "Libraries", "__pycache__", "tests"}
        # Find yaml.load( without Loader=SafeLoader nearby
        violations = []
        for py_file in PROJECT_ROOT.rglob("*.py"):
            parts = py_file.parts
            if any(p in parts for p in skip_dirs):
                continue
            try:
                content = py_file.read_text(encoding="utf-8")
            except (UnicodeDecodeError, PermissionError):
                continue
            # Find yaml.load( calls
            for match in re.finditer(r'yaml\.load\s*\(', content):
                # Check if SafeLoader or safe_load is used nearby (within 100 chars)
                context = content[match.start():match.start() + 100]
                if "SafeLoader" not in context and "safe_load" not in context:
                    rel_path = py_file.relative_to(PROJECT_ROOT)
                    violations.append(f"{rel_path}: unsafe yaml.load()")
        assert not violations, f"Unsafe YAML load found: {violations}"

    def test_no_dangerous_json_object_hook(self):
        """json.loads with object_hook could execute code — should not be used unsafely."""
        violations = self._scan_python_files(r'json\.loads?\s*\([^)]*object_hook')
        assert not violations, f"Dangerous json object_hook found: {violations}"


class TestPrototypePollution:
    """Tool results with __proto__ or similar should be inert."""

    def test_tool_result_proto_pollution(self):
        """__proto__ key in a dict should not affect Python objects."""
        s = SessionState(session_id="s1")
        s.hierarchy_nodes.append({"__proto__": {"admin": True}})
        # Should not affect the SessionState object itself
        assert not hasattr(s, "admin")
        j = s.to_json()
        s2 = SessionState.from_json(j)
        assert s2.hierarchy_nodes[0]["__proto__"] == {"admin": True}
        assert not hasattr(s2, "admin")


class TestLargePayloadHandling:
    """Large data should not cause OOM."""

    def test_session_state_50k_nodes(self):
        """50K hierarchy nodes should serialize without OOM."""
        s = SessionState(session_id="s1")
        for i in range(50_000):
            s.hierarchy_nodes.append({"node_id": f"n{i}", "name": f"Node {i}"})
        j = s.to_json()
        assert len(j) > 0
        # Verify count survives roundtrip
        s2 = SessionState.from_json(j)
        assert len(s2.hierarchy_nodes) == 50_000
