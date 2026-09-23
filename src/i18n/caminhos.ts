import { IDIOMAS, IDIOMA_PADRAO, slugCategoria, type Categoria, type Idioma } from './categorias';
import { slugComId } from '@/lib/slug';

/**
 * Endereços do site, nos cinco idiomas.
 *
 * Português fica na raiz (`/cachoeiras`); os outros usam prefixo e caminho
 * traduzido (`/en/waterfalls`) — quem busca em inglês procura "waterfalls",
 * não "cachoeiras". É o mesmo esquema do site em Next, mantido para as URLs
 * que o Google já conhece continuarem valendo.
 *
 * As páginas de CATEGORIA não entram na tabela: o slug muda por idioma e por
 * categoria, e sai de `slugCategoria()`.
 */
export const CAMINHOS_FIXOS = {
  '/': { pt: '/', en: '/', es: '/', fr: '/', de: '/' },
  '/destinos': {
    pt: '/destinos',
    en: '/destinations',
    es: '/destinos',
    fr: '/destinations',
    de: '/reiseziele',
  },
  '/roteiros': {
    pt: '/roteiros',
    en: '/itineraries',
    es: '/itinerarios',
    fr: '/itineraires',
    de: '/reiserouten',
  },
  '/busca': { pt: '/busca', en: '/search', es: '/busqueda', fr: '/recherche', de: '/suche' },
  '/ofertas': {
    pt: '/ofertas',
    en: '/deals',
    es: '/ofertas',
    fr: '/bons-plans',
    de: '/angebote',
  },
  '/mapeadores': {
    pt: '/mapeadores',
    en: '/mappers',
    es: '/mapeadores',
    fr: '/cartographes',
    de: '/kartierer',
  },
  '/sobre': { pt: '/sobre', en: '/about', es: '/sobre', fr: '/a-propos', de: '/ueber-uns' },
  '/contato': { pt: '/contato', en: '/contact', es: '/contacto', fr: '/contact', de: '/kontakt' },
  '/termos': { pt: '/termos', en: '/terms', es: '/terminos', fr: '/conditions', de: '/agb' },
  '/privacidade': {
    pt: '/privacidade',
    en: '/privacy',
    es: '/privacidad',
    fr: '/confidentialite',
    de: '/datenschutz',
  },
  '/entrar': { pt: '/entrar', en: '/sign-in', es: '/entrar', fr: '/connexion', de: '/anmelden' },
  '/criar-conta': {
    pt: '/criar-conta',
    en: '/sign-up',
    es: '/crear-cuenta',
    fr: '/creer-compte',
    de: '/registrieren',
  },
  '/recuperar-senha': {
    pt: '/recuperar-senha',
    en: '/forgot-password',
    es: '/recuperar-clave',
    fr: '/mot-de-passe-oublie',
    de: '/passwort-vergessen',
  },
  '/conta': { pt: '/conta', en: '/account', es: '/cuenta', fr: '/compte', de: '/konto' },
  '/conta/favoritos': {
    pt: '/conta/favoritos',
    en: '/account/favorites',
    es: '/cuenta/favoritos',
    fr: '/compte/favoris',
    de: '/konto/favoriten',
  },
  '/conta/meus-dados': {
    pt: '/conta/meus-dados',
    en: '/account/my-details',
    es: '/cuenta/mis-datos',
    fr: '/compte/mes-donnees',
    de: '/konto/meine-daten',
  },
  '/conta/roteiros': {
    pt: '/conta/roteiros',
    en: '/account/itineraries',
    es: '/cuenta/itinerarios',
    fr: '/compte/itineraires',
    de: '/konto/reiserouten',
  },
} as const;

export type RotaFixa = keyof typeof CAMINHOS_FIXOS;

/** Prefixo do idioma: vazio em português, `/en` nos demais. */
export function raiz(idioma: Idioma): string {
  return idioma === IDIOMA_PADRAO ? '' : `/${idioma}`;
}

/** Endereço de uma rota fixa no idioma pedido. `/roteiros` → `/en/itineraries`. */
export function href(rota: RotaFixa, idioma: Idioma): string {
  const caminho = CAMINHOS_FIXOS[rota][idioma];
  if (rota === '/') return raiz(idioma) || '/';
  return `${raiz(idioma)}${caminho}`;
}

/** A MESMA rota fixa nos cinco idiomas (para o seletor e o hreflang). */
export function hrefPorIdioma(rota: RotaFixa): Record<Idioma, string> {
  return Object.fromEntries(IDIOMAS.map((idioma) => [idioma, href(rota, idioma)])) as Record<Idioma, string>;
}

/** Hub da categoria: `/cachoeiras` · `/en/waterfalls`. */
export function hrefCategoria(categoria: Categoria | string, idioma: Idioma): string {
  const id = typeof categoria === 'string' ? categoria : categoria.id;
  return `${raiz(idioma)}/${slugCategoria(id, idioma) ?? id}`;
}

/** Categoria dentro de um destino: `/cachoeiras/capitolio`. */
export function hrefDestino(categoria: Categoria | string, slugDestino: string, idioma: Idioma): string {
  return `${hrefCategoria(categoria, idioma)}/${slugDestino}`;
}

/** Detalhe de um atrativo: `/cachoeiras/cachoeira-do-cristal-1234`. */
export function hrefEmpresa(
  empresa: { idempresa: number; nome: string },
  categoria: Categoria | string,
  idioma: Idioma,
): string {
  return `${hrefCategoria(categoria, idioma)}/${slugComId(empresa.nome, empresa.idempresa)}`;
}

/** A MESMA página de categoria nos cinco idiomas (hreflang). */
export function categoriaPorIdioma(categoria: Categoria | string): Record<Idioma, string> {
  return Object.fromEntries(IDIOMAS.map((i) => [i, hrefCategoria(categoria, i)])) as Record<Idioma, string>;
}

/** O mesmo destino dentro de uma categoria, nos cinco idiomas. */
export function destinoPorIdioma(categoria: Categoria | string, slug: string): Record<Idioma, string> {
  return Object.fromEntries(IDIOMAS.map((i) => [i, hrefDestino(categoria, slug, i)])) as Record<Idioma, string>;
}

/** Página de um destino (sem categoria): `/destinos/capitolio`. */
export function hrefPaginaDestino(slug: string, idioma: Idioma): string {
  return `${href('/destinos', idioma)}/${slug}`;
}

/** A mesma página de destino nos cinco idiomas. */
export function paginaDestinoPorIdioma(slug: string): Record<Idioma, string> {
  return Object.fromEntries(IDIOMAS.map((i) => [i, hrefPaginaDestino(slug, i)])) as Record<Idioma, string>;
}

/** Detalhe de um roteiro: `/roteiros/nome-12`. */
export function hrefRoteiro(slug: string, idioma: Idioma): string {
  return `${href('/roteiros', idioma)}/${slug}`;
}

/**
 * Descobre o idioma pelo primeiro segmento do endereço.
 * `/en/waterfalls` → `en`; `/cachoeiras` → `pt`.
 */
export function idiomaDoCaminho(caminho: string): Idioma {
  const primeiro = caminho.split('/').filter(Boolean)[0];
  return IDIOMAS.includes(primeiro as Idioma) ? (primeiro as Idioma) : IDIOMA_PADRAO;
}
