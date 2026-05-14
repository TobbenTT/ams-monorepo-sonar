# Equipment Resolution Cascade - Detailed Guide

## SequenceMatcher Algorithm

The resolution engine uses Python's `difflib.SequenceMatcher` to compute fuzzy similarity. The ratio represents the proportion of matching characters to total characters in both strings.

```python
from difflib import SequenceMatcher
ratio = SequenceMatcher(None, string_a, string_b).ratio()
# Returns float between 0.0 (no match) and 1.0 (identical)
```

## TAG Format Pattern

Standard OCP TAG format: `[AREA]-[SYSTEM]-[TYPE]-[NUMBER]`

Examples:
- `BRY-SAG-ML-001` -- Broyage area, SAG system, Mill type, unit 001
- `OCP-JFC-PMP-12` -- OCP plant, JFC system, Pump type, unit 12
- `FLT-CYC-HYD-003` -- Flotation area, Cyclone system, Hydrocyclone type, unit 003

Regex: `[A-Z]{2,5}-[A-Z]{2,5}-[A-Z]{2,5}-\d{2,4}`

## Worked Example

**Input**: `"Check the big sag mill at broyage"`

**Step 1**: cleaned = `"CHECK THE BIG SAG MILL AT BROYAGE"` -- not in TAG index. Proceed.

**Step 2**: Regex finds no TAG patterns. Proceed.

**Step 3**: Not in alias index. Proceed.

**Step 4**: Fuzzy TAG comparison:
- vs `BRY-SAG-ML-001`: ratio ~ 0.28 (below 0.7 threshold)
- Best score < 0.7. Proceed.

**Step 5**: Fuzzy description (lowercase):
- vs `"broyeur sag primaire broyage"`: score ~ 0.55 (best match)
- Final confidence = 0.55 * 0.8 = 0.44
- Method = HIERARCHY_SEARCH
- Triggers mandatory human review per confidence validator

## Confidence Validator Integration

| Confidence Range | Review Level | Action Required |
|-----------------|-------------|-----------------|
| >= 0.90 | TRUSTED | Minimal review |
| 0.70 - 0.89 | OPTIONAL_REVIEW | Review recommended |
| 0.30 - 0.69 | MANDATORY_REVIEW | Must be reviewed by human |
| < 0.30 | AUTO_REJECT | Reject -- manual input required |
