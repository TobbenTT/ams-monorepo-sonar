# Examples - model-staffing-requirements

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Copper Concentrator Staffing Model

**Facility**: 120,000 tpd copper concentrator, Antofagasta Region, 3,200 masl
**Operating Model**: 24/7 continuous, owner-operate, FIFO 7x7 shift pattern
**Maintenance Strategy**: RCM-based, 58,000 annual planned maintenance hours

| Function | Role Category | Positions/Shift | Crews | Total FTE |
|----------|-------------|----------------|-------|-----------|
| **Operations** | | | | |
| | Plant Manager | 1 day | 1 | 1 |
| | Area Superintendents | 3 day | 1 | 3 |
| | Shift Superintendent | 1 per shift | 4 | 4 |
| | Control Room Operators | 4 per shift | 4 | 16 |
| | Field Operators (Crushing) | 3 per shift | 4 | 12 |
| | Field Operators (Grinding) | 4 per shift | 4 | 16 |
| | Field Operators (Flotation) | 4 per shift | 4 | 16 |
| | Field Operators (Thickening/Filter) | 3 per shift | 4 | 12 |
| | Field Operators (Tailings/Water) | 2 per shift | 4 | 8 |
| | Process Engineers | 2 day | 1 | 2 |
| | Metallurgists | 2 day | 1 | 2 |
| | Lab Technicians | 2 per shift | 4 | 8 |
| **Operations Subtotal** | | | | **100** |
| **Maintenance** | | | | |
| | Maintenance Superintendent | 1 day | 1 | 1 |
| | Maintenance Supervisors | 3 per shift | 4 | 12 |
| | Maintenance Planners | 4 day | 1 | 4 |
| | Maintenance Scheduler | 1 day | 1 | 1 |
| | Mechanical Fitters | 8 per shift | 4 | 32 |
| | Welders/Boilermakers | 3 per shift | 4 | 12 |
| | Electricians | 4 per shift | 4 | 16 |
| | Instrument Technicians | 3 per shift | 4 | 12 |
| | PdM Technicians (vibration, oil, thermo) | 3 day | 1 | 3 |
| | Lubrication Technicians | 2 day | 2 | 4 |
| | Reliability Engineer | 1 day | 1 | 1 |
| | CMMS Administrator | 1 day | 1 | 1 |
| **Maintenance Subtotal** | | | | **99** |
| **HSE** | | | | |
| | HSE Manager | 1 day | 1 | 1 |
| | HSE Coordinators | 1 per shift | 4 | 4 |
| | Paramedics | 1 per shift | 4 | 4 |
| | Environmental Technicians | 2 day | 1 | 2 |
| **HSE Subtotal** | | | | **11** |
| **Support** | | | | |
| | Warehouse Staff | 2 per shift | 4 | 8 |
| | Training Coordinator | 1 day | 1 | 1 |
| | Admin/Clerical | 3 day | 1 | 3 |
| | IT Support | 1 day | 1 | 1 |
| **Support Subtotal** | | | | **13** |
| **TOTAL PERMANENT** | | | | **223** |
| **Contractor (est. 28%)** | | | | **87** |
| **TOTAL SITE** | | | | **310** |

**Key Metrics**:
- Maintenance FTEs per 100 equipment items: 11.6 (benchmark: 6-15, 2nd quartile)
- Operations FTEs per 10,000 tpd: 8.3 (benchmark: 5-12, 2nd quartile)
- Total FTE per $B CAPEX: 310 per $4.5B = 69 (adjusted for Chilean productivity)
- Estimated annual labor cost: $52M USD (fully loaded) = $1.43 per tonne processed

### Example 2: Shift Pattern Comparison

**Scenario**: Comparing 7x7 vs. 4x3 vs. 10x10 for a remote mining site (4,000 masl)

| Parameter | 7x7 | 4x3 | 10x10 |
|-----------|-----|-----|-------|
| Cycle length | 14 days | 7 days | 20 days |
| Hours per cycle | 84 (7x12) | 48 (4x12) | 120 (10x12) |
| Crews for 24/7 | 4 (2 on, 2 off) | 4 (complex pattern) | 4 (2 on, 2 off) |
| Annual hours worked | ~2,184 | ~2,256 | ~2,190 |
| Night shifts per cycle | 3.5 average | 2 average | 5 average |
| Chilean labor law | Compliant (Art. 38) | Compliant (Art. 38) | Compliant (Art. 38) |
| Fatigue risk (at 4,000m) | Moderate-High | Moderate | High |
| FIFO compatibility | Excellent | Poor (too short) | Excellent |
| FTE impact (example 20 positions) | 80 FTE | 80 FTE | 80 FTE |
| Travel cost impact | Medium | High (frequent) | Low (less frequent) |
| **RECOMMENDATION** | **PREFERRED** | Not recommended at altitude | Alternative for critical roles |

**Rationale**: 7x7 provides the best balance of FIFO logistics, fatigue management at altitude, and regulatory compliance. The 4x3 pattern, while legally compliant, creates excessive travel frequency for remote sites and is operationally complex. The 10x10 pattern raises fatigue concerns at 4,000 masl due to the extended 10-day cycle at altitude.
