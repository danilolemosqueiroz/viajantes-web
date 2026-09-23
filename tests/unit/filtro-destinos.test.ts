import { describe, expect, it } from 'vitest';
import { contarRegioes, filtrarEstados, prepararEstados, type EstadoFiltravel } from '@/features/destinos/filtrar';
import type { IndiceGeografia } from '@/lib/geo/indice';

/** Filtro da página Destinos: busca por texto e recorte por estado. */

const ESTADOS: EstadoFiltravel[] = [
  {
    id: 1,
    nome: 'Minas Gerais',
    regioes: [
      { id: 10, nome: 'Capitólio', slug: 'capitolio', quantidade: 40, foto: null, busca: 'capitolio capitolio guape' },
      { id: 11, nome: 'Serra do Cipó', slug: 'serra-do-cipo', quantidade: 20, foto: null, busca: 'serra-do-cipo santana-do-riacho' },
    ],
  },
  {
    id: 2,
    nome: 'São Paulo',
    regioes: [
      { id: 20, nome: 'Litoral Norte', slug: 'litoral-norte', quantidade: 15, foto: null, busca: 'litoral-norte ubatuba' },
    ],
  },
];

describe('filtrarEstados', () => {
  it('sem filtro devolve tudo', () => {
    const r = filtrarEstados(ESTADOS, { texto: '', estadoId: null });
    expect(r).toHaveLength(2);
    expect(contarRegioes(r)).toBe(3);
  });

  it('recorta por estado', () => {
    const r = filtrarEstados(ESTADOS, { texto: '', estadoId: 2 });
    expect(r.map((e) => e.nome)).toEqual(['São Paulo']);
    expect(contarRegioes(r)).toBe(1);
  });

  it('acha pelo nome da região, ignorando acento e caixa', () => {
    for (const texto of ['Capitólio', 'capitolio', 'CAPIT']) {
      const r = filtrarEstados(ESTADOS, { texto, estadoId: null });
      expect(contarRegioes(r), texto).toBe(1);
      expect(r[0].regioes[0].nome).toBe('Capitólio');
    }
  });

  it('acha a região pelo nome de uma cidade dela', () => {
    const r = filtrarEstados(ESTADOS, { texto: 'ubatuba', estadoId: null });
    expect(contarRegioes(r)).toBe(1);
    expect(r[0].regioes[0].nome).toBe('Litoral Norte');
  });

  it('some com o estado que ficou sem nenhuma região', () => {
    const r = filtrarEstados(ESTADOS, { texto: 'cipo', estadoId: null });
    expect(r.map((e) => e.nome)).toEqual(['Minas Gerais']);
  });

  it('combina texto e estado', () => {
    expect(contarRegioes(filtrarEstados(ESTADOS, { texto: 'capit', estadoId: 2 }))).toBe(0);
    expect(contarRegioes(filtrarEstados(ESTADOS, { texto: 'capit', estadoId: 1 }))).toBe(1);
  });

  it('espaço em branco não filtra nada', () => {
    expect(contarRegioes(filtrarEstados(ESTADOS, { texto: '   ', estadoId: null }))).toBe(3);
  });
});

describe('prepararEstados', () => {
  it('inclui os slugs das cidades no campo de busca da região', () => {
    const geografia = {
      estados: [
        {
          id: 1,
          nome: 'Minas Gerais',
          foto: null,
          regioes: [
            {
              tipo: 'regiao' as const,
              id: 10,
              nome: 'Capitólio',
              slug: 'capitolio',
              quantidade: 40,
              foto: 'capa.jpg',
              tituloturistico: null,
              cidades: [
                { id: 1, nome: 'Capitólio', slug: 'capitolio', quantidade: 30 },
                { id: 2, nome: 'São José da Barra', slug: 'sao-jose-da-barra', quantidade: 10 },
              ],
            },
          ],
        },
      ],
    } as unknown as IndiceGeografia;

    const [estado] = prepararEstados(geografia);
    expect(estado.regioes[0].busca).toContain('sao-jose-da-barra');
    expect(estado.regioes[0].foto).toBe('capa.jpg');

    // e por isso a região é encontrada pela cidade
    const r = filtrarEstados([estado], { texto: 'São José', estadoId: null });
    expect(contarRegioes(r)).toBe(1);
  });
});
