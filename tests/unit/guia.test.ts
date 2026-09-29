import { describe, expect, test } from 'vitest';
import { criarLeitorSse, type EventoBruto } from '@/lib/guia';
import { analisarLinha, analisarTexto, limparCauda, textoSimples } from '@/features/guia/texto';

describe('leitor de SSE do guia', () => {
  const ler = (pedacos: string[]) => {
    const eventos: EventoBruto[] = [];
    const alimentar = criarLeitorSse((e) => eventos.push(e));
    pedacos.forEach(alimentar);
    return eventos;
  };

  test('lê a sequência do turno e ignora os comentários de keep-alive', () => {
    const eventos = ler([
      ': ok\n\n',
      'event: inicio\ndata: {"mensagem_id":"m1","conversa_id":"c1"}\n\n',
      ': ping\n\n',
      'event: texto\ndata: {"delta":"Olá"}\n\n',
      'event: final\ndata: {"texto":"Olá!","lugares":[]}\n\n',
    ]);
    expect(eventos.map((e) => e.evento)).toEqual(['inicio', 'texto', 'final']);
    expect(eventos[2]!.dados).toMatchObject({ texto: 'Olá!' });
  });

  test('junta um evento cortado em qualquer ponto entre pedaços', () => {
    const bruto = 'event: texto\ndata: {"delta":"Canastra"}\n\nevent: texto\ndata: {"delta":" linda"}\n\n';
    for (let corte = 1; corte < bruto.length; corte++) {
      const eventos = ler([bruto.slice(0, corte), bruto.slice(corte)]);
      expect(eventos.map((e) => (e.dados as { delta: string }).delta)).toEqual(['Canastra', ' linda']);
    }
  });

  test('aceita CRLF e descarta JSON quebrado sem derrubar os próximos', () => {
    const eventos = ler(['event: texto\r\ndata: {quebrado\r\n\r\nevent: erro\r\ndata: {"erro":"limite_diario","status":429}\r\n\r\n']);
    expect(eventos).toEqual([{ evento: 'erro', dados: { erro: 'limite_diario', status: 429 } }]);
  });
});

describe('texto do guia', () => {
  const validos = new Set([20436]);

  test('marcação de lugar válida vira trecho de lugar, logo depois do nome', () => {
    expect(analisarLinha('- **Poço da Virtuosa** [[lugar:20436]] — acesso fácil', validos)).toEqual([
      { tipo: 'texto', texto: '- ' },
      { tipo: 'negrito', filhos: [{ tipo: 'texto', texto: 'Poço da Virtuosa' }] },
      { tipo: 'texto', texto: ' ' },
      { tipo: 'lugar', id: 20436 },
      { tipo: 'texto', texto: ' — acesso fácil' },
    ]);
  });

  test('marcação sem cartão some, junto com o espaço antes dela', () => {
    expect(analisarLinha('Casca Danta [[lugar:999]] fica perto.', validos)).toEqual([
      { tipo: 'texto', texto: 'Casca Danta fica perto.' },
    ]);
  });

  test('durante o streaming (sem lista de lugares) esconde todas as marcações e a que chegou pela metade', () => {
    expect(limparCauda('Visite o Poço [[lugar:204')).toBe('Visite o Poço');
    expect(limparCauda('Visite o Poço [')).toBe('Visite o Poço');
    const { blocos } = analisarTexto('Poço [[lugar:20436]] e Casca [[lug', null);
    expect(blocos).toEqual([{ tipo: 'paragrafo', trechos: [{ tipo: 'texto', texto: 'Poço e Casca' }] }]);
  });

  test('monta títulos, listas e parágrafos', () => {
    const { blocos, foraDoApp } = analisarTexto('### Dia 1\n- manhã: trilha\n- tarde: cachoeira\n\nQuer que eu monte o dia 2?', validos);
    expect(foraDoApp).toBeNull();
    expect(blocos.map((b) => b.tipo)).toEqual(['titulo', 'lista', 'paragrafo']);
    expect(blocos[1]).toMatchObject({ tipo: 'lista', ordenada: false, itens: [[{ texto: 'manhã: trilha' }], [{ texto: 'tarde: cachoeira' }]] });
  });

  test('separa o bloco "Fora do app" com a fonte em itálico', () => {
    const { blocos, foraDoApp } = analisarTexto(
      'O app ainda não cobre Paris.\n\n**Fora do app**\n- Torre Eiffel abre às 9h. _Fonte: toureiffel.paris_',
      validos,
    );
    expect(blocos).toHaveLength(1);
    expect(foraDoApp).toEqual([
      {
        tipo: 'lista',
        ordenada: false,
        itens: [[{ tipo: 'texto', texto: 'Torre Eiffel abre às 9h. ' }, { tipo: 'italico', filhos: [{ tipo: 'texto', texto: 'Fonte: toureiffel.paris' }] }]],
      },
    ]);
  });

  test('HTML no texto continua sendo texto', () => {
    expect(analisarLinha('<img src=x onerror=alert(1)>', validos)).toEqual([{ tipo: 'texto', texto: '<img src=x onerror=alert(1)>' }]);
  });

  test('texto simples tira marcações e negrito', () => {
    expect(textoSimples('### Roteiro\n**Poço** [[lugar:20436]] é lindo')).toBe('Roteiro\nPoço é lindo');
  });
});
