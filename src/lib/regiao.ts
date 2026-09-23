import { useCallback, useSyncExternalStore } from 'react';

/**
 * Região escolhida no cabeçalho — um FILTRO opcional, não um portão.
 *
 * O site abre mostrando tudo ("modo geral"). Quem chega do Google numa
 * cachoeira nunca é parado para escolher estado e região, como acontecia no
 * site antigo. As páginas de destino ignoram esta escolha de propósito: a URL
 * manda mais que a preferência guardada.
 */
export interface RegiaoEscolhida {
  id: number;
  nome: string;
  slug: string;
  capa: string | null;
}

const CHAVE = 'vj_regiao';
const ouvintes = new Set<() => void>();

function ler(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

export function escolherRegiao(regiao: RegiaoEscolhida | null): void {
  try {
    if (regiao) localStorage.setItem(CHAVE, JSON.stringify(regiao));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* armazenamento bloqueado: segue no modo geral */
  }
  avisar();
}

/** Valor corrompido cai no modo geral, sem quebrar a tela. */
export function lerRegiaoDoValor(valor: string | null): RegiaoEscolhida | null {
  if (!valor) return null;
  try {
    const dados = JSON.parse(valor);
    const id = Number(dados?.id);
    if (!Number.isSafeInteger(id) || id <= 0 || !dados?.nome) return null;
    return {
      id,
      nome: String(dados.nome),
      slug: String(dados.slug ?? ''),
      capa: dados.capa ? String(dados.capa) : null,
    };
  } catch {
    return null;
  }
}

export function useRegiao(): { regiao: RegiaoEscolhida | null; escolher: typeof escolherRegiao } {
  const assinar = useCallback((aoMudar: () => void) => {
    ouvintes.add(aoMudar);
    window.addEventListener('storage', aoMudar);
    return () => {
      ouvintes.delete(aoMudar);
      window.removeEventListener('storage', aoMudar);
    };
  }, []);

  const bruto = useSyncExternalStore(assinar, ler, () => null);
  return { regiao: lerRegiaoDoValor(bruto), escolher: escolherRegiao };
}

/** Filtro para a listagem de empresas. Modo geral manda `todasregioes=1`. */
export function filtroDaRegiao(regiao: RegiaoEscolhida | null): Record<string, number> {
  return regiao ? { regiao: regiao.id } : { todasregioes: 1 };
}
