import { useQuery } from '@tanstack/react-query';
import type { Categoria } from '@/i18n/categorias';
import { indiceGeografia, resolverDestino, type Destino, type IndiceGeografia } from '@/lib/geo/indice';
import { buscarEmpresa, listarEmpresas } from '@/features/catalogo/dados';
import { buscarAssinatura, buscarRoteiro, listarCompras, listarItensRoteiro, listarRoteiros } from '@/features/roteiros/dados';
import { lerSessao } from '@/lib/sessao';
import type { AssinaturaSite, CompraFeita, Empresa, EmpresaResumo, Roteiro, RoteiroItem } from '@/lib/tipos';

/**
 * As consultas à API, em um lugar só.
 *
 * Cada tela pede o que precisa por aqui; o TanStack Query cuida de não repetir
 * a mesma consulta durante a navegação e de refazer quando a aba é reaberta.
 * Nada é gravado no site: o conteúdo vem sempre do banco, pela API.
 */
export function useGeografia() {
  return useQuery<IndiceGeografia>({
    queryKey: ['geografia'],
    queryFn: indiceGeografia,
    staleTime: 60 * 60 * 1000, // muda poucas vezes por dia
  });
}

export function useDestino(slug: string | undefined) {
  return useQuery<Destino | null>({
    queryKey: ['destino', slug],
    queryFn: () => resolverDestino(slug!),
    enabled: Boolean(slug),
    staleTime: 60 * 60 * 1000,
  });
}

interface FiltroEmpresas {
  categoria?: Categoria;
  destino?: Destino | null;
  regiao?: number;
  /** Só o estado (sem região): o filtro Estado › Região › Cidade da categoria. */
  estado?: number;
  busca?: string;
  limite?: number;
}

export function useEmpresas(filtro: FiltroEmpresas, ligada = true) {
  return useQuery<EmpresaResumo[]>({
    queryKey: [
      'empresas',
      filtro.categoria?.id ?? null,
      filtro.destino ? `${filtro.destino.tipo}:${filtro.destino.id}` : null,
      filtro.regiao ?? null,
      filtro.estado ?? null,
      filtro.busca ?? null,
      filtro.limite ?? null,
    ],
    queryFn: () =>
      listarEmpresas({
        categoria: filtro.categoria,
        destino: filtro.destino ?? undefined,
        regiao: filtro.regiao,
        estado: filtro.estado,
        busca: filtro.busca,
        limite: filtro.limite,
      }),
    enabled: ligada,
  });
}

export function useEmpresa(id: number | undefined) {
  return useQuery<Empresa | null>({
    queryKey: ['empresa', id],
    queryFn: () => buscarEmpresa(id!),
    enabled: Number.isFinite(id) && (id ?? 0) > 0,
  });
}

export function useRoteiros(idRegiao?: number) {
  return useQuery<Roteiro[]>({
    queryKey: ['roteiros', idRegiao ?? null],
    queryFn: () => listarRoteiros(idRegiao),
  });
}

export function useRoteiro(id: number | undefined) {
  return useQuery<Roteiro | null>({
    queryKey: ['roteiro', id],
    queryFn: () => buscarRoteiro(id!),
    enabled: Number.isFinite(id) && (id ?? 0) > 0,
  });
}

/** Planos e assinatura da conta. A sessão entra na chave: entrar ou assinar muda a resposta. */
export function useAssinaturaSite() {
  return useQuery<AssinaturaSite>({
    queryKey: ['assinatura-site', lerSessao()],
    queryFn: buscarAssinatura,
    staleTime: 0,
  });
}

/** Itens só quando o acesso está liberado — antes disso a API responde 401/402. */
export function useItensRoteiro(id: number | undefined, liberado: boolean) {
  return useQuery<RoteiroItem[]>({
    queryKey: ['roteiro-itens', id, lerSessao()],
    queryFn: () => listarItensRoteiro(id!),
    enabled: liberado && Number.isFinite(id) && (id ?? 0) > 0,
  });
}

export function useComprasPlano(ligada: boolean) {
  return useQuery<CompraFeita[]>({
    queryKey: ['compras-plano', lerSessao()],
    queryFn: listarCompras,
    enabled: ligada,
    staleTime: 0,
  });
}
