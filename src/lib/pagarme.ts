/**
 * Tokenização do cartão no navegador (pagar.me v5) com a chave PÚBLICA.
 *
 * Número e CVV nunca chegam à nossa API: vai só o `card_token`, como no app
 * (`src/scenes/passaporte/pagarme.js`) e na página "Seja Parceiro".
 */
const CHAVE = (import.meta.env.VITE_PAGARME_PUBLIC_KEY ?? '').trim();
const URL_TOKENS = 'https://api.pagar.me/core/v5/tokens';

export function pagamentoConfigurado(): boolean {
  return CHAVE.length > 0;
}

export type Tokenizacao = { ok: true; token: string } | { ok: false; erro: string; campos: string[] };

export async function tokenizarCartao(cartao: {
  numero: string;
  nome: string;
  mes: number;
  ano: number;
  cvv: string;
}): Promise<Tokenizacao> {
  if (!pagamentoConfigurado()) return { ok: false, erro: 'config_ausente', campos: [] };

  try {
    const resposta = await fetch(`${URL_TOKENS}?appId=${encodeURIComponent(CHAVE)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'card',
        card: {
          number: cartao.numero.replace(/\D/g, ''),
          holder_name: cartao.nome.trim(),
          exp_month: cartao.mes,
          exp_year: cartao.ano,
          cvv: cartao.cvv.replace(/\D/g, ''),
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const dados = await resposta.json().catch(() => null);
    if (resposta.ok && dados?.id) return { ok: true, token: String(dados.id) };

    // Os nomes dos campos reprovados ("card.number") viram mensagem amigável na tela.
    const campos = dados?.errors && typeof dados.errors === 'object' ? Object.keys(dados.errors) : [];
    return { ok: false, erro: resposta.status === 401 || resposta.status === 404 ? 'chave_invalida' : 'cartao_invalido', campos };
  } catch {
    return { ok: false, erro: 'falha_conexao', campos: [] };
  }
}
