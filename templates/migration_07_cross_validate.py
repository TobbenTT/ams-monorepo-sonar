import pandas as pd

results = []

def check(name, passed, detail=''):
    status = 'PASS' if passed else 'FAIL'
    results.append((name, status, detail))
    print(f'  [{status}] {name}' + (f' -- {detail}' if detail else ''))

print('=' * 80)
print('CROSS-TEMPLATE VALIDATION AUDIT')
print('=' * 80)

t01 = pd.read_excel('templates/01_equipment_hierarchy.xlsx', sheet_name='Equipment Hierarchy')
t01_bom = pd.read_excel('templates/01_equipment_hierarchy.xlsx', sheet_name='Equipment BOM')
t02 = pd.read_excel('templates/02_criticality_assessment.xlsx')
t03 = pd.read_excel('templates/03_failure_modes.xlsx')
t04 = pd.read_excel('templates/04_maintenance_tasks.xlsx')
t05 = pd.read_excel('templates/05_work_packages.xlsx')
t07 = pd.read_excel('templates/07_spare_parts_inventory.xlsx')
t09 = pd.read_excel('templates/09_workforce.xlsx')
t10 = pd.read_excel('templates/10_field_capture.xlsx')
t14 = pd.read_excel('templates/14_maintenance_strategy.xlsx')

all_tags = set(t01['equipment_tag'].unique())
print(f'\nT01: {len(all_tags)} equipment tags')

# CHECK 1: T01 BOM Level Integrity
print('\n--- CHECK 1: T01 BOM Level Integrity ---')
lvl5 = t01_bom[t01_bom['level'] == 5]
lvl6 = t01_bom[t01_bom['level'] == 6]
lvl7 = t01_bom[t01_bom['level'] == 7]
check('BOM Level 5 count == 63 (Equipment)', len(lvl5) == 63, f'got {len(lvl5)}')
check('BOM Level 6 count == 218 (Subunit)', len(lvl6) == 218, f'got {len(lvl6)}')
check('BOM Level 7 count == 545 (MI)', len(lvl7) == 545, f'got {len(lvl7)}')
check('BOM node_type SUBUNIT exists', 'SUBUNIT' in t01_bom['node_type'].values)
check('BOM no SUB_ASSEMBLY remaining', 'SUB_ASSEMBLY' not in t01_bom['node_type'].values)
check('BOM has iso14224_level column', 'iso14224_level' in t01_bom.columns)
check('BOM has iso14224_level_name column', 'iso14224_level_name' in t01_bom.columns)

# CHECK 2: T01 Hierarchy ISO columns
print('\n--- CHECK 2: T01 Hierarchy ISO Columns ---')
check('T01 has iso14224_level_1_business', 'iso14224_level_1_business' in t01.columns)
check('T01 has iso14224_level_2_installation', 'iso14224_level_2_installation' in t01.columns)
check('T01 has iso14224_level_3_plant_unit', 'iso14224_level_3_plant_unit' in t01.columns)
check('T01 has iso14224_level_4_section', 'iso14224_level_4_section' in t01.columns)
check('T01 has 22 columns', len(t01.columns) == 22, f'got {len(t01.columns)}')

# CHECK 3: T01 BOM MIs <-> T03 maintainable_item
print('\n--- CHECK 3: T01 BOM MIs <-> T03 Maintainable Items ---')
bom_mi_pairs = set(zip(lvl7['equipment_tag'], lvl7['name']))
t03_mi_pairs = set(zip(t03['equipment_tag'], t03['maintainable_item']))
bom_only = bom_mi_pairs - t03_mi_pairs
t03_only = t03_mi_pairs - bom_mi_pairs
bom_mi_tags = set(lvl7['equipment_tag'])
t03_mi_tags = set(t03['equipment_tag'])
check('All BOM equipment in T03', bom_mi_tags.issubset(t03_mi_tags),
      f'missing: {bom_mi_tags - t03_mi_tags}' if not bom_mi_tags.issubset(t03_mi_tags) else '')
check('All T03 equipment in BOM', t03_mi_tags.issubset(bom_mi_tags),
      f'extra: {t03_mi_tags - bom_mi_tags}' if not t03_mi_tags.issubset(bom_mi_tags) else '')
check('BOM MIs all have failure modes in T03', len(bom_only) == 0,
      f'{len(bom_only)} BOM MI pairs missing from T03' if bom_only else '')
check('T03 MIs all in BOM', len(t03_only) == 0,
      f'{len(t03_only)} T03 MI pairs not in BOM' if t03_only else '')
if bom_only:
    for tag, mi in sorted(list(bom_only))[:10]:
        print(f'    BOM only: {tag} / {mi}')
if t03_only:
    for tag, mi in sorted(list(t03_only))[:10]:
        print(f'    T03 only: {tag} / {mi}')

# CHECK 4: T03 <-> T14 Row Alignment
print('\n--- CHECK 4: T03 <-> T14 Row Alignment ---')
check('T03 and T14 same row count', len(t03) == len(t14), f'T03={len(t03)}, T14={len(t14)}')
if len(t03) == len(t14):
    tag_match = (t03['equipment_tag'] == t14['equipment_tag']).all()
    mi_match = (t03['maintainable_item'] == t14['what']).all()
    mech_match = (t03['mechanism'] == t14['mechanism']).all()
    cause_match = (t03['cause'] == t14['cause']).all()
    sub_match = (t03['subunit'] == t14['subunit']).all()
    check('equipment_tag aligned', tag_match)
    check('maintainable_item == what', mi_match)
    check('mechanism aligned', mech_match)
    check('cause aligned', cause_match)
    check('subunit aligned', sub_match)

# CHECK 5: T14 task IDs -> T04
print('\n--- CHECK 5: T14 Task IDs -> T04 ---')
t04_ids = set(t04['task_id'].unique())
t14_primary = set(t14['primary_task_id'].dropna().unique())
t14_secondary = set(t14['secondary_task_id'].dropna().unique())
missing_primary = t14_primary - t04_ids
missing_secondary = t14_secondary - t04_ids
check('All T14 primary_task_id in T04', len(missing_primary) == 0, f'{len(missing_primary)} missing')
check('All T14 secondary_task_id in T04', len(missing_secondary) == 0, f'{len(missing_secondary)} missing')

# CHECK 6: T05 task_ids_csv -> T04
print('\n--- CHECK 6: T05 Work Package Tasks -> T04 ---')
wp_task_ids = set()
for csv in t05['task_ids_csv'].dropna():
    for tid in str(csv).split(','):
        tid = tid.strip()
        if tid:
            wp_task_ids.add(tid)
missing_wp_tasks = wp_task_ids - t04_ids
check('All T05 task IDs exist in T04', len(missing_wp_tasks) == 0, f'{len(missing_wp_tasks)} missing')

# CHECK 7: T04 equipment_tags -> T01
print('\n--- CHECK 7: T04 Equipment Tags -> T01 ---')
t04_tags = set(t04['equipment_tag'].dropna().unique())
missing_t04_tags = t04_tags - all_tags
check('T04 has equipment_tag column', 'equipment_tag' in t04.columns)
check('All T04 equipment_tags in T01', len(missing_t04_tags) == 0, f'{len(missing_t04_tags)} invalid')
check('T04 covers all 63 equipment', t04_tags == all_tags, f'T04 has {len(t04_tags)} tags')

# CHECK 8: T07 covers all equipment
print('\n--- CHECK 8: T07 Spare Parts Coverage ---')
covered = set()
for csv in t07['applicable_equipment_csv'].dropna():
    for tag in str(csv).split(','):
        tag = tag.strip()
        if tag:
            covered.add(tag)
missing_coverage = all_tags - covered
check('T07 covers all 63 equipment', len(missing_coverage) == 0,
      f'missing: {sorted(missing_coverage)}' if missing_coverage else '')

# CHECK 9: T10 worker_ids -> T09
print('\n--- CHECK 9: T10 Worker IDs -> T09 ---')
check('T10 has worker_id column', 'worker_id' in t10.columns)
check('T10 no technician_id column', 'technician_id' not in t10.columns)
t10_workers = set(t10['worker_id'].dropna().unique())
t09_workers = set(t09['worker_id'].unique())
missing_workers = t10_workers - t09_workers
check('All T10 worker_ids exist in T09', len(missing_workers) == 0,
      f'missing: {missing_workers}' if missing_workers else '')

# CHECK 10: T02 <-> T01
print('\n--- CHECK 10: T02 Criticality <-> T01 ---')
t02_tags = set(t02['equipment_tag'].unique())
check('T02 covers all 63 equipment', t02_tags == all_tags)

# CHECK 11: T03 column structure
print('\n--- CHECK 11: T03 Column Structure ---')
check('T03 has subunit column', 'subunit' in t03.columns)
check('T03 has 19 columns', len(t03.columns) == 19, f'got {len(t03.columns)}')
check('T03 headers all snake_case', all(h == h.lower() for h in t03.columns),
      f'non-snake: {[h for h in t03.columns if h != h.lower()]}')

# CHECK 12: T05 equipment_tags -> T01
print('\n--- CHECK 12: T05 Equipment Tags -> T01 ---')
t05_tags = set(t05['equipment_tag'].dropna().unique())
missing_t05 = t05_tags - all_tags
check('All T05 equipment_tags in T01', len(missing_t05) == 0)
check('T05 covers all 63 equipment', t05_tags == all_tags, f'T05 has {len(t05_tags)} tags')

# SUMMARY
print('\n' + '=' * 80)
passes = sum(1 for _, s, _ in results if s == 'PASS')
fails = sum(1 for _, s, _ in results if s == 'FAIL')
print(f'SUMMARY: {passes} PASS, {fails} FAIL out of {len(results)} checks')
if fails > 0:
    print('\nFAILED CHECKS:')
    for name, status, detail in results:
        if status == 'FAIL':
            print(f'  - {name}: {detail}')
else:
    print('\nALL CHECKS PASSED - Cross-template consistency verified.')
print('=' * 80)
