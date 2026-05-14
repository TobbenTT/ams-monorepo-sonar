# agents/_shared/loader.py
"""Carga dinámica de agentes desde su carpeta.

Provee funciones de conveniencia para cargar agentes por nombre
y para obtener la lista completa de skills de un agente.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from agents._shared.base import Agent, AgentConfig, SkillContent


# ---------------------------------------------------------------------------
# Directorio raíz de agentes
# ---------------------------------------------------------------------------

AGENTS_ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Loader principal
# ---------------------------------------------------------------------------

def load_agent(agent_name: str) -> Agent:
    """Carga un agente por nombre de carpeta.

    Args:
        agent_name: Nombre de la carpeta del agente (ej: "reliability").

    Returns:
        Instancia de Agent configurada.

    Raises:
        FileNotFoundError: Si la carpeta o el config.py no existen.
    """
    agent_dir = AGENTS_ROOT / agent_name

    if not agent_dir.exists():
        raise FileNotFoundError(f"Agent directory not found: {agent_dir}")

    config_path = agent_dir / "config.py"
    if not config_path.exists():
        raise FileNotFoundError(f"Agent config.py not found: {config_path}")

    # Importar dinámicamente el factory del agente
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        f"agents.{agent_name}.config", config_path
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Buscar la función factory (create_{agent_name}_agent)
    factory_name = f"create_{agent_name.replace('-', '_')}_agent"
    factory = getattr(module, factory_name, None)

    if factory is None:
        # Fallback: buscar cualquier función que empiece con "create_"
        for attr_name in dir(module):
            if attr_name.startswith("create_") and attr_name.endswith("_agent"):
                factory = getattr(module, attr_name)
                break

    if factory is None:
        raise AttributeError(
            f"No factory function found in {config_path}. "
            f"Expected: {factory_name}()"
        )

    return factory()


def load_skills_for_agent(
    agent_name: str,
    milestone: int | None = None,
) -> list[SkillContent]:
    """Carga los skills de un agente, opcionalmente filtrados por milestone.

    Args:
        agent_name: Nombre de la carpeta del agente.
        milestone: Si se especifica, filtra skills por este milestone.

    Returns:
        Lista de SkillContent cargados.
    """
    agent_dir = AGENTS_ROOT / agent_name
    skills_path = agent_dir / "skills.yaml"

    if not skills_path.exists():
        return []

    skills_config = yaml.safe_load(
        skills_path.read_text(encoding="utf-8")
    )

    results: list[SkillContent] = []

    for skill in skills_config.get("skills", []):
        skill_milestone = skill.get("milestone")

        if milestone is not None:
            if skill_milestone != milestone and skill_milestone != "all":
                continue

        results.append(
            SkillContent(
                name=skill["name"],
                path=skill["path"],
                mandatory=skill.get("mandatory", False),
                milestone=skill.get("milestone", 0),
            )
        )

    return results


def list_all_agents() -> list[str]:
    """Devuelve los nombres de todos los agentes registrados (carpetas con CLAUDE.md)."""
    agents: list[str] = []

    for item in sorted(AGENTS_ROOT.iterdir()):
        if item.is_dir() and not item.name.startswith("_"):
            claude_md = item / "CLAUDE.md"
            if claude_md.exists():
                agents.append(item.name)

    return agents


def get_agent_skills_summary(agent_name: str) -> dict[str, Any]:
    """Devuelve un resumen de los skills de un agente.

    Returns:
        Dict con claves: agent, model, total_skills, mandatory_skills,
        optional_skills, milestones, skills_list.
    """
    agent_dir = AGENTS_ROOT / agent_name
    skills_path = agent_dir / "skills.yaml"

    if not skills_path.exists():
        return {"agent": agent_name, "total_skills": 0}

    skills_config = yaml.safe_load(
        skills_path.read_text(encoding="utf-8")
    )

    skills_list = skills_config.get("skills", [])
    mandatory = [s for s in skills_list if s.get("mandatory", False)]
    optional = [s for s in skills_list if not s.get("mandatory", False)]
    milestones = sorted(
        {s["milestone"] for s in skills_list if s.get("milestone") != "all"}
    )

    return {
        "agent": agent_name,
        "model": skills_config.get("model", "unknown"),
        "total_skills": len(skills_list),
        "mandatory_skills": len(mandatory),
        "optional_skills": len(optional),
        "milestones": milestones,
        "skills_list": [s["name"] for s in skills_list],
    }
