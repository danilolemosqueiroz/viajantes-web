/**
 * Slugs e a leitura do padrão `nome-id` das URLs.
 *
 * Estas duas funções são puras de propósito: são o coração do roteamento do
 * site (decidem se `/cachoeiras/capitolio` é um destino ou um atrativo) e
 * precisam ser testáveis sem rede.
 */

/**
 * Transforma um nome em slug de URL: "São Roque de Minas" → "sao-roque-de-minas".
 *
 * Mesmo resultado do `slugify()` do site PHP, para que as URLs que o Google já
 * conhece continuem batendo depois do redirecionamento.
 */
export function slugify(texto: string | null | undefined): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ºª°]/g, 'o')
    .replace(/[’'`´]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Lê um segmento de URL no formato `nome-do-lugar-1234`.
 *
 * É o que distingue, num segmento só, o DETALHE de um atrativo
 * (`/cachoeiras/cachoeira-do-cristal-1234`) do DESTINO
 * (`/cachoeiras/capitolio`). Nenhum nome de região ou cidade do catálogo
 * termina em "-número" — isso é verificado em teste contra a geografia real —,
 * então a regra não tem falso positivo.
 *
 * Devolve `null` quando o segmento não termina em id.
 */
export function lerSlugComId(segmento: string): { slug: string; id: number } | null {
  const casou = /^(.*[^-])-(\d+)$/.exec(segmento ?? '');
  if (!casou) return null;

  const id = Number(casou[2]);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  return { slug: casou[1], id };
}

/** Monta o segmento `nome-id` de um item. */
export function slugComId(nome: string | null | undefined, id: number): string {
  const base = slugify(nome);
  return base ? `${base}-${id}` : String(id);
}
