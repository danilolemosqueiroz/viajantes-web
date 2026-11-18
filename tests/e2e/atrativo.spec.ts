import { expect, test, type Page } from '@playwright/test';
import { rota } from './rota';

/** Página do atrativo: convites, contato, avaliações, atrativos próximos, envio de avaliação e o
 * corte do Viajantes pago. Tudo simulado: a API de verdade corta o atrativo para quem não assina. */
const ATRATIVO = '/cachoeiras/cachoeira-agua-limpa-19475';
const RESTAURANTE = '/restaurantes/restaurante-de-teste-20494';

const INTEIRO = {
  idempresa: 19475,
  nome: 'Cachoeira Água Limpa',
  eavmoda: 3,
  anunciante: 1,
  descricao: '',
  endereco: 'Estrada da Cachoeira, km 4',
  cidade_nome: 'Capitólio',
  regiao_nome: 'Serra da Canastra',
  estado_nome: 'Minas Gerais',
  regiao_idregiao: 37,
  cidade_idcidade: 1,
  capa: null,
  logotipo: null,
  fotos: [],
  telefone1: '(37) 3373-0000',
  telefones: [{ idtelefone: 1, numero: '(37) 3373-0000', descricao: '' }],
  whatsapp: '',
  site: '',
  urlfacebook: '',
  urlinstagram: '',
  lat: '-20.6',
  long: '-46.3',
  coordenada: '-20.6,-46.3',
  aberto: 1,
  horario: '',
  horarios: [],
  infos: [{ idinfo: 1, titulo: 'Como chegar', descricao: 'Pela MG-050, 4 km de estrada de terra.' }],
  nota: 0,
  exibeavaliacao: 1,
  acesso: null,
  dificuldade: null,
  complexo: 0,
  total_atrativos: 0,
  filhos: [],
  bloqueado: 0,
};

const AVALIACOES = [
  { idavaliacao: 1, nome: 'Ana Teste', foto: null, nota: 5, mensagem: 'Linda demais, água cristalina.' },
  { idavaliacao: 2, nome: 'Bruno Teste', foto: null, nota: 4, mensagem: 'Trilha tranquila.' },
];

const PROXIMOS = [
  { idempresa: 20397, nome: 'Pousada de Teste', capa: null, cidade: 'Capitólio', eavmoda: 2, distancia_km: 3.2 },
  { idempresa: 20494, nome: 'Restaurante de Teste', capa: null, cidade: 'Capitólio', eavmoda: 4, distancia_km: 1.5 },
];

/** `/site/clique` chamados na página (D17): não podem chegar à API de verdade. */
let cliques: number[] = [];

async function simularEmpresa(page: Page, id: number, empresa: Record<string, unknown>) {
  await page.route(`**/site/empresa/${id}`, (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(empresa) }),
  );
}

async function simularComplementos(page: Page) {
  cliques = [];
  await page.route('**/site/clique', (r) => {
    cliques.push(Number(r.request().postDataJSON()?.idempresa));
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"error":false}' });
  });
  await simularEmpresa(page, 19475, INTEIRO);
  await page.route('**/site/avaliacoes/*', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVALIACOES) }),
  );
  await page.route('**/site/empresa/*/atrativos', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PROXIMOS) }),
  );
}

/** Abre o atrativo e dispensa o convite que aparece ao entrar. */
async function abrirAtrativo(page: Page, caminho = ATRATIVO) {
  await page.goto(rota(caminho));
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

  // Três aberturas na mesma aba: um acesso só para o painel do parceiro.
  expect(cliques).toEqual([19475]);
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

test.describe('Viajantes pago', () => {
  test('atrativo cortado: nome, resumo e títulos, sem contato, e o convite para assinar', async ({ page }) => {
    await simularEmpresa(page, 19475, {
      ...INTEIRO,
      bloqueado: 1,
      resumo: 'Poço verde.',
      infos: [{ idinfo: 1, titulo: 'Como chegar', descricao: '' }],
      telefones: [],
      telefone1: '',
      endereco: '',
      lat: '',
      long: '',
      coordenada: '',
      tem_wikiloc: true,
      tem_como_chegar: true,
      tem_whatsapp: false,
    });

    await abrirAtrativo(page);

    await expect(page.getByRole('heading', { level: 1, name: 'Cachoeira Água Limpa' })).toBeVisible();
    await expect(page.getByText('Poço verde.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Como chegar' })).toBeVisible();
    await expect(page.getByRole('button', { name: /ver trilha no wikiloc/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /como chegar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /whatsapp/i })).toHaveCount(0);
    await expect(page.getByText(/atrativos completos em|lugares com benefício/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /assinar por/i })).toBeVisible();

    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /como chegar/i })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /^avaliações$/i })).toHaveCount(0);
  });

  test('estabelecimento mostra que há benefício, sem dizer qual, a quem não assina', async ({ page }) => {
    await simularEmpresa(page, 20494, { ...INTEIRO, idempresa: 20494, nome: 'Restaurante de Teste', eavmoda: 4, tem_beneficio: true, beneficio: null });

    await abrirAtrativo(page, RESTAURANTE);

    await expect(page.getByText('Benefício exclusivo para assinantes')).toBeVisible();
    await page.getByRole('button', { name: /assinar o plano viajantes/i }).click();
    await expect(page.locator('#assinar-plano')).toBeInViewport();
    // Contato continua aberto: só o benefício é do assinante.
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  });

  test('assinante vê o benefício e como liberar', async ({ page }) => {
    await simularEmpresa(page, 20494, {
      ...INTEIRO,
      idempresa: 20494,
      nome: 'Restaurante de Teste',
      eavmoda: 4,
      tem_beneficio: true,
      beneficio: { tipo: 'percentual', valor: 10, descricao: null, condicoes: 'Exceto bebidas.', texto: '10% de desconto' },
    });

    await abrirAtrativo(page, RESTAURANTE);

    await expect(page.getByText('Seu benefício: 10% de desconto')).toBeVisible();
    await expect(page.getByText('Exceto bebidas.')).toBeVisible();
    await expect(page.getByText(/check-in no app viajantes/i)).toBeVisible();
    await expect(page.getByText('Benefício exclusivo para assinantes')).toHaveCount(0);
  });

  test('QR na porta: celular vai para a loja, computador para a página', async ({ page, isMobile }) => {
    await page.route('https://play.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>loja</p>' }));

    await page.goto(rota('/e/19475?origem=qr'));

    if (isMobile) {
      await page.waitForURL(/play\.google\.com/);
      expect(page.url()).toContain('id=app.nahora');
      expect(page.url()).toContain('referrer=utm_source%3Dqr-parceiro%26utm_medium%3Dqr');
    } else {
      await expect(page).toHaveURL(/\/cachoeiras\/cachoeira-agua-limpa-19475$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Cachoeira Água Limpa' })).toBeVisible();
    }
  });
});
