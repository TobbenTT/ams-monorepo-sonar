"""Hierarchy quality scoring strategy.

Scores equipment hierarchy deliverables across 7 quality dimensions.
Checks: 6-level depth, parent-child integrity, bilingual names, component refs.
"""

from __future__ import annotations

from tools.models.schemas import QualityDimension, QualityScoreDimension
from tools.engines.scoring_strategies.base import ScorerStrategy, _ratio_score

# Expected hierarchy levels 1-6
MAX_LEVEL = 6
# Node types that require component_lib_ref
MI_NODE_TYPE = "MAINTAINABLE_ITEM"
# Node types that require parent_node_id
CHILD_NODE_TYPES = {"AREA", "SYSTEM", "EQUIPMENT", "SUB_ASSEMBLY", "MAINTAINABLE_ITEM"}


class HierarchyScorer(ScorerStrategy):
    """Quality scoring for equipment hierarchy deliverables."""

    DELIVERABLE_TYPE = "hierarchy"

    def score_technical_accuracy(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.TECHNICAL_ACCURACY, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for node in nodes:
            checks_total += 1
            level = node.get("level", 0)
            node_type = node.get("node_type", "")

            # Level must be 1-6
            if 1 <= level <= MAX_LEVEL:
                checks_passed += 1
            else:
                findings.append(f"Node '{node.get('name', '?')}' has invalid level {level}")

            # MI nodes must have component_lib_ref
            if node_type == MI_NODE_TYPE:
                checks_total += 1
                if node.get("component_lib_ref"):
                    checks_passed += 1
                else:
                    findings.append(f"MI '{node.get('name', '?')}' missing component_lib_ref")

        return QualityScoreDimension(
            dimension=QualityDimension.TECHNICAL_ACCURACY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_completeness(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.COMPLETENESS, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Check that hierarchy has multiple levels
        levels_present = {n.get("level") for n in nodes}
        checks_total += 1
        if len(levels_present) >= 3:
            checks_passed += 1
        else:
            findings.append(f"Only {len(levels_present)} hierarchy levels present (expected >=3)")

        # Each node must have name
        for node in nodes:
            checks_total += 1
            if node.get("name"):
                checks_passed += 1
            else:
                findings.append(f"Node {node.get('node_id', '?')} missing name")

        # Bilingual: name_fr should be present (OCP is Morocco-based)
        nodes_with_fr = sum(1 for n in nodes if n.get("name_fr"))
        checks_total += 1
        if len(nodes) > 0 and nodes_with_fr / len(nodes) >= 0.8:
            checks_passed += 1
        else:
            findings.append(
                f"Only {nodes_with_fr}/{len(nodes)} nodes have French name (name_fr)"
            )

        return QualityScoreDimension(
            dimension=QualityDimension.COMPLETENESS,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_consistency(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.CONSISTENCY, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # Check level-to-type mapping consistency
        level_type_map = {
            1: "PLANT", 2: "AREA", 3: "SYSTEM",
            4: "EQUIPMENT", 5: "SUB_ASSEMBLY", 6: "MAINTAINABLE_ITEM",
        }
        for node in nodes:
            level = node.get("level", 0)
            node_type = node.get("node_type", "")
            expected = level_type_map.get(level)
            if expected:
                checks_total += 1
                if node_type == expected:
                    checks_passed += 1
                else:
                    findings.append(
                        f"Node '{node.get('name', '?')}' level {level} "
                        f"has type {node_type}, expected {expected}"
                    )

        return QualityScoreDimension(
            dimension=QualityDimension.CONSISTENCY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_format(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.FORMAT, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        for node in nodes:
            name = node.get("name", "")
            checks_total += 1
            # Names should not be empty or excessively long
            if 1 <= len(name) <= 100:
                checks_passed += 1
            else:
                findings.append(f"Node name '{name[:30]}...' has invalid length ({len(name)})")

            # node_id should be present and non-empty
            checks_total += 1
            if node.get("node_id"):
                checks_passed += 1
            else:
                findings.append(f"Node '{name}' missing node_id")

        return QualityScoreDimension(
            dimension=QualityDimension.FORMAT,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_actionability(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        # MI nodes should have component_lib_ref for actionable maintenance
        mi_nodes = [n for n in nodes if n.get("node_type") == MI_NODE_TYPE]
        for mi in mi_nodes:
            checks_total += 1
            if mi.get("component_lib_ref"):
                checks_passed += 1
            else:
                findings.append(
                    f"MI '{mi.get('name', '?')}' not linked to component library"
                )

        # Equipment nodes should have metadata (manufacturer, model)
        equip_nodes = [n for n in nodes if n.get("node_type") == "EQUIPMENT"]
        for eq in equip_nodes:
            checks_total += 1
            metadata = eq.get("metadata", {})
            if metadata and (metadata.get("manufacturer") or metadata.get("model")):
                checks_passed += 1
            else:
                findings.append(
                    f"Equipment '{eq.get('name', '?')}' missing manufacturer/model metadata"
                )

        if checks_total == 0:
            return QualityScoreDimension(
                dimension=QualityDimension.ACTIONABILITY, score=100.0,
                details="No actionability checks applicable",
            )

        return QualityScoreDimension(
            dimension=QualityDimension.ACTIONABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )

    def score_traceability(self, entities: dict, context: dict) -> QualityScoreDimension:
        nodes = entities.get("hierarchy_nodes", [])
        if not nodes:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=0.0,
                findings=["No hierarchy nodes found"],
            )

        findings = []
        checks_passed = 0
        checks_total = 0

        node_ids = {n.get("node_id") for n in nodes if n.get("node_id")}

        for node in nodes:
            node_type = node.get("node_type", "")
            parent_id = node.get("parent_node_id")

            # Child nodes must have valid parent references
            if node_type in CHILD_NODE_TYPES:
                checks_total += 1
                if parent_id and parent_id in node_ids:
                    checks_passed += 1
                elif parent_id and parent_id not in node_ids:
                    findings.append(
                        f"Node '{node.get('name', '?')}' references "
                        f"non-existent parent {parent_id}"
                    )
                elif not parent_id:
                    findings.append(
                        f"Node '{node.get('name', '?')}' ({node_type}) missing parent_node_id"
                    )

        if checks_total == 0:
            return QualityScoreDimension(
                dimension=QualityDimension.TRACEABILITY, score=100.0,
                details="No traceability checks applicable (root-only hierarchy)",
            )

        return QualityScoreDimension(
            dimension=QualityDimension.TRACEABILITY,
            score=_ratio_score(checks_passed, checks_total),
            findings=findings[:10],
        )
