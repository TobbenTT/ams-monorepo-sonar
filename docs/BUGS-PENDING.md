# AMS Platform — Bugs Pendientes

## Fecha: 2026-04-09

---

## ARREGLADOS HOY

| # | Bug | Estado |
|---|-----|--------|
| 5 | WR modal mostraba "Create WO" aunque ya existia | ARREGLADO — WR cambia a EN_EJECUCION |
| 5b | WR volvia a "Approved" al recargar despues de crear WO | ARREGLADO — backend actualiza status |
| 5c | WO creada no aparecia en lista (plant_id incorrecto) | ARREGLADO — usa plant_id del frontend |
| 5d | "Create WO" se quedaba pegado | RESUELTO — era cache del navegador |
| 6 | IA genera titulo con TAG numerico | ARREGLADO — prompt prohibe IDs numericos |
| 7 | IA no completaba Object Part y Cause | ARREGLADO — campos mandatory en prompt + fuzzy matching |
| 8 | Titulo WR muestra ID numerico en header | ARREGLADO — muestra nombre del equipo |
| 10 | Step 1 Location: equipos desaparecian, click no seleccionaba | ARREGLADO — flag equipFromLocation + timeout 400ms |
| 11 | Technical Location codigos repetidos (SN-SN-3000-SN-3000) | ARREGLADO — usa code directo, no concatena |
| 12 | Carrusel duplicados sin X individual | ARREGLADO — carrusel 3D con X por duplicado |
| 13 | Toggle Planner/Supervisor saltaba de tab | ARREGLADO — eliminado useEffect que reseteaba tab |

---

## PENDIENTES (requieren API keys o datos del cliente)

### 1. FailureCapture — Microfono no funciona
- **Problema**: Boton "Voice" no transcribe. Necesita OPENAI_API_KEY para Whisper
- **Prioridad**: Alta — feature de venta
- **Bloqueado por**: OPENAI_API_KEY no configurada en servidor

### 2. FailureCapture — Modo editar al hablar
- **Problema**: Al grabar voz, deberia llenar el campo "What Happened" automaticamente
- **Prioridad**: Alta
- **Bloqueado por**: Depende del fix #1 (microfono)

### 3. FailureCapture — Equipment TAG muestra IDs numericos en busqueda
- **Problema**: La busqueda de equipos muestra `000000000196` como TAG
- **Estado**: PARCIALMENTE ARREGLADO — el dropdown ahora muestra nombre primero, code como referencia. Pero el TAG en la DB sigue siendo numerico
- **Prioridad**: Media
- **Bloqueado por**: Datos seed del Excel tienen IDs numericos como TAG (ver SEED-DATA-EVIDENCE.md)

### 4. GuidedTour — Deshabilitado
- **Problema**: Blank page al activar. Fix de hooks aplicado pero no re-habilitado
- **Prioridad**: Baja
- **Pendiente**: Testear con localStorage limpio

---

## MEJORAS FUTURAS (requieren cliente)

### 9. Catalogos de falla configurables
- Actualmente hardcoded en frontend (5 categorias)
- Deberian venir de la DB, configurables por cliente
- El cliente sube su catalogo SAP PM via Data Import

### Infraestructura
- SAP RFC real (necesita credenciales del cliente)
- Datos reales de equipos (los IDs numericos se resuelven con data real)
- ANTHROPIC_API_KEY en produccion (costo mensual)
- OPENAI_API_KEY para transcripcion de voz (Whisper)
- SMTP configurado para notificaciones email reales
- Frontend tests (Vitest/Jest)
