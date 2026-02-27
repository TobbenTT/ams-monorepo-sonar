"""
Test Suite: Naming Convention Validation
Based on REF-07 §4 and REF-04 §8.5 (Rules T-05 to T-19, WP-05 to WP-07).
"""

import pytest

from tools.validators.naming_validator import NamingValidator


# ============================================================
# WORK PACKAGE NAME VALIDATION
# ============================================================

class TestWorkPackageNaming:
    def test_valid_wp_names(self):
        """All correct WP names should pass."""
        valid_names = [
            "4W SAG MILL CONMON INSP ON",
            "12W SAG MILL MECH SERV OFF",
            "1W CONV ELEC INSP ON",
            "52W PUMP INST FFI TEST",
            "26W CRUSH MECH SERV OFF",
        ]
        for name in valid_names:
            issues = NamingValidator.validate_wp_name(name)
            errors = [i for i in issues if i["severity"] == "ERROR"]
            assert len(errors) == 0, f"Unexpected ERROR for valid name: {name}"

    def test_wp05_exceeds_40_chars(self):
        """WP-05: Max 40 characters."""
        name = "12W SAG MILL PRIMARY MECHANICAL SERVICE OFFLINE"  # >40 chars
        issues = NamingValidator.validate_wp_name(name)
        wp05 = [i for i in issues if i["rule"] == "WP-05"]
        assert len(wp05) >= 1

    def test_wp06_not_all_caps(self):
        """WP-06: Must be ALL CAPS."""
        name = "4w Sag Mill Conmon Insp On"
        issues = NamingValidator.validate_wp_name(name)
        wp06 = [i for i in issues if i["rule"] == "WP-06"]
        assert len(wp06) == 1

    def test_wp07_missing_frequency(self):
        """WP-07: First part must be frequency."""
        name = "SAG MILL MECH SERV OFF"
        issues = NamingValidator.validate_wp_name(name)
        wp07 = [i for i in issues if i["rule"] == "WP-07"]
        assert len(wp07) >= 1

    def test_wp07_missing_constraint(self):
        """WP-07: Last part must be ON/OFF/TEST."""
        name = "12W SAG MILL MECH SERV"
        issues = NamingValidator.validate_wp_name(name)
        wp07 = [i for i in issues if i["rule"] == "WP-07"]
        assert len(wp07) >= 1

    def test_wp05_special_characters(self):
        """WP-05: No special characters."""
        name = "12W SAG-MILL MECH SERV OFF"
        issues = NamingValidator.validate_wp_name(name)
        wp05 = [i for i in issues if i["rule"] == "WP-05"]
        assert len(wp05) >= 1

    def test_too_few_parts(self):
        """WP-07: Minimum 3 parts."""
        name = "12W OFF"
        issues = NamingValidator.validate_wp_name(name)
        wp07 = [i for i in issues if i["rule"] == "WP-07"]
        assert len(wp07) >= 1


# ============================================================
# TASK NAME VALIDATION
# ============================================================

class TestTaskNaming:
    def test_t05_inspect_correct(self):
        """T-05: Inspect [what] for [evidence]."""
        name = "Inspect drive motor bearing for excessive vibration"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t05 = [i for i in issues if i["rule"] == "T-05"]
        assert len(t05) == 0

    def test_t05_inspect_missing_for(self):
        """T-05: Inspect without 'for' clause."""
        name = "Inspect drive motor bearing"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t05 = [i for i in issues if i["rule"] == "T-05"]
        assert len(t05) == 1

    def test_t07_check_correct(self):
        """T-07: Check [measurable value]."""
        name = "Check gearbox oil level"
        issues = NamingValidator.validate_task_name(name, "CHECK")
        t07 = [i for i in issues if i["rule"] == "T-07"]
        assert len(t07) == 0

    def test_t08_test_correct(self):
        """T-08: Perform [type] test of [MI]."""
        name = "Perform insulation resistance test of motor"
        issues = NamingValidator.validate_task_name(name, "TEST")
        t08 = [i for i in issues if i["rule"] == "T-08"]
        assert len(t08) == 0

    def test_t08_test_wrong_format(self):
        """T-08: Test without 'Perform...test of' pattern."""
        name = "Test the motor insulation"
        issues = NamingValidator.validate_task_name(name, "TEST")
        t08 = [i for i in issues if i["rule"] == "T-08"]
        assert len(t08) == 1

    def test_t10_visually_inspect(self):
        """T-10: Don't use 'Visually inspect'."""
        name = "Visually inspect motor for damage"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t10 = [i for i in issues if i["rule"] == "T-10"]
        assert len(t10) == 1

    def test_t06_use_nouns_not_verbs(self):
        """T-06: Use 'leakage' not 'leaks'."""
        name = "Inspect pump seal for leaks"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t06 = [i for i in issues if i["rule"] == "T-06"]
        assert len(t06) == 1
        assert "leakage" in t06[0]["message"]

    def test_t06_blockage_preferred(self):
        name = "Inspect strainer for blocks"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t06 = [i for i in issues if i["rule"] == "T-06"]
        assert len(t06) == 1
        assert "blockage" in t06[0]["message"]

    def test_t18_max_72_chars(self):
        """T-18: SAP max 72 characters."""
        name = "Inspect the entire drive system including all bearings and couplings for any signs of excessive vibration or misalignment"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t18 = [i for i in issues if i["rule"] == "T-18"]
        assert len(t18) == 1

    def test_t19_not_all_caps(self):
        """T-19: Task names should be sentence case."""
        name = "INSPECT DRIVE MOTOR FOR VIBRATION"
        issues = NamingValidator.validate_task_name(name, "INSPECT")
        t19 = [i for i in issues if i["rule"] == "T-19"]
        assert len(t19) == 1

    def test_t14_replace_format(self):
        """T-14: Replace [what]."""
        name = "Replace drive end bearing"
        issues = NamingValidator.validate_task_name(name, "REPLACE")
        t14 = [i for i in issues if i["rule"] == "T-14"]
        assert len(t14) == 0

    def test_lubricate_format(self):
        name = "Lubricate head end bearing"
        issues = NamingValidator.validate_task_name(name, "LUBRICATE")
        errors = [i for i in issues if i["severity"] == "ERROR"]
        assert len(errors) == 0

    def test_clean_format(self):
        name = "Clean strainer basket"
        issues = NamingValidator.validate_task_name(name, "CLEAN")
        errors = [i for i in issues if i["severity"] == "ERROR"]
        assert len(errors) == 0


# ============================================================
# FAILURE MODE 'WHAT' VALIDATION
# ============================================================

class TestFailureModeWhat:
    def test_fm01_capital_letter(self):
        """FM-01: Must start with capital letter."""
        issues = NamingValidator.validate_fm_what("bearing")
        fm01 = [i for i in issues if i["rule"] == "FM-01"]
        assert len(fm01) == 1

    def test_fm01_valid(self):
        issues = NamingValidator.validate_fm_what("Bearing")
        fm01 = [i for i in issues if i["rule"] == "FM-01"]
        assert len(fm01) == 0

    def test_fm02_singular(self):
        """FM-02: Must be singular."""
        issues = NamingValidator.validate_fm_what("Bearings")
        fm02 = [i for i in issues if i["rule"] == "FM-02"]
        assert len(fm02) == 1

    def test_fm02_singular_valid(self):
        issues = NamingValidator.validate_fm_what("Bearing")
        fm02 = [i for i in issues if i["rule"] == "FM-02"]
        assert len(fm02) == 0

    def test_fm02_words_ending_in_ss(self):
        """Words ending in 'ss' should NOT be flagged as plural."""
        issues = NamingValidator.validate_fm_what("Housing")
        fm02 = [i for i in issues if i["rule"] == "FM-02"]
        # "Housing" ends in 'g', not 's', so no issue
        assert len(fm02) == 0

    def test_fm02_words_ending_in_us(self):
        """Words ending in 'us' (like 'Apparatus') should NOT be flagged."""
        issues = NamingValidator.validate_fm_what("Apparatus")
        fm02 = [i for i in issues if i["rule"] == "FM-02"]
        assert len(fm02) == 0
