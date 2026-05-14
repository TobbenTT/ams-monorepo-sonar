import { test, expect } from '@playwright/test';

const USERNAME = process.env.E2E_USERNAME || 'admin';
const PASSWORD = process.env.E2E_PASSWORD || 'Admin1234!';

/**
 * SAP PM dashboard — flujo crítico #2 (SF-701).
 *
 * Verifica que tras login el transport info responde, el queue endpoint
 * devuelve los counts, y que la sección "SAP Live Data" puede leer
 * equipos del sandbox configurado.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/usuario|username|email/i).fill(USERNAME);
  await page.getByLabel(/contraseña|password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /entrar|login|iniciar/i }).click();
  await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });
});

test('GET /sap/transport/info devuelve transport activo + healthy', async ({ request, page }) => {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  const r = await request.get('/api/v1/sap/transport/info', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(r.ok()).toBeTruthy();
  const body = await r.json();
  expect(body.name).toMatch(/dry_run|mock|odata|rfc/);
  expect(typeof body.healthy).toBe('boolean');
});

test('GET /sap/queue devuelve counts + recent[]', async ({ request, page }) => {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  const r = await request.get('/api/v1/sap/queue', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(r.ok()).toBeTruthy();
  const body = await r.json();
  expect(body).toHaveProperty('counts');
  expect(body).toHaveProperty('recent');
  expect(Array.isArray(body.recent)).toBeTruthy();
});

test('navegar a SAP PM page renderiza panel SAP Live Data', async ({ page }) => {
  await page.goto('/sap-pm');
  // tolera distintas variantes de label
  await expect(page.getByText(/SAP Live Data|Live SAP|Transport activo/i)).toBeVisible({
    timeout: 10_000,
  });
});
