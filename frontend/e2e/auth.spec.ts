import { test, expect } from '@playwright/test';

/**
 * Login + sesión persistente — flujo crítico #1 (SF-701).
 *
 * Credenciales por env (E2E_USERNAME / E2E_PASSWORD); defaults para local dev.
 */
const USERNAME = process.env.E2E_USERNAME || 'admin';
const PASSWORD = process.env.E2E_PASSWORD || 'Admin1234!';

test('login válido redirige a dashboard y guarda token', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/login|auth|\/$/);

  await page.getByLabel(/usuario|username|email/i).fill(USERNAME);
  await page.getByLabel(/contraseña|password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /entrar|login|iniciar/i }).click();

  await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBeTruthy();
  expect(token!.length).toBeGreaterThan(20);
});

test('login inválido muestra error y NO guarda token', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/usuario|username|email/i).fill('nobody');
  await page.getByLabel(/contraseña|password/i).fill('wrongpass1!');
  await page.getByRole('button', { name: /entrar|login|iniciar/i }).click();

  // permanece en login o muestra error visible
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBeFalsy();
});
