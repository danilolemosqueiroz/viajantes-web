import { expect, test, type Page } from '@playwright/test';
import { rota } from './rota';

/** Guia Viajantes (chat com IA). A API Node e o `viajantes-ia` são simulados pelo caminho, então o
 * teste vale com qualquer `VITE_API_URL`/`VITE_IA_URL`. Sem `VITE_IA_URL` o botão não existe e o
 * teste é pulado. */

const USUARIO = {
  idusuario: 10,
  nome: 'Ana',
  sobrenome: 'Teste',
  email: 'ana@teste.com',
  foto: '',
  telefone: null,
  cpf: null,
  dtnascimento: null,
  nivel: null,
  pontos: 0,
  cupom: null,
  cadastroCompleto: true,
  faltando: [],
};

const PLANOS = [
  { idassinatura: 1, nome: 'Mensal', descricao: null, valor: 19.9, periodicidade: 'mensal', parcelas_max: 1 },
  { idassinatura: 2, nome: 'Anual', descricao: null, valor: 149.9, periodicidade: 'anual', parcelas_max: 12 },
];

const SALDO = {
  periodo: '2026-09',
  limite_usd: 1,
  usado_usd: 0.1,
  restante_usd: 0.9,
  percentual_usado: 10,
  mensagens_hoje: 1,
  limite_diario: 50,
  estimativa_mensagens_restantes: 200,
  renova_em: '2026-10-01T03:00:00.000Z',
};

const CONVERSA = {
  id: '11111111-1111-4111-8111-111111111111',
  usuario_id: 10,
  titulo: null,
  regiao_id: null,
  total_mensagens: 0,
  criada_em: '2026-09-29T12:00:00.000Z',
  atualizada_em: '2026-09-29T12:00:00.000Z',
};

const LUGAR = {
  id: 20436,
  nome: 'Poço da Virtuosa',
  tipo: 'atrativo',
  cidade: 'São Roque de Minas',
  capa_url: null,
  nota: 4.8,
  avaliacoes: 12,
  whatsapp: 'https://wa.me/5537999999999',
  link_app: 'viajantesapp://Business/20436',
  link_site: 'https://viajantesapp.com.br/empresa/20436/poco-da-virtuosa',
  passaporte: true,
  desconto_percentual: null,
};

const sse = (eventos: [string, unknown][]) =>
  ': ok\n\n' + eventos.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('');

async function simular(page: Page, { logado, assinado, turno }: { logado: boolean; assinado: boolean; turno?: string }) {
  // Enquanto o aviso de cookies está aberto, ele cobre o botão do guia (de propósito).
  await page.addInitScript(() => {
    document.cookie = 'vj_cookies=essenciais; path=/';
  });
  if (logado) await page.addInitScript(() => localStorage.setItem('vj_sessao', 'hash-de-teste-0000'));

  await page.route(/\/site\/usuario\/me(\?|$)/, (r) => r.fulfill({ json: USUARIO }));
  await page.route(/\/site\/assinatura(\?|$)/, (r) =>
    r.fulfill({ json: { logado, assinado, assinatura: null, planos: assinado ? [] : PLANOS } }),
  );
  await page.route(/\/v1\//, async (r) => {
    const url = new URL(r.request().url());
    const metodo = r.request().method();
    const cabecalhos = r.request().headers();
    // O guia manda a mesma sessão do site.
    expect(cabecalhos['passport']).toBe('hash-de-teste-0000');
    if (url.pathname.endsWith('/v1/saldo')) return r.fulfill({ json: SALDO });
    if (url.pathname.endsWith('/v1/sugestoes')) return r.fulfill({ json: { sugestoes: ['Onde nadar na Canastra?', 'Monte um roteiro de 2 dias'] } });
    if (url.pathname.endsWith('/v1/conversas') && metodo === 'POST') return r.fulfill({ status: 201, json: CONVERSA });
    if (url.pathname.endsWith('/v1/conversas')) return r.fulfill({ json: { conversas: [] } });
    if (url.pathname.endsWith('/mensagens') && metodo === 'POST') {
      return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream; charset=utf-8' }, body: turno ?? '' });
    }
    return r.fulfill({ status: 404, json: { erro: 'nao_encontrado', message: 'x' } });
  });
}

async function abrirGuia(page: Page) {
  await page.goto(rota('/sobre'));
  const botao = page.getByRole('button', { name: 'Abrir o Guia Viajantes' });
  const ligado = await botao.waitFor({ timeout: 10_000 }).then(
    () => true,
    () => false,
  );
  test.skip(!ligado, 'guia desligado (sem VITE_IA_URL)');
  await botao.click();
  return page.getByRole('dialog', { name: 'Guia Viajantes' });
}

test('quem não entrou recebe o convite para entrar', async ({ page }) => {
  await simular(page, { logado: false, assinado: false });
  const painel = await abrirGuia(page);
  await painel.getByRole('button', { name: 'Entrar para conversar' }).click();
  await expect(page.getByRole('heading', { name: 'Entre para usar o Guia Viajantes' })).toBeVisible();
});

test('quem não assina vê a oferta do plano', async ({ page }) => {
  await simular(page, { logado: true, assinado: false });
  const painel = await abrirGuia(page);
  await expect(painel.getByText('O Guia Viajantes faz parte do Plano Viajantes.')).toBeVisible();
  await expect(painel.getByText('Plano Viajantes').first()).toBeVisible();
});

test('assinante conversa: resposta em streaming, cartão do lugar e roteiro', async ({ page }) => {
  await simular(page, {
    logado: true,
    assinado: true,
    turno: sse([
      ['inicio', { mensagem_id: '22222222-2222-4222-8222-222222222222', conversa_id: CONVERSA.id }],
      ['ferramenta', { nome: 'buscar_lugares', rotulo: 'Procurando na base do Viajantes…' }],
      ['texto', { delta: 'Vou buscar… ' }],
      [
        'final',
        {
          mensagem_id: '22222222-2222-4222-8222-222222222222',
          conversa_id: CONVERSA.id,
          texto: 'Para nadar:\n- **Poço da Virtuosa** [[lugar:20436]] — acesso com carro comum\n- Casca [[lugar:999]] fechada',
          lugares: [LUGAR],
          roteiro_id: '33333333-3333-4333-8333-333333333333',
          status: 'ok',
          saldo: SALDO,
        },
      ],
    ]),
  });
  const painel = await abrirGuia(page);
  await painel.getByRole('button', { name: 'Onde nadar na Canastra?' }).click();

  // O `final` substitui o texto: a narração some e a marcação sem cartão também.
  await expect(painel.getByText('acesso com carro comum')).toBeVisible();
  await expect(painel.getByText('Vou buscar')).toHaveCount(0);
  await expect(painel.getByText('[[lugar')).toHaveCount(0);
  await expect(painel.getByRole('link', { name: 'Ver Poço da Virtuosa' })).toBeVisible();
  await expect(painel.getByRole('list', { name: 'Lugares citados' }).getByText('Poço da Virtuosa')).toBeVisible();
  await expect(painel.getByRole('button', { name: /Ver roteiro/ })).toBeVisible();
  await expect(painel.getByText('Onde nadar na Canastra?')).toBeVisible();
});

test('erro no meio do stream mostra o aviso e devolve a pergunta', async ({ page }) => {
  await simular(page, {
    logado: true,
    assinado: true,
    turno: sse([['erro', { erro: 'limite_diario', message: 'x', status: 429 }]]),
  });
  const painel = await abrirGuia(page);
  const caixa = painel.getByLabel('Sua pergunta para o guia');
  await caixa.fill('Quero um roteiro');
  await caixa.press('Enter');
  await expect(painel.getByRole('alert')).toContainText('limite de mensagens de hoje');
  await expect(caixa).toHaveValue('Quero um roteiro');
});

test('Esc fecha o painel e o foco volta ao botão', async ({ page }) => {
  await simular(page, { logado: false, assinado: false });
  const painel = await abrirGuia(page);
  await expect(painel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(painel).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir o Guia Viajantes' })).toBeFocused();
});

test('com o aviso de cookies aberto, o botão fica acima dele e continua clicável', async ({ page }) => {
  await page.route(/\/site\/usuario\/me(\?|$)/, (r) => r.fulfill({ json: USUARIO }));
  await page.goto(rota('/sobre'));
  const botao = page.getByRole('button', { name: 'Abrir o Guia Viajantes' });
  const ligado = await botao.waitFor({ timeout: 10_000 }).then(
    () => true,
    () => false,
  );
  test.skip(!ligado, 'guia desligado (sem VITE_IA_URL)');
  await expect(page.getByRole('dialog', { name: 'Aviso de cookies' })).toBeVisible();
  await botao.click();
  await expect(page.getByRole('dialog', { name: 'Guia Viajantes' })).toBeVisible();
});
