"""Mover tickets MagEAM de Desarrollado → Finalizada → En Producción.

Respetando el flujo correcto del proyecto SF:
  Tareas por hacer → En curso → Desarrollado → Finalizada → En producción

Para cada ticket en Desarrollado:
  1. Si tiene commit en git log → asumimos código deployado → mover a Finalizada
  2. Si está en Finalizada y prod responde OK → mover a En Producción

Uso:
  python scripts/jira_transition_desarrollado.py [--dry-run]

El input es una lista de SF-NNN que se pasa por stdin o como archivo.
"""

import json
import sys
import urllib.request
from pathlib import Path

CLOUD_ID = "6340738a-7332-4f8a-9043-63a618b78ce6"
ATLASSIAN_BASE = f"https://api.atlassian.com/ex/jira/{CLOUD_ID}/rest/api/3"
# Transitions descubiertas previamente
TRANSITION_FINALIZADA = "31"      # Listo (= Finalizada)
TRANSITION_EN_PRODUCCION = "51"   # En producción

# Token Atlassian — leído desde env
import os
ATL_TOKEN = os.environ.get("ATLASSIAN_TOKEN")
if not ATL_TOKEN:
    print("ERROR: necesito ATLASSIAN_TOKEN env var (Atlassian Cloud API token)")
    print("Usa el helper MCP en su lugar — este script es solo guía/plan.")


def parse_input(text: str) -> list[str]:
    """Extract SF-NNN ticket keys from arbitrary text."""
    import re
    return sorted(set(re.findall(r"SF-\d+", text)), key=lambda s: -int(s.split("-")[1]))


def load_commits_set() -> set[str]:
    """Read /tmp/sf_in_commits.txt produced by git log."""
    p = Path("/tmp/sf_in_commits.txt")
    if not p.exists():
        return set()
    return set(line.strip() for line in p.read_text().splitlines() if line.startswith("SF-"))


if __name__ == "__main__":
    text = sys.stdin.read() if not sys.stdin.isatty() else ""
    tickets = parse_input(text)
    commits = load_commits_set()
    in_commits = [t for t in tickets if t in commits]
    not_in_commits = [t for t in tickets if t not in commits]
    print(f"Total tickets input: {len(tickets)}")
    print(f"Con commit en git log (auto-promovibles a Finalizada): {len(in_commits)}")
    print(f"Sin commit visible: {len(not_in_commits)}")
    print()
    print("=== CON COMMIT (proponer Desarrollado → Finalizada → En Producción) ===")
    for t in in_commits:
        print(f"  {t}")
    print()
    print("=== SIN COMMIT visible (requieren revisión manual antes de mover) ===")
    for t in not_in_commits[:50]:
        print(f"  {t}")
