/**
 * Qual convite aparece ao abrir um atrativo — e quando.
 *
 * Dois convites para UMA cadeira: nunca há dois na mesma página.
 *
 *  - **Conta** (entrar ou criar): quem não está logado vê em TODA abertura de
 *    atrativo — é o pedido do cliente. Para dar um respiro entre um e outro,
 *    basta subir `RESPIRO_CONTA_MIN`.
 *  - **App** (baixar): é a vez dele no 2º atrativo da visita (quem chegou do
 *    Google e clicou num segundo lugar já mostrou interesse), ou logo no 1º
 *    para quem está logado — e não volta por 7 dias, nem em visita nova.
 *    Quando é a vez do app, ele passa na frente da conta.
 *
 * Sem memória (armazenamento bloqueado) o site não insiste: mostra só o que
 * não depende de lembrar, que é o convite de conta.
 */
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

/** A regra, pura: quem senta na cadeira desta página. */
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

/** Atrativos abertos nesta aba — fechar a aba zera. */
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

/**
 * Conta mais um atrativo aberto e diz qual convite mostrar. Chamar UMA vez
 * por atrativo aberto. Se for a vez do app, a data já fica marcada ao
 * MOSTRAR: quem fecha a aba sem responder também não o vê de novo.
 */
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
