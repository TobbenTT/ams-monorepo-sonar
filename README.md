# AMS Platform — Asset Management Software

Enterprise-grade AI-driven maintenance management system for industrial plants.

## Features

- **Multi-Plant Architecture** — Manage multiple plants (OCP, Goldfields, etc.) from one platform
- **Work Management** — Full lifecycle: Work Requests → Planning → Scheduling → Execution → Closure
- **FMEA/RCM** — Failure Mode Analysis, RCM decision logic, criticality assessment
- **AI Agents (CORTEX)** — 33 specialized agents for predictive maintenance, RCA, scheduling optimization
- **Scheduling** — Gantt visualization, HH balance, material tracking, priority-based distribution
- **Analytics** — Executive & Tactical views with KPIs (MTBF, MTTR, OEE, Availability)
- **Reports** — Auto-generated reports with XLSX/CSV export
- **Role-Based Access** — Admin, Manager, Planner, Engineer, Technician, Supervisor
- **Multi-Language** — English, Spanish, Arabic (RTL support)
- **Mobile** — Field technician interface for task execution, WR creation
- **Data Import** — Excel/CSV import with validation and auto-mapping

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+ / FastAPI |
| Frontend | React 18 / Vite / Tailwind CSS |
| Database | SQLite (upgradeable to PostgreSQL) |
| AI | Anthropic Claude API / Multi-agent orchestration |
| Infra | Docker Compose / Nginx reverse proxy |
| Auth | JWT (access + refresh tokens) / bcrypt |

## Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- 4GB RAM minimum (8GB recommended)

### Deploy

```bash
# 1. Clone
git clone <repo-url> && cd AMS-Production

# 2. Configure environment
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY, JWT_SECRET, etc.

# 3. Build & Run
docker compose up -d --build

# 4. Access
# Frontend: http://localhost:8080
# API Docs: http://localhost:8080/docs
```

### Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Administrator |
| planner1 | Planner123 | Planner |
| tecnico1 | Technician123 | Technician |
| supervisor1 | Supervisor123 | Supervisor |
| manager1 | Manager123 | Manager |

> Change passwords immediately after first login.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Nginx     │────▶│   React/Vite │     │   FastAPI    │
│  (Reverse   │     │   Frontend   │     │   Backend    │
│   Proxy)    │────▶│   Port 5173  │     │   Port 8000  │
│  Port 8080  │     └──────────────┘     └──────┬──────┘
└─────────────┘                                  │
                                          ┌──────┴──────┐
                                          │   SQLite DB  │
                                          │  + AI Agents │
                                          └─────────────┘
```

## API Endpoints (404 total)

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 10 | Login, register, roles, JWT refresh |
| Hierarchy | 8 | Plants, nodes, equipment tree |
| FMEA | 15+ | Failure modes, RCM, FMECA worksheets |
| Work Requests | 20+ | CRUD, AI classification, duplicates |
| Work Orders | 15+ | Lifecycle management, closure reports |
| Scheduling | 10+ | Programs, Gantt, HH balance |
| Execution | 10+ | Tasks, handovers, checklists |
| Analytics | 10+ | KPIs, dashboards, variance detection |
| Reporting | 10+ | Auto-reports, exports, notifications |
| AI Agents | 15+ | Sessions, tools, troubleshooting |
| Reliability | 10+ | RBI, Weibull, spare parts, shutdowns |

## Security

- JWT authentication with refresh tokens
- Role-based access control (6 roles)
- Brute-force protection (5 attempts → 5 min lockout)
- Rate limiting (API: 10r/s, Auth: 20r/m, Admin: 10r/m)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS restricted to configured origins
- Gzip compression enabled

## License

Proprietary — Value Strategy Consulting (VCS)
