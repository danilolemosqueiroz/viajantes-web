import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IDIOMA_PADRAO, IDIOMAS, type Idioma } from './categorias';

/**
 * Textos FIXOS da interface.
 *
 * A chave é o próprio texto em português (`t('Ver todos')`), como no
 * aplicativo: os cinco arquivos de `src/messages/` são os mesmos dele, com
 * 1.372 frases já traduzidas. Faltando tradução, aparece o português — nunca
 * uma chave crua na tela.
 *
 * Isto NÃO traduz o conteúdo do banco (nome e descrição de atrativos): esse
 * virá da própria API, no idioma pedido, quando estiver gravado lá.
 *
 * Num site que roda no navegador o dicionário inteiro é carregado de uma vez
 * (~100 KB), uma única vez por idioma — e some a necessidade de listar quais
 * frases cada componente usa.
 */
type Dicionario = Record<string, string>;
type Variaveis = Record<string, string | number>;
export type Traduzir = (chave: string, variaveis?: Variaveis) => string;

const cache = new Map<Idioma, Dicionario>();

/** Troca `{{nome}}` pelos valores passados. Mesmo formato do app (i18next). */
export function interpolar(texto: string, variaveis?: Variaveis): string {
  if (!variaveis) return texto;
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (original, chave: string) =>
    chave in variaveis ? String(variaveis[chave]) : original,
  );
}

export function criarTraduzir(dicionario: Dicionario): Traduzir {
  return (chave, variaveis) => interpolar(dicionario[chave] ?? chave, variaveis);
}

async function carregar(idioma: Idioma): Promise<Dicionario> {
  const emCache = cache.get(idioma);
  if (emCache) return emCache;
  const modulo = await import(`../messages/${idioma}.json`);
  const dicionario = (modulo.default ?? modulo) as Dicionario;
  cache.set(idioma, dicionario);
  return dicionario;
}

interface Contexto {
  idioma: Idioma;
  t: Traduzir;
}

const ContextoTraducao = createContext<Contexto>({ idioma: IDIOMA_PADRAO, t: (chave) => chave });

export function ProvedorTraducao({ idioma, children }: { idioma: Idioma; children: React.ReactNode }) {
  const valido = IDIOMAS.includes(idioma) ? idioma : IDIOMA_PADRAO;
  // Começa com o que já estiver em memória: trocar de página no mesmo idioma
  // não pisca texto em português.
  const [dicionario, setDicionario] = useState<Dicionario>(() => cache.get(valido) ?? {});

  useEffect(() => {
    let atual = true;
    carregar(valido).then((carregado) => {
      if (atual) setDicionario(carregado);
    });
    return () => {
      atual = false;
    };
  }, [valido]);

  useEffect(() => {
    document.documentElement.lang = valido;
  }, [valido]);

  const valor = useMemo(() => ({ idioma: valido, t: criarTraduzir(dicionario) }), [valido, dicionario]);
  return <ContextoTraducao.Provider value={valor}>{children}</ContextoTraducao.Provider>;
}

/** Função de tradução da tela atual. */
export function useT(): Traduzir {
  return useContext(ContextoTraducao).t;
}

/** Idioma da tela atual. */
export function useIdioma(): Idioma {
  return useContext(ContextoTraducao).idioma;
}
