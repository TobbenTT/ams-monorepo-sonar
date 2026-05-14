# Examples - generate-esg-report

*Extracted from SKILL.md to comply with the 500-line limit.*
*Read this file when you need detailed examples for this skill.*

---

## Examples

### Example 1: Annual ESG Report for Copper Mine

**Facility**: Proyecto Sierra Verde, Copper Concentrator, 120,000 tpd, Antofagasta, Chile
**Reporting Period**: January 1 - December 31, 2025
**Frameworks**: GRI 2021 + TCFD + SASB Metals & Mining

| ESG Category | Key Metric | Value | YoY Change | Peer Benchmark |
|-------------|-----------|-------|------------|----------------|
| Climate | Scope 1 emissions | 185,000 tCO2e | -8.2% | Top quartile |
| Climate | Scope 2 emissions (location) | 420,000 tCO2e | -12.5% | 2nd quartile |
| Climate | Carbon intensity | 4.8 tCO2e/kt ore | -10.3% | Top quartile |
| Climate | Renewable energy share | 62% of electricity | +15 pts | Top quartile |
| Water | Total withdrawal | 18.5 Mm3 | -3.1% | 2nd quartile |
| Water | Water recycling rate | 82% | +4 pts | Top quartile |
| Waste | Tailings generated | 42.1 Mt | +2.0% | N/A (volume driven) |
| Waste | Non-mineral waste recycled | 68% | +5 pts | Top quartile |
| Safety | TRIR | 0.38 | -24% | Top quartile |
| Safety | Process safety Tier 1 | 0 events | Maintained | Top quartile |
| Workforce | Women in workforce | 24.5% | +2.3 pts | 2nd quartile |
| Workforce | Training hours/employee | 62 hrs | +18% | Top quartile |
| Community | Community investment | $4.2M (1.1% revenue) | +15% | Top quartile |
| Community | Grievances resolved | 94% within 30 days | +6 pts | Top quartile |
| Governance | Board independence | 78% | Maintained | Top quartile |
| Governance | ESG-linked compensation | 25% of variable pay | +5 pts | 2nd quartile |

**TCFD Scenario Analysis Summary**:
- NZE 2050 scenario: Copper demand increases 40% by 2040 (electrification driver). Transition risk is low (positive demand outlook). Carbon cost exposure of $15M/year at $100/tCO2e by 2030, mitigated by 85% renewable energy target.
- STEPS scenario: Copper demand increases 20% by 2040. Physical risk increases -- water stress in Antofagasta region intensifies (medium-high risk by 2040). Adaptation investment of $8M required for desalination capacity expansion.

### Example 2: ESG Data Inconsistency Detection

**Scenario**: During data reconciliation (Step 14), the agent detects:
- Scope 1 emissions reported in Energy section: 185,000 tCO2e
- Scope 1 emissions in Performance Data Table: 183,500 tCO2e
- Difference: 1,500 tCO2e (0.8%)

**Resolution**:
- Root cause: Energy section includes mobile fleet emissions (1,500 tCO2e) that were initially excluded from the data table compilation
- Action: Include mobile fleet in Performance Data Table, add footnote explaining source categories
- Verification: All three locations (Energy section, Data Table, GHG Protocol summary) now report 185,000 tCO2e
- Lesson: Data collection template updated to explicitly include mobile fleet as a Scope 1 source category

### Example 3: Community Brief Generation

**Input**: Full 120-page ESG report for Sierra Verde copper mine
**Output**: 6-page Community Brief in Spanish, plain language

```
Resumen para la Comunidad: Proyecto Sierra Verde 2025

Medio Ambiente
- Usamos 15% menos agua que hace 3 anos, gracias a recircular el 82% del agua en nuestro proceso
- El 62% de nuestra electricidad viene de fuentes renovables (solar y eolica)
- Reciclamos el 68% de nuestros residuos no minerales
- Cero derrames significativos durante 2025

Seguridad
- Nuestro indice de accidentes (TRIR 0.38) es el mas bajo en la historia de la operacion
- Invertimos $1.8M en equipos de seguridad y capacitacion
- 62 horas de capacitacion promedio por trabajador

Nuestra Gente
- 2,450 empleados directos, 78% de la Region de Antofagasta
- 24.5% mujeres en nuestra fuerza laboral (+2.3 puntos vs 2024)
- 92% de satisfaccion en encuesta de clima laboral

Comunidad
- $4.2 millones invertidos en programas comunitarios
  - Becas educacionales: 180 beneficiarios
  - Programa de desarrollo de proveedores locales: 45 empresas
  - Proyecto de agua potable para comunidades cercanas: 3 localidades
- 94% de reclamos resueltos en menos de 30 dias
- 12 reuniones de dialogo comunitario realizadas

Contacto: oficina.comunidad@sierraverde.cl | Tel: +56 55 XXX XXXX
```
