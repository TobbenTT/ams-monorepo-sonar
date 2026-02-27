# Setting up Maintenance Plans in SAP using R8

---

> **Used By Skills:** export-to-sap

---

| Metadata | Value |
|---|---|
| **Source File** | `asset-management-methodology/Setting-up-Mtce-Plans-in-SAP-using R8.pdf` |
| **Pages** | 1 |
| **Conversion Date** | 2026-02-23 |
| **Format** | Single-page process flowchart |

---

## Process Overview

This document defines the end-to-end process for setting up maintenance plans in SAP using R8 (Rylson8) software. The process covers data collection, R8 database configuration, tactic development, quality checks, SAP upload preparation, and final deployment.

---

## Process Flow

### Step 1: Project Initiation

```
[Project Kick-Off Meeting on-site with key stakeholders]
```

Conduct an on-site kick-off meeting with all key stakeholders to align on scope, timeline, and deliverables.

### Step 2: Data Collection

```
[Collect SAP Data]
    |
    v
[Confirm Assets]
    |
    v
[Collect all data (the 'As Is' and the 'To Be')]
    |
    v
[Identify Missing Information]
    |
    v
[Collect Missing Information]
```

| Activity | Description |
|---|---|
| **Collect SAP Data** | Extract current SAP maintenance data (functional locations, equipment, existing plans) |
| **Confirm Assets** | Validate the asset list in scope for the project |
| **Collect all data** | Gather both the current state ("As Is") and the target state ("To Be") data |
| **Identify Missing Information** | Gap analysis between available data and required data |
| **Collect Missing Information** | Obtain missing data from site teams, OEMs, or other sources |

### Step 3: R8 Configuration and Database Setup

```
[Confirm R8 Configuration Standard]
    |
    v
[Configure R8]
    |
    v
[Set up Site R8 Database]
    |
    v
[SAP Load Configuration]
```

| Activity | Description |
|---|---|
| **Confirm R8 Configuration Standard** | Verify R8 configuration parameters match the corporate standard |
| **Configure R8** | Apply the configuration settings to the R8 instance |
| **Set up Site R8 Database** | Create and initialise the site-specific R8 database |
| **SAP Load Configuration** | Configure the SAP data load parameters and mapping |

### Step 4: Data Loading into R8

```
[Load data into R8]
    |
    v
[Convert data into R8 Upload sheets]
```

| Activity | Description |
|---|---|
| **Load data into R8** | Import asset hierarchy, existing tactics, and reference data into R8 |
| **Convert data into R8 Upload sheets** | Transform the R8 data into the standardised upload sheet format |

### Step 5: Tactic Development in R8

```
[Create Work Packages and Work Instruction sheets]
    |
    v
[Run data Quality checks]
```

| Activity | Description |
|---|---|
| **Create Work Packages** | Group maintenance tasks into logical work packages within R8 (by frequency, trade, constraint) |
| **Create Work Instruction sheets** | Develop detailed work instructions for each work package |
| **Run data Quality checks** | Execute R8 quality validation rules to ensure data integrity and completeness |

### Step 6: Output Preparation

```
[Update R8 Upload sheets]
    |
    +---> [Prepare Work Instruction template]
    |
    +---> [Prepare SAP Maint. Plan template]
    |
    +---> [Prepare SAP data upload template]
```

| Activity | Description |
|---|---|
| **Update R8 Upload sheets** | Finalise the upload sheets with all validated data |
| **Prepare Work Instruction template** | Create the standardised work instruction documents |
| **Prepare SAP Maint. Plan template** | Generate the SAP Maintenance Plan template with all required fields |
| **Prepare SAP data upload template** | Produce the data upload template formatted for SAP import |

### Step 7: Transfer and Upload

```
[Transfer into SAP upload sheet]
    |
    v
[Client review & sign off]
    |
    v
[Upload into SAP Sandbox for Testing]
    |
    v
[Store Work Instructions on client server]
```

| Activity | Description |
|---|---|
| **Transfer into SAP upload sheet** | Map R8 output data into the final SAP upload sheet format |
| **Client review & sign off** | Client reviews all data and provides formal sign-off before upload |
| **Upload into SAP Sandbox for Testing** | Load the data into the SAP Sandbox environment for testing and validation |
| **Store Work Instructions on client server** | Archive all work instruction documents on the client's designated server |

---

## End-to-End Process Summary Table

| Step | Activity | Input | Output |
|---|---|---|---|
| 1 | Project Kick-Off | Stakeholder list, project scope | Aligned project plan |
| 2 | Collect SAP Data | SAP system access | Functional locations, equipment data |
| 3 | Confirm Assets | Asset register | Validated asset list |
| 4 | Collect all data | As-Is and To-Be requirements | Complete data package |
| 5 | Identify / Collect Missing Info | Gap analysis | Complete dataset |
| 6 | Configure R8 | Configuration standard | Configured R8 instance |
| 7 | Set up Site R8 Database | Configuration | Ready database |
| 8 | SAP Load Configuration | SAP mapping rules | Load configuration |
| 9 | Load data into R8 | Complete dataset | Populated R8 database |
| 10 | Convert to R8 Upload sheets | R8 data | Upload sheets |
| 11 | Create Work Packages & Instructions | Tactics data | Work packages, instructions |
| 12 | Run Quality checks | Work packages | Validated data |
| 13 | Update Upload sheets | Validated data | Final upload sheets |
| 14 | Prepare templates | Upload sheets | WI template, SAP Plan template, Upload template |
| 15 | Transfer to SAP upload sheet | Templates | SAP-ready upload sheet |
| 16 | Client review & sign-off | Upload sheet | Approved upload |
| 17 | Upload to SAP Sandbox | Approved upload | SAP test environment loaded |
| 18 | Store Work Instructions | Work instructions | Archived on client server |

---

## Key Considerations

- All data must pass R8 quality checks before proceeding to SAP upload preparation
- The client must provide formal sign-off before any data is uploaded to SAP
- Initial upload goes to SAP **Sandbox** (test environment), not production
- Work instructions must be stored on the client server for operational access
- The R8 configuration standard must be confirmed before any configuration work begins
- Both the "As Is" (current state) and "To Be" (target state) data are required for gap analysis
