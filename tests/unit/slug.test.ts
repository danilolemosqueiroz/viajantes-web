import { describe, expect, test } from 'vitest';
import { lerSlugComId, slugComId, slugify } from '@/lib/slug';

describe('slugify', () => {
  test.each([
    ['São Roque de Minas', 'sao-roque-de-minas'],
    ['Capitólio', 'capitolio'],
    ['Olhos D`Água da Canastra', 'olhos-dagua-da-canastra'],
    ['Canastra 360º - 4x4 - Roteiro 12 dias', 'canastra-360o-4x4-roteiro-12-dias'],
    ['  Véu da Noiva!!  ', 'veu-da-noiva'],
    ['Museus & Igrejas', 'museus-igrejas'],
  ])('%s → %s', (entrada, esperado) => {
    expect(slugify(entrada)).toBe(esperado);
  });

  test('texto vazio vira string vazia', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});

describe('lerSlugComId', () => {
  test('separa o nome do id', () => {
    expect(lerSlugComId('cachoeira-do-cristal-1234')).toEqual({ slug: 'cachoeira-do-cristal', id: 1234 });
  });

  test('nome que já tem número continua funcionando', () => {
    expect(lerSlugComId('pousada-4-estacoes-987')).toEqual({ slug: 'pousada-4-estacoes', id: 987 });
    expect(lerSlugComId('canastra-360o-4x4-12-dias-47')).toEqual({ slug: 'canastra-360o-4x4-12-dias', id: 47 });
  });

  test('slug de destino não é confundido com detalhe', () => {
    expect(lerSlugComId('serra-da-canastra')).toBeNull();
    expect(lerSlugComId('capitolio')).toBeNull();
    expect(lerSlugComId('sao-joao-batista-do-gloria')).toBeNull();
  });

  test('id inválido é recusado', () => {
    expect(lerSlugComId('nome-0')).toBeNull();
    expect(lerSlugComId('-123')).toBeNull();
    expect(lerSlugComId('')).toBeNull();
  });
});

describe('slugComId', () => {
  test('monta o segmento e volta pelo leitor', () => {
    const segmento = slugComId('Cachoeira Casca d`Anta', 1234);
    expect(segmento).toBe('cachoeira-casca-danta-1234');
    expect(lerSlugComId(segmento)).toEqual({ slug: 'cachoeira-casca-danta', id: 1234 });
  });

  test('nome vazio cai no id puro', () => {
    expect(slugComId('', 55)).toBe('55');
  });
});
