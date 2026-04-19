# AMS Field PWA

Offline-first Progressive Web App for field supervisors.
Part of **GAP-W03: Offline Mode with Sync** — OCP Maintenance AI project.

## Overview

The Field PWA is a React/TypeScript companion to the main Streamlit app.
It runs on tablets and phones in the field and keeps working without internet.

```
OFFICE (online)          FIELD (offline-first)
─────────────────        ──────────────────────
Streamlit (23 pages)  ←→  Field PWA (3 pages)
Desktop browser           Tablet / phone
Full functionality        Capture · Program · Checklist
         └────── FastAPI backend (shared) ──────┘
```

### 3 pages

| Page | Route | Purpose |
|------|-------|---------|
| Field Capture | `/` | Submit work requests — works completely offline |
| Work Program | `/program` | Daily schedule of work orders cached offline |
| Checklist | `/checklist?orderId=…` | Digital maintenance checklist with gate logic |

---

## Setup

### Prerequisites
- Node.js 18+
- The FastAPI backend running (`uvicorn api.main:app`)

### Install

```bash
cd field_app
npm install
```

### Dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`. API calls proxy to `http://localhost:8000`.

### Build for production

```bash
npm run build
# Output: field_app/dist/
```

The FastAPI server automatically serves the built PWA at `http://localhost:8000/field/`
(only if `field_app/dist/` exists — build first).

### Run tests

```bash
npm test          # Vitest unit tests (33 tests)
npm run test:ui   # Vitest browser UI
```

---

## Architecture

### Offline-first data flow

```
[React Pages]
     │
     ├── [IndexedDB via Dexie.js]  ← offline cache (always read from here)
     │       ├── captures          write queue (pending → synced | conflict)
     │       ├── equipment         read-only cache (equipment hierarchy)
     │       ├── workOrders        read-only cache (daily work program)
     │       ├── checklists        write queue (offline progress)
     │       └── syncMeta          timestamps + record counts
     │
     ├── [SyncManager]             ← triggered on open/reconnect/periodic/manual
     │       ├── pushPendingCaptures()   POST /api/v1/sync/push
     │       ├── pullEquipmentHierarchy() GET /api/v1/hierarchy/nodes
     │       └── pullWorkOrders()        POST /api/v1/sync/pull
     │
     └── [Service Worker]          ← caches app shell + static assets
             ├── Cache-first:  JS/CSS/fonts/images (Vite content hashes)
             ├── Network-first: /api/ GET requests (fall back to cache)
             └── Stale-while-revalidate: HTML shell
```

### Sync cycle (triggered automatically)

1. **On app open** (1 s delay) — if online, run `syncAll()`
2. **On reconnect** — immediately run `syncAll()`
3. **Every 5 minutes** — if still online, run `syncAll()`
4. **Manual** — header `↻` button
5. **Background sync** — service worker `sync` event notifies main thread

`syncAll()` flow:
1. Push pending captures → server (POST /sync/push)
2. Pull equipment hierarchy (if cache > 1 h old)
3. Pull work orders (always)

### Conflict resolution

When `syncStatus === 'conflict'`, the `ConflictDialog` modal appears automatically.
User chooses **Garder la mienne** (LOCAL_WINS) or **Utiliser serveur** (SERVER_WINS).
Resolution is sent to POST /api/v1/sync/resolve.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/db/local-db.ts` | Dexie.js IndexedDB schema (v1 + v2 migrations) |
| `src/sync/sync-manager.ts` | Pull/push/resolve logic |
| `src/sync/sync-queue.ts` | Offline write queue |
| `src/hooks/useSync.ts` | Auto-sync hook (mount/reconnect/periodic/SW) |
| `src/hooks/useOnlineStatus.ts` | navigator.onLine + events |
| `src/components/ConnectionStatus.tsx` | Online/offline dot + pending badge |
| `src/components/ConflictDialog.tsx` | Conflict resolution modal |
| `src/i18n/index.ts` | FR/EN/ES/AR translations (RTL for Arabic) |
| `public/sw.js` | Service worker (cache strategies + background sync) |
| `public/manifest.json` | PWA manifest (installable on home screen) |

---

## PWA Install (mobile)

1. Open `http://[server]:8000/field/` on a phone/tablet
2. In browser menu: **Add to Home Screen** / **Install App**
3. The app installs and works offline from that point

Requires: HTTPS in production (or localhost for dev).

---

## i18n

Languages: **Français** (default), **English**, **Español**, **العربية** (RTL).
Stored in `localStorage`. Arabic automatically applies `dir="rtl"` on the document root.

---

## Deployment

The PWA is served from the same FastAPI server — no additional infrastructure needed.

```bash
# 1. Build the PWA
cd field_app && npm run build

# 2. Start FastAPI
uvicorn api.main:app --host 0.0.0.0 --port 8000

# 3. Access at
#    http://[host]:8000/field/     ← Field PWA
#    http://[host]:8000/docs       ← API docs
#    http://[host]:8000/           ← API root
```

---

## GAP-W03 Status

| Session | Description | Status |
|---------|-------------|--------|
| Session 1 | API sync infrastructure + PWA scaffold | ✅ Complete |
| Session 2 | Offline field capture | ✅ Complete |
| Session 3 | Work program viewer + checklist execution | ✅ Complete |
| Session 4 | Sync protocol, conflict resolution, polish | ✅ Complete |
