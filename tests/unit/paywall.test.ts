import { describe, expect, it } from 'vitest';
import { descricaoParaMeta, estaBloqueado, linhasDoResumo } from '@/features/catalogo/paywall';
import { LOJA_ANDROID, LOJA_IOS, lojaComOrigem } from '@/lib/lojas';
import worker from '../../worker/index';

describe('paywall do site', () => {
  it('reconhece o atrativo cortado pela API', () => {
    expect(estaBloqueado({ bloqueado: 1 })).toBe(true);
    expect(estaBloqueado({ bloqueado: 0 })).toBe(false);
    expect(estaBloqueado({})).toBe(false);
  });

  it('meta description usa o resumo quando bloqueado', () => {
    expect(descricaoParaMeta({ bloqueado: 1, resumo: 'Poço verde.' }, 'texto inteiro', 'Cachoeira')).toBe('Poço verde.');
    expect(descricaoParaMeta({ bloqueado: 0, descricao: '' }, 'texto inteiro', 'Cachoeira')).toBe('texto inteiro');
    expect(descricaoParaMeta({ bloqueado: 1, resumo: '' }, '', 'Cachoeira')).toBe('Cachoeira');
  });

  it('linhas de números sem os zeros', () => {
    const t = (s: string, v?: Record<string, unknown>) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(v?.[k]));
    expect(linhasDoResumo({ regiao: null, atrativos: 120, cachoeiras: 0, beneficios: 8 }, t)).toEqual([
      '120 atrativos completos',
      '8 lugares com benefício para assinantes',
    ]);
    expect(linhasDoResumo({ regiao: null, atrativos: 1, cachoeiras: 1, beneficios: 1 }, t)).toEqual([
      '1 atrativo completo',
      '1 cachoeira com fotos, mapa e como chegar',
      '1 lugar com benefício para assinantes',
    ]);
  });
});

describe('ponte do QR', () => {
  it('leva a origem da campanha para as duas lojas', () => {
    expect(lojaComOrigem(true, 'qr-parceiro')).toBe(`${LOJA_IOS}?ct=qr-parceiro&mt=8`);
    expect(lojaComOrigem(false, 'qr-parceiro')).toBe(`${LOJA_ANDROID}&referrer=utm_source%3Dqr-parceiro%26utm_medium%3Dqr`);
  });

  it('o worker serve o .well-known como JSON', async () => {
    const env = {
      ORIGEM: 'https://origem.exemplo',
      ASSETS: { fetch: async () => new Response('{"applinks":{}}', { headers: { 'Content-Type': 'application/octet-stream' } }) },
    };
    const r = await worker.fetch(new Request('https://viajantesapp.com.br/.well-known/apple-app-site-association'), env);
    expect(r.status).toBe(200);
    expect(r.headers.get('Content-Type')).toBe('application/json');
    expect(await r.json()).toEqual({ applinks: {} });
  });
});
