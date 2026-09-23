import { expect, test } from '@playwright/test';
import { rota } from './rota';

/**
 * "Viajantes Recomenda" e as seções novas da home.
 *
 * A página depende de um serviço de FORA (a Central de Ofertas), então o teste
 * não exige que exista oferta publicada: exige que a tela se resolva — ou
 * mostra cards, ou diz que está vazia, mas nunca fica carregando para sempre.
 */
test('a vitrine de ofertas abre e se resolve', async ({ page }) => {
  await page.goto(rota('/ofertas'));

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ofertas e descontos');

  const cards = page.getByRole('article');
  const vazio = page.getByText(/Nenhuma oferta|Não conseguimos carregar/);
  await expect(cards.first().or(vazio.first())).toBeVisible();
});

test('todo link de oferta passa pela Central, e nunca pelo afiliado', async ({ page }) => {
  await page.goto(rota('/ofertas'));

  // Espera a tela se resolver antes de contar: `count()` não espera, e sem
  // isto o teste passaria "de graça" só porque os dados ainda não chegaram.
  const cards = page.getByRole('article');
  const vazio = page.getByText(/Nenhuma oferta|Não conseguimos carregar/);
  await expect(cards.first().or(vazio.first())).toBeVisible();

  const links = cards.getByRole('link');
  if ((await links.count()) === 0) test.skip(true, 'Central sem oferta publicada no momento');

  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
    expect(href, 'link de oferta fora da Central').toContain('/go/');
    expect(href).toContain('canal=viajantes-site');
  }

  // `sponsored` é o que impede o site de emprestar autoridade para a loja.
  const rel = await links.first().getAttribute('rel');
  expect(rel).toContain('sponsored');
  expect(rel).toContain('nofollow');
});

test('a home mostra as seções novas e chega ao rodapé', async ({ page }) => {
  await page.goto(rota('/'));

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Descubra o Brasil');
  await expect(page.getByRole('heading', { name: 'Tudo para viver cada destino' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /nasceu viajando/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /turismo da sua região/ })).toBeVisible();
});

test('o botão de baixar o app leva à seção do aplicativo', async ({ page }) => {
  await page.goto(rota('/'));

  await page.getByRole('link', { name: 'Baixar o aplicativo' }).first().click();
  await expect(page.getByRole('heading', { name: 'Leve o Viajantes com você.' })).toBeInViewport();
});
