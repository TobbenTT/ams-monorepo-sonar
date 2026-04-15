---
name: MagEAM Project Full Context
description: Complete project knowledge dump for MagEAM (formerly AMS Platform) — architecture, VPS access, deployment, recent changes, pending work, team dynamics
type: project
originSessionId: 76c5f033-3812-4512-b096-26ae83ae4dd8
---
# MagEAM (formerly AMS Platform) — Full Project Context

## Identity
- **Product name**: MagEAM (rebranded from "AMS Platform" on 2026-04-13)
- **Domain**: https://mageam.com (also accessible at https://ams.aiprowork.com — same backend)
- **Company**: Value Strategy Consulting (VSC)
- **Logo**: `/frontend/public/MAGEAM_LOGO.png` — blue gear icon with "MagEAM by VSC" text

## VPS Access
- **IP**: 187.77.223.137
- **IPv6**: 2a02:4780:2d:e174::1
- **SSH**: `ssh vps` (alias in ~/.ssh/config → root@187.77.223.137, key: ~/.ssh/id_ed25519)
- **Hostname**: srv1425013
- **App directory**: `/root/ASSET-MANAGEMENT-SOFTWARE`
- **Note**: SSH ControlMaster sockets sometimes stale — use `ssh -o ControlMaster=no vps` if connection resets

## Local Repo
- **Path**: `c:\Users\Tobbe\Downloads\Practica\AMS-Production`
- **Branch**: `feature/multi-plant`
- **Remote**: pushes to `vps:~/ASSET-MANAGEMENT-SOFTWARE` (bare repo on VPS)
- **GitHub token**: exists for cloning — see memory file `ams-local-repo.md`

## Stack
- **Backend**: Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL
  - Entry: `api/main.py` → `create_app()` → Gunicorn with 4 Uvicorn workers
  - Docker container: `ocp-backend` (port 8020 internal → 8000 in container)
  - Config: `api/config.py` reads from `.env`
  - Auth: JWT tokens via `api/dependencies/auth.py` (get_current_user, require_role)
  - Rate limiting: 120 req/min/IP in `api/main.py` RateLimitMiddleware
  - Security headers: X-Frame-Options, CSP, HSTS, etc. in SecurityHeadersMiddleware
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui
  - Entry: `frontend/src/main.jsx` (React Router v7, lazy loading with retry)
  - API client: `frontend/src/api.js` (auto-injects plant_id, JWT token)
  - i18n: `frontend/src/i18n/en.js` + `es.js` (English/Spanish)
  - Docker container: `ocp-frontend` (nginx serving static, port 8030)
- **Database**: PostgreSQL 16 (in Docker)
  - Models: `api/database/models.py`
  - Connection: `api/database/connection.py`
  - Seed: `api/seed.py` (runs on empty DB), `api/seed_demo.py` (on-demand demo plant)
- **Proxy**: nginx on host (NOT Docker) → routes to containers
  - Config: `/etc/nginx/sites-available/mageam.com` (+ ams.aiprowork.com)
  - SSL: Let's Encrypt via certbot (auto-renew)

## Docker Containers
```
ocp-backend   → port 8020 → FastAPI (Gunicorn)
ocp-frontend  → port 8030 → nginx serving Vite build
ocp-nginx     → internal nginx (inside docker-compose, NOT the host nginx)
```
Host nginx proxies: mageam.com → 127.0.0.1:8030 (frontend) + /api/ → 127.0.0.1:8020 (backend)

## Deployment Process
1. Edit files locally in `c:\Users\Tobbe\Downloads\Practica\AMS-Production`
2. SCP changed files to VPS: `scp -o ControlMaster=no <file> vps:/tmp/`
3. Copy to app dir: `ssh vps "cp /tmp/<file> /root/ASSET-MANAGEMENT-SOFTWARE/<path>"`
4. Backend: `docker cp <file> ocp-backend:/app/<path> && docker restart ocp-backend`
5. Frontend: copy to source, rebuild with `docker run --rm -v $(pwd):/app -w /app node:20-alpine sh -c 'npm run build'`, then `docker cp dist/. ocp-frontend:/usr/share/nginx/html/ && docker exec ocp-nginx nginx -s reload`
6. Commit + push: `git add && git commit && git push` (pushes to VPS bare repo)

## CORS Configuration
- File: `/root/ASSET-MANAGEMENT-SOFTWARE/.env`
- Current: `CORS_ORIGINS=https://ocp.aiprowork.com,https://ams.aiprowork.com,https://mageam.com,https://www.mageam.com,http://localhost:8080`
- After changing .env: `docker restart ocp-backend`

## Multi-Plant Architecture
- Plants in DB: OCP-JFC1, GOLDFIELDS-SN, FLUOR-ALFA, DEMO-CORP
- Plant selector: `frontend/src/pages/ProjectSelector.jsx` (with per-plant colors/icons)
- Selected plant stored in `localStorage('selected_plant')`
- All API calls auto-inject `plant_id` query param via `api.js`
- Settings are per-plant: `GET/PUT /admin/settings?plant_id=X`
- DEMO-CORP seeded via `api/seed_demo.py` — 254 nodes, 25 WRs, 40 WOs, 15 workers
- Demo user: `demo-demo-corp` / `Demo2026!` (manager role)

## Key Pages & Routes
### Public (no auth):
- `/` → LandingPage (hero, features, stats, CTA → /contact)
- `/login` → Login page
- `/contact` → ContactPage (enterprise sales form → POST /api/v1/sales/contact)
- `/status` → StatusPage (health check display)
- `/security` or `/security-compliance` → SecurityCompliancePage (26-control compliance matrix)

### Authenticated (inside App shell with sidebar):
- `/dashboard` → HomeRouter (Executive + Tactical views)
- `/work-management` → WorkManagement (WR tabs with URL-synced state)
- `/work-orders` → WorkOrdersPage (WO lifecycle)
- `/failures-events` → FailuresEvents (FailureCapture wizard)
- `/improvement-actions` → ImprovementActionsPage
- `/analytics` → AnalyticsPage (manager/admin only)
- `/reports` → ReportsPage
- `/team` → TeamPage
- `/settings` → SettingsPage (per-plant, 6 tabs)
- `/sap-pm` → SapPmPage
- `/execution` → Execution tracking
- `/post-maintenance` → PostMaintenance reviews
- `/data-import` → DataImport
- `/audit-log` → AuditLogPage

## Backend Routers (api/routers/)
hierarchy, criticality, fmea, tasks, work_packages, sap, analytics, admin,
capture, work_requests, planner, backlog, scheduling, reliability, rca,
reporting, dashboard, auth, ai_agents, sync, troubleshooting,
execution_checklists, deliverables, assignments, expert_knowledge,
financial, workflow, media, imports, or_projects, improvement_actions,
managed_work_orders, feedback, notifications, capture_geo, execution,
post_maintenance, catalogs, sap_pm, data_import, agentic, sales, security

## Security Features Implemented
- JWT auth with 32+ char secret
- RBAC: 6 roles (admin, manager, planner, engineer, tecnico, supervisor)
- Rate limiting: 120 req/min/IP
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Audit log (all privileged actions)
- Multi-tenant data segmentation by plant_id
- SIEM export: `GET /api/v1/security/siem-export?format=json|cef`
- Certificate of deletion: `POST /api/v1/security/certificate-of-deletion`
- Token revocation: `POST /api/v1/security/revoke-tokens`
- Incident reporting: `POST /api/v1/security/report-incident`
- Compliance status: `GET /api/v1/security/compliance-status` (public, 88% compliance)
- Email notifications via SMTP (sales@aiprowork.com, security@aiprowork.com)

## Recent Changes (2026-04-10 to 2026-04-13)
1. **Rebrand**: AMS Platform → MagEAM across all files + new logo
2. **Domain**: mageam.com configured (DNS + nginx + SSL)
3. **Per-plant settings**: backend + frontend, each plant gets own config
4. **DEMO-CORP plant**: seeded with synthetic data for sales demos
5. **Contact form**: /contact page + POST /api/v1/sales/contact (emails to sales team + auto-reply)
6. **Security compliance**: 5 new API endpoints + /security-compliance public page
7. **Settings Data tab**: DB stats from /health, wired retention/backups, integration modals
8. **Settings Permissions tab**: role permission matrix modal
9. **Jorge feedback (yellow items)**:
   - Notification Class: removed "(SAP)", removed M003, auto-select M002/M001 by priority
   - Activity Class: new section showing PM01/PM03 determined by priority
   - Validate/Reject buttons removed from WR list (kept in detail modal only)
   - "+New Preventive WO" button removed from Planning
   - WO Operations: loads suggested_actions from parent WR when empty
10. **docs/SECURITY.md**: formal security policy document

## Pending Work
### From Jorge's Feedback (lower priority):
- Reject OT Cancel bug: needs manual testing (code looks correct)
- `Puesto_Trabajo_Responsable` filter in Team (needs SAP field in DB)
- `Grupo_Planificacion` filter (needs SAP field)
- Scheduling filter by `Puesto_de_Trabajo` (needs SAP field)
- Offline cache bug (risky, needs reproduction)

### Cybersecurity Phase 2:
- MFA (TOTP) — needs DB table + enrollment flow + UI
- Data retention auto-purge cron job
- Real ISO 27001 / SOC 2 certification (paper, not code)

### From Jose's Branch (not merged):
- `Agentic_solutions_jose` branch has: frontend pages, Gemma-4, planillas, tests, tools
- See memory file `ams-pending-jose-merge.md` for details

## Team Dynamics
- **Magda**: pushes minimalism, wants fewer features
- **Carlos/Gonzalo**: want architecture redo
- **Jorge**: detailed SAP PM knowledge, tests manually, provides specific feedback
- **Jose**: has separate branch with agentic solutions, planillas, not merged yet
- **Solution to Magda vs Carlos conflict**: role-based views (not less features)
- **User (David)**: prefers direct action over planning, gets frustrated when asked questions answerable by reading code, Spanish-speaking, wants immediate commits/pushes

## Important Files
- `api/main.py` — app factory, middleware, router registration
- `api/config.py` — settings from env vars
- `api/database/models.py` — all SQLAlchemy models
- `api/seed.py` — initial seed (OCP-JFC1)
- `api/seed_demo.py` — on-demand demo plant seeder
- `api/routers/security.py` — cybersecurity compliance endpoints
- `api/routers/sales.py` — contact form endpoint
- `api/routers/admin.py` — settings (per-plant), audit log, seed, export
- `frontend/src/main.jsx` — all routes
- `frontend/src/api.js` — API client
- `frontend/src/i18n/en.js` + `es.js` — translations
- `frontend/src/pages/FailureCapture.jsx` — WR creation wizard (biggest page ~2500 lines)
- `frontend/src/pages/WorkRequests.jsx` — WR list + detail modal
- `frontend/src/pages/WorkOrdersPage.jsx` — WO lifecycle
- `frontend/src/pages/SettingsPage.jsx` — per-plant settings (776 lines)
- `frontend/src/pages/LandingPage.jsx` — public landing
- `frontend/src/pages/ProjectSelector.jsx` — plant picker (with DEMO-CORP config)
- `docs/SECURITY.md` — formal security policy
- `docs/Feedback Plataforma AMS_jorge.docx` — Jorge's feedback (7 yellow items)
