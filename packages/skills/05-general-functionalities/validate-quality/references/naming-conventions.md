# Naming Convention Rules

## Work Package Names (WP-05 to WP-07)

### Required Format
`[FREQ] [ASSET] [LABOUR] [SERV/INSP] [ON/OFF]`

### Valid Frequency Abbreviations
`1W, 2W, 4W, 8W, 12W, 26W, 52W, 6M, 12M, 2Y, 3Y, 5Y, 500H, 1000H, 2000H, 4000H, 8000H`

### Valid Trade Abbreviations
`MECH, ELEC, INST, OPER, CONMON, LUBE`

### Valid Type Abbreviations
`SERV, INSP`

### Valid Constraint Abbreviations
`ON, OFF, TEST`

### Rules
- WP-05: Maximum 40 characters, no special characters (only A-Z, 0-9, space)
- WP-06: Must be ALL CAPS
- WP-07: First part must match `^\d+[WHMYD]$`; last part must be valid constraint

## Task Names (T-05 to T-19)

### Required Patterns by Task Type

| Task Type | Pattern | Example |
|-----------|---------|---------|
| INSPECT | `^Inspect .+ for .+$` | "Inspect bearing for wear" |
| CHECK | `^Check .+$` | "Check oil level" |
| TEST | `^Perform .+ test of .+$` | "Perform insulation test of motor" |
| LUBRICATE | `^Lubricate .+$` | "Lubricate drive bearing" |
| REPLACE | `^Replace .+$` | "Replace mechanical seal" |
| REPAIR | `^Repair .+$` | "Repair coupling alignment" |
| CLEAN | `^Clean .+$` | "Clean intake filter" |
| CALIBRATE | `^Calibrate .+$` | "Calibrate pressure sensor" |

### Preferred Nouns (T-06)

| Do NOT Use (verb) | Use Instead (noun) |
|-------------------|-------------------|
| leaks | leakage |
| blocks | blockage |
| breaks | breakage |
| cracks | cracking |
| corrodes | corrosion |
| wears | wear |
| overheats | overheating |

## Failure Mode 'what' Field (FM-01, FM-02)

- FM-01: Must start with a capital letter
- FM-02: Must be singular (heuristic: should not end in 's' unless ending in 'ss' or 'us')
