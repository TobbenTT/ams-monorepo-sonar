# Trilingual Software Glossary / Glossaire Trilingue / المسرد الثلاثي اللغات

**OCP Maintenance AI MVP** -- Reliability Centered Maintenance Platform for Phosphate Processing

| Audience | Language |
|----------|----------|
| Business stakeholders, management | Francais (primary) |
| Official documentation, regulatory | العربية (Arabic) |
| Technical staff, software engineers | English |

> **Convention**: Where a French or Arabic acronym differs from the English original, both are shown. Acronyms that are used identically across all three languages (e.g., SAP, OEE, RPN) are not translated.

---

## Domain 1: Maintenance Methodology / Methodologie de maintenance / منهجية الصيانة

| English | Francais | العربية | Definition |
|---------|----------|---------|------------|
| RCM (Reliability Centered Maintenance) | MBF (Maintenance Basee sur la Fiabilite) | الصيانة المرتكزة على الموثوقية (MBF/RCM) | Systematic methodology for identifying the most effective maintenance strategy for each failure mode based on consequences and feasibility. |
| FMEA (Failure Mode and Effects Analysis) | AMDE (Analyse des Modes de Defaillance et de leurs Effets) | تحليل انماط الفشل وآثارها (AMDE) | Structured approach to identify potential failure modes, their causes, and effects on system performance. Each failure mode is defined as What + Mechanism + Cause. |
| FMECA (Failure Mode, Effects and Criticality Analysis) | AMDEC (Analyse des Modes de Defaillance, de leurs Effets et de leur Criticite) | تحليل انماط الفشل وآثارها وحرجيتها (AMDEC) | Extension of FMEA that adds criticality ranking via RPN (Severity x Occurrence x Detection) to prioritize risk mitigation actions. |
| CBM (Condition Based Maintenance) | MBC (Maintenance Basee sur la Condition) | الصيانة المبنية على الحالة | Maintenance strategy triggered by detectable equipment condition indicators (vibration, temperature, oil analysis) rather than fixed schedules. Requires a measurable P-F interval. |
| FT (Fixed Time Maintenance) | MT (Maintenance a Temps Fixe) | الصيانة بوقت ثابت | Scheduled restoration or discard at predetermined intervals. Applicable only to age-related failure patterns (A, B, C). |
| FFI (Failure Finding Interval) | IDD (Intervalle de Detection de Defaillance) | فترة اكتشاف الفشل | Periodic functional test to discover hidden failures in protective devices (e.g., safety relief valves, fire suppression systems). |
| RTF (Run to Failure) | MJD (Maintenance Jusqu'a la Defaillance) | التشغيل حتى الفشل | Deliberate decision to allow non-critical equipment to fail, applied when cost of prevention exceeds cost of failure and no safety/environmental consequences exist. |
| RPN (Risk Priority Number) | NPR (Nombre de Priorite de Risque) | رقم اولوية المخاطر | Quantitative risk score: RPN = Severity x Occurrence x Detection. Range 1--1000. Categories: LOW (1--49), MEDIUM (50--99), HIGH (100--199), CRITICAL (200--1000). |
| PDCA (Plan-Do-Check-Act) | PDCA (Planifier-Deployer-Controler-Agir) | خطط-نفذ-تحقق-صحح | Iterative four-phase management cycle for continuous improvement of processes and products. |
| CAPA (Corrective and Preventive Action) | ACAP (Action Corrective et Action Preventive) | الاجراءات التصحيحية والوقائية | Systematic process to investigate root causes of nonconformities, implement corrective actions, and establish preventive measures. |
| VED Analysis (Vital-Essential-Desirable) | Analyse VED (Vital-Essentiel-Desirable) | تحليل VED (حيوي-اساسي-مرغوب) | Spare parts classification by operational criticality: Vital (production stops), Essential (degraded performance), Desirable (convenience). |
| FSN Analysis (Fast-Slow-Non-moving) | Analyse FSN (Rapide-Lent-Non-mobile) | تحليل FSN (سريع-بطيء-راكد) | Inventory classification by consumption velocity to optimize stock levels and identify obsolete materials. |
| ABC Analysis | Analyse ABC | تحليل ABC | Pareto-based inventory classification by annual consumption value: A (top 70--80%), B (15--20%), C (5--10%). |
| 5W2H / 5W+2H | 5W2H (Quoi-Quand-Ou-Qui-Pourquoi-Comment-Combien) | 5W2H (ماذا-متى-اين-من-لماذا-كيف-كم) | Structured questioning framework: What, When, Where, Who, Why, How, How Much. Used for Level 1 quick RCA per GFSN REF-15. |
| Ishikawa Diagram (Fishbone / Cause-Effect) | Diagramme d'Ishikawa (Arete de poisson / Cause-Effet) | مخطط إيشيكاوا (عظمة السمكة / السبب والاثر) | Visual root cause analysis tool organizing potential causes into categories (Man, Machine, Method, Material, Milieu, Measurement). |
| Weibull Analysis | Analyse de Weibull | تحليل ويبل | Statistical method using the Weibull distribution to model failure data. Beta (shape) identifies failure pattern; Eta (scale) estimates characteristic life. |
| Jack-Knife Analysis | Analyse Jack-Knife (Diagramme Jack-Knife) | تحليل Jack-Knife | Bad actor identification method plotting frequency vs. downtime to classify equipment as Acute, Chronic, Complex, or Controlled. |
| Pareto Analysis | Analyse de Pareto | تحليل باريتو | Prioritization technique based on the 80/20 principle: identifies the vital few contributors to the majority of failures or costs. |
| LCC (Life Cycle Cost) | CCV (Cout du Cycle de Vie) | تكلفة دورة الحياة | Total cost of ownership from acquisition through operation, maintenance, and disposal. Used to compare maintenance strategy economics. |
| OCR (Optimal Cost Replacement) | RCO (Remplacement a Cout Optimal) | الاستبدال بالتكلفة المثلى | Analysis to find the optimal preventive maintenance interval that minimizes total cost (PM cost + expected failure cost). |
| MoC (Management of Change) | GdC (Gestion du Changement) | ادارة التغيير | Formal process to evaluate, approve, implement, and close changes to equipment, procedures, or processes. Workflow: DRAFT - SUBMITTED - REVIEWING - APPROVED - IMPLEMENTING - CLOSED. |
| RBI (Risk-Based Inspection) | IBR (Inspection Basee sur le Risque) | التفتيش المبني على المخاطر | Methodology using a 5x5 probability-consequence risk matrix to prioritize inspection activities for static equipment. |
| P-F Interval | Intervalle P-F | فترة P-F | Time between the detectable onset of a potential failure (P) and functional failure (F). Determines CBM inspection frequency (inspect at intervals less than P-F). |
| MTBF (Mean Time Between Failures) | MTBF (Temps Moyen entre Defaillances) | متوسط الوقت بين الاعطال | Average elapsed time between consecutive failures of a repairable system. Key reliability KPI. |
| MTTR (Mean Time to Repair) | MTTR (Temps Moyen de Reparation) | متوسط وقت الاصلاح | Average time required to restore a failed system to operational status. Key maintainability KPI. |
| OEE (Overall Equipment Effectiveness) | TRG (Taux de Rendement Global) | الفعالية الشاملة للمعدات | Composite metric: OEE = Availability x Performance x Quality. Measures manufacturing productivity. |
| Asset Health Index | Indice de sante de l'actif | مؤشر صحة الاصل | Composite score reflecting current equipment condition based on criticality, backlog, failure mode coverage, and pending work. |
| Failure Pattern A (Bathtub) | Modele de defaillance A (Baignoire) | نمط الفشل A (حوض الاستحمام) | Nowlan and Heap pattern: high infant mortality, constant rate, then wear-out. Low prevalence in industrial equipment. |
| Failure Pattern B (Age-Related) | Modele de defaillance B (Lie a l'age) | نمط الفشل B (مرتبط بالعمر) | Increasing failure probability with age. Applicable to simple components subject to fatigue or corrosion. |
| Failure Pattern C (Fatigue) | Modele de defaillance C (Fatigue) | نمط الفشل C (الاجهاد) | Slowly increasing failure probability. No distinct wear-out region. Moderate prevalence. |
| Failure Pattern D (Stress-Related) | Modele de defaillance D (Lie au stress) | نمط الفشل D (مرتبط بالاجهاد) | Constant failure probability at any age after initial break-in. Moderate prevalence. |
| Failure Pattern E (Random) | Modele de defaillance E (Aleatoire) | نمط الفشل E (عشوائي) | Constant failure probability at any age. High prevalence in complex systems. |
| Failure Pattern F (Early Life) | Modele de defaillance F (Mortalite infantile) | نمط الفشل F (الحياة المبكرة) | Highest failure rate when new, decreasing to constant. Most common pattern in industrial equipment. |
| Root Cause Analysis (RCA) | Analyse des Causes Racines (ACR) | تحليل السبب الجذري | Systematic investigation to identify the fundamental cause of a failure event. GFSN 3-level methodology: Physical - Human - Latent causes. |
| Defect Elimination (DE) | Elimination des Defauts (ED) | ازالة العيوب | GFSN 5-stage program: Identify - Prioritize - Analyze - Implement - Control. Aims to permanently remove recurring failure causes. |
| Backlog | Arriere (de maintenance) | تراكم (اعمال الصيانة) | Accumulated maintenance work requests and orders awaiting execution. Measured in total hours. |
| Work Order (WO) | Ordre de Travail (OT) | امر العمل | Formal authorization document specifying maintenance work to be performed, including resources, materials, and scheduling. |
| Maintenance Plan | Plan de maintenance | خطة الصيانة | Scheduled set of maintenance activities for an asset, defining tasks, frequencies, and resource requirements. |
| Task List | Gamme de maintenance | قائمة المهام | Ordered sequence of maintenance operations (inspect, check, test, lubricate, replace, repair) assigned to a work package. |
| Work Package (WP) | Paquet de Travail (PT) | حزمة العمل | Grouped set of maintenance tasks sharing the same labour type, constraint (online/offline), and frequency. Types: Standalone, Suppressive, Sequential. |
| Work Instruction | Instruction de Travail | تعليمات العمل | Detailed step-by-step procedure for executing a specific maintenance task, including safety precautions and quality criteria. |
| Criticality Assessment | Evaluation de la criticite | تقييم الحرجية | 11-criteria risk assessment matrix (Safety, Health, Environment, Production, Operating Cost, Capital Cost, Schedule, Revenue, Communications, Compliance, Reputation) x 5 likelihood levels producing 4 risk classes (I--IV). |
| Hidden Failure | Defaillance cachee | فشل مخفي | Failure that is not evident to operating crew under normal conditions. Requires failure-finding tasks (FFI) to detect. Typically applies to protective devices. |
| Evident Failure | Defaillance evidente | فشل ظاهر | Failure that becomes apparent to operating crew during normal operations through observable symptoms. |
| Functional Failure | Defaillance fonctionnelle | الفشل الوظيفي | Inability of an asset to perform its required function at the required performance standard. Can be Total (complete loss) or Partial (degraded performance). |
| Failure Mode | Mode de defaillance | نمط الفشل | Specific way in which a component fails, defined as What (component) + Mechanism (how it fails) + Cause (why it fails). 72 valid mechanism-cause combinations per SRC-09. |
| Failure Effect | Effet de la defaillance | تاثير الفشل | Observable consequence of a failure mode: evidence, safety threat, production impact, collateral damage, and repair requirements. |
| Failure Consequence | Consequence de la defaillance | عاقبة الفشل | Classification of failure impact: Hidden Safety, Hidden Non-Safety, Evident Safety, Evident Environmental, Evident Operational, Evident Non-Operational. |

---

## Domain 2: OCP / Phosphate Industry / Industrie phosphatiere / صناعة الفوسفات

| English | Francais | العربية | Definition |
|---------|----------|---------|------------|
| Grinding | Broyage | الطحن | Size reduction of phosphate rock using mechanical force in mills (SAG, ball). Primary beneficiation step to liberate phosphate minerals from gangue. |
| Flotation | Flottation | التعويم | Separation process using air bubbles and chemical reagents to selectively concentrate phosphate minerals from ground ore in flotation cells. |
| Sedimentation | Sedimentation | الترسيب | Gravity-driven separation of solid particles from slurry in thickeners. Produces underflow (concentrated solids) and overflow (clarified water). |
| Filtration | Filtration | الترشيح | Mechanical separation of solids from liquids using belt filters or pressure filters to dewater phosphate concentrate. |
| Drying | Sechage | التجفيف | Thermal removal of moisture from phosphate concentrate using rotary dryers to achieve target moisture content for transport or processing. |
| Conveying | Convoyage | النقل بالسيور | Continuous transport of bulk materials (phosphate rock, concentrate, product) via belt conveyors between processing stages. |
| Storage | Stockage | التخزين | Bulk storage of raw materials, intermediates, and finished products in silos, stockpiles, or warehouses. |
| Pumping | Pompage | الضخ | Transfer of slurry, water, or reagents through pipelines using centrifugal or positive displacement pumps. |
| SAG Mill | Broyeur SAG (Broyeur semi-autogene) | طاحونة SAG (شبه ذاتية الطحن) | Semi-Autogenous Grinding mill using a combination of ore and steel balls as grinding media. Primary grinding stage in phosphate beneficiation. |
| Ball Mill | Broyeur a boulets | طاحونة كرات | Rotating cylindrical mill using steel balls as grinding media for secondary/fine grinding of phosphate ore. |
| Slurry Pump | Pompe a boue (Pompe a pulpe) | مضخة الملاط | Heavy-duty centrifugal pump designed to transport abrasive slurry mixtures of ground phosphate rock and water. |
| Thickener | Epaississeur | المكثف | Large settling tank where flocculated slurry is concentrated by gravity. Produces thickened underflow and clear overflow water for recycling. |
| Flotation Cell | Cellule de flottation | خلية التعويم | Vessel in which air is injected into phosphate slurry with reagents; phosphate-bearing froth is collected from the surface. |
| Belt Conveyor | Convoyeur a bande | سير ناقل | Continuous loop belt system for transporting bulk phosphate materials between processing stages. Key components: pulleys, idlers, belt, drive. |
| Belt Filter | Filtre a bande | مرشح شريطي | Continuous vacuum or pressure filter using a moving belt to dewater phosphate slurry into filter cake. |
| Rotary Dryer | Secheur rotatif | مجفف دوار | Cylindrical rotating drum through which hot gas passes to evaporate moisture from wet phosphate concentrate. |
| Crusher | Concasseur | الكسارة | Machine that reduces large phosphate rock pieces to smaller sizes by compression or impact. Types: jaw, cone, gyratory, impact. |
| Screen / Classifier | Crible / Classificateur | غربال / مصنف | Equipment that separates particles by size using vibrating screens (dry) or hydrocyclones (wet classification). |
| Cyclone (Hydrocyclone) | Cyclone (Hydrocyclone) | سيكلون (هيدروسيكلون) | Centrifugal separator that classifies slurry particles by size and density. Overflow (fines) and underflow (coarse) are directed to different process stages. |
| JFC (Jorf Fertilizer Complex) | JFC (Complexe d'Engrais de Jorf Lasfar) | مجمع الاسمدة بالجرف الاصفر (JFC) | OCP's integrated phosphate processing and fertilizer production complex at Jorf Lasfar, Morocco. |
| Equipment Tag | TAG Equipement | علامة المعدات | Unique alphanumeric identifier for physical equipment following OCP naming convention (e.g., BRY-SAG-ML-001). Used for field identification and CMMS cross-reference. |
| Functional Location | Poste technique (Emplacement fonctionnel) | الموقع الوظيفي | Hierarchical position in the plant structure representing where maintenance is performed (SAP TPLNR). Maps physical plant topology. |
| Phosphate Rock | Roche phosphatee (Minerai de phosphate) | صخر الفوسفات | Raw mineral ore containing phosphorus, the primary feedstock for OCP operations. Extracted from Moroccan deposits and processed through beneficiation. |
| Beneficiation | Enrichissement (Valorisation) | الاثراء (التحسين) | Series of physical and chemical processes (crushing, grinding, flotation, drying) to increase the P2O5 content of raw phosphate rock to commercial grade. |

---

## Domain 3: SAP PM (Plant Maintenance) / SAP PM / SAP PM (صيانة المصنع)

| English | Francais | العربية | Definition |
|---------|----------|---------|------------|
| PM01 (Inspection Order) | PM01 (Ordre d'inspection) | PM01 (امر الفحص) | SAP work order type for condition monitoring, inspection rounds, and diagnostic checks. Non-intrusive maintenance. |
| PM02 (Preventive Maintenance Order) | PM02 (Ordre de maintenance preventive) | PM02 (امر الصيانة الوقائية) | SAP work order type for scheduled preventive maintenance tasks: lubrication, replacement, overhaul at fixed intervals. |
| PM03 (Corrective Maintenance Order) | PM03 (Ordre de maintenance corrective) | PM03 (امر الصيانة التصحيحية) | SAP work order type for unplanned repairs and breakdown maintenance following a detected failure. |
| TPLNR (Technical Place Number) | TPLNR (Numero de poste technique) | TPLNR (رقم الموقع الفني) | SAP field identifier for Functional Location. Hierarchical key encoding plant structure (e.g., JFC1-MIN-BRY-01). |
| EQUNR (Equipment Number) | EQUNR (Numero d'equipement) | EQUNR (رقم المعدات) | SAP unique identifier for individual equipment items. Links to functional location, maintenance history, and BOM. |
| LOTO (Lock Out Tag Out) | LOTO (Consignation / Deconsignation) | LOTO (القفل والتعليم) | Safety procedure requiring isolation and tagging of energy sources before maintenance work. Mandatory for all offline tasks. |
| Work Center | Centre de travail (Poste de travail) | مركز العمل | SAP organizational unit representing a group of technicians with specific skills (e.g., Mechanical Workshop, Electrical Team). Defines available capacity. |
| Planner Group | Groupe de planificateurs | مجموعة المخططين | SAP organizational unit for maintenance planners responsible for a specific plant area or equipment category. |
| Task List (SAP) | Gamme (Liste de taches SAP) | قائمة المهام (SAP) | SAP object containing the ordered sequence of maintenance operations, materials, and time estimates for a work order. |
| Maintenance Plan (SAP) | Plan de maintenance (SAP) | خطة الصيانة (SAP) | SAP scheduling object that generates work orders automatically based on time or performance-based cycles. Links to maintenance items and task lists. |
| Maintenance Item | Poste de maintenance (Element de maintenance) | عنصر الصيانة | SAP object linking a maintenance plan to a specific piece of equipment or functional location, defining what is maintained. |
| System Condition 1 (Operating) | Etat systeme 1 (En fonctionnement) | حالة النظام 1 (تشغيل) | SAP system status indicating maintenance can be performed while equipment is running (online tasks). |
| System Condition 2 (Not Operating) | Etat systeme 2 (A l'arret) | حالة النظام 2 (متوقف) | SAP system status indicating equipment must be shut down for maintenance (offline tasks). |
| System Condition 3 (Test Mode) | Etat systeme 3 (Mode test) | حالة النظام 3 (وضع الاختبار) | SAP system status indicating equipment is in test or commissioning mode during maintenance. |
| Notification (SAP) | Avis de maintenance (Notification SAP) | اشعار الصيانة (SAP) | SAP document recording a maintenance-relevant condition, malfunction, or request. Precedes work order creation. |
| PLN (Planned) | PLN (Planifie) | PLN (مخطط) | SAP work order status: order has been created and planned with resources, materials, and scheduling. |
| REL (Released) | REL (Libere) | REL (صادر) | SAP work order status: order has been released for execution. Materials can be reserved and work can begin. |
| PCNF (Partially Confirmed) | PCNF (Partiellement confirme) | PCNF (مؤكد جزئياً) | SAP work order status: some operations have been confirmed complete, but work remains. |
| CNF (Confirmed) | CNF (Confirme) | CNF (مؤكد) | SAP work order status: all operations have been confirmed complete by the executing technician. |
| TECO (Technically Complete) | TECO (Techniquement termine) | TECO (مكتمل فنياً) | SAP work order status: all technical work is finished. Triggers settlement and cost allocation. No further time or material postings. |
| CTEC (Commercially Complete) | CTEC (Commercialement termine) | CTEC (مكتمل تجارياً) | SAP work order status: financial settlement is complete. Final archive status. Order is fully closed for both technical and commercial purposes. |

---

## Domain 4: Software-Specific / Termes logiciels / مصطلحات البرنامج

| English | Francais | العربية | Definition |
|---------|----------|---------|------------|
| MCP (Model Context Protocol) | MCP (Protocole de contexte de modele) | بروتوكول سياق النموذج (MCP) | Standardized protocol enabling AI models to interact with external tools and data sources through structured tool definitions and execution contexts. |
| Agent (AI Agent) | Agent (Agent IA) | وكيل (وكيل الذكاء الاصطناعي) | Autonomous AI component that executes multi-step workflows: field capture classification, planner recommendation, backlog optimization. Operates under human-in-the-loop approval. |
| Tool Wrapper | Enveloppe d'outil (Wrapper d'outil) | غلاف الاداة | Software layer that exposes deterministic engine functions as callable tools for AI agents via the MCP protocol. Ensures structured input/output contracts. |
| Engine (Deterministic Engine) | Moteur (Moteur deterministe) | محرك (محرك حتمي) | Core business logic module that produces repeatable, auditable results (e.g., RCM decision tree, criticality calculator, RPN calculator). No AI randomness. |
| Validator | Validateur | المدقق | Component that checks data integrity against business rules: 72 valid mechanism-cause combinations, task naming conventions (max 72 chars), work package naming (max 40 chars, ALL CAPS). |
| Processor | Processeur (Traitement) | المعالج | Pipeline component that transforms raw data through multiple stages: field capture text processing, work request structuring, SAP upload package generation. |
| Hierarchy Node | Noeud de hierarchie | عقدة التسلسل الهرمي | Element in the 6-level plant hierarchy: Plant - Area - System - Equipment - Sub-Assembly - Maintainable Item. Each node has a type, parent reference, and metadata. |
| Health Score | Score de sante | درجة الصحة | Composite metric (0--100) reflecting overall equipment condition calculated from criticality class, backlog hours, failure mode coverage, and strategy completion. |
| Traffic Light (KPI Indicator) | Feu de signalisation (Indicateur KPI) | اشارة المرور (مؤشر KPI) | Visual KPI status using color codes: Green (on target), Yellow (warning/approaching threshold), Red (off target/critical). Used in executive dashboards. |
| Backlog Stratification | Stratification de l'arriere | تصنيف التراكم | Analytical breakdown of maintenance backlog by blocking reason, priority level, and equipment criticality to identify bottlenecks and optimize scheduling. |
| Milestone Gate | Porte de validation (Jalon) | بوابة الانجاز | Approval checkpoint in the maintenance workflow where human review is mandatory before proceeding. Examples: work request validation, schedule approval, SAP upload authorization. |
| Session State | Etat de session | حالة الجلسة | Streamlit application state persisted across page interactions, storing selected plant, equipment, filters, and workflow progress for each user session. |
| Equipment Library | Bibliotheque d'equipements | مكتبة المعدات | Reusable catalog of standard equipment types (Pump, Conveyor, Crusher, Mill, etc.) with pre-defined failure modes, maintenance strategies, and component lists. Sources: R8 Library, OEM, Custom. |
| Component Library | Bibliotheque de composants | مكتبة المكونات | Reusable catalog of standard components (Mechanical, Electrical, Instrumentation, Structural, Hydraulic, Pneumatic) with associated failure mechanisms and maintenance tasks. |
| Vendor Data Import | Import de donnees fournisseur | استيراد بيانات المورد | Feature for ingesting external data (Excel/CSV/JSON) from equipment manufacturers or SAP extracts. Includes validation against schema rules before database insertion. |
| FMECA Worksheet | Feuille de travail AMDEC | ورقة عمل AMDEC | Digital form for conducting FMECA analysis through 4 stages: (1) Asset definition, (2) Failure mode entry with RPN scoring, (3) Review, (4) Automated RCM decision assignment. |
| Approval Status (DRAFT / REVIEWED / APPROVED) | Statut d'approbation (BROUILLON / REVISE / APPROUVE) | حالة الموافقة (مسودة / مراجع / موافق عليه) | Three-state workflow ensuring all AI outputs start as DRAFT, pass human REVIEW, and require explicit APPROVAL before affecting operations or SAP upload. |
| SAP Upload Package | Paquet de telechargement SAP | حزمة التحميل الى SAP | Generated data package containing maintenance plans, task lists, and work packages formatted for SAP PM import. Requires human approval before submission (never auto-submitted). |
| Audit Log | Journal d'audit | سجل التدقيق | Immutable record of all system actions: data changes, approvals, rejections, AI agent decisions, and user interactions. Supports traceability and compliance. |

---

## Appendix A: Failure Mechanisms (18) / Mecanismes de defaillance / آليات الفشل

Reference: SRC-09 -- Failure Modes (Mechanism + Cause).xlsx

| English | Francais | العربية | Description |
|---------|----------|---------|-------------|
| Arcs | Arcs electriques | اقواس كهربائية | Electrical arcing between conductors |
| Blocks | Obstrue / Bouche | انسداد | Flow or passage obstruction |
| Breaks / Fracture / Separates | Casse / Rupture / Separe | كسر / تصدع / انفصال | Structural separation under load |
| Corrodes | Corrode | تآكل كيميائي | Chemical or electrochemical degradation |
| Cracks | Fissure | تشقق | Surface or structural cracking |
| Degrades | Se degrade | تدهور | General material degradation |
| Distorts | Se deforme | تشوه | Shape or dimensional change |
| Drifts | Derive | انحراف | Parameter drift from specification |
| Expires | Expire | انتهاء الصلاحية | Time-limited component expiration |
| Immobilised | Immobilise (Bloque / Grippe) | تجمد (انحشار) | Seized, stuck, or frozen condition |
| Looses Preload | Perd la precharge (Desserrage) | فقدان الشد الاولي | Fastener or connection loosening |
| Open Circuit | Circuit ouvert | دارة مفتوحة | Electrical discontinuity |
| Overheats / Melts | Surchauffe / Fond | سخونة مفرطة / انصهار | Thermal failure exceeding limits |
| Severs | Coupe (Sectionne) | قطع (بتر) | Complete separation by cutting action |
| Short Circuits | Court-circuite | دارة قصيرة | Unintended electrical connection |
| Thermally Overloads | Surcharge thermique | حمل حراري زائد | Thermal capacity exceeded |
| Washes Off | Lessivage (Lavage) | غسل (ازالة بالتدفق) | Surface treatment or coating removal by fluid |
| Wears | S'use (Usure) | تآكل ميكانيكي (بلى) | Gradual material loss through friction |

---

## Appendix B: Abbreviation Quick Reference / Reference rapide des abreviations / مرجع سريع للاختصارات

| Abbreviation | English | Francais | العربية |
|-------------|---------|----------|---------|
| ACR | -- | Analyse des Causes Racines | تحليل السبب الجذري |
| AMDE | -- | Analyse des Modes de Defaillance et de leurs Effets | تحليل انماط الفشل وآثارها |
| AMDEC | -- | Analyse des Modes de Defaillance, de leurs Effets et de leur Criticite | تحليل انماط وآثار وحرجية الفشل |
| CBM | Condition Based Maintenance | Maintenance Basee sur la Condition | الصيانة المبنية على الحالة |
| CMMS | Computerized Maintenance Management System | GMAO (Gestion de Maintenance Assistee par Ordinateur) | نظام ادارة الصيانة المحوسب |
| DE | Defect Elimination | Elimination des Defauts | ازالة العيوب |
| EQUNR | Equipment Number (SAP) | Numero d'equipement (SAP) | رقم المعدات (SAP) |
| FFI | Failure Finding Interval | Intervalle de Detection de Defaillance | فترة اكتشاف الفشل |
| FMEA | Failure Mode and Effects Analysis | AMDE | تحليل انماط الفشل وآثارها |
| FMECA | Failure Mode, Effects and Criticality Analysis | AMDEC | تحليل انماط وآثار وحرجية الفشل |
| FT | Fixed Time (Maintenance) | Temps Fixe | وقت ثابت (صيانة) |
| GdC | -- | Gestion du Changement (MoC) | ادارة التغيير |
| IBR | -- | Inspection Basee sur le Risque (RBI) | التفتيش المبني على المخاطر |
| JFC | Jorf Fertilizer Complex | Complexe d'Engrais de Jorf Lasfar | مجمع الاسمدة بالجرف الاصفر |
| KPI | Key Performance Indicator | Indicateur Cle de Performance (ICP) | مؤشر الاداء الرئيسي |
| LCC | Life Cycle Cost | Cout du Cycle de Vie (CCV) | تكلفة دورة الحياة |
| LOTO | Lock Out Tag Out | Consignation / Deconsignation | القفل والتعليم |
| MBC | -- | Maintenance Basee sur la Condition (CBM) | الصيانة المبنية على الحالة |
| MBF | -- | Maintenance Basee sur la Fiabilite (RCM) | الصيانة المرتكزة على الموثوقية |
| MCP | Model Context Protocol | Protocole de Contexte de Modele | بروتوكول سياق النموذج |
| MoC | Management of Change | Gestion du Changement | ادارة التغيير |
| MTBF | Mean Time Between Failures | Temps Moyen entre Defaillances | متوسط الوقت بين الاعطال |
| MTTR | Mean Time to Repair | Temps Moyen de Reparation | متوسط وقت الاصلاح |
| NPR | -- | Nombre de Priorite de Risque (RPN) | رقم اولوية المخاطر |
| OCR | Optimal Cost Replacement | Remplacement a Cout Optimal (RCO) | الاستبدال بالتكلفة المثلى |
| OEE | Overall Equipment Effectiveness | Taux de Rendement Global (TRG) | الفعالية الشاملة للمعدات |
| OT | -- | Ordre de Travail (Work Order) | امر العمل |
| PT | -- | Paquet de Travail (Work Package) | حزمة العمل |
| RBI | Risk-Based Inspection | Inspection Basee sur le Risque | التفتيش المبني على المخاطر |
| RCA | Root Cause Analysis | Analyse des Causes Racines | تحليل السبب الجذري |
| RCM | Reliability Centered Maintenance | Maintenance Basee sur la Fiabilite (MBF) | الصيانة المرتكزة على الموثوقية |
| RPN | Risk Priority Number | Nombre de Priorite de Risque (NPR) | رقم اولوية المخاطر |
| RTF | Run to Failure | Maintenance Jusqu'a la Defaillance | التشغيل حتى الفشل |
| TPLNR | Technical Place Number (SAP) | Numero de Poste Technique (SAP) | رقم الموقع الفني (SAP) |
| TRG | -- | Taux de Rendement Global (OEE) | الفعالية الشاملة للمعدات |
| WO | Work Order | Ordre de Travail (OT) | امر العمل |
| WP | Work Package | Paquet de Travail (PT) | حزمة العمل |

---

*Generated for the OCP Maintenance AI MVP -- Reliability Centered Maintenance Platform*
*Office Cherifien des Phosphates -- Jorf Lasfar, Morocco*
