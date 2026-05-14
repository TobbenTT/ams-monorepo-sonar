# Plan ambiente de QA — Propuesta para Magdalena

**Contexto**: La VPS de producción (`mageam.com`) hospeda 12 proyectos VSC, siendo
AMS-MageAM el más pesado (~12 GB). Necesitamos un ambiente donde Jorge/José/cliente
validen cambios ANTES de tocar producción. Hasta hoy todo se deployaba directo a
prod y eso ya no es viable en escala (riesgo de romper algo en una demo).

---

## Plan A — QA en mismo VPS (sin costo extra)

**Setup**: Stack paralelo de contenedores Docker en la misma VPS de producción.
Cada proyecto tendría sus `*-prod` y sus `*-qa` corriendo lado a lado, con subdominios
distintos (`mageam.com` → prod, `qa.mageam.com` → QA).

### Costos
| Concepto | Costo |
|---|---|
| Hosting | **$0/mes** (reuso VPS actual) |
| Setup inicial | 30-45 min de implementación |
| Mantenimiento adicional | mínimo (mismo Docker, mismo nginx) |

### Capacidad post-setup
- RAM libre actual: 4.9 GB → 4.4 GB después (sobra)
- Disco libre actual: 49 GB → 37 GB después (entra pero apretado a futuro)
- AMS solo ya pesa 12 GB; multiplicar por 12 proyectos en QA es imposible aquí

### Pros
- Cero costo
- Setup más rápido
- Misma infraestructura de deploy y monitoreo

### Contras
- AMS es el proyecto más pesado del VPS → duplicarlo aprieta disco prod
- Si QA revienta el disco con un build mal cancelado, **prod cae también**
- Mismo Docker daemon → un docker crash afecta los 2 ambientes
- Misma IP → si Goldfields o terceros monitorean el host, ven todo junto
- No escala más allá de 2-3 proyectos en QA simultáneo
- Riesgo real durante demos: prod y QA compiten CPU/RAM

### Cuándo conviene Plan A
- Si Magda no quiere meter costo nuevo
- Si la cartera de proyectos no va a crecer en los próximos 6 meses
- Si la frecuencia de cambios a QA es baja (1-2 deploys/semana)

---

## Plan B — VPS dedicada para QA de todos los proyectos ✅ recomendado

**Setup**: Comprar VPS chica (Hostinger KVM 1) **solo para ambiente QA de los 12
proyectos de VSC** (AMS, OR-System, SecondBrain, Yogi Hostels, Codelco, etc.). La
VPS de producción queda intocable hasta que el cliente/equipo apruebe los cambios
en QA.

### Costos
| Concepto | Costo |
|---|---|
| Hosting KVM 1 (1 vCPU, 4 GB RAM, 50 GB NVMe) | **$83/año** primer año (~$6.92/mes) |
| Renovación año 2+ | $11.99/mes ($144/año) — opción de migrar a Hetzner $5/mes |
| Setup inicial multi-proyecto | 2-3 horas de implementación |
| Mantenimiento mensual | ~30 min (updates, monitoring) |

### Capacidad
- 50 GB NVMe **dedicados solo a QA** → cabe el stack QA de todos los proyectos VSC
- 4 GB RAM → maneja los 12 proyectos en idle, y 3-4 corriendo activamente
- 1 vCPU → suficiente para QA interno (no demos público)

### Flujo de trabajo propuesto
```
1. Desarrollador hace cambio          →  push a branch `qa`
2. Auto-deploy a VPS QA               →  qa.proyecto.com actualizado
3. Magda / cliente / equipo validan   →  prueban en qa.*
4. Si aprueban                        →  merge a `main` + deploy a prod
5. Si rechazan                        →  ajustes en branch qa, repetir
```

**Producción nunca se toca sin paso previo por QA aprobado.** Las VPS prod solo
recibe lo que ya fue validado. Imposible romper prod por error de implementación
durante una demo.

### Promoción QA → Prod
Cada proyecto tiene su pareja `prod` ↔ `qa`. La VPS QA es el **espejo dinámico**
de prod; cuando el cambio en QA se acepta, se promueve a prod con un comando
controlado (`./promote-to-prod.sh PROYECTO`). Prod queda "congelada" entre
promociones — solo se actualiza con lo nuevo aprobado.

### Pros
- Aislamiento real: lo que pase en QA NO afecta prod (otro hardware, otro disco, otra IP)
- Escalable: los 12 proyectos VSC tienen su espejo QA sin saturar prod
- Permite probar refactors agresivos (ej: bajar imagen Docker AMS de 9 GB a 3 GB) sin riesgo
- Cliente/Magda pueden ver `qa.mageam.com` con cambios nuevos sin afectar la demo de prod
- Si el disco QA se llena por basura de tests, **prod sigue intacta**
- IP separada → mejor para reputación (rate limits, integraciones SAP de prueba)
- Si en año 2 querés bajar costo, Hetzner CX22 ($5/mes, mejor hardware) es opción

### Contras
- Costo recurrente: $83 primer año, $144/año desde el 2do si seguís en Hostinger
- Setup inicial más largo (2-3 hs vs 30 min)
- Mantenimiento doble (updates, certs SSL, backups)

### Cuándo conviene Plan B
- Si la cartera de proyectos VSC va a seguir creciendo
- Si vas a tener clientes (Goldfields, Codelco, OR-System) viendo demos frecuentes
- Si querés poder hacer refactors pesados sin miedo (ej: el slim de Docker AMS)
- Si la frecuencia de cambios es >3 deploys/semana
- **Si querés dormir tranquila los días de demo**

---

## Comparación rápida

| Criterio | Plan A (Mismo VPS) | Plan B (VPS dedicada) |
|---|---|---|
| Costo año 1 | $0 | $83 |
| Costo año 2+ | $0 | $144/año (Hostinger) o $60/año (Hetzner) |
| Aislamiento prod | Solo lógico (mismo Docker) | Real (otro hardware) |
| Riesgo de romper prod por QA | Medio-alto | Cero |
| Setup | 30-45 min | 2-3 hs |
| Escalabilidad | Hasta 2-3 proyectos QA | Los 12 proyectos VSC |
| Soporte a refactors pesados | Riesgoso | Sin riesgo |
| Multi-proyecto QA | Limitado | Sí |
| Permite demos paralelas (prod estable + QA cambiando) | Limitado | Sí |

---

## Recomendación de David

**Plan B**. La VPS QA cuesta $83 el primer año ($6.92/mes), y a cambio:

1. Aislamos los 12 proyectos VSC de la VPS de producción
2. Magda/cliente pueden validar antes de que toque producción
3. AMS, que es el más pesado, deja de comprimir el disco de los demás proyectos
4. Prod queda blindada — solo actualiza con lo aprobado
5. Si en año 2 lo seguimos usando, migramos a Hetzner por $5/mes (más barato y mejor hardware)

El "costo" real comparado con UN error en demo Goldfields o el tiempo perdido
arreglando prod en hora pico → $83/año es ridículamente barato como seguro.

---

**Próximo paso si aprueba Plan B**:
1. Magda autoriza el gasto
2. David compra el KVM 1 en Hostinger (~5 min)
3. Pasa IP + DNS a Claude
4. Claude implementa setup (2-3 hs)
5. Pilotamos primero AMS-QA, después promovemos a los otros 11 proyectos
