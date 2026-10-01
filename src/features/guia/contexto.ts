import { useEffect, useSyncExternalStore } from 'react';

/** A região que a pessoa está vendo agora. As páginas de destino e de atrativo contam para o
 * guia, que usa isso nas sugestões e ao abrir uma conversa nova. Fica fora do pedaço preguiçoso
 * do guia de propósito: é pequeno e as páginas precisam dele. */
export interface RegiaoDoGuia {
  id: number;
  nome: string;
}

let atual: RegiaoDoGuia | null = null;
const ouvintes = new Set<() => void>();

function definir(regiao: RegiaoDoGuia | null) {
  if (atual?.id === regiao?.id && atual?.nome === regiao?.nome) return;
  atual = regiao;
  ouvintes.forEach((ouvir) => ouvir());
}

const assinar = (ouvir: () => void) => {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
};

export function useRegiaoDoGuia(): RegiaoDoGuia | null {
  return useSyncExternalStore(assinar, () => atual, () => null);
}

/** Chamado pela página: enquanto ela está na tela, a região vale para o guia. */
export function useInformarRegiao(id: number | null | undefined, nome: string | null | undefined) {
  useEffect(() => {
    if (!id || !nome) return;
    definir({ id, nome });
    return () => definir(null);
  }, [id, nome]);
}

/** A região de um destino: ela mesma, ou a região da cidade. */
export function regiaoDoDestino(destino: { tipo: 'regiao' | 'cidade'; id: number; nome: string; regiao?: { id: number; nome: string } | null } | null | undefined) {
  if (!destino) return null;
  return destino.tipo === 'regiao' ? { id: destino.id, nome: destino.nome } : (destino.regiao ?? null);
}
