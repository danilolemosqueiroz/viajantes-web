import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta.
 *
 * Rodam contra o servidor de desenvolvimento do Vite, que por sua vez fala com
 * a API (a local se `API_URL_DEV` estiver preenchida no `.env`). Dois aparelhos,
 * porque a navegação muda: no celular a barra de abas embaixo, no desktop o menu.
 */
const origem = process.env.SITE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: origem, trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: origem,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
