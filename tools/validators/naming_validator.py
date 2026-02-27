"""
Naming Convention Validator — Deterministic
Validates work package names and task descriptions.
Based on REF-07 §4 and REF-04 §8.5 (Rules T-05 through T-19, WP-05 through WP-07).
"""

import re


class NamingValidator:
    """Validates naming conventions for work packages and tasks."""

    # Valid frequency abbreviations
    VALID_FREQUENCIES = {
        "1W", "2W", "4W", "8W", "12W", "26W", "52W",
        "6M", "12M", "2Y", "3Y", "5Y",
        "500H", "1000H", "2000H", "4000H", "8000H",
    }

    # Valid trade abbreviations
    VALID_TRADES = {"MECH", "ELEC", "INST", "OPER", "CONMON", "LUBE"}

    # Valid type abbreviations
    VALID_TYPES = {"SERV", "INSP"}

    # Valid constraint abbreviations
    VALID_CONSTRAINTS = {"ON", "OFF", "TEST"}

    # Task naming patterns (REF-04 Rules T-05 to T-10, T-14)
    TASK_PATTERNS = {
        "INSPECT": re.compile(r"^Inspect .+ for .+$", re.IGNORECASE),
        "CHECK": re.compile(r"^Check .+$", re.IGNORECASE),
        "TEST": re.compile(r"^Perform .+ test of .+$", re.IGNORECASE),
        "LUBRICATE": re.compile(r"^Lubricate .+$", re.IGNORECASE),
        "REPLACE": re.compile(r"^Replace .+$", re.IGNORECASE),
        "REPAIR": re.compile(r"^Repair .+$", re.IGNORECASE),
        "CLEAN": re.compile(r"^Clean .+$", re.IGNORECASE),
        "CALIBRATE": re.compile(r"^Calibrate .+$", re.IGNORECASE),
    }

    # Words that should be action nouns, not verbs (Rule T-06)
    PREFERRED_NOUNS = {
        "leaks": "leakage",
        "blocks": "blockage",
        "breaks": "breakage",
        "cracks": "cracking",
        "corrodes": "corrosion",
        "wears": "wear",
        "overheats": "overheating",
    }

    @classmethod
    def validate_wp_name(cls, name: str) -> list[dict]:
        """
        Validate a work package name.
        Rules: WP-05 (max 40 chars), WP-06 (ALL CAPS), WP-07 (format).
        Returns list of {rule, severity, message}.
        """
        issues = []

        # WP-05: Max 40 characters
        if len(name) > 40:
            issues.append({
                "rule": "WP-05",
                "severity": "ERROR",
                "message": f"Name exceeds 40 chars ({len(name)}): '{name}'",
            })

        # WP-06: ALL CAPS
        if name != name.upper():
            issues.append({
                "rule": "WP-06",
                "severity": "WARNING",
                "message": f"Name is not ALL CAPS: '{name}'",
            })

        # WP-07: Format [FREQ] [ASSET] [LABOUR] [SERV/INSP] [ON/OFF]
        parts = name.split()
        if len(parts) < 3:
            issues.append({
                "rule": "WP-07",
                "severity": "WARNING",
                "message": f"Name has fewer than 3 parts: '{name}'",
            })
        else:
            # Check if first part looks like a frequency
            freq_pattern = re.compile(r"^\d+[WHMYD]$")
            if not freq_pattern.match(parts[0]):
                issues.append({
                    "rule": "WP-07",
                    "severity": "WARNING",
                    "message": f"First part '{parts[0]}' doesn't look like a frequency (e.g., 12W, 6M)",
                })

            # Check last part is a constraint
            if parts[-1] not in cls.VALID_CONSTRAINTS:
                issues.append({
                    "rule": "WP-07",
                    "severity": "WARNING",
                    "message": f"Last part '{parts[-1]}' is not a valid constraint ({cls.VALID_CONSTRAINTS})",
                })

        # No special characters
        if re.search(r"[^A-Z0-9 ]", name):
            issues.append({
                "rule": "WP-05",
                "severity": "ERROR",
                "message": f"Name contains special characters: '{name}'",
            })

        return issues

    @classmethod
    def validate_task_name(cls, name: str, task_type: str) -> list[dict]:
        """
        Validate a task description name.
        Rules: T-05 to T-10, T-14, T-18, T-19.
        Returns list of {rule, severity, message}.
        """
        issues = []

        # T-18: Max 72 characters for SAP
        if len(name) > 72:
            issues.append({
                "rule": "T-18",
                "severity": "ERROR",
                "message": f"Task name exceeds 72 chars ({len(name)}): '{name}'",
            })

        # T-19: Sentence case (not ALL CAPS)
        if name == name.upper() and len(name) > 3:
            issues.append({
                "rule": "T-19",
                "severity": "WARNING",
                "message": f"Task name appears to be ALL CAPS (should be sentence case): '{name}'",
            })

        # T-10: "Visually inspect" should just be "Inspect"
        if "visually inspect" in name.lower():
            issues.append({
                "rule": "T-10",
                "severity": "WARNING",
                "message": "Use 'Inspect' not 'Visually inspect'",
            })

        # Check pattern for task type
        pattern = cls.TASK_PATTERNS.get(task_type.upper())
        if pattern and not pattern.match(name):
            rule_map = {
                "INSPECT": "T-05", "CHECK": "T-07", "TEST": "T-08",
                "REPLACE": "T-14", "REPAIR": "T-14",
            }
            rule = rule_map.get(task_type.upper(), "T-05")
            issues.append({
                "rule": rule,
                "severity": "WARNING",
                "message": f"Task name doesn't follow {task_type} naming convention: '{name}'",
            })

        # T-06: Check for verb forms that should be nouns
        name_lower = name.lower()
        for verb, noun in cls.PREFERRED_NOUNS.items():
            if f" {verb}" in name_lower or name_lower.endswith(verb):
                issues.append({
                    "rule": "T-06",
                    "severity": "WARNING",
                    "message": f"Use '{noun}' instead of '{verb}' in task name",
                })

        return issues

    @classmethod
    def validate_fm_what(cls, what: str) -> list[dict]:
        """
        Validate failure mode 'what' field.
        Rules: FM-01 (capital letter), FM-02 (singular).
        """
        issues = []

        # FM-01: Must start with capital letter
        if what and not what[0].isupper():
            issues.append({
                "rule": "FM-01",
                "severity": "ERROR",
                "message": f"'what' must start with capital letter: '{what}'",
            })

        # FM-02: Must be singular (basic heuristic — ends with 's' but not 'ss')
        if what and what.endswith("s") and not what.endswith("ss") and not what.endswith("us"):
            issues.append({
                "rule": "FM-02",
                "severity": "ERROR",
                "message": f"'what' should be singular (not plural): '{what}'",
            })

        return issues
