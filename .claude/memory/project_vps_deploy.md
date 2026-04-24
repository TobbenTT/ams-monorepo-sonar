---
name: VPS deploy pattern
description: Cómo deployar y debuggear el VPS de AMS. Incluye pattern de rebuild, cache-bust, y backup tag.
type: reference
originSessionId: aa907cbb-cf3b-4c1b-8eb3-264b2251bba8
---
**Remote git:**
- `origin` = GitHub `ValueStrategyConsulting/AMS-Production`
- `vps` = `root@187.77.223.137:~/ASSET-MANAGEMENT-SOFTWARE` (NO es bare repo — working tree vive ahí)

**Deploy pattern (siempre usar este flujo):**
```
git push vps feature/multi-plant
ssh root@187.77.223.137 "cd ~/ASSET-MANAGEMENT-SOFTWARE && \
  git reset --hard feature/multi-plant && \
  docker compose build ocp-frontend ocp-backend && \
  docker compose up -d --force-recreate ocp-backend ocp-frontend"
```

**Por qué `git reset --hard`:** push a rama no-bare actualiza refs pero NO el working tree. Sin reset, el Docker build toma archivos viejos.

**Containers:**
- `ocp-backend` — gunicorn + FastAPI, port 8020
- `ocp-frontend` — nginx sirviendo build Vite, port 3020
- `ocp-nginx` — reverse proxy en 8030 (HTTP) / 8443 (HTTPS)

**Cache-bust:** `frontend/src/main.jsx` tiene const `CACHE_BUST_VERSION`. Cambiarla fuerza limpieza de localStorage (preserva token) + caches API + service workers + hard reload. Usar cuando el usuario reporta "no veo cambios".

**Backup tag actual:** `backup-2026-04-24-full` — estado tras ~55 commits de la sesión 2026-04-23/24. Recuperar con `git checkout backup-2026-04-24-full`.

**WebSocket debug:**
- Backend logs: `ssh root@... "docker compose -f ~/ASSET-MANAGEMENT-SOFTWARE/docker-compose.yml logs --tail=200 ocp-backend | grep -i ws"`
- Frontend: `wsSingleton.js` — backoff 500ms, ping 25s, pong timeout 10s, eventos `ws:reconnected` + `presence.session_kicked`.
- Nginx: `proxy_read_timeout 3600s` en `/ws/` location (ya tuneado).
