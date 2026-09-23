import { expect, test } from '@playwright/test';
import { rota } from './rota';

/** O site em cinco idiomas, com endereços traduzidos e hreflang recíproco. */
test('a mesma página em inglês tem endereço e texto próprios', async ({ page }) => {
  await page.goto(rota('/en/waterfalls'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/waterfalls/i);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('hreflang aponta para os cinco idiomas e para o padrão', async ({ page }) => {
  await page.goto(rota('/cachoeiras'));
  for (const idioma of ['pt', 'en', 'es', 'fr', 'de', 'x-default']) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${idioma}"]`)).toHaveCount(1);
  }
  await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute(
    'href',
    /\/de\/wasserfaelle$/,
  );
});

test('os roteiros têm endereço traduzido', async ({ page }) => {
  await page.goto(rota('/es/itinerarios'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(page.url()).toContain('/es/itinerarios');
});

/**
 * O endereço de um destino muda de nome em cada idioma (`/destinos`,
 * `/de/reiseziele`). A lista já montou esse link à mão uma vez e levou a 404
 * em tudo que não era português — por isso o teste abre o link, em vez de só
 * conferir o texto dele.
 */
test('o destino aberto pela lista existe em todos os idiomas', async ({ page }) => {
  for (const lista of ['/destinos', '/de/reiseziele', '/en/destinations', '/fr/destinations', '/es/destinos']) {
    await page.goto(rota(lista));

    const primeiro = page.getByRole('link', { name: /Serra da Canastra/ }).first();
    await expect(primeiro).toBeVisible();
    await primeiro.click();

    await expect(page.getByRole('heading', { level: 1 }), `destino quebrado a partir de ${lista}`).toContainText(
      /Serra da Canastra/,
    );
  }
});
