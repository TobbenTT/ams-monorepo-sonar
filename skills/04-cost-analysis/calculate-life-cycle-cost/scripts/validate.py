"""
Validation script for calculate-life-cycle-cost skill.
Checks that SKILL.md conforms to VSC Skills Methodology v2 structure.
"""
import json
import re
import sys
from pathlib import Path


def validate_skill_md(skill_dir: Path) -> list[str]:
    errors = []
    skill_file = skill_dir / "SKILL.md"

    if not skill_file.exists():
        return ["SKILL.md not found"]

    content = skill_file.read_text(encoding="utf-8")

    if not content.startswith("---"):
        errors.append("Missing YAML front matter (must start with ---)")
    else:
        yaml_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if not yaml_match:
            errors.append("Malformed YAML front matter")
        else:
            yaml_content = yaml_match.group(1)
            if "name:" not in yaml_content:
                errors.append("YAML front matter missing 'name' field")
            if "description:" not in yaml_content:
                errors.append("YAML front matter missing 'description' field")
            desc_match = re.search(r'description:\s*"(.+?)"', yaml_content, re.DOTALL)
            if desc_match and len(desc_match.group(1)) > 1000:
                errors.append(f"Description exceeds 1000 chars: {len(desc_match.group(1))}")

    required_sections = [
        "# Calculate Life Cycle Cost",
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
        if section not in content:
            errors.append(f"Missing required section: {section}")

    line_count = len(content.splitlines())
    if line_count > 500:
        errors.append(f"SKILL.md exceeds 500 lines: {line_count}")

    if "Reliability Engineer" not in content:
        errors.append("Missing 'Agente destinatario: Reliability Engineer'")

    return errors


def validate_directory_structure(skill_dir: Path) -> list[str]:
    errors = []
    for subdir in ["references", "scripts", "evals"]:
        if not (skill_dir / subdir).is_dir():
            errors.append(f"Missing subdirectory: {subdir}/")
    return errors


def validate_evals(skill_dir: Path) -> list[str]:
    errors = []
    evals_dir = skill_dir / "evals"

    trigger_file = evals_dir / "trigger-eval.json"
    if trigger_file.exists():
        try:
            data = json.loads(trigger_file.read_text(encoding="utf-8"))
            if "positive" not in data or "negative" not in data:
                errors.append("trigger-eval.json missing 'positive' or 'negative' keys")
            elif len(data["positive"]) < 10 or len(data["negative"]) < 10:
                errors.append("trigger-eval.json needs at least 10 positive and 10 negative cases")
        except json.JSONDecodeError:
            errors.append("trigger-eval.json is not valid JSON")
    else:
        errors.append("Missing evals/trigger-eval.json")

    evals_file = evals_dir / "evals.json"
    if evals_file.exists():
        try:
            data = json.loads(evals_file.read_text(encoding="utf-8"))
            if not isinstance(data, list) or len(data) < 3:
                errors.append("evals.json needs at least 3 functional test cases")
        except json.JSONDecodeError:
            errors.append("evals.json is not valid JSON")
    else:
        errors.append("Missing evals/evals.json")

    return errors


def main():
    skill_dir = Path(__file__).parent.parent
    all_errors = []
    all_errors.extend(validate_directory_structure(skill_dir))
    all_errors.extend(validate_skill_md(skill_dir))
    all_errors.extend(validate_evals(skill_dir))

    if all_errors:
        print(f"VALIDATION FAILED for {skill_dir.name}:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print(f"VALIDATION PASSED for {skill_dir.name}")
        sys.exit(0)


if __name__ == "__main__":
    main()
