# agents/_shared/base.py
"""AgentConfig dataclass y Agent loop class.

Define la estructura base de configuración para todos los agentes
y el loop de ejecución canónico documentado por Anthropic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


# ---------------------------------------------------------------------------
# Skill content container
# ---------------------------------------------------------------------------

@dataclass
class SkillContent:
    """Contenido cargado de un skill."""

    name: str
    path: str
    body: str = ""
    references: list[str] = field(default_factory=list)
    mandatory: bool = False
    milestone: int | str = 0


# ---------------------------------------------------------------------------
# AgentConfig
# ---------------------------------------------------------------------------

@dataclass
class AgentConfig:
    """Configuración declarativa de un agente.

    El campo ``agent_dir`` es la raíz de la carpeta del agente.
    Desde él se localizan automáticamente:
    - ``{agent_dir}/CLAUDE.md``  → system prompt
    - ``{agent_dir}/skills.yaml`` → mapeo de skills
    - ``{agent_dir}/references/`` → references propias del agente
    """

    name: str
    model: str
    agent_dir: str
    tools: list[str]
    max_turns: int = 20
    temperature: float = 0.0

    # -- Derived paths -------------------------------------------------------

    @property
    def system_prompt_path(self) -> Path:
        return Path(self.agent_dir) / "CLAUDE.md"

    @property
    def skills_map_path(self) -> Path:
        return Path(self.agent_dir) / "skills.yaml"

    @property
    def references_dir(self) -> Path:
        return Path(self.agent_dir) / "references"

    # -- Loaders -------------------------------------------------------------

    def load_system_prompt(self) -> str:
        """Carga el CLAUDE.md del agente."""
        return self.system_prompt_path.read_text(encoding="utf-8")

    def load_skills_for_milestone(self, milestone: int) -> list[SkillContent]:
        """Carga los skills asignados a este agente para un milestone."""
        if not self.skills_map_path.exists():
            return []

        skills_config = yaml.safe_load(
            self.skills_map_path.read_text(encoding="utf-8")
        )
        relevant: list[SkillContent] = []

        for skill in skills_config.get("skills", []):
            skill_milestone = skill.get("milestone")
            if skill_milestone == milestone or skill_milestone == "all":
                content = self._load_skill_at_level(skill)
                relevant.append(content)

        return relevant

    def _load_skill_at_level(self, skill: dict[str, Any]) -> SkillContent:
        """Carga un skill según su load_level configurado."""
        skill_path = Path(skill["path"])
        load_level = skill.get("load_level", 2)

        if load_level == 1:
            # Solo YAML front matter (~100 words)
            body = _extract_front_matter(skill_path)
            return SkillContent(
                name=skill["name"],
                path=skill["path"],
                body=body,
                mandatory=skill.get("mandatory", False),
                milestone=skill.get("milestone", 0),
            )

        if load_level == 2:
            # Body completo + references preloaded
            body = skill_path.read_text(encoding="utf-8") if skill_path.exists() else ""
            refs: list[str] = []
            for ref_rel in skill.get("references_to_preload", []):
                full_ref = skill_path.parent / ref_rel
                if full_ref.exists():
                    refs.append(full_ref.read_text(encoding="utf-8"))
            return SkillContent(
                name=skill["name"],
                path=skill["path"],
                body=body,
                references=refs,
                mandatory=skill.get("mandatory", False),
                milestone=skill.get("milestone", 0),
            )

        # load_level == 3: Solo punteros, references bajo demanda
        body = _extract_front_matter(skill_path)
        return SkillContent(
            name=skill["name"],
            path=skill["path"],
            body=body,
            mandatory=skill.get("mandatory", False),
            milestone=skill.get("milestone", 0),
        )

    def load_agent_references(self) -> dict[str, str]:
        """Carga las references propias del agente (no de skills)."""
        refs: dict[str, str] = {}
        if self.references_dir.exists():
            for ref_file in self.references_dir.glob("*.md"):
                refs[ref_file.stem] = ref_file.read_text(encoding="utf-8")
        return refs


# ---------------------------------------------------------------------------
# Agent (loop de ejecución)
# ---------------------------------------------------------------------------

class Agent:
    """Agente con loop de ejecución canónico.

    Esta es la implementación base. En producción, se integra con el
    Claude API client y el tool_wrappers registry.
    """

    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self._system_prompt: str | None = None

    @property
    def name(self) -> str:
        return self.config.name

    @property
    def model(self) -> str:
        return self.config.model

    def get_system_prompt(self, milestone: int | None = None) -> str:
        """Ensambla el system prompt con skills del milestone actual."""
        if self._system_prompt is None:
            self._system_prompt = self.config.load_system_prompt()

        prompt = self._system_prompt

        if milestone is not None:
            skills = self.config.load_skills_for_milestone(milestone)
            if skills:
                skills_block = self._format_skills_block(skills)
                prompt = f"{prompt}\n\n{skills_block}"

        return prompt

    def _format_skills_block(self, skills: list[SkillContent]) -> str:
        """Formatea los skills cargados como bloque de contexto."""
        lines = ["<loaded_skills>"]
        for skill in skills:
            lines.append(f"\n## Skill: {skill.name}")
            lines.append(f"Path: {skill.path}")
            lines.append(f"Mandatory: {skill.mandatory}")
            if skill.body:
                lines.append(f"\n{skill.body}")
            for i, ref in enumerate(skill.references, 1):
                lines.append(f"\n### Reference {i}:\n{ref}")
        lines.append("\n</loaded_skills>")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_front_matter(path: Path) -> str:
    """Extrae el YAML front matter de un archivo Markdown."""
    if not path.exists():
        return ""

    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return ""

    end = text.find("---", 3)
    if end == -1:
        return ""

    return text[: end + 3]
