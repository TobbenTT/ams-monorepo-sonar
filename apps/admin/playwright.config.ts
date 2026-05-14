import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config — flujos críticos AMS (SF-701).
 *
 * Asume backend en localhost:8000 + frontend Vite en localhost:5173, o stack
 * docker-compose con nginx en localhost.
 *
 * Ejecutar:
 *   cd frontend && npx playwright install chromium  # primera vez
 *   npm run e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
