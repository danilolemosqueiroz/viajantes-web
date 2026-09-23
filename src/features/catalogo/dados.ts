import { apiGet } from '@/lib/api';
import type { AtrativoProximo, Empresa, EmpresaResumo, Horario, Info } from '@/lib/tipos';
import type { Categoria } from '@/i18n/categorias';
import type { Destino } from '@/lib/geo/indice';
import { filtroDoDestino } from '@/lib/geo/indice';

/**
 * Leitura do catálogo de atrativos.
 *
 * Uma função por pergunta que uma página faz — "quais atrativos desta categoria
 * neste destino?", "qual é este atrativo?" — para as páginas ficarem só com a
 * montagem da tela.
 */

interface FiltroLista {
  categoria?: Categoria;
  destino?: Destino;
  /** Sem destino: `todasregioes=1` (tudo) ou a região do cookie. */
  regiao?: number;
  /** Só o estado, quando o filtro da categoria ainda não desceu à região. */
  estado?: number;
  busca?: string;
  limite?: number;
}

/**
 * Lista de atrativos. A API devolve a página 1 com até 100 itens, ordenada por
 * relevância dela; aqui a ordem final é alfabética, com quem tem o termo
 * buscado no nome primeiro — a mesma regra do site antigo.
 */
export async function listarEmpresas(filtro: FiltroLista): Promise<EmpresaResumo[]> {
  const query: Record<string, string | number> = {};

  // `turismo=1` só acompanha uma categoria: na API ele liga o filtro
  // `eavmoda = reservas`, e sem `reservas` isso vira `eavmoda = 0` — o guia
  // comercial, que não é o que a busca geral quer. A busca sem categoria vai
  // sem os dois e procura em todos os tipos, como no site antigo.
  if (filtro.categoria) {
    query.turismo = 1;
    query.reservas = filtro.categoria.eavmoda;
  }
  if (filtro.busca) query.busca = filtro.busca;

  if (filtro.destino) {
    Object.assign(query, filtroDoDestino(filtro.destino));
  } else if (filtro.regiao) {
    query.regiao = filtro.regiao;
  } else if (filtro.estado) {
    query.estado = filtro.estado;
  } else {
    query.todasregioes = 1;
  }

  const resposta = await apiGet<EmpresaResumo[]>('/site/empresas/1', query);

  if (!resposta.ok || !Array.isArray(resposta.data)) return [];

  const termo = (filtro.busca ?? '').toLowerCase();
  const lista = [...resposta.data].sort((a, b) => {
    if (termo) {
      const temA = (a.nome ?? '').toLowerCase().includes(termo) ? 0 : 1;
      const temB = (b.nome ?? '').toLowerCase().includes(termo) ? 0 : 1;
      if (temA !== temB) return temA - temB;
    }
    return (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR');
  });

  return filtro.limite ? lista.slice(0, filtro.limite) : lista;
}

/** Detalhe de um atrativo. `null` quando não existe ou saiu do ar. */
export async function buscarEmpresa(id: number): Promise<Empresa | null> {
  const resposta = await apiGet<Empresa>(`/site/empresa/${id}`);

  if (!resposta.ok || !resposta.data?.idempresa) return null;
  // `anunciante = 0` some da listagem; tem que sumir do detalhe também.
  if (resposta.data.anunciante === 0) return null;

  return resposta.data;
}

/** Capa do card, com a mesma imagem de reserva que o app usa. */
export function capaEmpresa(empresa: { capa?: string | null; logotipo?: string | null }): string | null {
  return empresa.capa || empresa.logotipo || null;
}

/**
 * O conteúdo do detalhe vem numa lista só (`infos`): texto, imagem ou vídeo,
 * conforme o campo preenchido — a mesma separação que o site antigo fazia.
 */
export function separarConteudo(infos: Info[] | null | undefined) {
  const textos: Info[] = [];
  const imagens: Info[] = [];
  const videos: Info[] = [];

  for (const info of infos ?? []) {
    if (info.video) videos.push(info);
    else if (info.arquivo) imagens.push(info);
    else if ((info.descricao ?? '').trim()) textos.push(info);
  }

  return { textos, imagens, videos };
}

/** Título de bloco sem o ":" que costuma vir digitado na gerência ("Informações: "). */
export function tituloInfo(titulo: string | null | undefined): string {
  return String(titulo ?? '')
    .replace(/[\s:：-]+$/u, '')
    .trim();
}

/**
 * URL de embed de um vídeo do YouTube. A API troca `watch?v=` por `/embed/` e
 * deixa uma barra dobrada; a gerência às vezes grava só o ID ou um youtu.be.
 */
export function urlEmbedVideo(video: string): string {
  const texto = video.trim();
  const id = texto.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,})/)?.[1];
  if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (/^https?:\/\//i.test(texto)) return texto;
  return `https://www.youtube-nocookie.com/embed/${texto}`;
}

/** Média das notas com uma casa decimal; 0 sem avaliações. */
export function mediaAvaliacoes(avaliacoes: { nota: number | string | null }[]): number {
  if (avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((total, a) => total + (Number(a.nota) || 0), 0);
  return Math.round((soma / avaliacoes.length) * 10) / 10;
}

/** Galeria = todas as fotos menos a capa (que a API põe como item 0). */
export function fotosDaGaleria(fotos: Empresa['fotos']): { id: number; url: string }[] {
  return (fotos ?? [])
    .filter((foto) => Number(foto.idempresafoto) > 0 && foto.arquivo)
    .map((foto) => ({ id: foto.idempresafoto, url: foto.arquivo }));
}

/** Abas dos atrativos próximos, na ordem do app; some a aba sem itens. */
export const ABAS_PROXIMOS = [
  { eavmoda: 3, rotulo: 'Cachoeiras' },
  { eavmoda: 4, rotulo: 'Restaurantes' },
  { eavmoda: 2, rotulo: 'Hospedagens' },
] as const;

export function abasProximos(proximos: AtrativoProximo[]) {
  return ABAS_PROXIMOS.map((aba) => ({
    ...aba,
    itens: proximos.filter((item) => Number(item.eavmoda) === aba.eavmoda),
  })).filter((aba) => aba.itens.length > 0);
}

export interface HorarioDeHoje {
  horario: Horario;
  /** `null` quando o valor não é uma faixa de horas ("Fechado" já se explica). */
  aberto: boolean | null;
}

/** O dia de hoje na tabela e se está aberto neste instante (faixa que vira a madrugada inclusive). */
export function horarioDeHoje(horarios: Horario[] | null | undefined, agora = new Date()): HorarioDeHoje | null {
  const hoje = (horarios ?? []).find((h) => Number(h.atual) === 1);
  if (!hoje) return null;

  const faixa = String(hoje.valor ?? '').match(/^(\d{2}:\d{2}) - (\d{2}:\d{2})$/);
  if (!faixa) return { horario: hoje, aberto: null };

  const [, inicio, fim] = faixa;
  const hhmm = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  const aberto = inicio <= fim ? hhmm >= inicio && hhmm <= fim : hhmm >= inicio || hhmm <= fim;
  return { horario: hoje, aberto };
}

/** Rota até o lugar: Apple Maps no iPhone/iPad, Google Maps no resto. */
export function linkComoChegar(
  empresa: { lat?: string | null; long?: string | null; endereco?: string | null },
  apple: boolean,
): string | null {
  const lat = String(empresa.lat ?? '').trim();
  const long = String(empresa.long ?? '').trim();
  if (lat && long) {
    return apple
      ? `https://maps.apple.com/?daddr=${lat},${long}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&travelmode=driving`;
  }
  const endereco = String(empresa.endereco ?? '').trim();
  if (endereco) {
    const q = encodeURIComponent(endereco);
    return apple ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  return null;
}

/** iPhone/iPad (o iPad novo se apresenta como Mac, mas tem toque). */
export function ehAparelhoApple(agente: string, temToque: boolean): boolean {
  return /iphone|ipad|ipod/i.test(agente) || (/macintosh/i.test(agente) && temToque);
}

/** Telefone brasileiro formatado, como no site antigo. */
export function formatarTelefone(numero: string | null | undefined): string {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return String(numero ?? '').trim();
}

/** Link do WhatsApp: a API manda a URL pronta; um número solto também serve. */
export function linkWhatsapp(valor: string | null | undefined): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) return null;
  if (/^https?:\/\//i.test(texto)) return texto;
  const digitos = texto.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  return `https://api.whatsapp.com/send?phone=55${digitos}`;
}

/** O número por extenso a partir do link (`phone=5537999090767` → "(37) 99909-0767"). */
export function numeroWhatsapp(link: string | null): string {
  const digitos = link?.match(/phone=(\d+)/)?.[1] ?? '';
  if (!digitos) return '';
  const nacional = digitos.startsWith('55') && digitos.length > 11 ? digitos.slice(2) : digitos;
  return formatarTelefone(nacional) || nacional;
}

/** Link externo garantido com protocolo ("pousada.com.br" → "https://pousada.com.br"). */
export function linkExterno(valor: string | null | undefined): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) return null;
  return /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;
}

/** Perfil de rede social: aceita URL completa ou só o @usuario. */
export function linkPerfil(valor: string | null | undefined, base: string): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) return null;
  if (/^https?:\/\//i.test(texto)) return texto;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(texto)) return `https://${texto}`;
  return `${base}/${texto.replace(/^@/, '')}`;
}

/** Tipo schema.org da empresa, pela categoria — o mesmo mapa do site antigo. */
export function tipoSchema(eavmoda: number | null | undefined): string {
  const tipos: Record<number, string> = {
    2: 'LodgingBusiness',
    3: 'TouristAttraction',
    4: 'Restaurant',
    5: 'Store',
    6: 'TouristAttraction',
    12: 'LodgingBusiness',
    13: 'Campground',
    15: 'Store',
    16: 'TouristAttraction',
  };
  return tipos[Number(eavmoda)] ?? 'LocalBusiness';
}
