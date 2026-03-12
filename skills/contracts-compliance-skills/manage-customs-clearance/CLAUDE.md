---
name: manage-customs-clearance
description: "Manage import documentation, HS codes, customs brokers, duty calculations, and Chilean/Peruvian customs clearance for OR projects. Triggers: 'customs clearance', 'import documentation', 'despacho aduanero'."
---

# Manage Customs Clearance

## Skill ID: manage-customs-clearance
## Version: 1.0.0
## Category: C - Tracking
## Priority: Medium

---

## Purpose

Manage the end-to-end customs clearance process for imported equipment, spare parts, materials, and consumables required by Operational Readiness projects, with specific focus on Chilean and Peruvian import regulations. This skill covers import documentation preparation, Harmonized System (HS) code classification, customs broker coordination, duty and tax calculations, regulatory permit management, and clearance timeline tracking to ensure materials clear customs efficiently and reach project sites without unnecessary delays or financial penalties.

Customs clearance is a critical bottleneck in international capital project supply chains. For mining, oil and gas, chemical, and energy projects in Latin America, a substantial portion of equipment and materials is sourced internationally -- from manufacturers in Europe, North America, and Asia-Pacific. Every imported item must pass through the customs clearance process, which involves government agencies, documentation requirements, inspections, duty payments, and regulatory compliance checks that can take anywhere from 2 days (optimal) to 6+ weeks (worst case) depending on preparation quality and cargo complexity.

Industry data quantifies the cost of customs delays. The World Bank's Logistics Performance Index ranks Chile at approximately 34th globally for customs efficiency, with average clearance times of 3-7 business days for well-documented shipments but 2-4 weeks for shipments with documentation deficiencies. Peru ranks approximately 83rd, with average clearance times 30-50% longer than Chile. For capital projects, customs delays compound because multiple shipments are on the critical path simultaneously -- a single documentation error on one shipment can consume customs broker attention and delay processing of other shipments.

The financial impact extends beyond direct delay costs. Incorrect HS code classification can result in overpayment of duties (recoverable but time-consuming) or underpayment leading to penalties and fines (10-200% of the underpaid duty amount in Chilean law). Failure to obtain required import permits before shipment arrival leads to cargo held at port at demurrage rates of $100-500/day per container. Items imported under temporary import regimes (for construction) that are not properly converted to definitive import when retained for operations create cumulative compliance liabilities.

For Operational Readiness, customs clearance directly affects commissioning readiness. Equipment and spare parts that clear customs on time can be installed and tested per schedule; those that are delayed at customs create gaps in the commissioning sequence. This skill integrates with manage-logistics-coordination for transport planning, track-long-lead-procurement for procurement milestone tracking, track-material-receipts for post-clearance goods receipt, and the OR Orchestrator for program-level readiness reporting.

---

## Intent & Specification

The AI agent MUST understand and execute the following core objectives:

1. **HS Code Classification**: Accurately classify all imported items using the Harmonized System nomenclature. Ensure correct 8-digit or 10-digit national tariff codes for Chile (Arancel Aduanero Nacional) and Peru (Arancel de Aduanas). Incorrect classification is the single most common cause of customs delays and penalties.

2. **Import Documentation Management**: Prepare, validate, and track all required import documents:
   - Commercial invoice (factura comercial)
   - Packing list (lista de empaque)
   - Bill of lading / airway bill (conocimiento de embarque / guia aerea)
   - Certificate of origin (certificado de origen) for preferential duty rates under free trade agreements
   - Phytosanitary / sanitary certificates where required
   - Technical standards compliance certificates (normas tecnicas)
   - Insurance certificate
   - Import declaration (Declaracion de Importacion / DIN in Chile, DAM in Peru)

3. **Customs Broker Coordination**: Manage relationships with licensed customs brokers (agentes de aduana), ensuring they receive complete documentation before cargo arrival, process declarations promptly, and resolve any customs queries efficiently. Monitor broker performance and maintain backup broker relationships.

4. **Duty & Tax Calculation**: Calculate applicable import duties, value-added tax (IVA: 19% in Chile, 18% IGV in Peru), and any additional levies (anti-dumping duties, safeguard measures) for budgeting and payment planning. Identify duty reduction opportunities through free trade agreements (FTAs), temporary import regimes, and duty drawback provisions.

5. **Regulatory Permits & Certifications**: Identify and obtain all required regulatory permits before cargo arrival:
   - SAG (Servicio Agricola y Ganadero) permits for items with phytosanitary risk (wooden packaging, organic materials)
   - ISP (Instituto de Salud Publica) permits for pharmaceutical/chemical products
   - SEC (Superintendencia de Electricidad y Combustibles) certifications for electrical equipment
   - DIRECTEMAR permits for hazardous materials
   - Mining-specific permits for explosives and controlled substances

6. **Free Trade Agreement Optimization**: Maximize duty savings by correctly applying Chile's extensive FTA network (agreements with EU, USA, China, Japan, South Korea, EFTA, P4, Pacific Alliance, CPTPP, among others). Verify origin qualification for each item and ensure proper certification.

7. **Clearance Timeline Tracking**: Track each shipment through customs clearance stages: pre-arrival documentation, arrival notification, declaration filing, document review, physical inspection (if selected), duty payment, customs release, and gate-out. Detect delays and escalate immediately.

8. **Compliance & Audit Readiness**: Maintain complete records of all customs transactions for regulatory audit compliance. Chilean customs (Servicio Nacional de Aduanas) can audit import transactions up to 5 years after import. Ensure defensible documentation trail.

---

## Trigger / Invocation

```
/manage-customs-clearance
```

**Aliases**: `/customs-tracker`, `/import-clearance`, `/despacho-aduana`, `/tramites-aduaneros`

**Primary Trigger Commands:**
- `manage-customs-clearance status --project [name]`
- `manage-customs-clearance classify --item [description] --origin [country]`
- `manage-customs-clearance calculate-duty --hs-code [code] --value [CIF-value] --origin [country]`
- `manage-customs-clearance prepare-docs --shipment [ID]`
- `manage-customs-clearance fta-check --item [description] --origin [country]`
- `manage-customs-clearance permit-check --item [description]`
- `manage-customs-clearance broker-status --shipment [ID]`
- `manage-customs-clearance dashboard --project [name]`

**Automatic Triggers:**
- T-30 days before vessel ETA: Initiate documentation preparation
- T-14 days before vessel ETA: Document completeness check
- T-7 days before vessel ETA: Submit pre-arrival documentation to customs broker
- When vessel arrives at port: Monitor declaration filing and processing
- When customs query issued: Immediate notification and response coordination
- When customs releases cargo: Notify logistics team for inland transport
- Daily: Status check on all shipments in customs clearance process
- Monthly: Customs cost reconciliation and compliance review

**Event-Driven Triggers:**
- New shipment booked requiring import documentation
- Customs broker reports documentation deficiency
- Customs authority selects shipment for physical inspection
- Regulatory authority issues new import requirements
- Free trade agreement terms change
- Exchange rate significant movement affecting duty calculations
- Customs authority issues penalty or fine notice

---

## Input Requirements

### Required Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Shipment Documentation | Supplier / freight forwarder | Yes | Commercial invoice, packing list, bill of lading for each shipment |
| Equipment/Material Specifications | mcp-erp / engineering | Yes | Technical descriptions for accurate HS code classification |
| Supplier Origin Certificates | Supplier | Yes | Certificates of origin for FTA duty preference claims |
| Customs Broker Contract | Procurement | Yes | Engaged customs broker with power of attorney for import declarations |
| Project Import Budget | agent-finance | Yes | Approved budget for duties, taxes, and customs processing fees |

### Recommended Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Chilean Tariff Schedule | Servicio Nacional de Aduanas | Current duty rates by HS code |
| FTA Origin Rules | DIRECON / trade agreements | Rules of origin for preferential duty treatment |
| Regulatory Permit Register | SAG, ISP, SEC, DIRECTEMAR | Required permits by product type |
| Historical Import Data | Previous projects | Past classifications, duty rates, and clearance times for similar items |
| Vessel Schedule | Shipping line / manage-logistics-coordination | Arrival dates for pre-arrival documentation timing |

### Optional Inputs

| Input | Source | Description | Default if Absent |
|-------|--------|-------------|-------------------|
| Anti-Dumping Duty Register | WTO / Chilean customs | Active anti-dumping or countervailing duties | Checked per classification |
| Temporary Import Regime Status | Customs broker | Items imported under temporary regime requiring conversion | Definitive import assumed |
| Insurance Valuation | Insurance broker | Insured values for customs valuation | CIF value used |
| Historical Broker Performance | Previous projects | Clearance time and accuracy data by broker | New broker assumed |
| Exchange Rate Forecasts | Treasury / financial data | For duty cost forecasting in project currency | Spot rate used |

---

## Output Specification

### Primary Output: Customs Clearance Tracker (.xlsx)

**Filename:** `{ProjectCode}_Customs_Clearance_v{version}_{date}.xlsx`

**Workbook Structure:**

#### Sheet 1: "Dashboard Summary"
- Total shipments in customs process: count and CIF value
- Status distribution: Pre-Arrival Docs / At Port Awaiting Filing / Under Review / Inspection / Duty Payment / Cleared
- Average clearance time: actual vs. target (5 business days)
- Shipments at risk of delay: count and commissioning impact
- Duty and tax summary: estimated vs. actual, FTA savings achieved
- Pending regulatory permits: count and status

#### Sheet 2: "Customs Clearance Register"
| Shipment ID | PO # | Description | Origin | CIF Value ($) | HS Code | Duty Rate | Duty Amount | IVA | Total Tax | FTA Applied | Permit Required | Declaration # | Status | Submit Date | Clear Date | Days in Customs |
|-------------|------|-------------|--------|-------------|---------|----------|------------|-----|----------|------------|----------------|--------------|--------|-----------|-----------|----------------|

#### Sheet 3: "HS Classification Register"
| Material # | Description | Technical Specs | HS Code (6-digit) | National Code (8/10) | Duty Rate | FTA Eligible | FTA Origin Country | Preferential Rate | Notes | Validated By |
|-----------|-------------|----------------|-------------------|---------------------|----------|-------------|-------------------|------------------|-------|------------|

#### Sheet 4: "Document Checklist per Shipment"
| Shipment ID | Commercial Invoice | Packing List | Bill of Lading | Certificate of Origin | Insurance Cert | SAG Permit | ISP Permit | SEC Cert | Other Permits | All Complete | Missing Items |
|-------------|-------------------|-------------|---------------|---------------------|---------------|-----------|-----------|---------|--------------|-------------|-------------|

#### Sheet 5: "Duty & Tax Calculator"
| Shipment ID | CIF Value (USD) | Exchange Rate | CIF Value (CLP) | HS Code | MFN Duty Rate | FTA Rate | Duty Savings | Duty Amount | IVA (19%) | Anti-Dumping | Total Customs Cost | Budget Allocation | Variance |
|-------------|----------------|--------------|----------------|---------|-------------|---------|-------------|------------|----------|-------------|-------------------|------------------|---------|

#### Sheet 6: "FTA Optimization Register"
| Material # | HS Code | Origin Country | Applicable FTA | Rule of Origin | Origin Certificate Type | Preferential Rate | MFN Rate | Savings per Unit | Total Savings | Documentation Status |
|-----------|---------|---------------|---------------|---------------|----------------------|------------------|---------|-----------------|-------------|-------------------|

#### Sheet 7: "Regulatory Permits Tracker"
| Permit Type | Authority | Material/Equipment | Application Date | Expected Approval | Actual Approval | Status | Linked Shipments | Impact if Delayed |
|------------|----------|-------------------|-----------------|------------------|----------------|--------|-----------------|-----------------|

#### Sheet 8: "Customs Issues & Resolution Log"
| Issue Date | Shipment ID | Issue Type | Description | Customs Reference | Broker Action | Resolution Date | Days to Resolve | Financial Impact | Lessons Learned |
|-----------|-------------|-----------|-------------|------------------|-------------|----------------|----------------|-----------------|----------------|

### Secondary Output: Monthly Customs Report (.docx)
**Filename:** `{ProjectCode}_Customs_Monthly_{month}_{date}.docx`

Narrative report (3-5 pages):
1. Executive summary: clearance volumes, average processing times, duty costs
2. Shipments cleared this period: count, value, average clearance time
3. Issues encountered and resolution status
4. FTA savings achieved vs. potential
5. Regulatory permit status update
6. Budget update: duties and taxes actual vs. budget
7. Broker performance assessment
8. Recommendations for upcoming period

### Formatting Standards
- Status colors: Blue (#0070C0) Pre-Arrival, Yellow (#FFD700) Under Review, Orange (#FF8C00) Inspection, Red (#FF0000) Issue/Hold, Green (#00B050) Cleared
- FTA savings: Green highlighted cells with savings amounts
- Overdue items: Red cell fill with white text
- Duty rates: displayed as percentage with 2 decimal places
- All monetary values in both USD and local currency (CLP/PEN)
- Dates in YYYY-MM-DD format

---

## Procedure

### Phase 1: Pre-Import Planning (Steps 1-4)

**Step 1: HS Code Classification**
1. For each item to be imported, obtain detailed technical description:
   - Material composition, function, application, technical specifications
   - Manufacturer, model, country of manufacture
2. Classify using Harmonized System nomenclature:
   - Start with 6-digit international HS code (WCO harmonized)
   - Extend to national code: Chile uses 8-digit Arancel Aduanero Nacional; Peru uses 10-digit
   - Cross-reference with Servicio Nacional de Aduanas binding rulings for similar items
3. Verify classification against historical imports of similar items (avoid reclassification risk)
4. For ambiguous items: request binding ruling from customs authority (takes 30-60 days)
5. Document classification rationale for audit defense
6. Record classification in HS Classification Register

**Step 2: Duty & Tax Calculation**
1. Determine applicable duty rate for each HS code:
   - Most Favored Nation (MFN) rate from national tariff schedule
   - Check for preferential rate under applicable FTA
   - Check for anti-dumping or countervailing duties
   - Check for safeguard measures or temporary surcharges
2. For FTA preference:
   - Verify item qualifies under origin rules of the applicable FTA
   - Confirm supplier can provide required certificate of origin (EUR.1, Form A, CPTPP certificate, etc.)
   - Calculate duty savings to justify effort of obtaining origin documentation
3. Calculate total customs cost: (CIF value x duty rate) + IVA on (CIF + duty) + processing fees
4. Aggregate across all planned imports for budget allocation
5. Report projected duty and tax costs to agent-finance

**Step 3: Regulatory Permit Identification**
1. Screen all imported items against regulatory requirements:
   - Wood packaging (pallets, crates): SAG phytosanitary treatment certificate (ISPM-15)
   - Chemical products: ISP import authorization, safety data sheets in Spanish
   - Electrical equipment: SEC certification or exemption
   - Pressure vessels: certification per Chilean/Peruvian pressure equipment regulations
   - Radioactive sources: CCHEN (Comision Chilena de Energia Nuclear) import permit
   - Explosives/controlled substances: DGMN (Direccion General de Movilizacion Nacional) permit
   - Hazardous materials: DIRECTEMAR for maritime transport, DGAC for air transport
2. For items requiring permits: initiate application process immediately (many take 30-90 days)
3. Track permit status in Regulatory Permits Tracker
4. Do not ship items until all required permits are in hand or confirmed in process

**Step 4: Customs Broker Engagement**
1. Brief customs broker on project scope: estimated shipment volumes, types of cargo, import regime
2. Provide power of attorney (poder especial) for import declarations
3. Share HS classification register for broker review and validation
4. Establish communication protocol: documentation submission, query response, status reporting
5. Agree on service levels: declaration filing within 24 hours of cargo arrival, query response within 4 hours
6. Confirm broker capacity for project peak periods (multiple simultaneous clearances)

### Phase 2: Active Clearance Management (Steps 5-8)

**Step 5: Pre-Arrival Documentation**
1. T-30 days before vessel ETA:
   - Request commercial invoice from supplier (verify matches PO terms)
   - Request packing list (detailed, item-by-item with weights and dimensions)
   - Request certificate of origin (if claiming FTA preference)
   - Request any required test certificates, material certificates, or compliance declarations
2. T-14 days: document completeness review
   - Check all documents against customs requirements checklist
   - Verify consistency: invoice matches PO, packing list matches invoice, B/L matches packing list
   - Identify missing documents and urgently request from supplier
3. T-7 days: submit complete documentation package to customs broker
   - Broker reviews and prepares import declaration (DIN)
   - Broker identifies any potential issues and flags for resolution
   - Pre-calculate duties and taxes for payment preparation

**Step 6: Customs Declaration & Processing**
1. When vessel arrives and cargo is available:
   - Customs broker files import declaration electronically (SISCOMEX/VNUCE system)
   - Declaration enters customs processing: documentary review or physical inspection channel
   - Green channel: documentary review only (60-70% of declarations in Chile)
   - Orange channel: detailed documentary review (20-25%)
   - Red channel: physical inspection required (5-15%)
2. If documentary query from customs:
   - Broker notifies immediately
   - Prepare and submit response within 24 hours
   - Common queries: valuation questions, classification challenges, origin verification
3. If physical inspection selected:
   - Coordinate with broker for inspection scheduling
   - Ensure cargo is accessible for inspection (container unstuffed if required)
   - Attend inspection if complex equipment requiring technical explanation
   - Respond to any findings immediately
4. Upon clearance: authorize duty and tax payment through broker
5. Obtain customs release (levante) and coordinate with logistics for cargo collection

**Step 7: Handle Customs Issues**
1. Classification disputes:
   - Customs may challenge HS code classification and apply different rate
   - Respond with technical justification and supporting documentation
   - If rate is higher: assess whether to accept, negotiate, or appeal
   - File formal appeal (reclamacion) within 90 days if substantial amount involved
2. Valuation challenges:
   - Customs may question declared CIF value (especially for related-party transactions)
   - Provide supporting evidence: purchase order, market price comparisons, prior import values
   - If additional duty assessed: pay under protest and file appeal to preserve rights
3. Documentation deficiencies:
   - If documents are missing or incorrect: provide corrected documents as urgently as possible
   - Every day of delay at customs incurs port storage and demurrage costs
   - For recurring documentation issues: address root cause with supplier
4. Log all issues in Customs Issues & Resolution Log with resolution and lessons learned

**Step 8: Post-Clearance Activities**
1. Confirm cargo released from port/airport
2. Notify manage-logistics-coordination for inland transport coordination
3. Notify track-material-receipts for site receiving preparation
4. Archive all customs documentation:
   - Import declaration and supporting documents (retain minimum 5 years)
   - Duty payment receipts
   - Inspection reports (if applicable)
   - Correspondence with customs authority
5. Reconcile actual duties and taxes against estimates:
   - Update duty and tax tracker with actual costs
   - Report variances to agent-finance
6. For temporary imports: diarize regime expiry dates and conversion/re-export deadlines

### Phase 3: Compliance & Optimization (Steps 9-12)

**Step 9: FTA Savings Optimization**
1. Review all imports for FTA eligibility not yet claimed
2. For items from FTA partner countries without preference claimed:
   - Contact supplier to request certificate of origin
   - Calculate potential duty savings
   - If savings justify effort: file amended declaration for duty refund (within statutory period)
3. Track cumulative FTA savings achieved vs. potential
4. Report savings to project management and agent-finance

**Step 10: Broker Performance Monitoring**
1. Track broker KPIs: clearance time, first-time acceptance rate, query response time, error rate
2. Compare against agreed service levels
3. Address underperformance with corrective action meetings
4. Maintain backup broker relationship for contingency

**Step 11: Compliance Audit Preparation**
1. Maintain organized customs file per shipment with all supporting documents
2. Quarterly self-audit: sample 10% of declarations for accuracy
3. Verify HS classifications remain valid (tariff schedule changes annually)
4. Ensure temporary import items are properly tracked and regime obligations met
5. Prepare compliance summary for external audit if triggered

**Step 12: Lessons Learned & Knowledge Base**
1. Document common customs issues and successful resolution approaches
2. Build HS classification database for project-type-specific items
3. Record actual clearance times by port, broker, and cargo type
4. Feed lessons into future project customs planning
5. Update regulatory permit lead time estimates based on actual experience

---

## Quality Criteria

| Criterion | Metric | Target | Minimum Acceptable |
|-----------|--------|--------|-------------------|
| Classification Accuracy | HS codes accepted without challenge | >95% | >90% |
| Documentation Completeness | Shipments with complete docs at T-7 | >95% | >90% |
| Clearance Time | Average days from arrival to customs release | <5 days | <7 days |
| First-Time Acceptance | Declarations cleared without customs query | >80% | >70% |
| FTA Utilization | Eligible shipments with FTA preference claimed | >90% | >80% |
| Duty Budget Accuracy | Actual duties within 10% of budget estimate | >90% | >80% |
| Permit Timeliness | Required permits obtained before cargo arrival | 100% | >95% |
| Issue Resolution | Customs issues resolved within 5 business days | >80% | >70% |
| Compliance Record | Zero customs penalties or fines | 100% | 100% |
| Broker Response Time | Broker responds to queries within 4 hours | >90% | >80% |
| Archive Completeness | All customs documents properly archived | 100% | 100% |
| Report Timeliness | Monthly reports distributed on schedule | 100% | >95% |

---

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs FROM other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-logistics-coordination` | Shipping documents | Bills of lading, vessel schedules, and shipping details for customs processing |
| `track-long-lead-procurement` | PO details | Purchase order data for import declaration preparation |
| `agent-procurement` | Supplier documents | Commercial invoices, certificates of origin, technical certificates |
| `agent-finance` | Duty budget | Approved budget for import duties, taxes, and customs processing fees |
| `map-regulatory-requirements` | Regulatory framework | Applicable regulatory requirements for imported items |

### Downstream Dependencies (Outputs TO other agents)

| Agent/Skill | Dependency | Description |
|-------------|------------|-------------|
| `manage-logistics-coordination` | Clearance status | Customs release notification for inland transport coordination |
| `track-material-receipts` | Release notification | Notification that materials are cleared and en route to site |
| `track-long-lead-procurement` | Customs milestone | Customs clearance milestone update for procurement tracking |
| `agent-finance` | Duty costs | Actual duty and tax payments for project cost reporting |
| `orchestrate-or-program` | Customs readiness | Clearance status data for OR program monitoring and gate reviews |

---

## References

### Regulations & Legal Framework
- **Chilean Customs Ordinance (Ordenanza de Aduanas, DFL 30/2004)** -- Primary customs law
- **Chilean Customs Regulations (Compendio de Normas Aduaneras)** -- Detailed operational regulations
- **Peruvian General Customs Law (Decreto Legislativo 1053)** -- Peruvian customs framework
- **Harmonized System Convention (WCO)** -- International goods classification framework
- **INCOTERMS 2020** -- Trade terms governing customs obligations by buyer/seller
- **Chilean FTA Network** -- Agreements with EU, USA, China, Japan, CPTPP, Pacific Alliance, etc.

### Industry Resources
- World Customs Organization (WCO) -- HS classification guidance and rulings
- Servicio Nacional de Aduanas (Chile) -- Tariff schedule, regulations, binding rulings
- SUNAT (Peru) -- Peruvian customs authority procedures and tariff
- World Bank Logistics Performance Index -- Country-level customs benchmarks
- VSC Corporate Pain Points Research Report -- D-04, OG-01

### Templates
- `templates/customs_clearance_tracker.xlsx` -- Master customs tracking workbook
- `templates/hs_classification_register.xlsx` -- HS code classification database
- `templates/import_document_checklist.xlsx` -- Per-shipment documentation checklist
- `templates/duty_calculator.xlsx` -- Duty and tax calculation workbook
- `templates/monthly_customs_report.docx` -- Monthly report template

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025-02-25 | VSC AI Architect | Initial skill definition for Wave 1 deployment |
