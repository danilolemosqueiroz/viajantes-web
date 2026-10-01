/** Cliente do Guia Viajantes (`viajantes-ia`), chamado direto do navegador, como a API Node.
 * Vai o mesmo `Passport` da sessão do site e o `Mpauth` do app, que não é segredo: quem protege
 * o serviço é a sessão mais a assinatura. Ver `viajantes-ia/docs/INTEGRACAO.md` §9. */
import type { Resultado } from './api';
import { lerSessao } from './sessao';

type Query = Record<string, string | number | undefined | null>;

const TEMPO_LIMITE = 15_000;

const base = (): string => (import.meta.env.VITE_IA_URL ?? '').replace(/\/$/, '');

/** Sem `VITE_IA_URL` no build, o guia nem aparece: é também o jeito de desligá-lo. */
export const guiaLigado = (): boolean => base() !== '';

function montarUrl(caminho: string, query?: Query): string {
  const url = new URL(`${base()}/${caminho.replace(/^\//, '')}`);
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined || valor === null || valor === '') continue;
    url.searchParams.set(chave, String(valor));
  }
  return url.toString();
}

function cabecalhos(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  const sessao = lerSessao();
  if (sessao) headers.Passport = sessao;
  const chave = import.meta.env.VITE_IA_APP_KEY;
  if (chave) headers.Mpauth = chave;
  return headers;
}

/** Erro no padrão do serviço (`{ erro, message }`), com o que vier junto (ex.: `renova_em`). */
function falha<T>(status: number, dados: Record<string, unknown> | null): Resultado<T> {
  return {
    ok: false,
    data: null,
    status,
    erro: typeof dados?.message === 'string' ? dados.message : `HTTP ${status}`,
    codigo: typeof dados?.erro === 'string' ? dados.erro : undefined,
    dados: dados ?? undefined,
  };
}

async function requisitar<T>(metodo: 'GET' | 'POST' | 'DELETE', caminho: string, corpo?: unknown, query?: Query): Promise<Resultado<T>> {
  try {
    const resposta = await fetch(montarUrl(caminho, query), {
      method: metodo,
      headers: cabecalhos(corpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE),
    });
    const texto = await resposta.text();
    let dados: unknown = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      // 404 de rota desconhecida e corpo grande demais não vêm no formato `{ erro, message }`.
    }
    if (!resposta.ok) return falha<T>(resposta.status, dados as Record<string, unknown> | null);
    return { ok: true, data: dados as T, status: resposta.status };
  } catch (erro) {
    const motivo = erro instanceof Error && erro.name === 'TimeoutError' ? 'tempo esgotado' : 'falha de rede';
    return { ok: false, data: null, status: 0, erro: motivo };
  }
}

export const guiaGet = <T>(caminho: string, query?: Query) => requisitar<T>('GET', caminho, undefined, query);
export const guiaPost = <T>(caminho: string, corpo: unknown = {}) => requisitar<T>('POST', caminho, corpo);
export const guiaDelete = (caminho: string) => requisitar<null>('DELETE', caminho);

export interface EventoBruto {
  evento: string;
  dados: unknown;
}

/** Leitor de SSE incremental: recebe pedaços do corpo em qualquer ponto de corte e devolve os
 * eventos completos. Comentários (`: ok`, `: ping`) são descartados. */
export function criarLeitorSse(aoEvento: (e: EventoBruto) => void) {
  let resto = '';
  return (pedaco: string) => {
    resto += pedaco.replace(/\r\n/g, '\n');
    let fim: number;
    while ((fim = resto.indexOf('\n\n')) >= 0) {
      const bloco = resto.slice(0, fim);
      resto = resto.slice(fim + 2);
      let evento = 'message';
      const linhas: string[] = [];
      for (const linha of bloco.split('\n')) {
        if (linha.startsWith(':')) continue;
        if (linha.startsWith('event:')) evento = linha.slice(6).trim();
        else if (linha.startsWith('data:')) linhas.push(linha.slice(5).replace(/^ /, ''));
      }
      if (!linhas.length) continue;
      try {
        aoEvento({ evento, dados: JSON.parse(linhas.join('\n')) });
      } catch {
        /* evento corrompido: ignora, o `final` traz o estado completo */
      }
    }
  };
}

/** Envia a mensagem e repassa os eventos do stream. Resolve quando o stream termina.
 * Recusa antes do stream (401, 402, 409, 429 no pré-voo) volta como `Resultado` com falha;
 * depois do stream aberto, erros de negócio chegam como `event: erro`, com HTTP 200. */
export async function enviarMensagem(
  conversaId: string,
  texto: string,
  { aoEvento, sinal }: { aoEvento: (e: EventoBruto) => void; sinal: AbortSignal },
): Promise<Resultado<null>> {
  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(`/v1/conversas/${encodeURIComponent(conversaId)}/mensagens`), {
      method: 'POST',
      headers: cabecalhos({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
      body: JSON.stringify({ texto }),
      signal: sinal,
    });
  } catch (erro) {
    if (sinal.aborted) return { ok: true, data: null, status: 0 };
    return { ok: false, data: null, status: 0, erro: erro instanceof Error ? erro.message : 'falha de rede' };
  }

  if (!resposta.ok || !resposta.body) {
    const dados = await resposta.json().catch(() => null);
    return falha(resposta.status, dados);
  }

  const alimentar = criarLeitorSse(aoEvento);
  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder();
  try {
    for (;;) {
      const { value, done } = await leitor.read();
      if (done) break;
      alimentar(decodificador.decode(value, { stream: true }));
    }
    alimentar(decodificador.decode() + '\n\n');
  } catch (erro) {
    if (!sinal.aborted) return { ok: false, data: null, status: 0, erro: erro instanceof Error ? erro.message : 'falha de rede' };
  }
  return { ok: true, data: null, status: resposta.status };
}
