import { expect, test } from '@playwright/test';
import { rota } from './rota';

/** Nada de terceiros antes do aceite. */
test('sem aceite, nenhum script de medição é carregado', async ({ page }) => {
  const terceiros: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (/googletagmanager|connect\.facebook|adsbygoogle/.test(url)) terceiros.push(url);
  });

  await page.goto(rota('/'));
  await page.waitForLoadState('networkidle');

  expect(terceiros, `carregou: ${terceiros.join(', ')}`).toEqual([]);
  await expect(page.getByRole('dialog', { name: /cookie/i })).toBeVisible();
});
