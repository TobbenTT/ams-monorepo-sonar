# SF-664 — Decisión: BD actual depurada vs BD nueva desde cero

**Sprint 7 VSC · Due 2026-05-15 · David Cabezas**

## Contexto
La BD actual (`/app/data/ams.db` SQLite, 197 WRs · 148 OTs · 10,136 hierarchy nodes en prod GFSN) viene acumulando data desde primeros sprints. SF-663 (auditoría) y comentarios Jorge/Magdalena marcaron:
- TAGs heterogéneos (algunos largos `SN-1000-1200-1210-1210AR0001`, otros cortos `1210AR0001`)
- Mezcla idioma ES/EN en `equipment_type`, `failure_category`, status
- Duplicados de equipment_tag (mismo tag bajo distintos `node_id`)
- WRs/OTs de seeds antiguos coexistiendo con producción real (Jorf + GFSN + Demo)

## Opciones evaluadas

### Opción A — BD actual depurada (continuidad)
- Pros: cero pérdida de data histórica, cero downtime, cero migración VPS
- Pros: WR/OT counts visibles a Jorge continúan creciendo (197→198→… narrativa de uso real)
- Contras: scripts de limpieza por tabla, riesgo de inconsistencias residuales
- Esfuerzo: 1-2 días (script depuración + tests + ejecución idempotente)

### Opción B — BD nueva desde cero
- Pros: schema limpio, sin legado, optimizada para casos uso actuales
- Pros: oportunidad de mover de SQLite → Postgres (Carlos lo propuso en SF-714 cobertura crítica)
- Contras: pérdida de data demo (197 WRs construidos en sesiones con Jorge)
- Contras: re-seedear plant GFSN con 8809 equipos toma horas
- Contras: downtime de prod durante migración
- Esfuerzo: 3-5 días (modelo nuevo + ETL + tests + cutover)

## Decisión recomendada: **Opción A — Depurar in-place**

**Justificación**:
1. **Velocidad demo**: Sprint 7 termina, prioridad es entregar features Jorge (Plan 12 sem, Disponibilidad, etc.). No tiene sentido invertir 3-5 días en BD nueva cuando faltan features.
2. **Continuidad narrativa**: cliente ve mismos WR-2026-XXX que validó en sesiones previas. Reset rompe trust.
3. **Postgres puede ser fase 2**: si Goldfields confirma piloto, migrar a Postgres con schema actual (sin más debt) es una migración SQLite→Postgres estándar.
4. **El "depurar" es chico**: scripts ya existen parcialmente:
   - `scripts/audit_db_tags.py` (SF-663)
   - `scripts/normalize_equipment_types.py` (existe parcial)
   - Solo falta script de duplicate-merge + idiom-normalize.

## Plan ejecución (post SF-664)

| Paso | Owner | ETA |
|---|---|---|
| Script `scripts/cleanup_db_2026Q2.py` con dry-run mode | David | 1 día |
| Backup prod DB antes de correr | David | 5 min |
| Run en QA primero, validar diff | David + Carlos | 4h |
| Run en prod off-hours | David | 30 min |
| Tests post-cleanup | David | 2h |

## Plan opcional Postgres (fase 2, post-piloto Goldfields)
- Nuevo modelo SQLAlchemy compatible (ya lo es)
- `pg_dump` schema + cargar data SQLite via script
- Cambiar `DATABASE_URL` en `.env` prod
- Sin cambios al código

---
**Status**: decidido. Cerrar SF-664 después de comment en Jira.
