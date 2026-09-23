import { buscar } from '@/lib/api';
import type { Geografia } from '@/lib/tipos';
import { slugify } from '@/lib/slug';

/**
 * Índice de destinos: transforma o slug da URL no id que a API entende.
 *
 * O visitante não sabe (nem precisa saber) se Capitólio é uma região ou uma
 * cidade no cadastro — ele digita "capitólio". Por isso os dois vivem no mesmo
 * espaço de nomes e `/cachoeiras/capitolio` resolve para o que fizer mais
 * sentido.
 *
 * Duas regras de desempate, medidas contra o catálogo real (193 regiões e 261
 * cidades, 173 delas com nome igual ao de uma região):
 *  1. Região vence cidade. As regiões do catálogo costumam ter o nome da cidade
 *     principal e agregam os arredores — que é o que o turista quer ver.
 *  2. Entre dois do mesmo tipo, vence o que tem mais atrativos.
 */

export interface Destino {
  tipo: 'regiao' | 'cidade';
  id: number;
  nome: string;
  slug: string;
  quantidade: number;
  /** Capa da região (a cidade herda a da região a que pertence). */
  foto: string | null;
  tituloturistico: string | null;
  /** Região a que a cidade pertence — ausente quando o destino já é a região. */
  regiao?: { id: number; nome: string; slug: string } | null;
  estado?: { id: number; nome: string } | null;
  /** Cidades da região, quando o destino é uma região. */
  cidades?: { id: number; nome: string; slug: string; quantidade: number }[];
}

export interface IndiceGeografia {
  /** slug → destino (região ou cidade), já com o desempate aplicado. */
  porSlug: Map<string, Destino>;
  /** Todas as regiões, da maior para a menor — usado em /destinos e no sitemap. */
  regioes: Destino[];
  /** Todas as cidades, para o sitemap e a busca por destino. */
  cidades: Destino[];
  estados: { id: number; nome: string; foto: string | null; regioes: Destino[] }[];
}

function montarIndice(geo: Geografia): IndiceGeografia {
  const porSlug = new Map<string, Destino>();
  const regioes: Destino[] = [];
  const cidades: Destino[] = [];
  const estados: IndiceGeografia['estados'] = [];

  /** Guarda o destino no índice respeitando as duas regras de desempate. */
  const registrar = (destino: Destino) => {
    const atual = porSlug.get(destino.slug);
    if (!atual) {
      porSlug.set(destino.slug, destino);
      return;
    }
    if (atual.tipo === destino.tipo) {
      if (destino.quantidade > atual.quantidade) porSlug.set(destino.slug, destino);
      return;
    }
    if (destino.tipo === 'regiao') porSlug.set(destino.slug, destino);
  };

  for (const estado of geo.estados ?? []) {
    const regioesDoEstado: Destino[] = [];

    for (const regiao of estado.regioes ?? []) {
      const slugRegiao = slugify(regiao.nome);

      const cidadesDaRegiao = (regiao.cidades ?? []).map((c) => ({
        id: c.idcidade,
        nome: c.nome,
        slug: slugify(c.nome),
        quantidade: c.quantidade,
      }));

      const destinoRegiao: Destino = {
        tipo: 'regiao',
        id: regiao.idregiao,
        nome: regiao.nome,
        slug: slugRegiao,
        quantidade: regiao.quantidade,
        foto: regiao.foto,
        tituloturistico: regiao.tituloturistico,
        estado: { id: estado.idestado, nome: estado.nome },
        cidades: cidadesDaRegiao,
      };

      regioes.push(destinoRegiao);
      regioesDoEstado.push(destinoRegiao);
      registrar(destinoRegiao);

      for (const cidade of regiao.cidades ?? []) {
        const destinoCidade: Destino = {
          tipo: 'cidade',
          id: cidade.idcidade,
          nome: cidade.nome,
          slug: slugify(cidade.nome),
          quantidade: cidade.quantidade,
          foto: regiao.foto,
          tituloturistico: regiao.tituloturistico,
          regiao: { id: regiao.idregiao, nome: regiao.nome, slug: slugRegiao },
          estado: { id: estado.idestado, nome: estado.nome },
        };
        cidades.push(destinoCidade);
        registrar(destinoCidade);
      }
    }

    estados.push({
      id: estado.idestado,
      nome: estado.nome,
      foto: estado.foto,
      regioes: regioesDoEstado.sort((a, b) => b.quantidade - a.quantidade),
    });
  }

  regioes.sort((a, b) => b.quantidade - a.quantidade);
  cidades.sort((a, b) => b.quantidade - a.quantidade);

  return { porSlug, regioes, cidades, estados };
}

/** Exposto para teste: monta o índice a partir de uma geografia qualquer. */
export const montarIndiceGeografia = montarIndice;

/**
 * A geografia inteira numa consulta só, guardada em memória enquanto a aba
 * estiver aberta. É ela que transforma o slug da URL no id que a API entende,
 * então toda navegação precisa dela — e ela muda no máximo algumas vezes por dia.
 */
let emMemoria: Promise<IndiceGeografia> | null = null;

export function indiceGeografia(): Promise<IndiceGeografia> {
  if (!emMemoria) {
    emMemoria = buscar<Geografia>('/site/geografia')
      .then(montarIndice)
      .catch((erro) => {
        // Não guarda o fracasso: a próxima navegação tenta de novo.
        emMemoria = null;
        throw erro;
      });
  }
  return emMemoria;
}

/** Destino de um slug de URL, ou `null` quando não existe. */
export async function resolverDestino(slug: string): Promise<Destino | null> {
  const indice = await indiceGeografia();
  return indice.porSlug.get(slug) ?? null;
}

/** Destino a partir de um id de cidade — usado nos 301 das URLs antigas. */
export async function destinoPorIdCidade(idcidade: number): Promise<Destino | null> {
  const indice = await indiceGeografia();
  return indice.cidades.find((c) => c.id === idcidade) ?? null;
}

/** Filtro da listagem de empresas para um destino. */
export function filtroDoDestino(destino: Destino): { regiao: number } | { cidade: number } {
  return destino.tipo === 'regiao' ? { regiao: destino.id } : { cidade: destino.id };
}
