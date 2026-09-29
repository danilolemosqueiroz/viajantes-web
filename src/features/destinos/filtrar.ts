import { slugify } from '@/lib/slug';
import type { IndiceGeografia } from '@/lib/geo/indice';

/** Regras do filtro da página Destinos, sem React, para poder ser testado. A busca é sobre o slug
 * (sem acento) e acha a região também pelo nome de uma cidade dela. */

export interface EstadoFiltravel {
  id: number;
  nome: string;
  regioes: {
    id: number;
    nome: string;
    slug: string;
    quantidade: number;
    foto: string | null;
    /** Slugs da região e das cidades dela, para a busca por texto. */
    busca: string;
  }[];
}

/** Achata o índice de geografia no mínimo que a página precisa. */
export function prepararEstados(geografia: IndiceGeografia): EstadoFiltravel[] {
  return geografia.estados.map((estado) => ({
    id: estado.id,
    nome: estado.nome,
    regioes: estado.regioes.map((regiao) => ({
      id: regiao.id,
      nome: regiao.nome,
      slug: regiao.slug,
      quantidade: regiao.quantidade,
      foto: regiao.foto,
      busca: [regiao.slug, ...(regiao.cidades ?? []).map((c) => c.slug)].join(' '),
    })),
  }));
}

export interface Filtro {
  /** O que a pessoa digitou. */
  texto: string;
  /** Id do estado, ou `null` para todos. */
  estadoId: number | null;
}

/** Aplica o filtro. Estado sem nenhuma região correspondente sai da lista. */
export function filtrarEstados(estados: EstadoFiltravel[], filtro: Filtro): EstadoFiltravel[] {
  const termo = slugify(filtro.texto.trim());

  return estados
    .filter((estado) => filtro.estadoId === null || estado.id === filtro.estadoId)
    .map((estado) => ({
      ...estado,
      regioes: termo ? estado.regioes.filter((regiao) => regiao.busca.includes(termo)) : estado.regioes,
    }))
    .filter((estado) => estado.regioes.length > 0);
}

/** Quantas regiões o filtro deixou passar. */
export function contarRegioes(estados: EstadoFiltravel[]): number {
  return estados.reduce((total, estado) => total + estado.regioes.length, 0);
}
