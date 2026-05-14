# Field-to-Structured Mapping Reference

**Skill:** identify-work-request
**Version:** 0.1 | **Date:** 2026-03-10

---

## 1. Input → Output Field Mapping

### FieldCaptureInput → StructuredWorkRequest

| Input Field | Output Field | Transformation |
|-------------|-------------|----------------|
| `capture_id` | `source_capture_id` | Direct copy |
| `timestamp` | `created_at` | Direct copy |
| `raw_voice_text` / `raw_text_input` | `problem_description.original_text` | Concatenate available inputs |
| `raw_voice_text` / `raw_text_input` | `problem_description.structured_description` | NLP extraction → max 72 chars EN |
| `raw_voice_text` / `raw_text_input` | `problem_description.structured_description_fr` | NLP extraction → max 72 chars FR |
| symptoms in text | `problem_description.failure_mode_detected` | Symptom→Mechanism mapping + 72-combo validation |
| symptoms in text | `problem_description.failure_mode_code` | FM-XX code from MASTER table |
| component refs in text | `problem_description.affected_component` | Component library lookup |
| `equipment_tag_manual` / text | `equipment_identification.equipment_tag` | resolve_equipment tool chain |
| `equipment_tag_manual` / text | `equipment_identification.equipment_id` | resolve_equipment tool chain |
| resolution method | `equipment_identification.confidence_score` | 0.0-1.0 from resolution chain |
| resolution method | `equipment_identification.resolution_method` | EXACT/FUZZY/IMAGE_OCR/MANUAL |
| context + criticality | `ai_classification.work_order_type` | PM01/PM02/PM03 rules |
| criticality + status + safety | `ai_classification.priority_suggested` | Priority matrix |
| equipment type | `ai_classification.estimated_duration_hours` | Component complexity heuristic |
| equipment type + FM | `ai_classification.required_specialties` | Specialty mapping table |
| context keywords | `ai_classification.safety_flags` | Safety flag detection rules |
| FM mechanism + BOM | `spare_parts_suggested[]` | suggest_materials tool |
| `images[]` | `image_analysis` | Visual anomaly detection |

---

## 2. Technical Jargon Normalization

### French → English

| French | English | Equipment Context |
|--------|---------|------------------|
| pompe | pump | Pumping systems |
| pompe centrifuge | centrifugal pump | Fluid transport |
| roulement | bearing | Rotating equipment |
| palier | bearing housing | Rotating equipment |
| fuite | leak | Any fluid system |
| vanne | valve | Piping systems |
| moteur | motor | Electrical drives |
| bruit | noise | Any equipment |
| chaleur | heat/overheating | Any equipment |
| courroie | belt | Conveyor/drive systems |
| engrenage | gear | Gearboxes |
| accouplement | coupling | Drive trains |
| joint | seal/gasket | Pressure vessels, pumps |
| garniture mécanique | mechanical seal | Centrifugal pumps |
| tuyauterie | piping | Fluid transport |
| vibration excessive | excessive vibration | Rotating equipment |
| corrosion | corrosion | Any metallic |
| usure | wear | Any moving parts |
| colmatage | blockage | Filters, screens |
| grippage | seizure | Bearings, shafts |

### Arabic → English

| Arabic | English | Equipment Context |
|--------|---------|------------------|
| مضخة | pump | Pumping systems |
| محمل | bearing | Rotating equipment |
| تسرب | leak | Any fluid system |
| صمام | valve | Piping systems |
| محرك | motor | Electrical drives |
| اهتزاز | vibration | Rotating equipment |
| تآكل | corrosion | Any metallic |

### Spanish → English

| Spanish | English | Equipment Context |
|---------|---------|------------------|
| bomba | pump | Pumping systems |
| rodamiento | bearing | Rotating equipment |
| fuga | leak | Any fluid system |
| válvula | valve | Piping systems |
| motor | motor | Electrical drives |
| correa | belt | Conveyor/drive systems |
| vibración | vibration | Rotating equipment |
| corrosión | corrosion | Any metallic |
| grieta | crack | Structural |
| desgaste | wear | Any moving parts |

---

## 3. Symptom → FM Code Mapping

| Symptom Pattern | Primary FM Code | Mechanism | Typical Cause | Confidence |
|----------------|----------------|-----------|---------------|:----------:|
| excessive vibration + rotating | FM-68 | WEARS | EROSION | 0.80 |
| vibration + bearing | FM-70 | WEARS | FATIGUE | 0.85 |
| vibration + misalignment | FM-63 | LOOSES PRELOAD | MISALIGNMENT | 0.90 |
| oil/grease leak + pump | FM-68 | WEARS | EROSION | 0.75 |
| oil leak + seal | FM-68 | WEARS | EROSION | 0.80 |
| water leak + pipe | FM-15 | CORRODES | AQUEOUS CORROSION | 0.85 |
| grinding noise + bearing | FM-04 | BREAKS/FRACTURE/SEPARATES | FATIGUE | 0.80 |
| overheating + motor | FM-57 | OVERHEATS/MELTS | OVERLOAD | 0.85 |
| overheating + bearing | FM-70 | WEARS | FATIGUE | 0.75 |
| corrosion + external surface | FM-15 | CORRODES | AQUEOUS CORROSION | 0.90 |
| corrosion + internal | FM-16 | CORRODES | CHEMICAL ATTACK | 0.80 |
| crack + structural | FM-19 | CRACKS | FATIGUE | 0.85 |
| crack + weld | FM-21 | CRACKS | STRESS CORROSION | 0.80 |
| sparking + electrical | FM-60 | SHORT-CIRCUITS | FOREIGN MATTER | 0.85 |
| burnt smell + motor | FM-57 | OVERHEATS/MELTS | OVERLOAD | 0.80 |
| pressure loss + filter | FM-02 | BLOCKS | CONTAMINATION | 0.90 |
| pressure loss + valve | FM-68 | WEARS | EROSION | 0.75 |
| seized/stuck + bearing | FM-45 | IMMOBILISED | SEIZURE | 0.90 |
| drift + instrument | FM-34 | DRIFTS | CALIBRATION DRIFT | 0.85 |
| belt damage + conveyor | FM-04 | BREAKS/FRACTURE/SEPARATES | FATIGUE | 0.80 |

---

## 4. Realistic Scenarios

### Scenario 1: Centrifugal Pump Leak (Voice + Photo, French)

**Input:**
```json
{
  "capture_type": "VOICE+IMAGE",
  "language_detected": "fr",
  "raw_voice_text": "Il y a une fuite d'huile importante sur la pompe centrifuge PMP-003 dans la zone de broyage. La garniture mécanique semble endommagée. C'est urgent, il y a de l'huile partout sur le sol.",
  "images": [{"file_path": "leak_pmp003.jpg", "gps_coordinates": "32.123,-6.456"}],
  "technician_id": "TECH-042",
  "technician_name": "Ahmed B."
}
```

**Step 1 Parse:** Equipment=PMP-003, Symptom=leak(fuite), Component=mechanical seal(garniture mécanique), Area=crushing(broyage), Urgency marker="urgent"

**Step 2 Resolve:** `PMP-003` → EXACT_MATCH, confidence=1.0, equipment_id="EQ-12345"

**Step 3 FM:** leak + mechanical seal + pump → WEARS + EROSION → FM-68 (valid in 72-combo) ✓

**Step 4 Classify:**
- Type: PM03_CORRECTIVE (active leak = functional failure)
- Priority: Criticality A+ + Equipment partially functional + No safety flag → `2_URGENT`
- Duration: 4h (mechanical seal replacement)
- Specialties: [Mechanical]
- Safety flags: [LOCKOUT_TAGOUT] (rotating equipment)

**Step 6 Spare Parts:** (T-16: WEARS → REPLACE implied)
- Mechanical seal kit, SAP: 10045678, qty: 1, IN_STOCK

**Output structured_description:** `"Oil leak from mechanical seal on centrifugal pump PMP-003"` (58 chars ✓)
**Output structured_description_fr:** `"Fuite huile garniture mécanique pompe centrifuge PMP-003"` (57 chars ✓)

---

### Scenario 2: Conveyor Motor Vibration (Text, English)

**Input:**
```json
{
  "capture_type": "TEXT",
  "language_detected": "en",
  "raw_text_input": "Excessive vibration on conveyor belt motor CV-BRY-MTR-004. Bearings sound rough. Has been getting worse over the last 2 weeks. No shutdown yet but close.",
  "technician_id": "TECH-018",
  "technician_name": "Carlos M."
}
```

**Step 1 Parse:** Equipment=CV-BRY-MTR-004, Symptom=vibration+rough bearings, Component=bearing, Temporal=progressive (2 weeks)

**Step 2 Resolve:** `CV-BRY-MTR-004` → EXACT_MATCH, confidence=1.0

**Step 3 FM:** vibration + bearing + progressive → WEARS + FATIGUE → FM-70 ✓

**Step 4 Classify:**
- Type: PM02_PREVENTIVE (degrading but not failed)
- Priority: Criticality A + Not down + No safety flag → `3_NORMAL` (but trending → planner may upgrade)
- Duration: 6h (bearing replacement on motor)
- Specialties: [Mechanical, Crane]
- Safety flags: [LOCKOUT_TAGOUT]

**Step 6 Spare Parts:** Bearing SKF 6316-2Z, SAP: 10089012, qty: 2, IN_STOCK

---

### Scenario 3: Pipeline Corrosion (Photo only, Arabic)

**Input:**
```json
{
  "capture_type": "IMAGE",
  "language_detected": "ar",
  "images": [
    {"file_path": "corrosion_pipe_01.jpg"},
    {"file_path": "corrosion_pipe_02.jpg"}
  ],
  "location_hint": "Zone A, pipeline section near acid tank",
  "technician_id": "TECH-056",
  "technician_name": "Youssef K."
}
```

**Step 1 Parse:** No text input. Image analysis detects: external corrosion, pitting. Location: Zone A, near acid tank.

**Step 2 Resolve:** No TAG available. Location "Zone A + acid tank" → FUZZY_MATCH against hierarchy, confidence=0.55 → `REQUIRES_REVIEW`

**Step 3 FM:** corrosion + near acid tank → CORRODES + CHEMICAL ATTACK → FM-16 ✓

**Step 4 Classify:**
- Type: PM01_INSPECTION (observed degradation, not functional failure)
- Priority: Equipment unknown criticality + Not down + HAZARDOUS_SUBSTANCE → `3_NORMAL`
- Duration: 2h (inspection + wall thickness measurement)
- Specialties: [Mechanical, Instrumentation]
- Safety flags: [HAZARDOUS_SUBSTANCE]

**Step 6 Spare Parts:** Not applicable (inspection, not replacement)

**Note:** Equipment marked `REQUIRES_REVIEW` — planner must confirm exact pipeline section and TAG.
