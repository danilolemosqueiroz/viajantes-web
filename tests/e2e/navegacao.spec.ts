import { expect, test } from '@playwright/test';
import { rota } from './rota';

/** O caminho que o visitante faz: home → categoria → destino → atrativo. */
test('da home até um atrativo', async ({ page }) => {
  await page.goto(rota('/'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/descubra o brasil/i);

  await page.goto(rota('/cachoeiras'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/cachoeiras/i);

  await page.goto(rota('/cachoeiras/capitolio'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/capitólio/i);

  const primeiro = page.locator(`a[href^="${rota('/cachoeiras/')}"]`).filter({ hasNotText: '' }).first();
  const destino = await primeiro.getAttribute('href');
  expect(destino).toMatch(/\/cachoeiras\/[a-z0-9-]+-\d+$/);

  await page.goto(destino!);
  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

test('endereço inexistente mostra a página de 404', async ({ page }) => {
  // Num site que monta no navegador o servidor sempre devolve o index.html; o
  // 404 é a TELA, e é ela que precisa aparecer.
  for (const endereco of ['/cachoeiras/lugar-que-nao-existe', '/cachoeiras/qualquer-coisa-99999999']) {
    await page.goto(rota(endereco));
    await expect(page.getByRole('heading', { level: 1 }), endereco).toContainText(/não encontrada/i);
  }
});

test('as URLs do site antigo continuam levando a algum lugar', async ({ page }) => {
  // Comparação por CAMINHO, sem a barra final: a home é `/` na raiz e `/new`
  // quando o site está publicado numa subpasta, e as duas formas são corretas.
  const semBarra = (caminho: string) => caminho.replace(/\/+$/, '') || '/';
  const caminhoAtual = () => semBarra(new URL(page.url()).pathname);

  for (const [antiga, esperado] of [
    ['/home', semBarra(rota('/'))],
    ['/guia-cachoeiras', rota('/cachoeiras')],
    ['/ranking-mapeadores', rota('/mapeadores')],
  ] as const) {
    await page.goto(rota(antiga));
    // O redirecionamento acontece depois que o React monta.
    await expect
      .poll(caminhoAtual, { message: `${antiga} deveria levar a ${esperado}` })
      .toBe(esperado);
  }

  await page.goto(rota('/empresa/19475/nome-antigo'));
  await expect.poll(caminhoAtual).toMatch(new RegExp(`^${rota('/cachoeiras')}/[a-z0-9-]+-19475$`));
});

test('o filtro de destinos encurta a lista', async ({ page }) => {
  await page.goto(rota('/destinos'));

  const campo = page.getByLabel('Buscar região ou cidade...');
  const regioes = page.locator('h2.rotulo-secao');
  await expect(campo).toBeVisible();
  await expect.poll(() => regioes.count()).toBeGreaterThan(1);
  const antes = await regioes.count();
  expect(antes).toBeGreaterThan(1);

  // Por texto: sobra só o estado que tem a região procurada.
  await campo.fill('capit');
  await expect(regioes).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Capitólio/i }).first()).toBeVisible();

  // Sem correspondência: estado vazio explicado, não uma lista em branco.
  await campo.fill('zzzznaoexiste');
  await expect(regioes).toHaveCount(0);
  await expect(page.getByText('Nenhum resultado encontrado')).toBeVisible();

  // Limpar devolve a lista inteira.
  await campo.fill('');
  await expect(regioes).toHaveCount(antes);
});
