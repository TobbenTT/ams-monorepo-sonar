# MAGEAM · Estrategia y Dimensionamiento de Infraestructura
## Arbitraje tecnológico China → LatAm + sizing por cliente real

**Autor:** David Cabezas
**Fecha:** 2026-04-21
**Audiencia:** José (Director) · Gonzalo (Producto)
**Estado:** Propuesta estratégica · requiere VB para incorporar a roadmap

---

## Parte I — Contexto de mercado

### Tamaños reales de operaciones mineras chilenas

| Operación | Tipo | Trabajadores total | Mantenimiento (app) | Equipos críticos | OTs/mes |
|-----------|------|---------------------|---------------------|------------------|---------|
| **Goldfields Salares Norte** | Oro, mediana | 1,500 | 150-250 | ~100 | 200-400 |
| **Los Pelambres** (AMSA) | Cu, mediana-grande | 6,000 | 600-900 | ~500 | 1,200-1,800 |
| **Centinela** (AMSA) | Cu, mediana | 4,500 | 450-700 | ~400 | 900-1,400 |
| **Caserones** | Cu, mediana | 5,000 | 500-800 | ~400 | 1,000-1,600 |
| **BHP Escondida** | Cu, grande | 12,000-30,000 | 1,500-4,000 | 1,500 | 3,500-5,000 |
| **Codelco Chuquicamata** | Cu, grande | 15,000 | 2,000-3,500 | 1,800 | 4,000-6,000 |
| **Codelco El Teniente** | Cu, grande | 15,000 | 2,000-3,500 | 2,000 | 4,500-6,500 |
| **Codelco total (7 divisiones)** | Conglomerado | ~78,000 | ~10,000 | ~12,000 | ~30,000 |

*Fuentes: reportes de sustentabilidad 2024, SONAMI, informes de personal Consejo Minero.*

### Perfiles de usuario en la plataforma

De los "usuarios de mantenimiento", no todos entran diariamente. Distribución típica:

| Rol | % del total mantto | Uso diario | Horas/día |
|-----|--------------------|------------|-----------|
| **Mantenedores de campo** | 75% | Mobile, reporta fallas | 15-30 min |
| **Supervisores** | 12% | Desktop + mobile, revisa OTs | 2-4 h |
| **Planificadores** | 8% | Desktop, planifica semana | 6-8 h |
| **Gerencia / Management** | 3% | Dashboard, analytics | 30 min |
| **Reliability / RCA** | 2% | Desktop, análisis profundo | 4-6 h |

**Concurrencia real** (pico de usuarios simultáneos): aprox **25-35%** del total de usuarios registrados. Una mina de 1,000 users registrados tiene 250-350 concurrentes en turno día.

---

## Parte II — Arbitraje tecnológico China → LatAm

### Qué tiene China en producción real (no demo)

China lidera mining tech en 7 áreas verificables:

1. **5G privado underground con tele-operación** — Baowu, Shenhua, latencia <20ms
2. **Flotas autónomas coal mining** — 500+ camiones 24/7 en Inner Mongolia/Shanxi
3. **AI ore sorting con visión computacional** — Zijin Mining, ahorro 40% procesamiento
4. **IOC centralizados reales** — war rooms de 30 personas decidiendo por 15 minas
5. **ML-optimized shift scheduling** — rosters por algoritmo considerando fatiga, skills, ley laboral
6. **Digital twin operacional continuo** — simulación viva contrafactual
7. **IoT masivo de condición** — sensores en cada motor crítico + predictive real 90%+ accuracy

### Por qué no exportan (y vos podés explotar el gap)

**Barreras duras:**
- Data Security Law 2021: data minera no puede salir del país
- IP & sovereignty: Australia/US/Canadá bloquearon procurement SW chino post-2022
- Certificaciones: no tienen ISO 27001, SOC 2, GDPR requeridas por Occidente
- Ecosistema cerrado: integran con Kingdee/YonYou, no SAP/Oracle

**Barreras cosméticas:**
- Idioma (solo mandarín)
- Zero marketing global
- Cultura guanxi no replicable

### La oportunidad: arbitraje de concepto

Precedentes exitosos del mismo patrón:
- **TikTok** (concepto Douyin → occidentalizado) = US$200B
- **SHEIN** (fast-fashion Shenzhen → e-commerce global) = US$60B
- **Temu** (group-buy chino → UI gringa) = US$30B+
- **BYD/NIO** (EVs chinos → certificación CE para Europa)

Cada uno copió concepto probado + lo occidentalizó + ganó market share.

### Qué podemos implementar en MAGEAM

**Tier 1 · Factible en 1-2 meses cada uno (prioridad alta):**

- **Rosters optimizados por ML** — OR-Tools + data de workforce que ya tenemos. Diferenciador vs Fracttal/Prometheus. 4 semanas · 1 dev.
- **Visión computacional en inspección** — YOLO v8 en fotos de WR, detecta grietas/corrosión/fugas. 6-8 semanas.
- **Predictive maintenance con vibraciones** — LSTM sobre sensores SKF/Schaeffler existentes. 6 semanas + piloto.

**Tier 2 · 3-6 meses:**

- **Digital twin operacional simplificado** — 3D lite + simulaciones qué-pasa-si. 12-16 semanas.
- **IOC (Integrated Operations Center)** — consolidación multi-mina + war room web. 8-10 semanas.

**Tier 3 · Fuera de alcance:**

- 5G privado (hardware)
- Tele-operación autónoma (integración Caterpillar/Komatsu)
- AI ore sorting (industria adyacente, no maintenance)

---

## Parte III — Dimensionamiento de infraestructura por cliente

### Escenario A · Mina pequeña (tipo Goldfields Salares Norte)

**Perfil:**
- 200 usuarios registrados
- 60-80 concurrentes pico
- 300 OTs/mes
- 100 equipos críticos
- 1,500 fotos/mes (15 GB/año)
- Sin IoT inicial

**Infra requerida:**
| Recurso | Cantidad | Detalle |
|---------|----------|---------|
| vCPU | 4 | API + worker rosters ML |
| RAM | 8 GB | App + YOLO + buffer |
| Disco servidor | 80 GB | Docker + logs + PG local |
| Object Storage (S3) | 50 GB | Fotos WRs primer año |
| PostgreSQL gestionado | 2 GB RAM / 20 GB | DB principal |
| Redis | 512 MB | WebSocket pub/sub |
| GPU | Pay-per-use (entrenamiento mensual) | ~US$20/mes |

**Costo mensual estimado:** US$120-160

**Upgrade trigger:** al pasar 150 concurrentes simultáneos o 100 GB storage.

---

### Escenario B · Mina mediana (tipo Los Pelambres, Caserones, Centinela)

**Perfil:**
- 800 usuarios registrados
- 250-350 concurrentes pico
- 1,500 OTs/mes
- 500 equipos críticos
- 200 equipos con sensores vibración activos
- 7,500 fotos/mes (100 GB/año)
- 4M puntos IoT/día

**Infra requerida:**
| Recurso | Cantidad | Detalle |
|---------|----------|---------|
| vCPU | 8 | 4 API + 2 workers ML + 2 visión |
| RAM | 16 GB | Expansión por TimescaleDB + workers |
| Disco servidor | 160 GB | Logs crecen con IoT |
| Object Storage (S3) | 300 GB primer año | Fotos + backups |
| PostgreSQL + TimescaleDB | 8 GB RAM / 100 GB | Con replica incluida |
| Redis | 2 GB | Broadcast multi-planta |
| GPU dedicada | T4 o L4 | Inference tiempo real visión + LSTM |

**Costo mensual estimado:** US$500-750

**Upgrade trigger:** al pasar 3 minas en paralelo o 500 concurrentes.

---

### Escenario C · Cliente grande multi-operación (tipo AMSA completo, Codelco división, BHP)

**Perfil:**
- 3,000-8,000 usuarios registrados
- 1,000-2,500 concurrentes pico
- 10,000+ OTs/mes (3-5 operaciones)
- 2,000-5,000 equipos críticos
- 1,500+ equipos con sensores
- 50,000+ fotos/mes (600 GB/año)
- 30M+ puntos IoT/día

**Infra requerida (Kubernetes cluster):**
| Recurso | Cantidad | Detalle |
|---------|----------|---------|
| Nodos K8s | 3-5 nodos · 8 vCPU · 16 GB c/u | API + workers distribuidos |
| PostgreSQL cluster | Primary + replica · 16 GB RAM | Alta disponibilidad |
| TimescaleDB dedicado | 8 GB RAM · 500 GB | IoT masivo separado |
| Kafka / event streaming | Cluster 3 nodos | Ingesta sensores |
| Redis cluster | 8 GB | Cache + WS + queue |
| Object Storage + CDN | 1-2 TB | Fotos + videos + backups cross-region |
| GPU dedicada | 1x T4 permanente + burst | Inference + reentrenamientos |
| Monitoring completo | Grafana Cloud + Sentry + Loki | Observabilidad enterprise |

**Costo mensual estimado:** US$2,000-3,500

**Upgrade trigger:** implementación directa, no escala desde A/B.

---

## Parte IV — Comparativa consolidada

### Matriz por escenario

| Parámetro | A · Pequeña | B · Mediana | C · Grande |
|-----------|-------------|-------------|------------|
| **Cliente tipo** | Goldfields Salares Norte | Los Pelambres, Caserones | Escondida, AMSA, Codelco div |
| **Users totales** | 200 | 800 | 3,000-8,000 |
| **Concurrentes pico** | 80 | 350 | 2,500 |
| **OTs/mes** | 300 | 1,500 | 10,000+ |
| **Equipos críticos** | 100 | 500 | 2,000-5,000 |
| **IoT (sensores)** | No | Sí (200 motores) | Sí (1,500+ motores) |
| **vCPU** | 4 | 8 | 24+ (cluster) |
| **RAM** | 8 GB | 16 GB | 48+ GB (cluster) |
| **Disco servidor** | 80 GB | 160 GB | 3x 200 GB (cluster) |
| **Storage S3/año** | 50 GB | 300 GB | 1-2 TB |
| **PG** | 2 GB RAM | 8 GB RAM | 16 GB + replica |
| **GPU** | Pay-per-use | T4 dedicada | T4 + burst |
| **Costo US$/mes** | **120-160** | **500-750** | **2,000-3,500** |
| **ARR potencial** | US$30-50k | US$150-300k | US$600k-1.2M |
| **Margen infra** | 96% | 95% | 94% |

### Cálculo de ARR por escenario

**Escenario A (Salares Norte-like):**
- 200 users × US$15/user/mes × 12 = **US$36,000/año**
- Infra: US$1,800/año
- Margen: US$34,200/año por cliente

**Escenario B (Los Pelambres-like):**
- 800 users × US$25/user/mes × 12 = **US$240,000/año**
- Infra: US$7,800/año
- Margen: US$232,200/año por cliente

**Escenario C (Escondida/Codelco div-like):**
- 5,000 users × US$20/user/mes × 12 = **US$1,200,000/año**
- Infra: US$33,000/año
- Margen: US$1,167,000/año por cliente

*Precios de referencia: Fracttal US$15-30/user/mes, Infraspeak US$25/user/mes, SAP PM US$200+/user/mes.*

---

## Parte V — Cómo se compara con competidores

### Stack actual de competidores (a 2026)

| Competidor | Stack | Mejoras China integradas | Precio/user/mes |
|------------|-------|--------------------------|-----------------|
| **Fracttal** | AWS · Postgres · React | Ninguna (heurística básica en scheduling) | US$15-25 |
| **Infraspeak** | Azure · Postgres · Vue | Rosters básicos, no ML real | US$25-40 |
| **Prometheus GWOS** | AWS · Oracle · Angular | CMMS clásico, cero ML | US$30-60 |
| **Cromateus** | On-prem · SQL Server | Enterprise tradicional | US$60+ |
| **Maximo** (IBM) | On-prem/SaaS · DB2 | Watson opcional (caro) | US$100+ |
| **SAP PM** | SAP cloud · HANA | Joule AI (early access) | US$200+ |
| **MAGEAM propuesto** | Hetzner/DO · Postgres + Timescale · React | **Rosters ML + Visión + Predictive** | US$25-50 target |

### Diferenciador único que nadie más tiene en LatAm

1. **Rosters ML real** (no heurística) — solo MAGEAM
2. **Visión computacional integrada al WR** — solo MAGEAM
3. **Predictive maintenance nativo con IoT** — solo MAGEAM en rango <US$50/user
4. **Audit log + firma digital en cierre** — ya implementado, diferenciador vs competidores
5. **Real-time WS + optimistic lock** — ya implementado, nivel SaaS moderno

---

## Parte VI — Roadmap consolidado 12 meses

| Trimestre | Desarrollo | Infra | Comercial |
|-----------|-----------|-------|-----------|
| **Q2 2026** (May-Jul) | Rosters ML + fine-tune IA actual | Stay Escenario A (~US$120) | Cerrar Goldfields, primer caso de éxito |
| **Q3 2026** (Ago-Oct) | Visión en WR + Predictive piloto | Escenario B upgrade (~US$550) | Pitch a Antofagasta Minerals / Teck Chile |
| **Q4 2026** (Nov-Ene 2027) | IOC ligero + Digital Twin MVP | Escenario B consolidado | Entrar RFP enterprise (Codelco, BHP) |
| **Q1 2027** (Feb-Abr) | Escalamiento multi-tenant | Escenario C cuando gana primer grande | Cierre primer contrato enterprise |

### Equipo requerido

- **1 dev full-stack senior** (David, existente)
- **1 ML engineer part-time** (6 meses, 50% dedicación) — US$3,000-5,000/mes
- **1 domain expert minero** (Jorge o externo) — disponibilidad 10h/semana
- **1 DevOps part-time** (solo si se llega a Escenario C) — US$2,000/mes

### Presupuesto total año

- **Dev core:** cubierto (David full-time)
- **ML engineer 6 meses:** US$20,000-30,000
- **Compute (training + cloud):** US$3,000-5,000
- **Monitoreo + herramientas:** US$1,500/año
- **Infra base primer año:** US$1,800 (Escenario A)
- **Total:** **US$26,000-38,000 primer año**

**Break-even:** al cerrar 1 cliente Escenario B (ARR US$240k) o 3 Escenario A (ARR US$108k).

---

## Parte VII — Decisión requerida

**Opción A · Sí completo**
Arrancar Q2 con rosters ML. 1 mes dev dedicado. Review ejecutiva en 6 semanas con métricas reales. Compromiso total.

**Opción B · Exploración (recomendada)**
2 semanas de tiempo de David para prototipo con data sintética + deck comercial detallado. Decisión Go/No-Go al final. Bajo riesgo, alta información.

**Opción C · No por ahora**
Mantener foco en cierre de MVP actual. Revisitar en 6 meses. **Riesgo:** ventana de diferenciación se achica — Fracttal levantó US$70M y va a acelerar, Rio Tinto invirtió US$1B en Mine of the Future.

**Mi recomendación: Opción B.** Bajo riesgo, alta información de vuelta. Si el prototipo impresiona a Goldfields/Antofagasta, pasamos a Opción A con caso. Si no, no quemamos 3 meses.

---

## Fuentes

**Reports:**
- McKinsey Mining 4.0 2024
- ABB Digital Mining Adoption Curve 2025
- PwC Mine 2025: staying the course
- Consejo Minero Chile · Personal 2024
- SONAMI estadísticas 2024

**Competidores (public roadmaps):**
- Fracttal · Infraspeak · Prometheus GWOS

**Papers chinos (traducidos):**
- Zijin AI-driven ore grade classification CSM 2024
- Baowu 5G underground ISIJ 2023
- Sany Predictive maintenance IoT whitepaper 2024

---

*Documento vivo. Actualizo con feedback de José y Gonzalo.*
