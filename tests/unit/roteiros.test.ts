import { describe, expect, test } from 'vitest';
import {
  cpfValido,
  lerValidade,
  mascaraCartao,
  mascaraCpf,
  mascaraTelefone,
  mascaraValidade,
  numeroCartaoValido,
  parcelasOpcoes,
} from '@/features/roteiros/cartao';
import { agruparPorDia, economiaAnual, rotuloPeriodo } from '@/features/roteiros/dados';
import { temPreco } from '@/features/ofertas/dados';
import type { RoteiroItem } from '@/lib/tipos';

/**
 * Regras da compra de roteiro no site. O que é barrado aqui não sai do
 * navegador — o pagar.me recusaria do mesmo jeito, só que com mensagem pior.
 */

describe('cartão', () => {
  test('Luhn: os cartões de teste do pagar.me passam, um dígito trocado não', () => {
    expect(numeroCartaoValido('4000 0000 0000 0010')).toBe(true);
    expect(numeroCartaoValido('4000000000000028')).toBe(true);
    expect(numeroCartaoValido('4000000000000011')).toBe(false);
    expect(numeroCartaoValido('1234')).toBe(false);
  });

  test('validade aceita MM/AA e MM/AAAA e recusa vencida', () => {
    const hoje = new Date(2026, 8, 19);
    expect(lerValidade('12/30', hoje)).toEqual({ mes: 12, ano: 2030 });
    expect(lerValidade('09/2026', hoje)).toEqual({ mes: 9, ano: 2026 });
    expect(lerValidade('08/26', hoje)).toBeNull();
    expect(lerValidade('13/30', hoje)).toBeNull();
    expect(lerValidade('1', hoje)).toBeNull();
  });

  test('máscaras formatam enquanto a pessoa digita', () => {
    expect(mascaraCartao('4000000000000010')).toBe('4000 0000 0000 0010');
    expect(mascaraValidade('1230')).toBe('12/30');
    expect(mascaraCpf('52998224725')).toBe('529.982.247-25');
    expect(mascaraTelefone('35988515877')).toBe('(35) 98851-5877');
    expect(mascaraTelefone('3532223344')).toBe('(35) 3222-3344');
  });

  test('CPF com dígito verificador', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('529.982.247-24')).toBe(false);
  });

  test('parcelas: até 3x, limitadas pelo que a API permite', () => {
    expect(parcelasOpcoes(59.7, 3)).toEqual([
      { n: 1, valor: 59.7 },
      { n: 2, valor: 29.85 },
      { n: 3, valor: 19.9 },
    ]);
    expect(parcelasOpcoes(29.9, 2).map((o) => o.n)).toEqual([1, 2]);
    expect(parcelasOpcoes(9.9, 12).map((o) => o.n)).toEqual([1, 2, 3]);
    expect(parcelasOpcoes(9.9, 1)).toEqual([{ n: 1, valor: 9.9 }]);
  });
});

describe('roteiro', () => {
  test('o anual mostra quanto economiza frente a 12 mensais', () => {
    const planos = [
      { idassinatura: 1, nome: 'Mensal', descricao: null, valor: 19.9, periodicidade: 'mensal' as const, parcelas_max: 1 },
      { idassinatura: 2, nome: 'Anual', descricao: null, valor: 149.9, periodicidade: 'anual' as const, parcelas_max: 3 },
    ];
    expect(economiaAnual(planos)).toBe(37);
    expect(economiaAnual(planos.slice(0, 1))).toBe(0);
    expect(rotuloPeriodo('mensal')).toBe('por mês');
    expect(rotuloPeriodo('anual')).toBe('por ano');
  });

  test('itens agrupados por dia, em ordem, respeitando a ordem da API dentro do dia', () => {
    const item = (dia: number, titulo: string) => ({ dia, titulo, ordem: 0 }) as RoteiroItem;
    const dias = agruparPorDia([item(2, 'b1'), item(1, 'a1'), item(2, 'b2'), item(1, 'a2')]);
    expect(dias.map((d) => d.dia)).toEqual([1, 2]);
    expect(dias[0].itens.map((i) => i.titulo)).toEqual(['a1', 'a2']);
    expect(dias[1].itens.map((i) => i.titulo)).toEqual(['b1', 'b2']);
    expect(agruparPorDia([])).toEqual([]);
  });
});

describe('oferta sem preço', () => {
  test('a Central manda price 0 nas ofertas de cupom: não é "R$ 0,00"', () => {
    expect(temPreco({ price: 0 })).toBe(false);
    expect(temPreco({ price: null })).toBe(false);
    expect(temPreco({ price: 193.89 })).toBe(true);
  });
});
