import { afterEach, describe, expect, test, vi } from 'vitest';
import { formatarPreco, linkClique, listarCategorias, rotuloCta } from '@/features/ofertas/dados';

/**
 * Regras da vitrine "Viajantes Recomenda".
 *
 * O que é testado aqui é o que quebra sem aparecer: um link que pula o
 * registro do clique continua levando a pessoa à loja, e ninguém percebe que a
 * contagem parou.
 */

describe('link de clique', () => {
  test('passa pela Central (/go/{id}) e nunca pelo link de afiliado', () => {
    const url = new URL(linkClique('abc-123', 'camping'));

    expect(url.pathname).toBe('/go/abc-123');
    expect(url.searchParams.get('canal')).toBe('viajantes-site');
    expect(url.searchParams.get('utm_campaign')).toBe('viajantes_recomenda');
    expect(url.searchParams.get('utm_content')).toBe('camping');
  });

  test('oferta sem categoria não deixa o utm_content vazio', () => {
    const url = new URL(linkClique('abc-123', null));
    expect(url.searchParams.get('utm_content')).toBe('outros');
  });

  test('id com caractere especial não escapa da URL', () => {
    const url = new URL(linkClique('a/b?c=1', 'pet'));
    expect(url.pathname).toBe('/go/a%2Fb%3Fc%3D1');
  });
});

describe('chamada do botão', () => {
  test('cupom vence a categoria — é o que a pessoa veio buscar', () => {
    expect(rotuloCta('hospedagens', 'VIAJA10')).toBe('Pegar cupom');
  });

  test('cada categoria com a sua ação', () => {
    expect(rotuloCta('hospedagens', null)).toBe('Reservar');
    expect(rotuloCta('passagens', null)).toBe('Ver passagens');
    expect(rotuloCta('camping', null)).toBe('Ver oferta');
    expect(rotuloCta(null, null)).toBe('Ver oferta');
  });
});

describe('preço', () => {
  test('mostra R$ nos cinco idiomas — as lojas são brasileiras', () => {
    // Sem `narrowSymbol` o espanhol sai "35,89 BRL" e destoa das outras telas.
    for (const idioma of ['pt', 'en', 'es', 'fr', 'de'] as const) {
      expect(formatarPreco(35.89, idioma), idioma).toMatch(/R\$/);
    }
  });

  test('o idioma muda a escrita do número, não a moeda', () => {
    // espaço fino/NBSP varia por runtime: compara só os dígitos e separadores
    const digitos = (s: string) => s.replace(/[^\d.,]/g, '');
    expect(digitos(formatarPreco(1407, 'pt'))).toBe('1.407,00');
    expect(digitos(formatarPreco(1407, 'en'))).toBe('1,407.00');
    expect(digitos(formatarPreco(1407, 'de'))).toBe('1.407,00');
  });
});

describe('categorias visíveis', () => {
  const resposta = (data: unknown) =>
    vi.fn(async () => new Response(JSON.stringify({ error: false, data }), { status: 200 }));

  afterEach(() => vi.unstubAllGlobals());

  test('mostra só as 4 do cliente, na ordem, com o rótulo da Central', async () => {
    vi.stubGlobal(
      'fetch',
      resposta([
        { value: 'todos', label: 'Todos', own_data: true },
        { value: 'hospedagens', label: 'Hospedagens', own_data: true },
        { value: 'camping', label: 'Camping e Outdoor', own_data: true },
        { value: 'pet', label: 'Pet', own_data: true },
        { value: 'tecnologia', label: 'Tecnologia', own_data: true },
        { value: 'patrocinadores', label: 'Benefícios Viajantes', own_data: true },
      ]),
    );

    expect((await listarCategorias()).map((c) => [c.value, c.label])).toEqual([
      ['todos', 'Todos'],
      ['hospedagens', 'Hospedagens'],
      ['camping', 'Camping e Outdoor'],
      ['pet', 'Pet'],
    ]);
  });

  test('categoria que sumir da Central não vira chip quebrado', async () => {
    vi.stubGlobal('fetch', resposta([{ value: 'todos', label: 'Todos', own_data: true }]));
    expect((await listarCategorias()).map((c) => c.value)).toEqual(['todos']);
  });
});
