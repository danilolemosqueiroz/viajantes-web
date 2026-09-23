/**
 * Categorias do catálogo — a tabela que liga o `eavmoda` da API ao slug da URL
 * em cada idioma.
 *
 * O slug é o que a pessoa busca ("cachoeiras em capitólio"), então ele muda de
 * idioma junto com o resto do site: `/cachoeiras/capitolio` e
 * `/en/waterfalls/capitolio` são a mesma página em duas línguas.
 *
 * `eavmoda` é o mesmo código que o app usa nos parâmetros de navegação e que a
 * API recebe como `reservas` na listagem de empresas.
 */

export const IDIOMAS = ['pt', 'en', 'es', 'fr', 'de'] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_PADRAO: Idioma = 'pt';

/** Rótulo de cada idioma no seletor do cabeçalho (mesma lista do app). */
export const IDIOMAS_INFO: Record<Idioma, { nome: string; nomeNativo: string; bandeira: string }> = {
  pt: { nome: 'Português', nomeNativo: 'Português (Brasil)', bandeira: '🇧🇷' },
  en: { nome: 'Inglês', nomeNativo: 'English', bandeira: '🇺🇸' },
  es: { nome: 'Espanhol', nomeNativo: 'Español', bandeira: '🇪🇸' },
  fr: { nome: 'Francês', nomeNativo: 'Français', bandeira: '🇫🇷' },
  de: { nome: 'Alemão', nomeNativo: 'Deutsch', bandeira: '🇩🇪' },
};

/** Layout do card na listagem — os três que o app usa. */
export type LayoutLista = 'capa' | 'compacto' | 'detalhado';

export interface Categoria {
  /** Chave interna, estável, independente de idioma. */
  id: string;
  /** Código da categoria na API (`reservas` na listagem, `eavmoda` no detalhe). */
  eavmoda: number;
  /** Slug da URL por idioma. */
  slugs: Record<Idioma, string>;
  /** Nome completo, usado em títulos de página e metadados. */
  titulo: string;
  /** Nome curto, para o menu e os círculos da home (uma palavra sempre que possível). */
  tituloCurto: string;
  /** Frase de apoio nas metas e no cabeçalho da listagem. */
  descricao: string;
  layout: LayoutLista;
  /** Nome do ícone em `components/layout/IconesCategoria.tsx`. */
  icone: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    id: 'cachoeiras',
    eavmoda: 3,
    slugs: { pt: 'cachoeiras', en: 'waterfalls', es: 'cascadas', fr: 'cascades', de: 'wasserfaelle' },
    titulo: 'Cachoeiras e pontos turísticos',
    tituloCurto: 'Cachoeiras',
    descricao:
      'Cachoeiras, mirantes e pontos turísticos com rota traçada, dificuldade e o que esperar de cada trilha.',
    layout: 'capa',
    icone: 'Cachoeira',
  },
  {
    id: 'pousadas',
    eavmoda: 2,
    slugs: { pt: 'pousadas', en: 'lodging', es: 'alojamientos', fr: 'hebergements', de: 'unterkuenfte' },
    titulo: 'Pousadas e hospedagens',
    tituloCurto: 'Hospedagens',
    descricao: 'Pousadas, chalés e casas para ficar perto dos atrativos, com contato direto do anfitrião.',
    layout: 'detalhado',
    icone: 'BedDouble',
  },
  {
    id: 'passeios',
    eavmoda: 6,
    slugs: { pt: 'passeios', en: 'tours', es: 'excursiones', fr: 'excursions', de: 'touren' },
    titulo: 'Guias e passeios',
    tituloCurto: 'Passeios',
    descricao: 'Guias credenciados e passeios para conhecer a região com quem vive nela.',
    layout: 'detalhado',
    icone: 'Signpost',
  },
  {
    id: 'restaurantes',
    eavmoda: 4,
    slugs: { pt: 'restaurantes', en: 'restaurants', es: 'restaurantes', fr: 'restaurants', de: 'restaurants' },
    titulo: 'Restaurantes',
    tituloCurto: 'Restaurantes',
    descricao: 'Onde comer na região: comida mineira, fogão a lenha e cozinha de estrada.',
    layout: 'detalhado',
    icone: 'UtensilsCrossed',
  },
  {
    id: 'campings',
    eavmoda: 13,
    slugs: { pt: 'campings', en: 'campsites', es: 'campings', fr: 'campings', de: 'campingplaetze' },
    titulo: 'Camping',
    tituloCurto: 'Camping',
    descricao: 'Campings e áreas de barraca para dormir perto da natureza.',
    layout: 'detalhado',
    icone: 'Tent',
  },
  {
    id: 'queijarias',
    eavmoda: 5,
    slugs: { pt: 'queijarias', en: 'cheese-farms', es: 'queserias', fr: 'fromageries', de: 'kaesereien' },
    titulo: 'Queijarias e empórios',
    tituloCurto: 'Queijarias e Empórios',
    descricao: 'Queijarias com visita e degustação, e produtores de doces e cachaça da região.',
    layout: 'detalhado',
    icone: 'Milk',
  },
  {
    id: 'artesanato',
    eavmoda: 15,
    slugs: { pt: 'artesanato', en: 'crafts', es: 'artesania', fr: 'artisanat', de: 'kunsthandwerk' },
    titulo: 'Artesanato e doces',
    tituloCurto: 'Artesanato',
    descricao: 'Artesãos, ateliês e doces feitos na região para levar de lembrança.',
    layout: 'detalhado',
    icone: 'Palette',
  },
  {
    id: 'museus-e-igrejas',
    eavmoda: 16,
    slugs: {
      pt: 'museus-e-igrejas',
      en: 'museums-churches',
      es: 'museos-iglesias',
      fr: 'musees-eglises',
      de: 'museen-kirchen',
    },
    titulo: 'Museus e igrejas',
    tituloCurto: 'Museus e igrejas',
    descricao: 'Museus, igrejas e patrimônio histórico para conhecer a história do lugar.',
    layout: 'detalhado',
    icone: 'Church',
  },
  {
    id: 'ranchos',
    eavmoda: 12,
    slugs: { pt: 'ranchos', en: 'ranches', es: 'ranchos', fr: 'ranchs', de: 'ranches' },
    titulo: 'Ranchos e chácaras',
    tituloCurto: 'Ranchos',
    descricao: 'Ranchos e chácaras para alugar, com espaço para a família toda.',
    layout: 'detalhado',
    icone: 'Home',
  },
];

const PORTIPO = new Map(CATEGORIAS.map((c) => [c.id, c]));

/** Categoria pela chave interna. */
export function categoriaPorId(id: string): Categoria | null {
  return PORTIPO.get(id) ?? null;
}

/** Categoria pelo código da API — é assim que o detalhe descobre a própria URL. */
export function categoriaPorEavmoda(eavmoda: number | null | undefined): Categoria | null {
  if (!eavmoda) return null;
  return CATEGORIAS.find((c) => c.eavmoda === Number(eavmoda)) ?? null;
}

/** Categoria a partir do slug que veio na URL, no idioma daquela URL. */
export function categoriaPorSlug(slug: string, idioma: Idioma): Categoria | null {
  return CATEGORIAS.find((c) => c.slugs[idioma] === slug) ?? null;
}

/** Slug da categoria no idioma pedido. */
export function slugCategoria(id: string, idioma: Idioma): string | null {
  return PORTIPO.get(id)?.slugs[idioma] ?? null;
}

/**
 * Slugs de rota que não são categoria (para o roteador saber que
 * `/roteiros` não é uma categoria de atrativo).
 */
export const SLUGS_RESERVADOS: Record<Idioma, Record<string, string>> = {
  pt: { roteiros: 'roteiros', destinos: 'destinos', busca: 'busca', conta: 'conta', mapeadores: 'mapeadores' },
  en: { roteiros: 'itineraries', destinos: 'destinations', busca: 'search', conta: 'account', mapeadores: 'mappers' },
  es: { roteiros: 'itinerarios', destinos: 'destinos', busca: 'busqueda', conta: 'cuenta', mapeadores: 'mapeadores' },
  fr: {
    roteiros: 'itineraires',
    destinos: 'destinations',
    busca: 'recherche',
    conta: 'compte',
    mapeadores: 'cartographes',
  },
  de: { roteiros: 'reiserouten', destinos: 'reiseziele', busca: 'suche', conta: 'konto', mapeadores: 'kartierer' },
};
