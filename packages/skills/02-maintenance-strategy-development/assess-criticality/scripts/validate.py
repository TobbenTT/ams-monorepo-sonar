"""
Validation script for the assess-criticality skill.
Checks that SKILL.md structure, references, and evals are well-formed.
"""

import json
import os
import sys

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL_NAME = "assess-criticality"


def check_skill_md_exists():
    """Verify SKILL.md exists and has YAML front matter."""
    skill_path = os.path.join(SKILL_DIR, "SKILL.md")
    assert os.path.isfile(skill_path), f"SKILL.md not found in {SKILL_DIR}"
    with open(skill_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert content.startswith("---"), "SKILL.md must start with YAML front matter (---)"
    parts = content.split("---", 2)
    assert len(parts) >= 3, "SKILL.md must have closing --- for YAML front matter"
    yaml_block = parts[1]
    assert "name:" in yaml_block, "YAML front matter must contain 'name:'"
    assert "description:" in yaml_block, "YAML front matter must contain 'description:'"
    print("[PASS] SKILL.md exists with valid YAML front matter")


def check_required_sections():
    """Verify SKILL.md contains all required sections."""
    skill_path = os.path.join(SKILL_DIR, "SKILL.md")
    with open(skill_path, "r", encoding="utf-8") as f:
        content = f.read()
    required_sections = [
        "## 1. Rol y Persona",
        "## 2. Intake - Informacion Requerida",
        "## 3. Flujo de Ejecucion",
        "## 4. Logica de Decision",
        "## 5. Validacion",
        "## 6. Recursos Vinculados",
        "## Common Pitfalls",
        "## Changelog",
    ]
    for section in required_sections:
        assert section in content, f"Missing required section: {section}"
    print("[PASS] All required sections present")


def check_references():
    """Verify references directory has at least one file."""
    ref_dir = os.path.join(SKILL_DIR, "references")
    assert os.path.isdir(ref_dir), "references/ directory not found"
    files = os.listdir(ref_dir)
    assert len(files) > 0, "references/ directory is empty"
    print(f"[PASS] references/ contains {len(files)} file(s)")


def check_evals():
    """Verify eval files exist and are valid JSON."""
    evals_dir = os.path.join(SKILL_DIR, "evals")
    trigger_path = os.path.join(evals_dir, "trigger-eval.json")
    evals_path = os.path.join(evals_dir, "evals.json")

    assert os.path.isfile(trigger_path), "evals/trigger-eval.json not found"
    assert os.path.isfile(evals_path), "evals/evals.json not found"

    with open(trigger_path, "r", encoding="utf-8") as f:
        trigger_data = json.load(f)
    assert "should_trigger" in trigger_data, "trigger-eval.json missing 'should_trigger'"
    assert "should_not_trigger" in trigger_data, "trigger-eval.json missing 'should_not_trigger'"
    assert len(trigger_data["should_trigger"]) >= 10, "Need at least 10 should_trigger cases"
    assert len(trigger_data["should_not_trigger"]) >= 10, "Need at least 10 should_not_trigger cases"

    with open(evals_path, "r", encoding="utf-8") as f:
        evals_data = json.load(f)
    assert isinstance(evals_data, list), "evals.json must be a JSON array"
    assert len(evals_data) >= 3, "Need at least 3 functional test cases"

    print("[PASS] Eval files valid")


def check_line_count():
    """Verify SKILL.md is under 500 lines."""
    skill_path = os.path.join(SKILL_DIR, "SKILL.md")
    with open(skill_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    assert len(lines) <= 500, f"SKILL.md has {len(lines)} lines (max 500)"
    print(f"[PASS] SKILL.md has {len(lines)} lines (within 500 limit)")


if __name__ == "__main__":
    try:
        check_skill_md_exists()
        check_required_sections()
        check_references()
        check_evals()
        check_line_count()
        print(f"\n[ALL PASS] {SKILL_NAME} skill validation complete.")
    except AssertionError as e:
        print(f"\n[FAIL] {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(2)
