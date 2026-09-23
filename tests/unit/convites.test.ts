import { beforeEach, describe, expect, it } from 'vitest';
import {
  ATRATIVO_DO_CONVITE_APP,
  DIAS_ENTRE_CONVITES_APP,
  decidirConviteAoAbrir,
  escolherConvite,
  marcarConviteContaDispensado,
} from '@/features/catalogo/convites';

/** Qual convite aparece ao abrir um atrativo: conta sempre, app de vez em quando. */

const DIA = 24 * 60 * 60 * 1000;
const AGORA = Date.UTC(2026, 8, 23, 12);
const nunca = { appEm: null, contaEm: null };

describe('escolherConvite', () => {
  it('quem não está logado vê o convite de conta em toda abertura', () => {
    expect(escolherConvite(false, { vistos: 1, ...nunca }, AGORA)).toBe('conta');
    expect(escolherConvite(false, { vistos: 3, appEm: AGORA - DIA, contaEm: AGORA - 1000 }, AGORA)).toBe('conta');
  });

  it('o app passa na frente no 2º atrativo da visita, e não volta por 7 dias', () => {
    expect(escolherConvite(false, { vistos: ATRATIVO_DO_CONVITE_APP - 1, ...nunca }, AGORA)).toBe('conta');
    expect(escolherConvite(false, { vistos: ATRATIVO_DO_CONVITE_APP, ...nunca }, AGORA)).toBe('app');
    expect(escolherConvite(false, { vistos: ATRATIVO_DO_CONVITE_APP, appEm: AGORA - DIA, contaEm: null }, AGORA)).toBe('conta');
    expect(
      escolherConvite(false, { vistos: 9, appEm: AGORA - (DIAS_ENTRE_CONVITES_APP + 1) * DIA, contaEm: null }, AGORA),
    ).toBe('app');
  });

  it('quem está logado só vê o app, já no primeiro atrativo, e depois nada', () => {
    expect(escolherConvite(true, { vistos: 1, ...nunca }, AGORA)).toBe('app');
    expect(escolherConvite(true, { vistos: 2, appEm: AGORA - DIA, contaEm: null }, AGORA)).toBeNull();
  });

  it('sem memória (armazenamento bloqueado) não insiste: só o convite de conta', () => {
    expect(escolherConvite(false, { vistos: 0, ...nunca }, AGORA)).toBe('conta');
    expect(escolherConvite(true, { vistos: 0, ...nunca }, AGORA)).toBeNull();
  });
});

describe('decidirConviteAoAbrir', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('conta, app, conta, conta… ao longo da visita de quem não está logado', () => {
    expect(decidirConviteAoAbrir(false, AGORA)).toBe('conta');
    expect(decidirConviteAoAbrir(false, AGORA)).toBe('app');
    expect(decidirConviteAoAbrir(false, AGORA)).toBe('conta');
    expect(decidirConviteAoAbrir(false, AGORA)).toBe('conta');
  });

  it('marca a data do app ao MOSTRAR; numa aba nova ele só volta depois de 7 dias', () => {
    expect(decidirConviteAoAbrir(true, AGORA)).toBe('app');

    sessionStorage.clear(); // aba nova, sem responder ao convite
    expect(decidirConviteAoAbrir(true, AGORA + DIA)).toBeNull();

    sessionStorage.clear();
    expect(decidirConviteAoAbrir(true, AGORA + (DIAS_ENTRE_CONVITES_APP + 1) * DIA)).toBe('app');
  });

  it('dispensar o convite de conta fica guardado (é o que dá o respiro, se configurado)', () => {
    marcarConviteContaDispensado(AGORA);
    expect(localStorage.getItem('vj_convite_conta_em')).toBe(String(AGORA));
  });
});
