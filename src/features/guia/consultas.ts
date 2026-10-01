import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guiaDelete, guiaGet, guiaPost } from '@/lib/guia';
import type { Resultado } from '@/lib/api';
import { lerSessao } from '@/lib/sessao';
import type { Conversa, ConversaComMensagens, EstadoSaldo, RoteiroGuia } from './tipos';

/** Falha do serviço com o código estável (`assinatura_necessaria`, `limite_diario`…). */
export class FalhaGuia extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string | undefined,
    message: string,
    public readonly dados?: Record<string, unknown>,
  ) {
    super(message);
  }
}

async function exigir<T>(resposta: Promise<Resultado<T>>): Promise<T> {
  const r = await resposta;
  if (!r.ok) throw new FalhaGuia(r.status, r.codigo, r.erro, r.dados);
  return r.data;
}

/** A sessão entra na chave: trocar de conta não pode mostrar a conversa de outra pessoa. */
export const chaves = {
  tudo: () => ['guia', lerSessao()] as const,
  conversas: () => ['guia', lerSessao(), 'conversas'] as const,
  conversa: (id: string) => ['guia', lerSessao(), 'conversa', id] as const,
  saldo: () => ['guia', lerSessao(), 'saldo'] as const,
  sugestoes: (regiao: number | null) => ['guia', lerSessao(), 'sugestoes', regiao] as const,
  roteiro: (id: string) => ['guia', lerSessao(), 'roteiro', id] as const,
};

/** Não repete 4xx: 402, 404 e 429 não mudam na segunda tentativa. */
const repetir = (vezes: number, erro: Error) => vezes < 1 && !(erro instanceof FalhaGuia && erro.status >= 400 && erro.status < 500);

export function useConversas(ligada: boolean) {
  return useQuery({
    queryKey: chaves.conversas(),
    queryFn: () => exigir(guiaGet<{ conversas: Conversa[] }>('/v1/conversas', { limite: 30 })).then((r) => r.conversas),
    enabled: ligada,
    staleTime: 30_000,
    retry: repetir,
  });
}

export function useConversa(id: string | null) {
  return useQuery({
    queryKey: chaves.conversa(id ?? ''),
    queryFn: () => exigir(guiaGet<ConversaComMensagens>(`/v1/conversas/${encodeURIComponent(id!)}`, { limite: 100 })),
    enabled: Boolean(id),
    staleTime: Infinity,
    retry: repetir,
  });
}

export function useSaldo(ligada: boolean) {
  return useQuery({
    queryKey: chaves.saldo(),
    queryFn: () => exigir(guiaGet<EstadoSaldo>('/v1/saldo')),
    enabled: ligada,
    staleTime: 60_000,
    retry: repetir,
  });
}

export function useSugestoes(regiao: number | null, ligada: boolean) {
  return useQuery({
    queryKey: chaves.sugestoes(regiao),
    queryFn: () => exigir(guiaGet<{ sugestoes: string[] }>('/v1/sugestoes', { regiao_id: regiao })).then((r) => r.sugestoes),
    enabled: ligada,
    staleTime: 10 * 60_000,
    retry: repetir,
  });
}

export function useRoteiroGuia(id: string | null) {
  return useQuery({
    queryKey: chaves.roteiro(id ?? ''),
    queryFn: () => exigir(guiaGet<RoteiroGuia>(`/v1/roteiros/${encodeURIComponent(id!)}`)),
    enabled: Boolean(id),
    staleTime: Infinity,
    retry: repetir,
  });
}

export const criarConversa = (regiao: number | null) =>
  exigir(guiaPost<Conversa>('/v1/conversas', regiao ? { regiao_id: regiao } : {}));

/** Arquivar tira a conversa da lista; não há como desfazer. */
export function useArquivarConversa() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exigir(guiaDelete(`/v1/conversas/${encodeURIComponent(id)}`)),
    onSuccess: (_, id) => {
      cliente.setQueryData<Conversa[]>(chaves.conversas(), (lista) => lista?.filter((c) => c.id !== id));
      cliente.removeQueries({ queryKey: chaves.conversa(id) });
    },
  });
}

export function useFeedback(conversaId: string) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ mensagemId, nota }: { mensagemId: string; nota: 1 | -1 }) =>
      exigir(guiaPost<null>(`/v1/mensagens/${encodeURIComponent(mensagemId)}/feedback`, { nota })),
    onSuccess: (_, { mensagemId, nota }) => {
      cliente.setQueryData<ConversaComMensagens>(chaves.conversa(conversaId), (atual) =>
        atual && { ...atual, mensagens: atual.mensagens.map((m) => (m.id === mensagemId ? { ...m, feedback: nota } : m)) },
      );
    },
  });
}
