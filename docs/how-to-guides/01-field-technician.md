# How-To Guide: Field Technician

**Role**: Field Technician
**Modules**: Module 1 (Field Capture), Module 2 (Work Request Review)
**Pages**: Page 8 (Field Capture), Page 9 (Work Requests)

## Role Description

Field Technicians are frontline maintenance personnel who capture observations during equipment inspections and rounds. They use the Field Capture page to submit observations via text, voice transcription, or image descriptions in French (FR), English (EN), or Arabic (AR). They can also review the work requests generated from their captures.

---

## Prerequisites

| Requirement | Details |
|---|---|
| API server running | `uvicorn api.main:app --reload` on `http://localhost:8000` |
| Streamlit app running | `streamlit run streamlit_app/Home.py` on `http://localhost:8501` |
| Database seeded | At least one plant and equipment hierarchy must exist (run seed from Page 7) |
| Technician ID | A valid technician identifier (e.g., `TECH-001`) |
| Equipment knowledge | Familiarity with equipment tags in the plant (e.g., `BRY-SAG-ML-001`) |

---

## User Story FT-01: Capture Field Observation

**Goal**: Submit a field observation (defect, anomaly, or inspection finding) that will be automatically classified and converted into a work request.

### Step-by-Step Instructions

1. **Navigate to Page 8 -- Field Capture**
   - Open the Streamlit sidebar and click **Field Capture**.
   - The page displays two tabs: **Submit Capture** and **Capture History**.

2. **Select the Submit Capture tab**
   - This is the default tab when the page loads.

3. **Fill in Technician Information (left column)**
   - **Technician ID**: Enter your technician identifier (e.g., `TECH-001`).
   - **Capture Type**: Select one of:
     - `TEXT` -- Type your observation directly.
     - `VOICE` -- Paste or enter voice transcription text.
     - `IMAGE` -- Describe what you see in an image.
     - `VOICE+IMAGE` -- Combine voice transcription with text description.
   - **Language**: Select your preferred language: `en` (English), `fr` (French), or `ar` (Arabic).

4. **Fill in Equipment Information (right column)**
   - **Equipment Tag**: Enter the equipment tag manually (e.g., `BRY-SAG-ML-001`). This helps the AI match to the correct equipment in the hierarchy.
   - **Location Hint**: Optionally describe the physical location (e.g., `Grinding area, level 2`).

5. **Enter Observation Details**
   - Depending on the capture type selected:
     - For **TEXT** or **VOICE+IMAGE**: A text area appears for your written observation. Describe the defect or anomaly clearly.
     - For **VOICE** or **VOICE+IMAGE**: A separate text area appears for voice transcription content.
   - Example observation (FR): `"Vibration anormale sur le palier c\u00f4t\u00e9 commande du broyeur SAG. Bruit m\u00e9tallique intermittent."`
   - Example observation (EN): `"Abnormal vibration on drive-side bearing of SAG mill. Intermittent metallic noise."`

6. **Submit the Capture**
   - Click the **Submit Capture** button (blue primary button).
   - Wait for the AI processing to complete.

### Expected Output

On success, the page displays:

- A green success banner: "Capture submitted successfully"
- Three metric cards:
  - **Equipment Tag**: The matched or confirmed equipment tag
  - **Confidence**: AI confidence in the equipment match (e.g., `85%`)
  - **Priority**: Suggested priority level (e.g., `2_URGENT`)
- A full JSON response showing the complete capture result, including AI classification details

### API Endpoint Called

```
POST /api/v1/capture/
```

**Request body:**
```json
{
  "technician_id": "TECH-001",
  "technician_name": "Tech TECH-001",
  "capture_type": "TEXT",
  "language": "fr",
  "equipment_tag_manual": "BRY-SAG-ML-001",
  "location_hint": "Grinding area, level 2",
  "raw_text_input": "Vibration anormale sur le palier..."
}
```

**Response:**
```json
{
  "capture_id": "uuid-...",
  "equipment_tag": "BRY-SAG-ML-001",
  "equipment_confidence": 0.92,
  "priority_suggested": "2_URGENT",
  "work_request_id": "uuid-...",
  "ai_classification": {
    "work_order_type": "CM",
    "estimated_duration_hours": 4,
    "required_specialties": ["MECHANICAL"]
  }
}
```

### Error Handling / Troubleshooting

| Issue | Possible Cause | Solution |
|---|---|---|
| "Error: Connection refused" | API server is not running | Start the API with `uvicorn api.main:app --reload` |
| Equipment tag shows "UNKNOWN" | Tag not found in hierarchy | Verify the tag exists in Page 1 (Hierarchy). Run database seed if needed. |
| Low confidence score (< 50%) | Ambiguous observation text or missing equipment tag | Provide a more specific equipment tag manually. Add more detail to the observation. |
| No priority suggested | AI classification could not determine severity | Include keywords describing severity (e.g., "urgent", "safety risk", "production stop") |
| Language not recognized | Selected language does not match text language | Ensure the language selector matches the actual language of your input |

---

## User Story FT-02: Review Generated Work Request

**Goal**: After submitting a capture, review the work request that was automatically generated and verify its accuracy.

### Step-by-Step Instructions

1. **Navigate to Page 9 -- Work Requests**
   - Open the Streamlit sidebar and click **Work Requests**.

2. **Filter Work Requests (optional)**
   - Use the **Filter by Status** dropdown to narrow the list:
     - `DRAFT` -- Newly created, not yet reviewed
     - `PENDING_VALIDATION` -- Awaiting planner review
     - `VALIDATED` -- Approved by planner
     - `REJECTED` -- Rejected by planner
   - Leave as `None` to see all work requests.

3. **Locate Your Work Request**
   - Work requests are listed with:
     - **Request ID** (truncated UUID)
     - **Equipment Tag**
     - **Status** (color-coded badge)
   - Find the work request matching your recent capture.

4. **Expand the Work Request**
   - Click the expander arrow next to the work request row.
   - Review the displayed information:
     - **Equipment**: The matched equipment tag
     - **Confidence**: AI confidence in the equipment match
     - **AI Priority**: Suggested priority from AI classification
     - **WO Type**: Work order type (e.g., CM for corrective maintenance)
     - **Duration**: Estimated duration in hours
     - **Specialties**: Required maintenance specialties
     - **Created**: Timestamp of creation

5. **Take Action on Draft/Pending Work Requests**
   - If the status is `DRAFT` or `PENDING_VALIDATION`, three action buttons are available:
     - **Approve**: Validate the work request as-is
     - **Reject**: Reject the work request
     - **Classify**: Re-trigger AI classification with updated data

6. **Verify the Classification**
   - If the AI classification seems incorrect, click **Classify** to re-run the AI classification engine.
   - The page will reload with updated classification results.

### Expected Output

- An expandable list of work requests with color-coded status badges:
  - Blue: `DRAFT`
  - Orange: `PENDING_VALIDATION`
  - Green: `VALIDATED`
  - Red: `REJECTED`
- Each expanded work request shows equipment details, AI classification, and action buttons.

### API Endpoints Called

**List work requests:**
```
GET /api/v1/work-requests/?status=DRAFT
```

**Validate (approve/reject):**
```
PUT /api/v1/work-requests/{request_id}/validate
```
```json
{ "action": "APPROVE" }
```

**Re-classify:**
```
POST /api/v1/work-requests/{request_id}/classify
```

### Error Handling / Troubleshooting

| Issue | Possible Cause | Solution |
|---|---|---|
| "Could not load work requests" | API server not running or DB empty | Start API server. Ensure captures have been submitted first. |
| "No work requests found" | No captures submitted yet, or filter is too restrictive | Remove the status filter. Submit a capture on Page 8 first. |
| Approve/Reject button gives error | Work request already processed | Refresh the page. Check if another user already acted on the request. |
| Classification results seem wrong | Insufficient data in the observation | Go back to Page 8 and submit a new, more detailed capture. |

---

## Quick Reference: Field Technician Workflow

```
Page 8: Field Capture          Page 9: Work Requests
+-------------------+         +----------------------+
| 1. Enter tech ID  |         | 4. Filter by status  |
| 2. Select type    |  --->   | 5. Expand WR details |
| 3. Submit capture |         | 6. Approve/Reject    |
+-------------------+         +----------------------+
        |                              |
        v                              v
  POST /capture/              GET  /work-requests/
                              PUT  /work-requests/{id}/validate
                              POST /work-requests/{id}/classify
```

## Tips for Effective Field Captures

- **Be specific**: Include equipment tag, location, and symptom description.
- **Use correct language**: Select the language that matches your input text.
- **Describe severity**: Mention if the issue is safety-related, production-stopping, or cosmetic.
- **Include context**: Mention operating conditions (e.g., "under full load", "during startup").
- **Review promptly**: Check Page 9 soon after submitting to verify AI classification accuracy.
