import { defineConfig, devices } from '@playwright/test';

/** Testes de ponta a ponta, contra o servidor de desenvolvimento do Vite.
 * Dois aparelhos, porque a navegação muda: abas embaixo no celular, menu no desktop. */
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
