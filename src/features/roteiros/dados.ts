import { apiGet, apiPost, type Resultado } from '@/lib/api';
import type { AssinaturaSite, CompraFeita, CompraPlano, Periodicidade, PlanoSite, Roteiro, RoteiroItem, StatusCompra } from '@/lib/tipos';
import { slugComId } from '@/lib/slug';

/**
 * Roteiros prontos — os mesmos da aba "Roteiros" do aplicativo
 * (`roteiro_personalizado`). Não confundir com os "roteiros personalizados"
 * (a consultoria por WhatsApp) nem com os roteiros mapeados por usuários.
 */

/** Caminho do detalhe: /roteiros/{titulo}-{id}. */
export function caminhoRoteiro(roteiro: Pick<Roteiro, 'idroteiro_personalizado' | 'titulo'>): string {
  return slugComId(roteiro.titulo, roteiro.idroteiro_personalizado);
}

/**
 * Todos os roteiros ativos, ou só os de uma região.
 *
 * A API embaralha a ordem de propósito (o app quer variedade a cada abertura);
 * o site fixa em destaque primeiro e depois alfabética — quem volta encontra a
 * mesma lista, e o robô vê uma ordem estável.
 */
export async function listarRoteiros(idRegiao?: number): Promise<Roteiro[]> {
  const resposta = await apiGet<Roteiro[]>('/site/roteiros', idRegiao ? { regiao_id: idRegiao } : undefined);

  if (!resposta.ok || !Array.isArray(resposta.data)) return [];

  return resposta.data
    .filter((r) => r?.idroteiro_personalizado && r?.titulo)
    .sort((a, b) => {
      const porDestaque = Number(b.destaque ?? 0) - Number(a.destaque ?? 0);
      return porDestaque !== 0 ? porDestaque : a.titulo.localeCompare(b.titulo, 'pt-BR');
    });
}

export async function buscarRoteiro(id: number): Promise<Roteiro | null> {
  const resposta = await apiGet<Roteiro>(`/site/roteiros/${id}`);
  if (!resposta.ok || !resposta.data?.idroteiro_personalizado) return null;
  if (Number(resposta.data.ativo) !== 1) return null;
  return resposta.data;
}

export async function listarItensRoteiro(id: number): Promise<RoteiroItem[]> {
  const resposta = await apiGet<RoteiroItem[]>(`/site/roteiros/${id}/itens`);
  return resposta.ok && Array.isArray(resposta.data) ? resposta.data : [];
}

/**
 * O Plano Viajantes: os planos à venda e a assinatura da conta (loja ou site).
 * Sem a rota (API antiga) ou fora do ar, lança — a tela mostra "tentar de novo".
 */
export async function buscarAssinatura(): Promise<AssinaturaSite> {
  const resposta = await apiGet<AssinaturaSite>('/site/assinatura');
  if (!resposta.ok || !Array.isArray(resposta.data?.planos)) throw new Error(resposta.ok ? 'resposta inválida' : resposta.erro);
  return resposta.data;
}

export interface PedidoCompra {
  plano_id: number;
  metodo: 'credit_card' | 'pix';
  card_token?: string;
  parcelas?: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  billing_address?: { line_1: string; line_2?: string; zip_code: string; city: string; state: string };
}

export function comprarPlano(pedido: PedidoCompra): Promise<Resultado<CompraPlano>> {
  return apiPost<CompraPlano>('/site/assinatura/compra', pedido);
}

export async function statusCompra(idcompra: number): Promise<StatusCompra | null> {
  const resposta = await apiGet<StatusCompra>(`/site/assinatura/compras/${idcompra}`);
  return resposta.ok && resposta.data?.idcompra ? resposta.data : null;
}

export async function listarCompras(): Promise<CompraFeita[]> {
  const resposta = await apiGet<CompraFeita[]>('/site/assinatura/compras');
  return resposta.ok && Array.isArray(resposta.data) ? resposta.data : [];
}

/** Chave de tradução: "por mês" / "por ano". */
export function rotuloPeriodo(periodicidade: Periodicidade): string {
  return periodicidade === 'anual' ? 'por ano' : 'por mês';
}

/** Quanto o anual economiza frente a 12 meses do mensal, em % inteiro; 0 se não dá para comparar. */
export function economiaAnual(planos: PlanoSite[]): number {
  const mensal = planos.find((p) => p.periodicidade === 'mensal');
  const anual = planos.find((p) => p.periodicidade === 'anual');
  if (!mensal || !anual || mensal.valor <= 0) return 0;
  const cheio = mensal.valor * 12;
  return cheio > anual.valor ? Math.round(((cheio - anual.valor) / cheio) * 100) : 0;
}

/** Itens por dia, na ordem da API (dia, horário, ordem). */
export function agruparPorDia(itens: RoteiroItem[]): { dia: number; itens: RoteiroItem[] }[] {
  const mapa = new Map<number, RoteiroItem[]>();
  for (const item of itens) {
    const dia = Math.max(1, Number(item.dia ?? 1) || 1);
    mapa.set(dia, [...(mapa.get(dia) ?? []), item]);
  }
  return [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([dia, doDia]) => ({ dia, itens: doDia }));
}

/** Conta uma visualização (o mesmo contador que o app mostra). */
export async function registrarVisualizacao(id: number): Promise<void> {
  await apiPost(`/site/roteiros/${id}/visualizacao`, {});
}

/**
 * Regiões que o roteiro cruza, sem repetição.
 *
 * A LISTA manda `regioes`; o DETALHE manda só `cidades`, cada uma com a região
 * a que pertence — por isso as duas origens.
 */
export function regioesDoRoteiro(roteiro: Roteiro): { id: number; nome: string }[] {
  const mapa = new Map<number, string>();

  for (const regiao of roteiro.regioes ?? []) {
    if (regiao?.nome) mapa.set(Number(regiao.idregiao), regiao.nome);
  }
  if (mapa.size === 0) {
    for (const cidade of roteiro.cidades ?? []) {
      if (cidade?.nome_regiao) mapa.set(Number(cidade.idregiao), cidade.nome_regiao);
    }
  }
  if (mapa.size === 0 && roteiro.nome_regiao) {
    mapa.set(Number(roteiro.regiao_idregiao ?? 0), roteiro.nome_regiao);
  }

  return [...mapa].map(([id, nome]) => ({ id, nome }));
}

/** Cidades do roteiro, sem repetição, na ordem que a API mandou. */
export function cidadesDoRoteiro(roteiro: Roteiro): string[] {
  const nomes = new Set<string>();
  for (const cidade of roteiro.cidades ?? []) {
    if (cidade?.nome) nomes.add(cidade.nome);
  }
  if (nomes.size === 0 && roteiro.nome_cidade) nomes.add(roteiro.nome_cidade);
  return [...nomes];
}

/**
 * Agrupa por região como o aplicativo faz: um roteiro que passa por duas
 * regiões aparece nas duas. A região escolhida no cabeçalho vem primeiro;
 * depois, as que têm mais roteiros.
 */
export function agruparPorRegiao(
  roteiros: Roteiro[],
  idRegiaoEscolhida?: number,
): { id: number; nome: string; roteiros: Roteiro[] }[] {
  const grupos = new Map<number, { id: number; nome: string; roteiros: Roteiro[] }>();

  for (const roteiro of roteiros) {
    const regioes = regioesDoRoteiro(roteiro);
    const alvo = regioes.length > 0 ? regioes : [{ id: 0, nome: 'Outras regiões' }];

    for (const regiao of alvo) {
      const grupo = grupos.get(regiao.id) ?? { id: regiao.id, nome: regiao.nome, roteiros: [] };
      grupo.roteiros.push(roteiro);
      grupos.set(regiao.id, grupo);
    }
  }

  return [...grupos.values()].sort((a, b) => {
    if (idRegiaoEscolhida) {
      if (a.id === idRegiaoEscolhida) return -1;
      if (b.id === idRegiaoEscolhida) return 1;
    }
    const porTamanho = b.roteiros.length - a.roteiros.length;
    return porTamanho !== 0 ? porTamanho : a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

/** "1 dia" / "3 dias". */
export function rotuloDias(total: number | null | undefined): string {
  const dias = Number(total ?? 0);
  return dias === 1 ? '1 dia' : `${dias} dias`;
}
