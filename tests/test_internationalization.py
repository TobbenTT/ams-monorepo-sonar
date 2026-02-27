"""
Test Suite: Internationalization (OPP-7)
Validates multilingual support (French, English, Arabic, Spanish) across all schemas.
"""

import uuid
from datetime import date, datetime

import pytest
from pydantic import ValidationError

from tools.models.schemas import (
    CaptureType,
    ComponentCategory,
    ComponentLibraryItem,
    Equipment,
    EquipmentCriticality,
    EquipmentStatus,
    FieldCaptureInput,
    Function,
    FunctionType,
    FunctionalFailure,
    FailureType,
    Language,
    LibrarySource,
    Plant,
    PlantHierarchyNode,
    NodeType,
)


class TestTrilingualFieldCapture:
    """M1: Field input must accept French, English, Arabic, and Spanish."""

    def test_french_voice_input(self):
        capture = FieldCaptureInput(
            timestamp=datetime.now(),
            technician_id="T1", technician_name="Ahmed Benali",
            capture_type=CaptureType.VOICE,
            language_detected=Language.FR,
            raw_voice_text="Le broyeur SAG fait un bruit anormal de vibration côté entraînement",
        )
        assert capture.language_detected == Language.FR
        assert "broyeur" in capture.raw_voice_text

    def test_english_text_input(self):
        capture = FieldCaptureInput(
            timestamp=datetime.now(),
            technician_id="T2", technician_name="John Smith",
            capture_type=CaptureType.TEXT,
            language_detected=Language.EN,
            raw_text_input="SAG mill drive end bearing showing high vibration",
        )
        assert capture.language_detected == Language.EN

    def test_arabic_text_input(self):
        capture = FieldCaptureInput(
            timestamp=datetime.now(),
            technician_id="T3", technician_name="محمد أمين",
            capture_type=CaptureType.TEXT,
            language_detected=Language.AR,
            raw_text_input="المطحنة تصدر ضوضاء غير عادية من جانب المحرك",
        )
        assert capture.language_detected == Language.AR
        assert "المطحنة" in capture.raw_text_input

    def test_spanish_text_input(self):
        capture = FieldCaptureInput(
            timestamp=datetime.now(),
            technician_id="T5", technician_name="Carlos García",
            capture_type=CaptureType.TEXT,
            language_detected=Language.ES,
            raw_text_input="El molino SAG presenta vibración anormal en el lado del accionamiento",
        )
        assert capture.language_detected == Language.ES
        assert "molino" in capture.raw_text_input
        # Spanish special characters preserved
        assert "í" in capture.technician_name  # García
        assert "ó" in capture.raw_text_input  # vibración

    def test_arabic_technician_name(self):
        """Arabic names must be accepted in technician_name field."""
        capture = FieldCaptureInput(
            timestamp=datetime.now(),
            technician_id="T4", technician_name="عبد الله بن سعيد",
            capture_type=CaptureType.TEXT,
            language_detected=Language.AR,
            raw_text_input="Test input",
        )
        assert "عبد الله" in capture.technician_name


class TestBilingualDescriptions:
    """All entities with _fr fields must accept French text correctly."""

    def test_plant_french_name(self):
        plant = Plant(
            plant_id="OCP-JFC1",
            name="Jorf Fertilizer Complex",
            name_fr="Complexe d'engrais de Jorf",
            name_ar="مجمع الأسمدة جرف",
        )
        assert "'" in plant.name_fr  # French apostrophe
        assert "مجمع" in plant.name_ar

    def test_equipment_french_description(self):
        eq = Equipment(
            equipment_id="EQ-001", tag="TAG-001",
            description="Slurry pump for phosphoric acid",
            description_fr="Pompe à boue pour acide phosphorique",
            equipment_type="Pump",
            criticality=EquipmentCriticality.A,
            func_loc_id="FL-001",
        )
        assert "à" in eq.description_fr  # French accent
        assert eq.description_fr != eq.description

    def test_function_french(self):
        func = Function(
            node_id="X",
            function_type=FunctionType.PRIMARY,
            description="To pump slurry at minimum 9,772 m3/Hr",
            description_fr="Pomper la boue à minimum 9 772 m3/h",
        )
        assert func.description_fr != ""
        assert "Pomper" in func.description_fr

    def test_functional_failure_french(self):
        ff = FunctionalFailure(
            function_id="X",
            failure_type=FailureType.TOTAL,
            description="Pumps 0 m3/Hr",
            description_fr="Pompe 0 m3/h",
        )
        assert ff.description_fr != ""


class TestSAPFieldsPreserveASCII:
    """SAP codes, TAGs, and part numbers must preserve exact formatting."""

    def test_tag_preserves_hyphens(self):
        eq = Equipment(
            equipment_id="EQ-SAG-001", tag="BRY-SAG-ML-001",
            description="SAG Mill", description_fr="Broyeur SAG",
            equipment_type="Mill",
            criticality=EquipmentCriticality.AA,
            func_loc_id="JFC1-MIN-BRY-01",
        )
        assert eq.tag == "BRY-SAG-ML-001"
        assert eq.func_loc_id == "JFC1-MIN-BRY-01"

    def test_sap_func_loc_format(self):
        node = PlantHierarchyNode(
            node_type=NodeType.EQUIPMENT,
            name="SAG Mill", name_fr="Broyeur SAG",
            code="BRY-SAG-ML-001", parent_node_id="parent", level=4,
            sap_func_loc="JFC1-MIN-BRY-01",
            sap_equipment_nr="000000012345",
        )
        assert node.sap_func_loc == "JFC1-MIN-BRY-01"
        assert node.sap_equipment_nr == "000000012345"


class TestSpecialCharacterHandling:
    """French accents, Arabic diacritics, and special chars must be preserved."""

    def test_french_accents_preserved(self):
        item = ComponentLibraryItem(
            name="Roulement à rotule sur rouleaux",
            code="CL-BRG-001",
            component_category=ComponentCategory.MECHANICAL,
            description="Roulement à rotule avec étanchéité intégrée - système de première qualité",
            description_fr="Roulement à rotule avec étanchéité intégrée - système de première qualité",
            source=LibrarySource.CUSTOM,
        )
        assert "à" in item.description_fr
        assert "é" in item.description_fr
        assert "è" in item.description_fr  # in première

    def test_arabic_characters_preserved(self):
        plant = Plant(
            plant_id="OCP-JFC1",
            name="Jorf Complex",
            name_fr="Complexe Jorf",
            name_ar="مجمع جرف الأسفر للأسمدة",
        )
        assert len(plant.name_ar) > 0
        # Arabic text should be right-to-left capable
        assert "مجمع" in plant.name_ar

    def test_mixed_language_description(self):
        """Technical terms in English within French descriptions."""
        func = Function(
            node_id="X",
            function_type=FunctionType.PRIMARY,
            description="To contain slurry at minimum 15 bar pressure",
            description_fr="Contenir la boue (slurry) à minimum 15 bar de pression",
        )
        # French with English technical term
        assert "slurry" in func.description_fr
        assert "bar" in func.description_fr


class TestLanguageEnumCompleteness:
    def test_all_four_languages(self):
        assert Language.FR.value == "fr"
        assert Language.EN.value == "en"
        assert Language.AR.value == "ar"
        assert Language.ES.value == "es"
        assert len(Language) == 4
