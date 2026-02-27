# Worked Example: 6 Equipment Items at Plant JFC-01

## Input Data

| Equipment ID | Tag | Failures | Downtime (hrs) | Operating Hours |
|-------------|-----|----------|----------------|-----------------|
| EQ-001 | PUMP-101A | 8 | 160 | 8760 |
| EQ-002 | CONV-201 | 6 | 30 | 8760 |
| EQ-003 | COMP-301 | 2 | 96 | 8760 |
| EQ-004 | VALVE-401 | 1 | 4 | 8760 |
| EQ-005 | MOTOR-501 | 3 | 12 | 8760 |
| EQ-006 | CRUSHER-601 | 0 | 0 | 8760 |

## MTBF and MTTR Calculations

| Equipment | MTBF (days) | MTTR (hours) | Calculation |
|-----------|-------------|--------------|-------------|
| PUMP-101A | 45.6 | 20.0 | (8760/8)/24 = 45.6; 160/8 = 20.0 |
| CONV-201 | 60.8 | 5.0 | (8760/6)/24 = 60.8; 30/6 = 5.0 |
| COMP-301 | 182.5 | 48.0 | (8760/2)/24 = 182.5; 96/2 = 48.0 |
| VALVE-401 | 365.0 | 4.0 | (8760/1)/24 = 365.0; 4/1 = 4.0 |
| MOTOR-501 | 121.7 | 4.0 | (8760/3)/24 = 121.7; 12/3 = 4.0 |
| CRUSHER-601 | 365.0 | 0.0 | 8760/24 = 365.0; 0 failures |

## Median Thresholds
- MTBF sorted: [45.6, 60.8, 121.7, 182.5, 365.0, 365.0]
- **Median MTBF = 152.1** (avg of 121.7 and 182.5)
- MTTR sorted: [0.0, 4.0, 4.0, 5.0, 20.0, 48.0]
- **Median MTTR = 4.5** (avg of 4.0 and 5.0)

## Zone Classification

| Equipment | MTBF | vs Median (152.1) | MTTR | vs Median (4.5) | Zone |
|-----------|------|-------------------|------|-----------------|------|
| PUMP-101A | 45.6 | < median | 20.0 | > median | **ACUTE** |
| CONV-201 | 60.8 | < median | 5.0 | > median | **ACUTE** |
| COMP-301 | 182.5 | >= median | 48.0 | > median | **COMPLEX** |
| VALVE-401 | 365.0 | >= median | 4.0 | <= median | **CONTROLLED** |
| MOTOR-501 | 121.7 | < median | 4.0 | <= median | **CHRONIC** |
| CRUSHER-601 | 365.0 | >= median | 0.0 | <= median | **CONTROLLED** |

## Zone Counts
- ACUTE: 2 (PUMP-101A, CONV-201)
- CHRONIC: 1 (MOTOR-501)
- COMPLEX: 1 (COMP-301)
- CONTROLLED: 2 (VALVE-401, CRUSHER-601)

## Recommended Actions
- PUMP-101A: Immediate RCA, consider replacement (LCC), optimize PM (OCR)
- CONV-201: Investigate failure modes, improve PM strategy
- COMP-301: Reduce repair time (better procedures, spare parts staging)
- MOTOR-501: Improve reliability (PM optimization, condition monitoring)
