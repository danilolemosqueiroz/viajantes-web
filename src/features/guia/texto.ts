/** Leitura do texto do guia, que vem em markdown leve (ver `viajantes-ia/src/agent/prompts/formato.md`):
 * **negrito**, _itálico_, listas com "-", títulos "###", a marcação `[[lugar:ID]]` logo depois do
 * nome de um lugar e, no fim, o bloco opcional "**Fora do app**". Nada aqui vira HTML cru: o
 * resultado é uma árvore que o React desenha como texto. */

export type Trecho =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'negrito'; filhos: Trecho[] }
  | { tipo: 'italico'; filhos: Trecho[] }
  | { tipo: 'lugar'; id: number };

export type Bloco =
  | { tipo: 'paragrafo'; trechos: Trecho[] }
  | { tipo: 'titulo'; trechos: Trecho[] }
  | { tipo: 'lista'; ordenada: boolean; itens: Trecho[][] };

export interface TextoAnalisado {
  blocos: Bloco[];
  /** O bloco "Fora do app", separado para ganhar outra cara. */
  foraDoApp: Bloco[] | null;
}

const MARCA_LUGAR = /\[\[lugar:(\d+)\]\]/;
const INLINE = /\*\*(.+?)\*\*|\[\[lugar:(\d+)\]\]|(?<![\w*])[_*](?![\s_*])(.+?)(?<![\s_*])[_*](?![\w*])/g;
const CABECALHO_FORA = /^[ \t]*\*\*Fora do app\*\*/im;

/** Trechos de uma linha. `lugaresValidos` nulo (durante o streaming) esconde todas as marcações. */
export function analisarLinha(linha: string, lugaresValidos: Set<number> | null): Trecho[] {
  const trechos: Trecho[] = [];
  let desde = 0;
  const texto = (s: string) => {
    if (!s) return;
    const ultimo = trechos[trechos.length - 1];
    if (ultimo?.tipo === 'texto') ultimo.texto += s;
    else trechos.push({ tipo: 'texto', texto: s });
  };
  for (const m of linha.matchAll(INLINE)) {
    texto(linha.slice(desde, m.index));
    desde = m.index + m[0].length;
    if (m[1] !== undefined) trechos.push({ tipo: 'negrito', filhos: analisarLinha(m[1], lugaresValidos) });
    else if (m[2] !== undefined) {
      const id = Number(m[2]);
      if (lugaresValidos?.has(id)) trechos.push({ tipo: 'lugar', id });
      else if (trechos[trechos.length - 1]?.tipo === 'texto') {
        // Marcação escondida: tira o espaço que ficaria sobrando antes dela.
        const ultimo = trechos[trechos.length - 1] as { texto: string };
        ultimo.texto = ultimo.texto.replace(/\s$/, '');
      }
    } else if (m[3] !== undefined) trechos.push({ tipo: 'italico', filhos: analisarLinha(m[3], lugaresValidos) });
  }
  texto(linha.slice(desde));
  return trechos;
}

function analisarBlocos(texto: string, lugares: Set<number> | null): Bloco[] {
  const blocos: Bloco[] = [];
  let paragrafo: string[] = [];
  let lista: { ordenada: boolean; itens: Trecho[][] } | null = null;

  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push({ tipo: 'paragrafo', trechos: analisarLinha(paragrafo.join('\n'), lugares) });
    paragrafo = [];
  };
  const fecharLista = () => {
    if (lista) blocos.push({ tipo: 'lista', ...lista });
    lista = null;
  };

  for (const bruta of texto.split('\n')) {
    const linha = bruta.trimEnd();
    const titulo = /^#{1,6}\s+(.*)$/.exec(linha);
    const item = /^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/.exec(linha);
    if (!linha.trim()) {
      fecharParagrafo();
      fecharLista();
    } else if (titulo) {
      fecharParagrafo();
      fecharLista();
      blocos.push({ tipo: 'titulo', trechos: analisarLinha(titulo[1]!, lugares) });
    } else if (item) {
      fecharParagrafo();
      const ordenada = item[2] !== undefined;
      if (lista && lista.ordenada !== ordenada) fecharLista();
      lista ??= { ordenada, itens: [] };
      lista.itens.push(analisarLinha(item[3]!, lugares));
    } else if (lista && /^\s{2,}\S/.test(bruta)) {
      // Continuação de um item de lista, indentada.
      const ultimo = lista.itens[lista.itens.length - 1]!;
      ultimo.push({ tipo: 'texto', texto: ' ' }, ...analisarLinha(linha.trim(), lugares));
    } else {
      fecharLista();
      paragrafo.push(linha);
    }
  }
  fecharParagrafo();
  fecharLista();
  return blocos;
}

/** Durante o streaming, uma marcação pode chegar pela metade (`[[lugar:204`): some com ela. */
export function limparCauda(texto: string): string {
  return texto.replace(/\s?\[(?:\[[^\]\n]{0,20}\]?)?$/, '');
}

export function analisarTexto(texto: string, lugaresValidos: Set<number> | null): TextoAnalisado {
  const limpo = lugaresValidos ? texto : limparCauda(texto);
  const corte = limpo.search(CABECALHO_FORA);
  if (corte < 0) return { blocos: analisarBlocos(limpo, lugaresValidos), foraDoApp: null };
  const fora = limpo.slice(corte).replace(CABECALHO_FORA, '');
  return {
    blocos: analisarBlocos(limpo.slice(0, corte), lugaresValidos),
    // O bloco de fora nunca tem marcação de lugar: o serviço já garante, e aqui não se confia.
    foraDoApp: analisarBlocos(fora, new Set()),
  };
}

/** Texto corrido, sem marcações (título de conversa, leitor de tela). */
export function textoSimples(texto: string): string {
  return texto
    .replace(new RegExp(`\\s?${MARCA_LUGAR.source}`, 'g'), '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');
}
