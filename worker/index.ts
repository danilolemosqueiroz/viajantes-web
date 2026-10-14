/**
 * Porta da frente do viajantesapp.com.br na Cloudflare.
 *
 * O site React sai dos arquivos de dist/ (sem passar por aqui). Este código só
 * roda nos caminhos de `run_worker_first` (wrangler.jsonc): as páginas PHP que
 * continuam na KingHost. Para quem acessa, o endereço não muda.
 */
interface Env {
  /** Arquivos de dist/ (binding de assets do wrangler.jsonc). */
  ASSETS: { fetch(request: Request): Promise<Response> };
  ORIGEM: string;
}

/** Pastas renomeadas: o 301 que o .htaccess fazia (app publicado e e-mails antigos). */
const RENOMEADAS: Array<[RegExp, string]> = [
  [/^\/seja-parceiro(\/.*)?$/, '/seja-cliente'],
  [/^\/parceiros(\/.*)?$/, '/painel-cliente'],
];

/** O que continua morando na KingHost. */
const NA_ORIGEM = [/^\/seja-cliente(\/|$)/, /^\/painel-cliente(\/|$)/, /^\/download(\/|$)/, /^\/descontos(\/|$)/, /\.php$/];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    for (const [de, para] of RENOMEADAS) {
      const m = url.pathname.match(de);
      if (m) return Response.redirect(`${url.origin}${para}${m[1] ?? ''}${url.search}`, 301);
    }

    if (NA_ORIGEM.some((re) => re.test(url.pathname))) {
      return buscarNaOrigem(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function buscarNaOrigem(request: Request, url: URL, env: Env): Promise<Response> {
  const origem = new URL(env.ORIGEM);
  const destino = new URL(url.pathname + url.search, origem);

  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');

  const resposta = await fetch(destino, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual', // o navegador segue os redirects do PHP (login, etc.)
  });

  // Redirect do PHP apontando para o hostname de origem volta para o domínio público.
  const local = resposta.headers.get('Location');
  if (local && local.includes(origem.host)) {
    const h = new Headers(resposta.headers);
    h.set('Location', local.replace(`${origem.protocol}//${origem.host}`, url.origin));
    return new Response(resposta.body, { status: resposta.status, headers: h });
  }
  return resposta;
}
