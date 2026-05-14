# Schema Definitions for Data Import

This document defines the expected schemas for each entity type supported by the import-data skill.

## Equipment Schema

| Column | Type | Required | Description | Validation |
|--------|------|----------|-------------|------------|
| `equipment_tag` | string | Yes | Unique equipment identifier (e.g., BRY-SAG-ML-001) | Non-empty, alphanumeric with hyphens |
| `description` | string | Yes | Human-readable equipment name | Non-empty, max 200 chars |
| `parent_tag` | string | No | Parent equipment tag in hierarchy | Must exist in equipment master |
| `plant_code` | string | No | SAP plant code (default: "OCP") | Valid plant code |
| `location` | string | No | Physical location code | Free text |
| `manufacturer` | string | No | Equipment manufacturer | Free text |
| `model` | string | No | Equipment model number | Free text |

## Failure History Schema

| Column | Type | Required | Description | Validation |
|--------|------|----------|-------------|------------|
| `equipment_tag` | string | Yes | Equipment that failed | Must exist in equipment master |
| `failure_date` | date | Yes | Date of failure occurrence | Valid date, not in future |
| `failure_mode` | string | Yes | Description of how the equipment failed | Non-empty |
| `description` | string | No | Extended failure description | Max 500 chars |
| `downtime_hours` | number | No | Hours of production lost | >= 0 |
| `cost` | number | No | Cost of failure (USD) | >= 0 |
| `root_cause` | string | No | Root cause category | Free text |

## Work Orders Schema

| Column | Type | Required | Description | Validation |
|--------|------|----------|-------------|------------|
| `wo_number` | string | Yes | Unique work order number | Non-empty |
| `equipment_tag` | string | Yes | Equipment the WO applies to | Must exist in equipment master |
| `wo_type` | enum | Yes | Type of work order | PM, CM, PdM, PROJ |
| `priority` | integer | No | Work order priority | 1-5 |
| `planned_date` | date | No | Planned execution date | Valid date |
| `status` | enum | No | Work order status | OPEN, IN_PROGRESS, COMPLETED, CANCELLED |
| `description` | string | No | Work order description | Max 500 chars |

## Spare Parts Schema

| Column | Type | Required | Description | Validation |
|--------|------|----------|-------------|------------|
| `material_number` | string | Yes | SAP material number | Non-empty |
| `description` | string | Yes | Material description | Non-empty |
| `unit_cost` | number | No | Unit cost (USD) | >= 0 |
| `lead_time_days` | integer | No | Procurement lead time | >= 0 |
| `stock_level` | integer | No | Current stock quantity | >= 0 |
| `reorder_point` | integer | No | Minimum stock before reorder | >= 0 |

## Spanish-English Column Name Dictionary

| Spanish | English Mapping |
|---------|----------------|
| Equipo | equipment_tag |
| Descripcion | description |
| Fecha de falla | failure_date |
| Modo de falla | failure_mode |
| Horas de paro | downtime_hours |
| Costo | cost |
| Causa raiz | root_cause |
| Numero de OT | wo_number |
| Tipo de OT | wo_type |
| Prioridad | priority |
| Fecha planificada | planned_date |
| Estado | status |
| Numero de material | material_number |
| Costo unitario | unit_cost |
| Tiempo de entrega | lead_time_days |
| Nivel de stock | stock_level |
| Punto de reorden | reorder_point |
