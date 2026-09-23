import { expect, test } from '@playwright/test';
import { rota } from './rota';

/** O filtro Estado › Região › Cidade logo abaixo do título da categoria. */
test('escolher estado, região e cidade leva às páginas certas', async ({ page }) => {
  await page.goto(rota('/pousadas'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/pousadas/i);

  const estado = page.getByLabel('Estado', { exact: true });
  const regiao = page.getByLabel('Região', { exact: true });
  const cidade = page.getByLabel('Cidade', { exact: true });
  await expect(regiao).toBeDisabled();

  await estado.selectOption({ label: 'Minas Gerais' });
  await expect(page).toHaveURL(/\/pousadas\?estado=\d+$/);
  await expect(regiao).toBeEnabled();

  // A primeira região do estado: o nome varia ("Capitólio, Guapé e regiões").
  const nomeRegiao = (await regiao.locator('option').nth(1).textContent()) ?? '';
  await regiao.selectOption({ index: 1 });
  await expect(page).toHaveURL(/\/pousadas\/[a-z0-9-]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(nomeRegiao.slice(0, 8));
  await expect(regiao).toHaveValue(/\d+/);

  // A cidade leva à página dela (ou à região homônima, que a contém).
  const opcoes = cidade.locator('option');
  if ((await opcoes.count()) > 1) {
    await cidade.selectOption({ index: 1 });
    await expect(page).toHaveURL(/\/pousadas\/[a-z0-9-]+$/);
  }

  await page.getByRole('button', { name: 'Limpar filtro' }).click();
  await expect(page).toHaveURL(/\/pousadas$/);
});

test('o chip escolhido continua legível (texto branco no verde)', async ({ page }) => {
  await page.goto(rota('/destinos'));
  const todos = page.getByRole('button', { name: 'Todos os estados' });
  await expect(todos).toHaveAttribute('aria-pressed', 'true');
  const cor = await todos.evaluate((el) => getComputedStyle(el).color);
  expect(cor).toBe('rgb(255, 255, 255)');
});
