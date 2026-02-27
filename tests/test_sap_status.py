"""Tests for SAP PM Status Lifecycles — Phase 4A."""

import pytest
from tools.engines.state_machine import StateMachine, TransitionError


class TestSAPWorkOrderWorkflow:

    def test_happy_path_8_status(self):
        path = ["PLN", "FMA", "LPE", "LIB", "IMPR", "NOTP", "NOTI", "CTEC"]
        for i in range(len(path) - 1):
            assert StateMachine.validate_transition("sap_work_order", path[i], path[i + 1])

    def test_skip_fma_allowed(self):
        assert StateMachine.validate_transition("sap_work_order", "PLN", "LPE")

    def test_direct_to_noti_from_impr(self):
        assert StateMachine.validate_transition("sap_work_order", "IMPR", "NOTI")

    def test_ctec_is_terminal(self):
        valid = StateMachine.get_valid_transitions("sap_work_order", "CTEC")
        assert valid == {"CTEC"}

    def test_invalid_skip_pln_to_noti(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_work_order", "PLN", "NOTI")

    def test_invalid_backward_lib_to_pln(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_work_order", "LIB", "PLN")

    def test_all_8_states_exist(self):
        states = StateMachine.get_all_states("sap_work_order")
        assert len(states) == 8
        assert "PLN" in states
        assert "CTEC" in states


class TestSAPNotificationWorkflow:

    def test_happy_path_4_status(self):
        path = ["MEAB", "METR", "ORAS", "MECE"]
        for i in range(len(path) - 1):
            assert StateMachine.validate_transition("sap_notification", path[i], path[i + 1])

    def test_mece_is_terminal(self):
        valid = StateMachine.get_valid_transitions("sap_notification", "MECE")
        assert valid == {"MECE"}

    def test_invalid_skip_meab_to_mece(self):
        with pytest.raises(TransitionError):
            StateMachine.validate_transition("sap_notification", "MEAB", "MECE")

    def test_all_4_states_exist(self):
        states = StateMachine.get_all_states("sap_notification")
        assert len(states) == 4
