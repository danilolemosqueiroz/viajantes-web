/** Slugs e a leitura do padrão `nome-id` das URLs. As duas funções são puras de propósito:
 * o roteamento depende delas e elas precisam ser testáveis sem rede. */

/** Transforma um nome em slug de URL: "São Roque de Minas" vira "sao-roque-de-minas".
 * Mesmo resultado do `slugify()` do site PHP, para as URLs antigas continuarem batendo. */
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

/** Lê um segmento de URL no formato `nome-do-lugar-1234`; `null` quando não termina em id.
 * É o que distingue o detalhe de um atrativo do destino (`/cachoeiras/capitolio`). */
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
