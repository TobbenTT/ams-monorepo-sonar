---
name: Docs para José (QA + Security)
description: Dos PDFs generados 2026-04-24 para justificar hiring QA y seguridad ante José (CEO/jefe David). Si vuelven a pedir argumentos, referir ahí.
type: reference
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
**Ubicación:** `docs/` del repo.

- `docs/QA_SCOPE.md` + `docs/QA_SCOPE.pdf`
  - Coverage honesto: Claude hace ~20% del QA real (no 60%).
  - Sección "Confabulación de fixes" con 5 ejemplos concretos de la semana.
  - Tabla de documentación obligatoria (test plan, bug reports, matriz permisos, etc.).
  - Certificaciones afectadas (ISO 27001/9001/55001, SOC 2) + Ley 21.663 Chile.

- `docs/SECURITY_SCOPE.md` + `docs/SECURITY_SCOPE.pdf`
  - Audit defensivo de 2026-04-23: 5 vulnerabilidades CRÍTICO/ALTO arregladas (IDOR FMECA, IDOR Cancel WR, AuthZ export-iw22, XSS ExecutiveView, timing attack deploy secret).
  - 4 huecos que exigen rol humano (pentest, threat modeling minero, SecOps 24/7, compliance).
  - Vectores concretos de la plataforma (tabnabbing, supply chain, insider contratista, VPS sin hardening).

- `docs/SAP_PIVOT.md` — registro de decisiones SAP-way de Jorge con atribución de responsabilidad (culpabilidad de desaceleración de innovación por replicar SAP).

- `docs/_md_to_pdf.py` — utilidad para regenerar PDFs. Uso: `python _md_to_pdf.py input.md output.pdf`. Requiere `markdown` + `reportlab`.

**How to apply:**
- Si el usuario (David) pide "docs para José" o similar, estos ya existen.
- Si hay que actualizar coverage o argumentos, editar el MD y re-generar PDF con el script.
- Los PDFs están versionados en git. El tag `backup-2026-04-24-full` los preserva.
