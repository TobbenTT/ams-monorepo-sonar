# Análisis: Estrategia de Plataforma e Integración SAP

**Fecha:** 7 de mayo, 2026
**Para:** Magdalena Ortega
**De:** David Cabezas — VSC

> Este documento responde a dos preguntas planteadas en la última reunión:
> (a) ventajas y costos de una solución mono-cliente vs. escalable; (b) opciones de integración con SAP, incluyendo el caso del usuario-puente con RPA.
>
> Los datos del **Anexo A** están verificados contra el código del repositorio.
> Las **decisiones recomendadas** son sugerencias del autor que requieren validación con el equipo y el cliente antes de comprometerse.

---

## 1. Solución mono-cliente vs. solución escalable

### 1.1 Activos actuales que sirven a ambos caminos

Los siguientes elementos ya existen en el repositorio y se aprovechan en cualquiera de los dos caminos:

| Activo | Verificable en | Estado |
|---|---|---|
| Branch `feature/multi-plant` con perfiles para 4 plantas (OCP-JFC1, GOLDFIELDS-SN, FLUOR-ALFA, DEMO-CORP) | `api/routers/admin.py` (`_PLANT_DEFAULTS`) | Activo |
| Filtro de scope por planta para usuarios no-admin | `api/routers/work_requests.py`, `managed_work_orders.py` | Desplegado 2026-05-06 |
| i18n en español, inglés y árabe (con RTL) | `frontend/src/i18n/{es,en,ar}.js` | Activo |
| Modelo de jerarquía genérico (`HierarchyNodeModel.metadata_json`) | `api/database/models.py` | Activo |
| Plantillas FMECA por tipo de equipo (6 industrias) | `frontend/src/data/fmecaTemplates.js` | Activo |
| Auth con JWT versionado y revocable | `api/routers/auth.py`, `api/dependencies/auth.py` | Desplegado 2026-05-06 |

> **Nota:** la existencia de los 4 perfiles de planta es un hecho verificable; **no implica** que el equipo haya tomado una decisión formal de servir a más de un cliente. La decisión sigue abierta.

### 1.2 Trabajo necesario para servir a un segundo cliente

Estimaciones de orden de magnitud, sin compromiso. Suponen un cliente con un caso de uso similar al actual (otra minera).

| Faltante | Esfuerzo aproximado | ¿Bloquea cliente #2? |
|---|---|---|
| Aislamiento multi-tenant en BD (RLS Postgres o esquema-por-tenant) | 2 semanas | Sí, si los clientes no aceptan compartir BD |
| Mapeo SAP configurable por cliente | 1 semana | Sí |
| Audit log con etiqueta de tenant | 3 días | No |
| Onboarding documentado (no self-service) | 2 semanas | No |
| Soporte multi-versión de SAP (R/3, ECC, S/4HANA) | 1 semana por versión | Depende del cliente |

### 1.3 Tradeoffs

| Dimensión | Mono-cliente (Goldfields) | Escalable multi-cliente |
|---|---|---|
| Tiempo a primer revenue | Semanas | Mismo, pero el segundo cliente toma 5+ semanas adicionales de plataforma |
| Riesgo comercial | Alto (cancelación = pérdida total) | Distribuido |
| Profundidad funcional | Mayor (concentración en minería) | Menor en cualquier industria individual |
| Costo de infraestructura | Bajo (single-tenant) | Mayor (multi-tenant managed) |
| Diferenciación de producto | Vertical (minería avanzada) | Horizontal (cubre varios) |

### 1.4 Decisiones que requieren input

Para cerrar esta sección hace falta:

1. ¿Existe ya una decisión comercial o de inversionistas sobre el modelo de negocio (mono-cliente vs SaaS)?
2. ¿Hay clientes #2 y #3 identificados por VSC, aunque sea como pipeline?
3. ¿Cuál es la disponibilidad de inversión durante el período en que se dedicaría a abstraer la plataforma?

Sin estos inputs, el autor no recomienda comprometer las 5 semanas de trabajo de multi-tenancy aún.

---

## 2. Integración con SAP — opciones técnicas

### 2.1 Opciones disponibles en la industria

Las cinco formas de integrar una aplicación externa con SAP PM son las siguientes. Las cinco son estándar y están documentadas por SAP.

| # | Método | Mecanismo | Sincrónico | Documentación oficial SAP |
|---|---|---|---|---|
| 1 | RFC / BAPI | Llamadas RPC a funciones nativas (BAPI_ALM_ORDER_MAINTAIN, etc.) | Sí | SAP NW RFC SDK |
| 2 | OData / REST | API HTTP nativa (S/4HANA principalmente) | Sí | SAP Gateway |
| 3 | IDoc / ALE | Mensajería XML asíncrona entre sistemas | No | SAP ALE/IDoc |
| 4 | Carga masiva por archivo (LSMW / migración) | El sistema externo genera planillas que SAP carga manual o programada | No | LSMW |
| 5 | RPA (UiPath, Automation Anywhere, otros) | Automatización de UI sobre SAP GUI con un usuario humano-puente | Variable | No oficial — la respuesta de SAP a RPA es heterogénea |

### 2.2 Comparación operativa

| Criterio | RFC/BAPI | OData/REST | IDoc/ALE | Archivo (LSMW) | RPA |
|---|---|---|---|---|---|
| Tiempo real | Sí | Sí | No (cola) | No (batch) | Cuasi |
| Resistente a cambios de UI SAP | Sí | Sí | Sí | Sí | No |
| Auditable como integración formal por SAP | Sí | Sí | Sí | Sí | No (SAP la trata como tráfico de usuario) |
| Requiere cuenta técnica SAP | Sí | Sí | Sí | No | No (usa cuenta humana) |
| Requiere SDK o componente local | Sí (NW RFC SDK) | No | No | No | Sí (motor RPA) |
| Sensibilidad a actualizaciones de SAP | Baja | Baja | Baja | Baja | Alta |

### 2.3 Análisis específico del usuario-puente con RPA

El planteamiento es: en lugar de pedir una cuenta técnica con permisos BAPI, se reutiliza una cuenta de usuario humano y un motor RPA (UiPath, Power Automate, etc.) ejecuta acciones sobre SAP GUI.

**Cuándo el enfoque es válido:**

- POC corto donde el cliente aún no asigna recursos de IT-SAP.
- Casos de muy bajo volumen (decenas de transacciones/día).
- Etapa puente mientras se gestiona la cuenta técnica.

**Limitaciones técnicas reales:**

- Las cuentas humanas en SAP (Professional User, Functional User) tienen costo licenciamiento mayor que las cuentas técnicas (Service User). El costo exacto depende del contrato del cliente con SAP.
- Las políticas de SAP sobre RPA varían por contrato. Algunos clientes han recibido objeciones al usar usuarios humanos para automatización; conviene consultar con el área de licencias del cliente.
- Cualquier cambio en la UI de SAP (parche, upgrade, customizing) puede romper el script. La frecuencia de mantenimiento es mayor que con BAPI.
- En volumen alto, el RPA es más lento que un endpoint nativo (cada acción pasa por la pantalla).

**Cuándo el enfoque NO es recomendable:**

- Producción a escala con cientos o miles de transacciones diarias.
- Entornos con auditoría estricta de SAP.
- Cuando el cliente sí tiene capacidad de asignar una cuenta técnica.

> **Sin números propios:** el autor no tiene cotizaciones formales de RPA en Chile en este momento. Las cifras que circulan en mercado para licencias UiPath o Automation Anywhere (atendido vs no-atendido), licencias Professional User SAP, y costos de mantenimiento de scripts deberían pedirse al cliente o a un partner local antes de cualquier compromiso.

### 2.4 Cuándo conviene cada opción

| Tipo de cliente | Opción más apropiada | Justificación |
|---|---|---|
| Cliente sin SAP | Carga por archivo (LSMW) | Cero dependencia técnica del cliente |
| Cliente con SAP ECC on-premise + IT-SAP responsivo | RFC / BAPI | Estable, formalmente soportado, sin licencias adicionales |
| Cliente con S/4HANA Cloud | OData / REST | Camino oficial de SAP para nuevos clientes |
| Cliente que requiere asincronía y alta resiliencia | IDoc / ALE | Tolera ventanas de mantenimiento sin perder transacciones |
| Cliente sin acceso a IT-SAP en el corto plazo | RPA temporal + plan de migración | El RPA es transición, no destino final |

### 2.5 Recomendación para Goldfields

> **Sujeto a confirmar las preguntas del Anexo B.** Esta sección es la opinión técnica del autor, no un compromiso de plataforma.

**Camino recomendado: RFC / BAPI como destino, LSMW como puente si hace falta.**

Razones:

1. El conector ya está al 90% en código (Anexo A.1). Lo que falta es: cuenta técnica del cliente, instalación del SAP NW RFC SDK en el servidor de VSC, y conectar `_transport_send` con el conector existente. No requiere desarrollo grande.
2. BAPIs `BAPI_ALM_ORDER_*`, `BAPI_MAINTENANCEPLAN_*` y `BAPI_FUNCLOC_*` son estables desde SAP R/3 y siguen vigentes en ECC y S/4HANA. Bajo riesgo de obsolescencia.
3. LSMW (Anexo A.3) ya genera los templates correctos. Si la cuenta técnica BAPI tarda, el operador puede cargar por archivo sin pérdida de funcionalidad — solo de tiempo real.
4. RPA con usuario-puente queda como **Plan B táctico** únicamente si IT-Goldfields no logra asignar la cuenta técnica en el plazo de go-live. En ese caso, se documenta como solución temporal con fecha de migración a BAPI definida desde el inicio.

**Por qué no recomendamos RPA como destino final:**

- Las cuentas humanas en SAP tienen mayor costo de licencia que las técnicas.
- Los scripts RPA se rompen ante cambios de UI o customizing en SAP, lo que genera mantenimiento recurrente.
- La automatización de UI no escala bien en volumen alto.
- Todo lo anterior se evita con BAPI, que es el camino formal de SAP para integraciones.

**Por qué no recomendamos OData/REST como destino:**

- Sólo aplica si Goldfields ya está en S/4HANA Cloud. Hasta confirmar la versión SAP del cliente (Anexo B punto 1), esta opción queda en pausa.

**Por qué no recomendamos IDoc/ALE como destino:**

- Es la opción correcta para volúmenes muy altos con tolerancia a asincronía. Sin saber el volumen proyectado (Anexo B punto 4), no es posible justificar el costo de configurar partner ALE en SAP del cliente.

---

## Anexo A — Estado verificado del código SAP en el repositorio

> Esta sección lista únicamente lo que está implementado en `feature/multi-plant` al 2026-05-07.

### A.1 Conector RFC

**Archivo:** `api/services/sap_rfc_connector.py` · 1.041 líneas

- Detecta dinámicamente si la librería `pyrfc` está instalada. Si no, opera en modo `dry_run` registrando lo que enviaría.
- Configuración por variables de entorno: `SAP_ASHOST`, `SAP_SYSNR`, `SAP_CLIENT`, `SAP_USER`, `SAP_PASSWD`, `SAP_LANG`.
- Implementa el parsing de `BAPIRET2` (mensajes estándar SAP de éxito/error).
- Maneja `BAPI_TRANSACTION_COMMIT` para confirmar las llamadas.

**BAPIs cableadas:**

| BAPI | Función |
|---|---|
| `BAPI_MAINTENANCEPLAN_CREATE` | Crear plan de mantenimiento |
| `BAPI_MAINTENANCEITEM_CREATE` | Crear ítem de plan |
| `BAPI_ALM_ORDER_MAINTAIN` | Crear/modificar orden + lista de tareas |
| `BAPI_ALM_ORDER_GET_DETAIL` | Leer orden existente |
| `BAPI_FUNCLOC_GETLIST` | Listar ubicaciones técnicas |
| `BAPI_EQUI_GETDETAIL` | Leer registro maestro de equipo |
| `BAPI_TRANSACTION_COMMIT` | Confirmar transacción |

**Lo que falta:** instalar el SAP NW RFC SDK en el servidor de producción y proveer una cuenta SAP con perfil PM. El código en sí no requiere modificaciones.

### A.2 Cola de sincronización (outbox)

**Archivo:** `api/services/sap_sync_service.py` · 136 líneas

- `build_payload(wo)` arma el JSON con la forma esperada por `BAPI_ALM_ORDER_MAINTAIN` (ORDER, OPERATIONS, COMPONENTS, CLOSURE).
- `push_wo(db, wo_id)` registra la OT en la tabla `sap_sync_log` con estado `PENDING`. Es idempotente por `entity_id`.
- `get_status(db, wo_id)` consulta el estado del último intento.

**Lo que falta:** la función `_transport_send(payload)` está documentada como pendiente al final del archivo. Su implementación es una llamada al conector RFC ya existente o al canal que se elija.

### A.3 Generador de templates LSMW

**Archivo:** `tools/engines/sap_export_engine.py` · 175 líneas

- Genera tres planillas linkadas: Maintenance Plan, Maintenance Item, Task List.
- Cumple el formato de la referencia interna `skills/00-knowledge-base/integration/ref-03-sap-pm-integration.md`.
- Mapea los códigos internos a campos SAP: `WPConstraint.ONLINE → SYSBED=1`, frecuencias `DAYS/WEEKS/MONTHS/YEARS/HOURS` a unidades SAP (`DAY/WK/MON/YR/H`).

**Estado:** funcional. El operador puede tomar el output y cargarlo en SAP por LSMW manualmente.

### A.4 Endpoints REST expuestos al frontend

**Archivos:** `api/routers/sap.py` (78 líneas), `api/routers/sap_pm.py` (117 líneas)

| Endpoint | Función |
|---|---|
| `POST /api/v1/sap/generate-upload` | Genera un paquete de carga LSMW |
| `GET /api/v1/sap/uploads/{package_id}` | Consulta el paquete |
| `GET /api/v1/sap/uploads` | Lista paquetes |
| `PUT /api/v1/sap/uploads/{id}/approve` | Marca como aprobado |
| `POST /api/v1/sap/validate-transition` | Valida transición de estado |
| `GET /api/v1/sap/mock/{transaction}` | Retorna datos mock para desarrollo |
| `GET /api/v1/sap-pm/maintenance-plans` | Lista planes de mantenimiento |
| `GET /api/v1/sap-pm/bom/{equipment_tag}` | Lista BOM del equipo |
| `GET /api/v1/sap-pm/measuring-points` | Lista puntos de medición |
| `GET /api/v1/sap-pm/permits` | Lista permisos |
| `GET /api/v1/sap-pm/purchase-requisitions` | Lista requisiciones |
| `GET /api/v1/sap-pm/cost-centers` | Lista centros de costo |
| `GET /api/v1/sap-pm/inventory` | Lista items de inventario |

### A.5 Datos mock para desarrollo

**Carpeta:** `sap_mock/data/`

| Archivo | Contenido |
|---|---|
| `work_orders.json` | OTs PM históricas |
| `functional_locations.json` | Ubicaciones técnicas |
| `materials_bom.json` | Listas de materiales |
| `equipment_master.json` | Registros maestros de equipo |
| `maintenance_plans.json` | Planes de mantenimiento predefinidos |
| `avisos_work_requests.json` | Avisos / WRs |
| `avisos_campos_blueprint.xlsx` | Mapping de campos |

Estos datos permiten que el frontend funcione completo sin SAP real, útil para demos y desarrollo.

---

## Anexo B — Preguntas pendientes para discutir con el cliente

Antes de comprometer un camino de integración SAP con Goldfields conviene resolver:

1. ¿Qué versión de SAP corre el cliente (R/3, ECC, S/4HANA on-premise, S/4HANA Cloud)?
2. ¿IT-SAP del cliente está disponible para asignar una cuenta técnica con perfil PM?
3. ¿Está autorizado instalar el SAP NW RFC SDK en el servidor de producción del lado VSC?
4. ¿Qué volumen de transacciones diarias se proyecta (decenas, cientos, miles)?
5. ¿Hay restricciones contractuales del cliente con SAP respecto a RPA o automatización de UI?
6. ¿Existe ya un partner SAP local que el cliente prefiera para gestionar la integración?

Las respuestas a 1–3 determinan si la opción 1 (RFC/BAPI) es viable a corto plazo. Si la respuesta a 2 o 3 es negativa, las opciones 4 (LSMW) o 5 (RPA temporal) pasan a primer plano hasta destrabar la cuenta técnica.

---

*Documento de discusión · 07-may-2026 · David Cabezas — Value Strategy Consulting*
