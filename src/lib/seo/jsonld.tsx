import { publico } from '@/lib/publico';
/**
 * Dados estruturados (schema.org) — o que o Google usa para mostrar o site em
 * resultados enriquecidos. Num site que monta no navegador, o bloco entra no
 * HTML junto com a tela, e o robô que executa JavaScript o encontra.
 */
export function urlSite(caminho = '/'): string {
  const origem = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origem}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
}

type Bloco = Record<string, unknown>;

/** Trilha de navegação: Home › Cachoeiras › Capitólio. */
export function migalhas(itens: { nome: string; caminho: string }[]): Bloco {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      item: urlSite(item.caminho),
    })),
  };
}

/** Lista de itens de uma página de listagem. */
export function listaDeItens(nome: string, itens: { nome: string; caminho: string }[]): Bloco {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nome,
    itemListElement: itens.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      url: urlSite(item.caminho),
    })),
  };
}

/** A organização — vai na home. */
export function organizacao(): Bloco {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Viajantes App',
    url: urlSite('/'),
    logo: urlSite(publico('images/logo.png')),
  };
}

export function JsonLd({ blocos }: { blocos?: Bloco[] }) {
  const lista = blocos && blocos.length > 0 ? blocos : [organizacao()];
  return (
    <>
      {lista.map((bloco, indice) => (
        <script
          key={indice}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bloco) }}
        />
      ))}
    </>
  );
}
