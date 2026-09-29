/** Qual convite aparece ao abrir um atrativo. Conta: em toda abertura para quem não está logado.
 * App: no 2º atrativo da visita (ou no 1º para logado), e depois não volta por 7 dias. */
export type Convite = 'conta' | 'app' | null;

/** Em que atrativo da visita o app é convidado, para quem não está logado. */
export const ATRATIVO_DO_CONVITE_APP = 2;
/** Dias sem repetir o convite do app. */
export const DIAS_ENTRE_CONVITES_APP = 7;
/** Minutos sem repetir o convite de conta depois de dispensado. 0 = toda abertura. */
export const RESPIRO_CONTA_MIN = 0;

export interface MemoriaConvites {
  /** Atrativos abertos nesta aba, contando este. 0 = sem memória. */
  vistos: number;
  /** Quando o convite do app apareceu pela última vez (ms), ou nunca. */
  appEm: number | null;
  /** Quando o convite de conta foi dispensado pela última vez (ms), ou nunca. */
  contaEm: number | null;
}

const DIA = 24 * 60 * 60 * 1000;
const MINUTO = 60 * 1000;

/** A regra, como função pura: qual convite esta página mostra. */
export function escolherConvite(logado: boolean, memoria: MemoriaConvites, agora = Date.now()): Convite {
  const { vistos, appEm, contaEm } = memoria;

  const vezDoApp = vistos >= (logado ? 1 : ATRATIVO_DO_CONVITE_APP);
  const appDescansou = appEm === null || agora - appEm >= DIAS_ENTRE_CONVITES_APP * DIA;
  if (vezDoApp && appDescansou) return 'app';

  if (logado) return null;
  const contaDescansou =
    RESPIRO_CONTA_MIN === 0 || contaEm === null || agora - contaEm >= RESPIRO_CONTA_MIN * MINUTO;
  return contaDescansou ? 'conta' : null;
}

/** Atrativos abertos nesta aba. Fechar a aba zera. */
const CHAVE_VISTOS = 'vj_atrativos_vistos';
/** Datas em milissegundos; sobrevivem à visita. */
const CHAVE_APP_EM = 'vj_convite_app_em';
const CHAVE_CONTA_EM = 'vj_convite_conta_em';

function lerData(chave: string): number | null {
  const valor = Number(localStorage.getItem(chave));
  return valor > 0 ? valor : null;
}

function gravarData(chave: string, valor: number): void {
  try {
    localStorage.setItem(chave, String(valor));
  } catch {
    /* armazenamento bloqueado: o estado da página segura o resto da visita */
  }
}

/** Conta mais um atrativo aberto e diz qual convite mostrar. Chamar uma vez por atrativo.
 * Se for a vez do app, a data já fica marcada ao mostrar. */
export function decidirConviteAoAbrir(logado: boolean, agora = Date.now()): Convite {
  let memoria: MemoriaConvites;
  try {
    const vistos = (Number(sessionStorage.getItem(CHAVE_VISTOS)) || 0) + 1;
    sessionStorage.setItem(CHAVE_VISTOS, String(vistos));
    memoria = { vistos, appEm: lerData(CHAVE_APP_EM), contaEm: lerData(CHAVE_CONTA_EM) };
  } catch {
    memoria = { vistos: 0, appEm: null, contaEm: null };
  }

  const convite = escolherConvite(logado, memoria, agora);
  if (convite === 'app') gravarData(CHAVE_APP_EM, agora);
  return convite;
}

/** O convite de conta foi fechado sem entrar. */
export function marcarConviteContaDispensado(agora = Date.now()): void {
  gravarData(CHAVE_CONTA_EM, agora);
}
