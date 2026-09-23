import { expect, test } from '@playwright/test';
import { rota } from './rota';

/**
 * Roteiros prontos: a lista mostra SÓ a capa, e o detalhe não entrega o dia a
 * dia para quem não comprou — é o conteúdo que se vende.
 */
test('a lista de roteiros mostra só a capa com o título', async ({ page }) => {
  await page.goto(rota('/roteiros'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Roteiros prontos');

  const cards = page.getByRole('article');
  const vazio = page.getByText('Nenhum resultado encontrado');
  await expect(cards.first().or(vazio)).toBeVisible();
  if ((await cards.count()) === 0) test.skip(true, 'sem roteiro ativo no momento');

  // A faixa do plano fica acima da lista, fechada.
  await expect(page.getByRole('button', { name: 'Assinar', exact: true })).toBeVisible();

  // Um card é um link só, com a foto e o título por cima — nada de descrição ou paradas.
  const primeiro = cards.first();
  await expect(primeiro.getByRole('link')).toHaveCount(1);
  await expect(primeiro.getByRole('heading', { level: 3 })).not.toBeEmpty();
  await expect(primeiro.locator('p')).toHaveCount(0);
});

test('sem assinar, o detalhe mostra o plano e nenhuma parada', async ({ page }) => {
  await page.goto(rota('/roteiros'));
  const cards = page.getByRole('article');
  await expect(cards.first().or(page.getByText('Nenhum resultado encontrado'))).toBeVisible();
  if ((await cards.count()) === 0) test.skip(true, 'sem roteiro ativo no momento');
  await cards.first().getByRole('link').click();

  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
  // Quem não assina vê a oferta do Plano Viajantes — nunca a lista de dias.
  await expect(page.getByRole('button', { name: /^Assinar por/ })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Plano/ }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Dia \d+$/ })).toHaveCount(0);
  await expect(page.locator('main ol li')).toHaveCount(0);
});

test('meus roteiros exige login', async ({ page }) => {
  await page.goto(rota('/conta/roteiros'));
  await expect(page).toHaveURL(/\/entrar$/);
});
