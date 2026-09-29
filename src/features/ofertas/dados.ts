/** Central de Ofertas Viajantes, a fonte do "Viajantes Recomenda". É um projeto separado, com
 * endpoints públicos, e por isso não usa `lib/api.ts`. Contrato em `docs/ofertas.md`. */

export interface Oferta {
  id: string;
  /** `fixa` = cupom/desconto de patrocinador, sem preço (a Central manda `price: 0`). */
  type: 'produto' | 'passagem' | 'fixa';
  category: string | null;
  title: string;
  description: string | null;
  image: string | null;
  provider: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  /** Vem no JSON só por transparência. Nunca linkar direto (ver `linkClique`). */
  affiliate_url: string;
  destination: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  coupon: string | null;
  featured: boolean;
}

export interface CategoriaOferta {
  value: string;
  label: string;
  /** `false` = a Central ainda não tem oferta própria aqui (vira "Em breve"). */
  own_data: boolean;
}

interface Resposta<T> {
  error?: boolean;
  message?: string;
  data?: T;
}

/** Quantas ofertas por página. É o mesmo número que o site em PHP usava. */
export const POR_PAGINA = 12;

/** Canal registrado em cada clique. Continua `viajantes-site` para não partir em duas
 * a série de cliques que a Central já vinha medindo. */
const CANAL = 'viajantes-site';

const API = (import.meta.env.VITE_OFERTAS_API_URL ?? 'https://ofertas-indol.vercel.app/api').replace(/\/$/, '');

/** A origem da Central (sem o `/api`). É de lá que sai a rota `/go/{id}`. */
const ORIGEM = API.replace(/\/api$/, '');

const TEMPO_LIMITE = 15_000;

async function pegar<T>(caminho: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API}${caminho}`);
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined || valor === '') continue;
    url.searchParams.set(chave, String(valor));
  }

  const resposta = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TEMPO_LIMITE),
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

  const json = (await resposta.json()) as Resposta<T>;
  if (json.error) throw new Error(json.message ?? 'Central de Ofertas indisponível');
  return json.data as T;
}

/** Uma página de ofertas. `categoria: 'todos'` (ou vazio) não filtra. */
export function listarOfertas(filtro: {
  categoria?: string;
  busca?: string;
  pagina?: number;
}): Promise<Oferta[]> {
  return pegar<Oferta[]>('/offers', {
    category: filtro.categoria && filtro.categoria !== 'todos' ? filtro.categoria : undefined,
    q: filtro.busca || undefined,
    limit: POR_PAGINA,
    page: filtro.pagina ?? 1,
  }).then((lista) => (Array.isArray(lista) ? lista : []));
}

/** As únicas categorias que o site mostra, por decisão do cliente (22/09/2026).
 * A Central tem outras; 'Todos' continua trazendo as ofertas de todas elas. */
export const CATEGORIAS_VISIVEIS = ['todos', 'hospedagens', 'camping', 'pet'];

/** Só as visíveis, na ordem acima. O rótulo ainda é o da Central. */
export function listarCategorias(): Promise<CategoriaOferta[]> {
  return pegar<CategoriaOferta[]>('/categories').then((lista) =>
    Array.isArray(lista)
      ? CATEGORIAS_VISIVEIS.map((v) => lista.find((c) => c?.value === v)).filter(
          (c): c is CategoriaOferta => Boolean(c),
        )
      : [],
  );
}

/** O endereço de um clique: sempre o `/go/{id}` da Central, que registra o clique e redireciona.
 * Usar o `affiliate_url` direto não conta o clique, e a parceria depende dessa contagem. */
export function linkClique(id: string, categoria: string | null): string {
  const parametros = new URLSearchParams({
    canal: CANAL,
    utm_source: CANAL,
    utm_medium: 'organic',
    utm_campaign: 'viajantes_recomenda',
    utm_content: categoria || 'outros',
  });
  return `${ORIGEM}/go/${encodeURIComponent(id)}?${parametros.toString()}`;
}

/** A Central manda `price: 0` nas ofertas fixas (cupom): 0 é ausência de preço, não "R$ 0,00". */
export function temPreco<T extends Pick<Oferta, 'price'>>(oferta: T): oferta is T & { price: number } {
  return typeof oferta.price === 'number' && Number.isFinite(oferta.price) && oferta.price > 0;
}

/** O texto do botão. Quem tem cupom pega cupom; hospedagem se reserva; passagem se compra.
 * Chaves em português, traduzidas na tela como o resto do site. */
export function rotuloCta(categoria: string | null, cupom: string | null): string {
  if (cupom) return 'Pegar cupom';
  if (categoria === 'hospedagens') return 'Reservar';
  if (categoria === 'passagens') return 'Ver passagens';
  return 'Ver oferta';
}

/** Preço em real nos cinco idiomas. O formatador fica em lib/moeda. */
export { formatarPreco } from '@/lib/moeda';
