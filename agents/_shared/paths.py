# agents/_shared/paths.py
"""Path resolution for the two-folder VSC AMS architecture.

ASSET-MANAGEMENT-SOFTWARE (this repo): system code, agents, skills, engines
ASSET-MANAGEMENT-SOFTWARE-CLIENT (sibling): client data, project inputs/outputs/state

Layout on disk:
  {PRODUCT_ROOT}/ASSET-MANAGEMENT-SOFTWARE/          <-- this repo
  {PRODUCT_ROOT}/ASSET-MANAGEMENT-SOFTWARE-CLIENT/   <-- client data
"""

import logging
import os
import re
from pathlib import Path

logger = logging.getLogger(__name__)

# Environment variable overrides for testing and CI
_ENV_CLIENT_ROOT = "AMS_CLIENT_ROOT"
_ENV_SYSTEM_ROOT = "AMS_SYSTEM_ROOT"

# Sibling folder name (relative to the parent of AMS)
_CLIENT_FOLDER_NAME = "ASSET-MANAGEMENT-SOFTWARE-CLIENT"

# Slug validation pattern: lowercase alphanumeric with hyphens
_SLUG_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")

# Input subdirectory names (numbered convention)
INPUT_SUBDIRS = (
    "00-scope",
    "01-equipment-list",
    "02-failure-history",
    "03-existing-maintenance",
    "04-spare-parts",
    "05-shutdown-calendar",
    "06-workforce",
    "07-standards",
    "08-interviews",
    "09-vendor-docs",
    "10-proposal",
)

# Project subdirectory names
PROJECT_SUBDIRS = (
    "0-input",
    "1-output",
    "2-state",
    "3-memory",
    "4-intent-specs",
    "5-templates",
)


# ---------------------------------------------------------------------------
# Slug validation
# ---------------------------------------------------------------------------


def _validate_slug(value: str, label: str = "slug") -> None:
    """Validate a slug against the allowed pattern.

    Raises ValueError if the slug is invalid or could enable path traversal.
    """
    if not value:
        raise ValueError(f"{label} must not be empty")
    if ".." in value or "/" in value or "\\" in value:
        raise ValueError(f"{label} contains path traversal characters: {value!r}")
    if not _SLUG_PATTERN.match(value):
        raise ValueError(
            f"{label} must match pattern [a-z0-9][a-z0-9-]*: {value!r}"
        )


# ---------------------------------------------------------------------------
# Root resolution
# ---------------------------------------------------------------------------


def get_system_root() -> Path:
    """Return the root of the ASSET-MANAGEMENT-SOFTWARE repository.

    Resolution order:
    1. AMS_SYSTEM_ROOT environment variable (for CI/testing)
    2. Walk up from this file to find the repo root
       (this file is at agents/_shared/paths.py, so root is ../../..)
    """
    env_root = os.environ.get(_ENV_SYSTEM_ROOT)
    if env_root:
        return Path(env_root).resolve()
    # agents/_shared/paths.py -> agents/_shared -> agents -> AMS root
    return Path(__file__).resolve().parent.parent.parent


def get_client_root() -> Path:
    """Return the root of the ASSET-MANAGEMENT-SOFTWARE-CLIENT folder.

    Resolution order:
    1. AMS_CLIENT_ROOT environment variable (for CI/testing)
    2. Sibling of AMS: ../ASSET-MANAGEMENT-SOFTWARE-CLIENT/
    """
    env_root = os.environ.get(_ENV_CLIENT_ROOT)
    if env_root:
        return Path(env_root).resolve()
    return get_system_root().parent / _CLIENT_FOLDER_NAME


# ---------------------------------------------------------------------------
# Project access
# ---------------------------------------------------------------------------


def get_project_root(client_slug: str, project_slug: str) -> Path:
    """Return the root of a specific client project.

    Example: get_project_root("ocp", "jfc-maintenance-strategy")
    -> .../ASSET-MANAGEMENT-SOFTWARE-CLIENT/clients/ocp/projects/jfc-maintenance-strategy/
    """
    _validate_slug(client_slug, "client_slug")
    _validate_slug(project_slug, "project_slug")
    return get_client_root() / "clients" / client_slug / "projects" / project_slug


def get_client_context_dir(client_slug: str) -> Path:
    """Return the client-level context directory (shared across projects).

    Example: get_client_context_dir("ocp")
    -> .../ASSET-MANAGEMENT-SOFTWARE-CLIENT/clients/ocp/context/
    """
    _validate_slug(client_slug, "client_slug")
    return get_client_root() / "clients" / client_slug / "context"


# ---------------------------------------------------------------------------
# Project subdirectory accessors (numbered convention)
# ---------------------------------------------------------------------------


def get_input_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 0-input/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "0-input"


def get_output_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 1-output/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "1-output"


def get_state_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 2-state/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "2-state"


def get_memory_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 3-memory/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "3-memory"


def get_intent_specs_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 4-intent-specs/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "4-intent-specs"


def get_templates_dir(client_slug: str, project_slug: str) -> Path:
    """Return the 5-templates/ directory for a project."""
    return get_project_root(client_slug, project_slug) / "5-templates"


# ---------------------------------------------------------------------------
# Input subdirectory accessors
# ---------------------------------------------------------------------------


def get_scope_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/00-scope/."""
    return get_input_dir(client_slug, project_slug) / "00-scope"


def get_equipment_list_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/01-equipment-list/."""
    return get_input_dir(client_slug, project_slug) / "01-equipment-list"


def get_failure_history_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/02-failure-history/."""
    return get_input_dir(client_slug, project_slug) / "02-failure-history"


def get_existing_maintenance_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/03-existing-maintenance/."""
    return get_input_dir(client_slug, project_slug) / "03-existing-maintenance"


def get_spare_parts_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/04-spare-parts/."""
    return get_input_dir(client_slug, project_slug) / "04-spare-parts"


def get_shutdown_calendar_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/05-shutdown-calendar/."""
    return get_input_dir(client_slug, project_slug) / "05-shutdown-calendar"


def get_workforce_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/06-workforce/."""
    return get_input_dir(client_slug, project_slug) / "06-workforce"


def get_standards_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/07-standards/."""
    return get_input_dir(client_slug, project_slug) / "07-standards"


def get_interviews_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/08-interviews/."""
    return get_input_dir(client_slug, project_slug) / "08-interviews"


def get_vendor_docs_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/09-vendor-docs/."""
    return get_input_dir(client_slug, project_slug) / "09-vendor-docs"


def get_proposal_dir(client_slug: str, project_slug: str) -> Path:
    """Return 0-input/10-proposal/."""
    return get_input_dir(client_slug, project_slug) / "10-proposal"


# ---------------------------------------------------------------------------
# State file accessors
# ---------------------------------------------------------------------------


def get_agent_state_file(
    client_slug: str, project_slug: str, agent_name: str
) -> Path:
    """Return the state file path for a specific agent.

    -> .../2-state/{agent_name}-state.md
    """
    return get_state_dir(client_slug, project_slug) / f"{agent_name}-state.md"


def get_session_file(client_slug: str, project_slug: str) -> Path:
    """Return the session state JSON file path.

    -> .../2-state/session-state.json
    """
    return get_state_dir(client_slug, project_slug) / "session-state.json"


def get_gates_file(client_slug: str, project_slug: str) -> Path:
    """Return the gates JSON file path.

    -> .../2-state/gates.json
    """
    return get_state_dir(client_slug, project_slug) / "gates.json"


def get_checkpoint_dir(client_slug: str, project_slug: str) -> Path:
    """Return the checkpoint directory within 2-state/.

    -> .../2-state/checkpoints/
    """
    return get_state_dir(client_slug, project_slug) / "checkpoints"


# ---------------------------------------------------------------------------
# Client-level directories (shared across projects)
# ---------------------------------------------------------------------------


def get_client_templates_dir(client_slug: str) -> Path:
    """Return the client-level templates directory.

    Contains default branding, logo, and document templates for the client.
    Project-level 5-templates/ can override these defaults.

    -> .../clients/{slug}/context/templates/
    """
    return get_client_context_dir(client_slug) / "templates"


def get_client_memory_dir(client_slug: str) -> Path:
    """Return the client-level memory directory.

    Stores cross-project knowledge: strategic objectives, culture, glossary.

    -> .../clients/{slug}/context/memory/
    """
    return get_client_context_dir(client_slug) / "memory"


def get_meetings_dir(client_slug: str, project_slug: str) -> Path:
    """Return the meetings directory within 3-memory/.

    -> .../3-memory/meetings/
    """
    return get_memory_dir(client_slug, project_slug) / "meetings"


# ---------------------------------------------------------------------------
# Configuration loaders
# ---------------------------------------------------------------------------


def load_project_config(client_slug: str, project_slug: str) -> dict | None:
    """Load and parse project.yaml for a project.

    Returns the parsed YAML dict, or None if not found or invalid.
    """
    project_yaml = get_project_root(client_slug, project_slug) / "project.yaml"
    if not project_yaml.is_file():
        logger.warning("project.yaml not found at %s", project_yaml)
        return None
    try:
        import yaml

        with open(project_yaml, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        if not isinstance(config, dict):
            logger.warning("project.yaml at %s is not a valid YAML dict", project_yaml)
            return None
        return config
    except Exception as exc:
        logger.warning("Failed to load project.yaml from %s: %s", project_yaml, exc)
        return None


# ---------------------------------------------------------------------------
# Branding & Templates (3-level cascade)
# ---------------------------------------------------------------------------


def get_template_path(
    template_name: str,
    client_slug: str,
    project_slug: str,
) -> Path | None:
    """Resolve a template file using 3-level cascade.

    Resolution order:
    1. Project-level: 5-templates/{template_name}
    2. Client-level: context/templates/{template_name}
    3. System-level: AMS/templates/{template_name}

    Returns the resolved Path, or None if the template is not found anywhere.

    Raises ValueError if template_name contains path traversal characters.
    """
    if not template_name:
        raise ValueError("template_name must not be empty")
    if ".." in template_name or "/" in template_name or "\\" in template_name:
        raise ValueError(
            f"template_name contains path traversal characters: {template_name!r}"
        )

    # Level 1: Project-specific
    project_path = get_templates_dir(client_slug, project_slug) / template_name
    if project_path.is_file():
        return project_path

    # Level 2: Client-level
    client_path = get_client_templates_dir(client_slug) / template_name
    if client_path.is_file():
        return client_path

    # Level 3: System-level (fallback)
    system_path = get_system_root() / "templates" / template_name
    if system_path.is_file():
        return system_path

    return None


def get_branding_config(client_slug: str, project_slug: str) -> dict | None:
    """Load branding.yaml with 3-level cascade resolution.

    Resolution order:
    1. Project-level: 5-templates/branding.yaml
    2. Client-level: context/templates/branding.yaml
    3. System-level: AMS/templates/branding.yaml

    Returns the parsed YAML dict, or None if no branding found anywhere.
    """
    import yaml

    # Level 1: Project-specific
    project_branding = get_templates_dir(client_slug, project_slug) / "branding.yaml"
    if project_branding.is_file():
        try:
            with open(project_branding, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as exc:
            logger.warning("Failed to load branding from %s: %s", project_branding, exc)

    # Level 2: Client-level
    client_branding = get_client_templates_dir(client_slug) / "branding.yaml"
    if client_branding.is_file():
        try:
            with open(client_branding, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as exc:
            logger.warning("Failed to load branding from %s: %s", client_branding, exc)

    # Level 3: System-level
    system_branding = get_system_root() / "templates" / "branding.yaml"
    if system_branding.is_file():
        try:
            with open(system_branding, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as exc:
            logger.warning("Failed to load branding from %s: %s", system_branding, exc)

    return None


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def validate_project_structure(client_slug: str, project_slug: str) -> list[str]:
    """Validate that a project has the expected 6-folder structure.

    Returns a list of missing directory names (empty list if valid).
    """
    root = get_project_root(client_slug, project_slug)
    return [d for d in PROJECT_SUBDIRS if not (root / d).is_dir()]


def validate_input_structure(client_slug: str, project_slug: str) -> list[str]:
    """Validate that 0-input/ has all 11 expected subdirectories.

    Returns a list of missing subdirectory names (empty list if valid).
    """
    input_dir = get_input_dir(client_slug, project_slug)
    return [d for d in INPUT_SUBDIRS if not (input_dir / d).is_dir()]


def validate_client_root_exists() -> bool:
    """Check if the ASSET-MANAGEMENT-SOFTWARE-CLIENT folder is accessible."""
    return get_client_root().is_dir()


def scaffold_project(client_slug: str, project_slug: str) -> Path:
    """Create the full project directory structure.

    Creates all 6 project subdirectories and 11 input subdirectories.
    Returns the project root path.
    """
    root = get_project_root(client_slug, project_slug)

    # Create project subdirectories
    for subdir in PROJECT_SUBDIRS:
        (root / subdir).mkdir(parents=True, exist_ok=True)

    # Create input subdirectories
    input_dir = root / "0-input"
    for subdir in INPUT_SUBDIRS:
        (input_dir / subdir).mkdir(parents=True, exist_ok=True)

    # Create client context directories
    get_client_templates_dir(client_slug).mkdir(parents=True, exist_ok=True)
    get_client_memory_dir(client_slug).mkdir(parents=True, exist_ok=True)

    return root


# ---------------------------------------------------------------------------
# Intent profile loading
# ---------------------------------------------------------------------------


def load_intent_profile(client_slug: str, project_slug: str) -> dict | None:
    """Load and parse intent-profile.yaml for a project.

    Returns the parsed YAML dict, or None if not found (graceful fallback
    to legacy v3.1 mode without intent constraints).
    """
    import yaml

    path = get_intent_specs_dir(client_slug, project_slug) / "intent-profile.yaml"
    if not path.is_file():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            profile = yaml.safe_load(f)
        if not isinstance(profile, dict):
            logger.warning("Intent profile at %s is not a valid YAML dict", path)
            return None
        is_valid, warnings = validate_intent_profile(profile)
        for w in warnings:
            logger.warning("Intent profile %s: %s", path, w)
        if not is_valid:
            return None
        return profile
    except Exception as exc:
        logger.warning("Failed to load intent profile from %s: %s", path, exc)
        return None


def validate_intent_profile(profile: dict) -> tuple[bool, list[str]]:
    """Validate intent profile schema compliance.

    Returns (is_valid, warnings). Invalid if intent_summary is missing
    or lacks required fields.
    """
    warnings: list[str] = []
    if "intent_summary" not in profile:
        warnings.append("Missing required section: intent_summary")
        return False, warnings

    summary = profile["intent_summary"]
    if not isinstance(summary, dict):
        warnings.append("intent_summary must be a dict")
        return False, warnings

    for field in ("client", "project", "trade_off_priority"):
        if field not in summary:
            warnings.append(f"intent_summary missing required field: {field}")

    has_errors = any("required" in w for w in warnings)
    return not has_errors, warnings


def get_intent_domain(profile: dict, domain: str) -> dict | None:
    """Extract domain-specific intent from profile.

    Args:
        profile: The loaded intent profile dict.
        domain: Domain name (e.g., 'reliability', 'planning', 'spare_parts').

    Returns the domain-specific intent dict, or None if not found.
    """
    domain_intent = profile.get("domain_intent", {})
    if not isinstance(domain_intent, dict):
        return None
    return domain_intent.get(domain)
