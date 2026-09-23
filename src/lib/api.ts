/**
 * Cliente da API Node (`viajantes-node-api`), chamado direto do NAVEGADOR.
 *
 * O site é um SPA: não há servidor nosso no meio, então a `Site-Key` viaja no
 * pacote do JavaScript — do mesmo jeito que já viaja dentro do aplicativo.
 * É a mesma chave, com o mesmo alcance: as rotas `/site/*`, que são de leitura
 * do catálogo e de autenticação, e nunca as rotas administrativas.
 *
 * Quem está logado manda também o `Passport` (o hash da sessão), exatamente
 * como o aplicativo faz.
 */
import { lerSessao } from './sessao';

export type Resultado<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; data: null; status: number; erro: string; codigo?: string; dados?: Record<string, unknown> };

type Query = Record<string, string | number | boolean | undefined | null>;

const TEMPO_LIMITE = 15_000;

const base = (): string => (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Monta a URL ignorando parâmetros vazios. */
export function montarUrl(caminho: string, query?: Query): string {
  const url = new URL(`${base()}/${caminho.replace(/^\//, '')}`);
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined || valor === null || valor === '') continue;
    url.searchParams.set(chave, String(valor));
  }
  return url.toString();
}

async function requisitar<T>(
  metodo: 'GET' | 'POST',
  url: string,
  opcoes: { corpo?: unknown; comSessao?: boolean } = {},
): Promise<Resultado<T>> {
  const headers: Record<string, string> = {
    'Site-Key': import.meta.env.VITE_API_SITE_KEY ?? '',
    Accept: 'application/json',
  };

  const sessao = opcoes.comSessao === false ? null : lerSessao();
  if (sessao) headers.Passport = sessao;
  if (metodo === 'POST') headers['Content-Type'] = 'application/json';

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers,
      body: metodo === 'POST' ? JSON.stringify(opcoes.corpo ?? {}) : undefined,
      signal: AbortSignal.timeout(TEMPO_LIMITE),
    });

    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
      return { ok: false, data: null, status: resposta.status, erro: dados?.message ?? `HTTP ${resposta.status}`, codigo: dados?.erro, dados };
    }

    // Algumas rotas do app respondem 200 com `{ error: true, message }` — para
    // o site isso é falha do mesmo jeito (ex.: e-mail ou senha inválidos).
    if (dados && typeof dados === 'object' && !Array.isArray(dados) && dados.error === true) {
      return { ok: false, data: null, status: resposta.status, erro: dados.message ?? 'Não foi possível concluir.', codigo: dados.erro, dados };
    }

    return { ok: true, data: dados as T, status: resposta.status };
  } catch (erro) {
    const motivo = erro instanceof Error && erro.name === 'TimeoutError' ? 'tempo esgotado' : 'falha de rede';
    return { ok: false, data: null, status: 0, erro: motivo };
  }
}

export function apiGet<T>(caminho: string, query?: Query): Promise<Resultado<T>> {
  return requisitar<T>('GET', montarUrl(caminho, query));
}

export function apiPost<T>(caminho: string, corpo: unknown, opcoes?: { comSessao?: boolean }): Promise<Resultado<T>> {
  return requisitar<T>('POST', montarUrl(caminho), { corpo, comSessao: opcoes?.comSessao });
}

/**
 * Para usar com o TanStack Query: lança quando falha, porque é assim que ele
 * distingue "deu erro" de "veio vazio" e sabe quando tentar de novo.
 */
export async function buscar<T>(caminho: string, query?: Query): Promise<T> {
  const resposta = await apiGet<T>(caminho, query);
  if (!resposta.ok) throw new Error(resposta.erro);
  return resposta.data;
}
