# Examples - track-long-lead-procurement

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Weekly Long-Lead Procurement Status Report

```
LONG-LEAD PROCUREMENT STATUS REPORT
Project: Sierra Verde Copper Expansion
Week: 2026-W24 | Report Date: 2026-06-12
Commissioning Start: 2027-07-01 (389 days)

SUMMARY:
  Total items tracked: 187 items across 42 POs
  Total procurement value: $285M

  STATUS DISTRIBUTION:
  +-------------+-------+----------+
  | Status      | Items | Value    |
  +-------------+-------+----------+
  | Green (On Track) | 142 | $198M |
  | Yellow (Watch)   |  27 | $52M  |
  | Orange (Alert)   |  12 | $28M  |
  | Red (Critical)   |   4 | $6.2M |
  | Purple (Emergency)|  0 | $0    |
  | Delivered        |   2 | $0.8M |
  +-------------+-------+----------+

  CRITICAL ITEMS (Red):
  1. PO-2025-1847, SAG Mill Main Motor (5,000 kW)
     Vendor: WEG Motors, Brazil
     Issue: Stator winding copper wire supply chain disruption
     Original delivery: 2027-01-15 | Revised: 2027-04-01 (+75 days)
     Required on-site: 2027-03-01
     Impact: 30-day gap; delays mill commissioning start
     Action: Air freight from Santos to San Antonio authorized ($180K)
     New forecast with air freight: 2027-03-15 (+14 days, within float)

  2. PO-2025-2103, Primary Crusher Mantle & Concave Set (Insurance Spare)
     Vendor: CITIC Heavy Industries, China
     Issue: Manufacturing delay; casting quality issue on first attempt
     Original delivery: 2026-12-01 | Revised: 2027-02-15 (+76 days)
     Required on-site: 2027-05-01
     Impact: Within float but tight; insurance spare needed for ramp-up
     Action: Vendor re-casting in progress; next FAT scheduled 2027-01-20

  3. PO-2025-2250, 150kV Power Transformer
     Vendor: Siemens Energy, Germany
     Issue: Transformer core steel allocation delayed by 3 weeks
     Original delivery: 2027-02-01 | Revised: 2027-02-22 (+21 days)
     Required on-site: 2027-04-01
     Impact: Within float (39 days remaining); monitoring closely
     Action: Weekly vendor calls; factory visit scheduled 2026-09

  4. PO-2026-0456, DCS I/O Modules (Yokogawa CENTUM VP)
     Vendor: Yokogawa, Japan
     Issue: Semiconductor supply chain affecting FPGA chips
     Original delivery: 2026-11-01 | Revised: 2027-01-15 (+76 days)
     Required on-site: 2027-03-01
     Impact: Within float (45 days); but trend concerning
     Action: Alternative chip supplier being qualified by Yokogawa
     Contingency: Honeywell Experion has compatible I/O with 20-week lead time

  DELIVERIES THIS WEEK: 0 items

  UPCOMING DELIVERIES (Next 30 days):
  - PO-2025-1502: Conveyor belt (1,200m), arriving 2026-06-25
  - PO-2025-1689: Thickener mechanism, arriving 2026-07-03

  ACTIONS REQUIRED:
  1. Approve air freight for SAG mill motor ($180K) -- Decision: Project Director
  2. Confirm Yokogawa alternative chip timeline -- Procurement team, by 2026-06-19
  3. Schedule factory visit to CITIC for crusher casting -- Inspector, Sept 2026
```

### Example 2: Expediting Decision for Critical Item

```
Command: track-long-lead-procurement expedite --po PO-2025-1847

EXPEDITING ANALYSIS: SAG Mill Main Motor (5,000 kW)
============================================

Current Situation:
  Vendor: WEG Motors (Jaragu do Sul, Brazil)
  PO Value: $4.2M
  PO Date: 2025-08-15
  Promised Delivery: 2027-01-15 (ex-works)
  Revised Forecast: 2027-04-01 (ex-works) -- 75 day delay
  Required On-Site: 2027-03-01

  Root Cause: Global copper wire shortage affecting stator winding
  manufacturing. WEG's supplier delayed delivery of specialty enameled
  copper wire by 10 weeks. Manufacturing timeline compressed where possible
  but still net 75-day delay.

  Normal Logistics (Sea Freight):
    Ex-works to Santos port: 3 days
    Sea freight Santos to San Antonio, Chile: 20-25 days
    Customs clearance: 10-15 days
    Transport to site: 5 days
    TOTAL: 38-48 days
    Normal delivery to site: 2027-05-19 (75 days after required-on-site)

Options Analysis:
  Option A: Accept Delay
    - Motor arrives site: 2027-05-19 (75 days late)
    - Commissioning impact: SAG mill circuit delayed 75 days
    - Production impact: $45M/month x 2.5 months = $112M in deferred revenue
    - Cost: $0 additional procurement cost
    - Risk: Other systems idle while waiting for mill

  Option B: Air Freight (Recommended)
    - Ex-works: 2027-04-01
    - Air freight Santos to Santiago (AN-124 Antonov charter): 2 days
    - Customs (pre-cleared): 5 days
    - Oversize transport to site: 7 days
    - Arrival at site: 2027-04-15 (45 days late, but within 38-day float)
    - Commissioning impact: 7-day delay (within recovery range)
    - Production impact: ~$10M in compressed ramp-up
    - Cost: $180K air freight + $45K special transport = $225K
    - Risk: Low (AN-124 availability confirmed)
    - ROI: ($112M avoided delay - $225K expediting) / $225K = 497:1

  Option C: Alternative Vendor (ABB, Switzerland)
    - ABB can deliver identical spec motor in 32 weeks from order
    - If ordered today: delivery 2027-01-30 (sea freight to Chile)
    - Arrives site: 2027-03-15 (14 days late, within float)
    - Cost: $4.8M (14% premium over WEG price)
    - Premium cost: $600K
    - Risk: Medium (new motor requires re-validation of foundation design)
    - Additional cost: $80K for foundation re-check
    - Total cost: $680K but eliminates all delay risk

  Option D: Vendor Recovery (WEG Acceleration)
    - WEG can add 2nd shift on motor assembly: reduces delay by 15 days
    - Vendor absorbs cost (contractual obligation for partial recovery)
    - Revised delivery: 2027-03-15 ex-works
    - Combined with air freight: arrive site 2027-03-29 (28 days late, within float)
    - Cost: $225K air freight only (vendor absorbs acceleration cost)

RECOMMENDATION: Option D (Vendor Recovery + Air Freight)
  - Delivery to site: 2027-03-29 (within schedule float)
  - Cost: $225K (lowest option that eliminates schedule risk)
  - Vendor contractually obligated for partial recovery
  - Air freight provides additional schedule protection
  - Decision required by: 2026-06-30 (to confirm AN-124 booking)
```
