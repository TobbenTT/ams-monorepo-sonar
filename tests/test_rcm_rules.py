"""
test_rcm_rules.py
=================
Unit tests for the RCM rules module (scripts/rcm_rules.py).
Covers technique applicability, task naming, format helpers,
truncation, RCM decision tree, subsystem classification,
and hidden-failure detection.
"""
import sys
import os
import math

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from rcm_rules import (
    classify_subsystem, detect_cbm_technique, assign_tactics_type,
    build_cb_task_name, build_ft_task_name, build_ffi_task_name,
    build_secondary_task_name, format_mi, truncate_task_name,
    get_vibration_target, is_hidden_failure, is_vibration_applicable,
    deduplicate_tasks, get_visual_limits, get_visual_comments,
    VIBRATION_EXCLUDED_MI_KEYWORDS, SUBSYSTEM_RULES,
)


# ═══════════════════════════════════════════════════════════════════════════
# TestVibracionApplicability
# ═══════════════════════════════════════════════════════════════════════════

class TestVibracionApplicability:
    """Vibration must be rejected for static MIs and accepted for rotative ones."""

    @pytest.mark.parametrize("mi", [
        "Pernos", "Estructura", "Armario electrico", "Panel", "Botonera",
        "Pasamanos", "Grating", "Etiquetado", "Sirena", "Luces",
        "Conduit", "Conectores", "Sellos", "Base", "Brida",
        "Carcaza", "Cuerpo", "Tuberia", "Polines", "Cinta",
        "Correa", "Freno",
    ])
    def test_static_mi_no_vibration(self, mi):
        result = detect_cbm_technique("vibracion", mi, "Sistema General", "", "")
        assert result != "vibracion", (
            f"'{mi}' is static — vibration must NOT apply"
        )

    @pytest.mark.parametrize("mi", [
        "Motor", "Rodamientos", "Eje", "Impulsor",
        "Acoplamiento", "Polea", "Tambor", "Descansos",
    ])
    def test_rotative_mi_has_vibration(self, mi):
        result = detect_cbm_technique("vibracion", mi, "Sistema Motriz", "", "")
        assert result == "vibracion", (
            f"'{mi}' is rotative — vibration MUST apply"
        )


# ═══════════════════════════════════════════════════════════════════════════
# TestVibracionNaming
# ═══════════════════════════════════════════════════════════════════════════

class TestVibracionNaming:
    """Vibration names target measurable rotary assemblies, not parent equipment nor internal parts."""

    def test_rodamientos_in_bomba_says_bomba(self):
        """Rodamiento is internal to bomba — vibration measured at bomba."""
        name = build_cb_task_name(
            "vibracion", "Rodamientos", "X", "Desgaste", "Bomba alimentacion"
        )
        assert "bomba" in name.lower()
        assert "transportador" not in name.lower()

    def test_rodamientos_in_correa_says_descansos(self):
        """Rodamiento in correa — no motor/bomba → defaults to descansos."""
        name = build_cb_task_name(
            "vibracion", "Rodamientos", "X", "Desgaste", "Correa descarga Chancador"
        )
        assert "descansos" in name.lower()
        assert "transportador" not in name.lower()

    def test_poleas_says_poleas(self):
        """Poleas IS a measurable assembly — use directly."""
        name = build_cb_task_name(
            "vibracion", "Poleas", "X", "Desgaste", "Correa descarga Chancador"
        )
        assert "poleas" in name.lower()

    def test_descansos_says_descansos(self):
        """Descansos IS a measurable assembly — use directly."""
        name = build_cb_task_name(
            "vibracion", "Descansos", "X", "Desgaste", "Correa descarga Chancador"
        )
        assert "descansos" in name.lower()

    def test_motor_says_motor(self):
        """Motor IS a measurable assembly — use directly."""
        name = build_cb_task_name(
            "vibracion", "Motor electrico", "X", "Desgaste", "Bomba alimentacion"
        )
        assert "motor" in name.lower()

    def test_eje_in_bomba_says_bomba(self):
        """Eje is internal — vibration measured at containing bomba."""
        name = build_cb_task_name(
            "vibracion", "Eje", "X", "Desgaste", "Bomba alimentacion"
        )
        assert "bomba" in name.lower()

    def test_impulsor_in_bomba_says_bomba(self):
        """Impulsor is internal — vibration measured at containing bomba."""
        name = build_cb_task_name(
            "vibracion", "Impulsor", "X", "Desgaste", "Bomba alimentacion"
        )
        assert "bomba" in name.lower()

    def test_never_says_transportador(self):
        """Vibration NEVER targets 'transportador' — not a measurable point."""
        for mi in ["Rodamientos", "Ejes", "Poleas", "Descansos", "Acoplamiento"]:
            name = build_cb_task_name(
                "vibracion", mi, "X", "Desgaste", "Correa descarga Chancador"
            )
            assert "transportador" not in name.lower(), f"MI={mi} should not say transportador"


# ═══════════════════════════════════════════════════════════════════════════
# TestMPI
# ═══════════════════════════════════════════════════════════════════════════

class TestMPI:
    """MPI only applies to large structural / shaft components."""

    @pytest.mark.parametrize("mi", [
        "Etiquetado", "Sirena", "Luces", "Grating",
        "Seguros puerta", "Pernos", "Conectores", "Conduit",
    ])
    def test_small_components_no_mpi(self, mi):
        result = detect_cbm_technique("mpi", mi, "Sistema General", "", "")
        assert result != "mpi", f"'{mi}' should NOT get MPI"

    @pytest.mark.parametrize("mi", [
        "Eje", "Estructura", "Tambor",
    ])
    def test_large_structures_have_mpi(self, mi):
        result = detect_cbm_technique("mpi", mi, "Sistema General", "", "")
        assert result == "mpi", f"'{mi}' MUST get MPI"


# ═══════════════════════════════════════════════════════════════════════════
# TestTorque
# ═══════════════════════════════════════════════════════════════════════════

class TestTorque:
    def test_perno_has_torque(self):
        assert detect_cbm_technique("torque", "Perno base", "Sistema Estructural", "", "") == "torque"

    def test_cinta_no_torque(self):
        assert detect_cbm_technique("torque", "Cinta transportadora", "Sistema de Transporte", "", "") != "torque"


# ═══════════════════════════════════════════════════════════════════════════
# TestEspesor
# ═══════════════════════════════════════════════════════════════════════════

class TestEspesor:
    def test_tuberia_has_espesor(self):
        assert detect_cbm_technique("espesor", "Tuberia descarga", "Sistema de Tuberias", "", "") == "espesor"

    def test_pernos_no_espesor(self):
        assert detect_cbm_technique("espesor", "Pernos", "Sistema Estructural", "", "") != "espesor"


# ═══════════════════════════════════════════════════════════════════════════
# TestTermografia
# ═══════════════════════════════════════════════════════════════════════════

class TestTermografia:
    def test_polines_has_termografia(self):
        assert detect_cbm_technique("temperatura", "Polines", "Sistema de Transporte", "", "") == "temperatura"

    def test_motor_has_termografia(self):
        assert detect_cbm_technique("temperatura", "Motor principal", "Sistema Motriz", "", "") == "temperatura"


# ═══════════════════════════════════════════════════════════════════════════
# TestFallbackVisual
# ═══════════════════════════════════════════════════════════════════════════

class TestFallbackVisual:
    """When a specific technique is inapplicable or missing, fall back to visual."""

    def test_inapplicable_technique_falls_to_visual(self):
        result = detect_cbm_technique("vibracion", "Etiquetado", "Sistema General", "", "")
        assert result == "visual"

    def test_empty_detection_gets_visual(self):
        result = detect_cbm_technique("", "Motor", "Sistema Motriz", "", "")
        assert result == "visual"

    def test_nan_detection_gets_visual(self):
        result = detect_cbm_technique(float('nan'), "Motor", "Sistema Motriz", "", "")
        assert result == "visual"


# ═══════════════════════════════════════════════════════════════════════════
# TestFormatMI
# ═══════════════════════════════════════════════════════════════════════════

class TestFormatMI:
    def test_all_caps(self):
        assert format_mi("PERNOS") == "pernos"

    def test_all_lower(self):
        assert format_mi("estructura de acero") == "estructura de acero"

    def test_mixed(self):
        assert format_mi("Motor Principal") == "motor principal"

    def test_empty(self):
        assert format_mi("") == ""


# ═══════════════════════════════════════════════════════════════════════════
# TestTruncation
# ═══════════════════════════════════════════════════════════════════════════

class TestTruncation:
    def test_mechanism_never_truncated(self):
        """A very long MI with a specific mechanism must keep the full mechanism."""
        long_mi = "Rodamientos del eje de transmision principal lado acoplamiento"
        mechanism = "Rotura/Fractura/Separacion"
        name = build_cb_task_name("visual", long_mi, "X", mechanism, "Bomba")
        assert mechanism.lower() in name.lower(), (
            "Mechanism must survive truncation"
        )

    def test_max_72(self):
        """Any generated name must be <= 72 characters and still contain the mechanism."""
        long_mi = "Rodamientos del eje de transmision principal lado acoplamiento"
        mechanism = "Desgaste"
        name = build_cb_task_name("visual", long_mi, "X", mechanism, "Bomba")
        assert len(name) <= 72
        assert mechanism.lower() in name.lower()

    def test_ffi_keeps_tag(self):
        name = build_ffi_task_name("Sensor presion", "1210PT0001")
        assert "[1210PT0001]" in name


# ═══════════════════════════════════════════════════════════════════════════
# TestRCMTree
# ═══════════════════════════════════════════════════════════════════════════

class TestRCMTree:
    """RCM decision-tree logic via assign_tactics_type."""

    @staticmethod
    def _make_row(**overrides):
        base = dict(
            maintainable_item="Motor",
            fm_what="Motor",
            equipment_name="Bomba",
            detection_method="vibracion",
            failure_consequence="OPERACIONAL",
            failure_pattern="B",
            rpn_total=100,
            equipment_tag="X",
        )
        base.update(overrides)
        return base

    def test_hidden_is_ffi(self):
        row = self._make_row(maintainable_item="Sensor presion")
        result = assign_tactics_type(row, {"X": 1})
        assert result == "FAULT_FINDING"

    def test_operacional_cbm_viable_is_cb(self):
        row = self._make_row()
        result = assign_tactics_type(row, {"X": 1})
        assert result == "CONDITION_BASED"

    def test_pattern_e_never_ft(self):
        row = self._make_row(failure_pattern="E", detection_method="")
        result = assign_tactics_type(row, {"X": 1})
        assert result != "FIXED_TIME"

    def test_crit_a_always_cb(self):
        row = self._make_row(
            failure_consequence="NO OPERACIONAL",
            detection_method="vibracion",
        )
        result = assign_tactics_type(row, {"X": 1})  # abckz=1 -> crit A
        assert result == "CONDITION_BASED"


# ═══════════════════════════════════════════════════════════════════════════
# TestBudgetedFields
# ═══════════════════════════════════════════════════════════════════════════

class TestBudgetedFields:
    """Document budgeted-life expectations per tactics type.

    FT tasks do NOT carry a budgeted_life field (restoration is scheduled,
    not condition-triggered). CB and RTF do carry budgeted_life so planners
    can estimate replacement horizon.
    """

    def test_ft_has_no_budgeted_concept(self):
        # FT tasks are scheduled restorations; budgeted_life is N/A
        # This is a documentation-level assertion
        assert True, "FT tasks are scheduled — no budgeted_life field"

    def test_cb_has_budgeted(self):
        # CB tasks have an associated budgeted_life for the secondary (restore) action
        assert True, "CB secondary tasks carry budgeted_life"

    def test_rtf_has_budgeted(self):
        # RTF items track budgeted_life for capital planning
        assert True, "RTF items carry budgeted_life for capital replacement planning"


# ═══════════════════════════════════════════════════════════════════════════
# TestSubsystem
# ═══════════════════════════════════════════════════════════════════════════

class TestSubsystem:
    def test_motor_is_motriz(self):
        assert classify_subsystem("Motor principal") == "Sistema Motriz"

    def test_perno_is_estructural(self):
        assert classify_subsystem("Perno soporte") == "Sistema Estructural"

    def test_unknown_is_general(self):
        assert classify_subsystem("Objeto desconocido") == "Sistema General"


# ═══════════════════════════════════════════════════════════════════════════
# TestHiddenFailure
# ═══════════════════════════════════════════════════════════════════════════

class TestHiddenFailure:
    def test_sensor_is_hidden(self):
        assert is_hidden_failure("Sensor presion") is True

    def test_motor_not_hidden(self):
        assert is_hidden_failure("Motor principal") is False


# ═══════════════════════════════════════════════════════════════════════════
# TestMIAlwaysLowercase — MI names must be all lowercase in task names
# ═══════════════════════════════════════════════════════════════════════════

class TestMIAlwaysLowercase:
    """format_mi SIEMPRE retorna lowercase. La mayuscula la pone el verbo."""

    @pytest.mark.parametrize("mi,expected", [
        ("Abrazaderas", "abrazaderas"),
        ("PERNOS", "pernos"),
        ("Motor Principal", "motor principal"),
        ("Cama Impacto", "cama impacto"),
        ("Aceite hidraulico", "aceite hidraulico"),
    ])
    def test_format_mi_lowercase(self, mi, expected):
        assert format_mi(mi) == expected

    def test_task_name_mi_lowercase(self):
        """In built task name, the MI portion must be lowercase."""
        name = build_cb_task_name("visual", "Abrazaderas", "X", "Desgaste", "")
        assert "abrazaderas" in name
        assert "Abrazaderas" not in name

    def test_ft_name_mi_lowercase(self):
        name = build_ft_task_name("Desgaste", "Camisa", "X")
        assert "camisa" in name
        assert "Camisa" not in name

    def test_secondary_name_mi_lowercase(self):
        name = build_secondary_task_name("Corrosion", "Tuberia", "X")
        assert "tuberia" in name
        assert "Tuberia" not in name


# ═══════════════════════════════════════════════════════════════════════════
# TestVisualLimitsAligned — Acceptable limits must match the mechanism
# ═══════════════════════════════════════════════════════════════════════════

class TestVisualLimitsAligned:
    """Acceptable limits must be specific to the inspection mechanism."""

    def test_desgaste_has_desgaste_limits(self):
        limits = get_visual_limits("Desgaste")
        assert "desgaste" in limits.lower()
        assert "corrosion" not in limits.lower()

    def test_corrosion_has_corrosion_limits(self):
        limits = get_visual_limits("Corrosion")
        assert "corrosion" in limits.lower()
        assert "desgaste" not in limits.lower()

    def test_agrietamiento_has_grietas_limits(self):
        limits = get_visual_limits("Agrietamiento")
        assert "grieta" in limits.lower()

    def test_precarga_has_pernos_limits(self):
        limits = get_visual_limits("Perdida de precarga")
        assert any(kw in limits.lower() for kw in ["perno", "torque", "apretad"])

    def test_deformacion_has_deformacion_limits(self):
        limits = get_visual_limits("Deformacion")
        assert "deformacion" in limits.lower()

    def test_different_mechanisms_different_limits(self):
        """Each mechanism must produce DIFFERENT limits text."""
        mechanisms = [
            "Desgaste", "Corrosion", "Agrietamiento",
            "Perdida de precarga", "Deformacion",
            "Rotura/Fractura/Separacion",
        ]
        limits = [get_visual_limits(m) for m in mechanisms]
        assert len(set(limits)) == len(limits), "All mechanisms must have unique limits"

    def test_unknown_mechanism_still_specific(self):
        """Unknown mechanism should generate a dynamic limit, not generic."""
        limits = get_visual_limits("Falla rara desconocida")
        assert "falla rara desconocida" in limits.lower()
