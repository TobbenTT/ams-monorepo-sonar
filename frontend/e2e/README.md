# E2E Playwright — flujos críticos AMS (SF-701)

## Setup

```bash
cd frontend
npm install
npm run e2e:install   # baja Chromium (~150MB)
```

## Correr

Backend + frontend deben estar arriba (docker compose up, o stack local).

```bash
# Default: baseURL = http://localhost (stack docker)
npm run e2e

# Modo interactivo (debug)
npm run e2e:ui

# Contra otra URL
E2E_BASE_URL=http://mageam.com E2E_USERNAME=admin E2E_PASSWORD=xxx npm run e2e
```

## Specs

- `auth.spec.ts` — Login válido/inválido + token en localStorage
- `sap-dashboard.spec.ts` — Transport info, queue, render del panel SAP Live Data

Variables:

- `E2E_BASE_URL` — default `http://localhost`
- `E2E_USERNAME` — default `admin`
- `E2E_PASSWORD` — default `Admin1234!`

## CI

Cuando se quiera meter a GitHub Actions, agregar job en `.github/workflows/ci.yml`:

```yaml
e2e:
  name: E2E · Playwright
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '20', cache: npm, cache-dependency-path: frontend/package-lock.json }
    - run: docker compose up -d
    - working-directory: frontend
      run: |
        npm ci
        npx playwright install --with-deps chromium
        npm run e2e
```
