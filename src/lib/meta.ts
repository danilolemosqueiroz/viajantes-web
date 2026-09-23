import { useEffect } from 'react';

/**
 * Título, descrição e canonical da tela atual.
 *
 * Num site que monta no navegador não há `<head>` pronto por página: quem
 * escreve é o próprio React, a cada troca de tela. Serve para a aba do
 * navegador, para o que é compartilhado em redes sociais e para o robô que
 * executa JavaScript.
 */
interface Meta {
  titulo?: string;
  descricao?: string;
  /** Caminho canônico; vira URL absoluta com a origem atual. */
  caminho?: string;
  imagem?: string | null;
  /** A mesma página nos cinco idiomas, para o `hreflang`. */
  porIdioma?: Record<string, string>;
  naoIndexar?: boolean;
}

const SUFIXO = 'Viajantes App';

function tag(seletor: string, criar: () => HTMLElement): HTMLElement {
  const existente = document.head.querySelector(seletor);
  if (existente) return existente as HTMLElement;
  const nova = criar();
  document.head.appendChild(nova);
  return nova;
}

function meta(nome: string, valor: string, propriedade = false) {
  const atributo = propriedade ? 'property' : 'name';
  const elemento = tag(`meta[${atributo}="${nome}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(atributo, nome);
    return m;
  });
  elemento.setAttribute('content', valor);
}

export function useMeta({ titulo, descricao, caminho, imagem, porIdioma, naoIndexar }: Meta): void {
  useEffect(() => {
    const completo = titulo ? (titulo.includes(SUFIXO) ? titulo : `${titulo} | ${SUFIXO}`) : SUFIXO;
    document.title = completo;

    if (descricao) meta('description', descricao);
    meta('robots', naoIndexar ? 'noindex, follow' : 'index, follow');

    meta('og:title', completo, true);
    if (descricao) meta('og:description', descricao, true);
    meta('og:type', 'website', true);
    meta('og:site_name', SUFIXO, true);
    if (imagem) meta('og:image', imagem, true);
    meta('twitter:card', 'summary_large_image');

    const url = caminho ? new URL(caminho, window.location.origin).toString() : window.location.href;
    meta('og:url', url, true);

    const canonical = tag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }) as HTMLLinkElement;
    canonical.href = url;

    // hreflang: recria a cada tela, senão sobra o da anterior.
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
    if (porIdioma) {
      for (const [idioma, caminhoIdioma] of Object.entries(porIdioma)) {
        const alternativo = document.createElement('link');
        alternativo.setAttribute('rel', 'alternate');
        alternativo.setAttribute('hreflang', idioma);
        alternativo.setAttribute('href', new URL(caminhoIdioma, window.location.origin).toString());
        document.head.appendChild(alternativo);
      }
      const padrao = document.createElement('link');
      padrao.setAttribute('rel', 'alternate');
      padrao.setAttribute('hreflang', 'x-default');
      padrao.setAttribute('href', new URL(porIdioma.pt ?? '/', window.location.origin).toString());
      document.head.appendChild(padrao);
    }
  }, [titulo, descricao, caminho, imagem, porIdioma, naoIndexar]);
}
