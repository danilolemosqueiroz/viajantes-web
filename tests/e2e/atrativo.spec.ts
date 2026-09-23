import { expect, test, type Page } from '@playwright/test';
import { rota } from './rota';

/**
 * Página do atrativo: os convites ao abrir (conta sempre, app no 2º atrativo —
 * nenhum trava nada), contato, avaliações com nota média, abas de atrativos
 * próximos e o envio de avaliação.
 *
 * O atrativo vem da API de verdade; avaliações, atrativos próximos e o envio
 * são simulados, para o teste não depender do que há no banco hoje.
 */
const ATRATIVO = '/cachoeiras/cachoeira-agua-limpa-19475';

const AVALIACOES = [
  { idavaliacao: 1, nome: 'Ana Teste', foto: null, nota: 5, mensagem: 'Linda demais, água cristalina.' },
  { idavaliacao: 2, nome: 'Bruno Teste', foto: null, nota: 4, mensagem: 'Trilha tranquila.' },
];

const PROXIMOS = [
  { idempresa: 20397, nome: 'Pousada de Teste', capa: null, cidade: 'Capitólio', eavmoda: 2, distancia_km: 3.2 },
  { idempresa: 20494, nome: 'Restaurante de Teste', capa: null, cidade: 'Capitólio', eavmoda: 4, distancia_km: 1.5 },
];

async function simularComplementos(page: Page) {
  await page.route('**/site/avaliacoes/*', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVALIACOES) }),
  );
  await page.route('**/site/empresa/*/atrativos', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PROXIMOS) }),
  );
}

/** Abre o atrativo e dispensa o convite que aparece ao entrar. */
async function abrirAtrativo(page: Page) {
  await page.goto(rota(ATRATIVO));
  const convite = page.getByRole('dialog', { name: /entre ou crie sua conta|baixe o aplicativo/i });
  await convite.getByRole('button', { name: /continuar no site/i }).click();
  await expect(convite).toBeHidden();
}

/** Aceita os cookies antes, para o aviso da LGPD não cobrir nada. */
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    document.cookie = 'vj_cookies=essenciais; path=/';
  });
  await simularComplementos(page);
});

test('convite de conta ao abrir, app no segundo atrativo — e nada trava', async ({ page }) => {
  await page.goto(rota(ATRATIVO));

  // Quem não está logado é convidado a entrar ou criar conta.
  const conta = page.getByRole('dialog', { name: /entre ou crie sua conta/i });
  await expect(conta).toBeVisible();
  await expect(conta.getByRole('button', { name: /criar conta/i })).toBeVisible();
  await expect(conta.getByRole('button', { name: /^entrar$/i })).toBeVisible();

  await conta.getByRole('button', { name: /continuar no site/i }).click();
  await expect(conta).toBeHidden();

  // Nada bloqueado: contato e "como chegar" estão à mão.
  await expect(page.getByRole('heading', { name: /^contato$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /como chegar/i }).first()).toBeVisible();

  // Segundo atrativo da visita: é a vez do app.
  await page.reload();
  const app = page.getByRole('dialog', { name: /baixe o aplicativo/i });
  await expect(app).toBeVisible();
  await expect(app.getByRole('link', { name: /app store/i })).toBeVisible();
  await expect(app.getByRole('link', { name: /google play/i })).toBeVisible();
  await app.getByRole('button', { name: /continuar no site/i }).click();
  await expect(app).toBeHidden();

  // Terceiro: o app descansa por uma semana; a conta volta, sempre.
  await page.reload();
  await expect(page.getByRole('dialog', { name: /entre ou crie sua conta/i })).toBeVisible();
  await expect(page.getByRole('dialog', { name: /baixe o aplicativo/i })).toBeHidden();
});

test.describe('com o convite já respondido', () => {
  test('mostra a nota média, as avaliações e os atrativos próximos em abas', async ({ page }) => {
    await abrirAtrativo(page);

    // 4,5 = média de 5 e 4; aparece no topo e na seção.
    await expect(page.getByText('4,5').first()).toBeVisible();
    await expect(page.getByText('(2 avaliações)').first()).toBeVisible();
    await expect(page.getByText('Linda demais, água cristalina.')).toBeVisible();

    const restaurantes = page.getByRole('tab', { name: /restaurantes/i });
    const hospedagens = page.getByRole('tab', { name: /hospedagens/i });
    await expect(restaurantes).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('link', { name: /restaurante de teste/i })).toBeVisible();

    await hospedagens.click();
    await expect(page.getByRole('link', { name: /pousada de teste/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /restaurante de teste/i })).toHaveCount(0);
  });

  test('avaliar este local valida a nota e envia para moderação', async ({ page }) => {
    let enviado: Record<string, unknown> | null = null;
    await page.route('**/site/avaliacaoAdd', (r) => {
      enviado = r.request().postDataJSON();
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Avaliação enviada com sucesso! Ela será publicada após aprovação.', idAvaliacao: 99 }),
      });
    });

    await abrirAtrativo(page);
    await page.getByRole('button', { name: /avaliar este local/i }).click();

    const modal = page.getByRole('dialog', { name: /avaliar este local/i });
    await expect(modal).toBeVisible();

    // Sem estrela, não vai.
    await modal.getByRole('button', { name: /enviar avaliação/i }).click();
    await expect(modal.getByRole('alert')).toContainText(/nota de 1 a 5/i);

    await modal.getByRole('radio', { name: /nota 5 de 5/i }).click();
    await modal.getByLabel(/seu nome/i).fill('Carla Teste');
    await modal.getByLabel(/seu e-mail/i).fill('carla@example.com');
    await modal.getByLabel(/como foi sua visita/i).fill('Muito bom, recomendo.');
    await modal.getByRole('button', { name: /enviar avaliação/i }).click();

    await expect(modal.getByRole('status')).toContainText(/publicada após aprovação/i);
    expect(enviado).toMatchObject({ idempresa: 19475, nota: 5, nome: 'Carla Teste', email: 'carla@example.com' });
  });
});
