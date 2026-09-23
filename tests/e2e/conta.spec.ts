import { expect, test } from '@playwright/test';
import { rota } from './rota';

/** Área logada: quem não entrou não passa. */
test('conta exige login', async ({ page }) => {
  await page.goto(rota('/conta'));
  // O site decide no navegador: espera a troca de endereço, não o primeiro quadro.
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('a sessão fica no navegador e some ao sair', async ({ page }) => {
  await page.goto(rota('/entrar'));
  // Sem sessão gravada, a API nem é chamada para /site/usuario/me.
  const sessao = await page.evaluate(() => localStorage.getItem('vj_sessao'));
  expect(sessao).toBeNull();
});
