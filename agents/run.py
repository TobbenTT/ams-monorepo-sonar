"""CLI entry point for running a strategy development session.

Usage:
    python -m agents.run "SAG Mill 001" --plant OCP-JFC
    python -m agents.run "Ball Mill BM-201" --plant OCP-BEN --output session.json
"""

from __future__ import annotations

import argparse
import json
import sys

from agents.orchestration.workflow import StrategyWorkflow


def cli_approval(milestone_number: int, summary: str) -> tuple[str, str]:
    """Interactive CLI approval gate.

    Presents the milestone summary and waits for human input.
    """
    print("\n" + "=" * 60)
    print(summary)
    print("=" * 60)

    while True:
        action = input(f"\nMilestone {milestone_number} — Action [approve/modify/reject]: ").strip().lower()
        if action in ("approve", "modify", "reject"):
            break
        print("Invalid action. Enter: approve, modify, or reject")

    feedback = ""
    if action in ("modify", "reject"):
        feedback = input("Feedback: ").strip()

    return (action, feedback)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="OCP Maintenance AI — Strategy Development Session",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Example:\n"
            "  python -m agents.run \"SAG Mill 001\" --plant OCP-JFC\n"
            "  python -m agents.run \"Ball Mill BM-201\" --plant OCP-BEN --output session.json\n"
        ),
    )
    parser.add_argument("equipment", help="Equipment description (e.g., 'SAG Mill 001')")
    parser.add_argument("--plant", default="OCP", help="SAP plant code (default: OCP)")
    parser.add_argument("--output", "-o", help="Save session state to JSON file")

    args = parser.parse_args()

    print(f"Starting strategy development for: {args.equipment}")
    print(f"Plant code: {args.plant}")
    print("This session will proceed through 4 milestones with human approval gates.\n")

    workflow = StrategyWorkflow(human_approval_fn=cli_approval)

    try:
        session = workflow.run(args.equipment, plant_code=args.plant)
    except KeyboardInterrupt:
        print("\n\nSession interrupted by user.")
        session = workflow.session

    # Print final summary
    print("\n" + "=" * 60)
    print("SESSION COMPLETE")
    print("=" * 60)
    counts = session.get_entity_counts()
    for entity, count in counts.items():
        if isinstance(count, bool):
            print(f"  {entity}: {'Yes' if count else 'No'}")
        elif count > 0:
            print(f"  {entity}: {count}")

    milestones_approved = sum(1 for m in workflow.milestones if m.is_complete)
    print(f"\nMilestones approved: {milestones_approved}/4")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(session.to_json())
        print(f"Session saved to: {args.output}")


if __name__ == "__main__":
    main()
