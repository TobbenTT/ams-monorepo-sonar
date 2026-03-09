"""Navigation tests — validate React frontend pages and API module.

Verifies that:
1. Each React page file exists on disk
2. Core React components exist
3. The api.js module exists with correct structure
4. Frontend config files are present
"""

from pathlib import Path

import pytest


# All 11 React page modules
REACT_PAGES = [
    "Dashboard.jsx",
    "Hierarchy.jsx",
    "Criticality.jsx",
    "FMEA.jsx",
    "WorkPackages.jsx",
    "Planning.jsx",
    "FieldCapture.jsx",
    "Analytics.jsx",
    "RCA.jsx",
    "Reports.jsx",
    "Admin.jsx",
]

REACT_COMPONENTS = [
    "Sidebar.jsx",
    "Header.jsx",
    "Shared.jsx",
    "Toast.jsx",
    "ConfirmDialog.jsx",
    "ErrorBoundary.jsx",
]


# ════════════════════════════════════════════════════════════════════════
# SECTION 1: REACT PAGE FILES EXIST
# ════════════════════════════════════════════════════════════════════════

class TestReactPageFilesExist:

    @pytest.mark.parametrize("filename", REACT_PAGES)
    def test_page_file_exists(self, filename):
        page_path = Path("frontend/src/pages") / filename
        assert page_path.exists(), f"Page file missing: {page_path}"

    def test_total_page_count(self):
        pages_dir = Path("frontend/src/pages")
        page_files = sorted(pages_dir.glob("*.jsx"))
        assert len(page_files) == 23, f"Expected 23 pages, found {len(page_files)}"


# ════════════════════════════════════════════════════════════════════════
# SECTION 2: REACT COMPONENT FILES EXIST
# ════════════════════════════════════════════════════════════════════════

class TestReactComponentFilesExist:

    @pytest.mark.parametrize("filename", REACT_COMPONENTS)
    def test_component_file_exists(self, filename):
        comp_path = Path("frontend/src/components") / filename
        assert comp_path.exists(), f"Component file missing: {comp_path}"


# ════════════════════════════════════════════════════════════════════════
# SECTION 3: CORE FRONTEND FILES
# ════════════════════════════════════════════════════════════════════════

class TestCoreFrontendFiles:

    def test_main_jsx_exists(self):
        assert Path("frontend/src/main.jsx").exists()

    def test_app_jsx_exists(self):
        assert Path("frontend/src/App.jsx").exists()

    def test_api_module_exists(self):
        assert Path("frontend/src/api.js").exists()

    def test_index_css_exists(self):
        assert Path("frontend/src/index.css").exists()

    def test_index_html_exists(self):
        assert Path("frontend/index.html").exists()

    def test_vite_config_exists(self):
        assert Path("frontend/vite.config.js").exists()

    def test_package_json_exists(self):
        assert Path("frontend/package.json").exists()

    def test_dockerfile_exists(self):
        assert Path("frontend/Dockerfile").exists()


# ════════════════════════════════════════════════════════════════════════
# SECTION 4: API MODULE COMPLETENESS (check api.js has key exports)
# ════════════════════════════════════════════════════════════════════════

class TestAPIModuleCompleteness:

    @pytest.fixture(autouse=True)
    def _load_api_source(self):
        self.source = Path("frontend/src/api.js").read_text(encoding="utf-8")

    @pytest.mark.parametrize("func_name", [
        "listPlants", "listNodes", "getNode",
        "assessCriticality", "approveCriticality",
        "listFunctions", "createFunction",
        "listWorkPackages", "approveWorkPackage",
        "submitCapture", "listWorkRequests",
        "getExecutiveDashboard", "getKpiSummary",
        "generateRecommendation",
        "createRca", "listRcas",
        "seedDatabase", "getStats",
        "exportData", "healthCheck",
    ])
    def test_api_function_exists(self, func_name):
        assert f"export" in self.source and func_name in self.source, \
            f"api.js missing function: {func_name}"
