import { describe, expect, test } from 'vitest';
import geografiaReal from '../fixtures/geografia.json';
import { montarIndiceGeografia, filtroDoDestino } from '@/lib/geo/indice';
import { lerSlugComId } from '@/lib/slug';
import type { Geografia } from '@/lib/tipos';

const indice = montarIndiceGeografia(geografiaReal as Geografia);

describe('índice de geografia (catálogo real)', () => {
  test('carrega as regiões e cidades do catálogo', () => {
    expect(indice.regioes.length).toBeGreaterThan(150);
    expect(indice.cidades.length).toBeGreaterThan(200);
    expect(indice.estados.length).toBeGreaterThan(15);
  });

  test('resolve um destino conhecido', () => {
    const canastra = indice.porSlug.get('serra-da-canastra');
    expect(canastra?.tipo).toBe('regiao');
    expect(canastra?.nome).toBe('Serra da Canastra');
    expect(canastra?.quantidade).toBeGreaterThan(0);
    expect(canastra?.cidades?.length).toBeGreaterThan(0);
  });

  test('região vence cidade quando o nome é o mesmo', () => {
    // O catálogo tem 173 casos assim: a região leva o nome da cidade principal
    // e agrega os arredores, que é o que o visitante espera ver.
    const colisoes = indice.cidades.filter((cidade) => {
      const regiao = indice.regioes.find((r) => r.slug === cidade.slug);
      return Boolean(regiao);
    });
    expect(colisoes.length).toBeGreaterThan(0);

    for (const cidade of colisoes.slice(0, 20)) {
      expect(indice.porSlug.get(cidade.slug)?.tipo).toBe('regiao');
    }
  });

  test('nenhum slug de destino é confundido com um detalhe', () => {
    const suspeitos = [...indice.porSlug.keys()].filter((slug) => lerSlugComId(slug) !== null);
    expect(suspeitos).toEqual([]);
  });

  test('cidade guarda a região e o estado a que pertence', () => {
    const cidade = indice.cidades.find((c) => c.slug === 'sao-roque-de-minas');
    expect(cidade?.tipo).toBe('cidade');
    expect(cidade?.regiao?.nome).toBeTruthy();
    expect(cidade?.estado?.nome).toBeTruthy();
  });

  test('filtro da listagem usa região ou cidade conforme o destino', () => {
    const regiao = indice.regioes[0];
    const cidade = indice.cidades.find((c) => !indice.regioes.some((r) => r.slug === c.slug))!;
    expect(filtroDoDestino(regiao)).toEqual({ regiao: regiao.id });
    expect(filtroDoDestino(cidade)).toEqual({ cidade: cidade.id });
  });

  test('slug inexistente não resolve', () => {
    expect(indice.porSlug.get('lugar-que-nao-existe')).toBeUndefined();
  });
});
