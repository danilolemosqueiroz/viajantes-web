/** O que o Guia Viajantes (`viajantes-ia`) devolve. Espelha `docs/INTEGRACAO.md` do serviço. */

export interface Conversa {
  id: string;
  titulo: string | null;
  regiao_id: number | null;
  total_mensagens: number;
  criada_em: string;
  atualizada_em: string;
}

/** Cartão de um lugar citado na resposta. Os dados vêm da base, nunca do texto do modelo. */
export interface CartaoLugar {
  id: number;
  nome: string;
  tipo: string;
  cidade: string | null;
  capa_url: string | null;
  nota: number | null;
  avaliacoes: number;
  /** Link `wa.me` pronto. */
  whatsapp: string | null;
  link_site: string;
  passaporte: boolean;
  desconto_percentual: number | null;
}

export interface Mensagem {
  id: string;
  papel: 'usuario' | 'assistente';
  texto: string;
  lugares: CartaoLugar[];
  roteiro_id: string | null;
  status: 'ok' | 'erro' | 'cancelada' | 'parcial';
  feedback: -1 | 1 | null;
  criada_em: string;
}

export interface ConversaComMensagens {
  conversa: Conversa;
  mensagens: Mensagem[];
}

export interface EstadoSaldo {
  periodo: string;
  limite_usd: number;
  usado_usd: number;
  restante_usd: number;
  percentual_usado: number;
  mensagens_hoje: number;
  limite_diario: number;
  estimativa_mensagens_restantes: number;
  renova_em: string;
}

export interface RespostaTurno {
  mensagem_id: string;
  conversa_id: string;
  texto: string;
  lugares: CartaoLugar[];
  roteiro_id: string | null;
  status: 'ok' | 'parcial';
  saldo: EstadoSaldo;
}

export interface ErroGuia {
  erro: string;
  message: string;
  status: number;
  renova_em?: string;
}

export type EventoTurno =
  | { evento: 'inicio'; dados: { mensagem_id: string; conversa_id: string } }
  | { evento: 'ferramenta'; dados: { nome: string; rotulo: string } }
  | { evento: 'texto'; dados: { delta: string } }
  | { evento: 'final'; dados: RespostaTurno }
  | { evento: 'erro'; dados: ErroGuia };

const EVENTOS = new Set(['inicio', 'ferramenta', 'texto', 'final', 'erro']);

/** Aceita só os eventos conhecidos, com corpo de objeto. O resto é ignorado. */
export function comoEventoTurno(e: { evento: string; dados: unknown }): EventoTurno | null {
  if (!EVENTOS.has(e.evento) || !e.dados || typeof e.dados !== 'object') return null;
  return e as EventoTurno;
}

export type Periodo = 'manha' | 'almoco' | 'tarde' | 'noite' | 'hospedagem';

/** Roteiro que o guia salvou (`GET /v1/roteiros/:id`). */
export interface RoteiroGuia {
  id: string;
  titulo: string;
  regiao_id: number | null;
  criado_em: string;
  dados: {
    titulo: string;
    resumo?: string;
    perfil?: string;
    dicas?: string[];
    avisos?: string[];
    dias: {
      dia: number;
      titulo?: string;
      itens: {
        periodo: Periodo;
        horario?: string | null;
        atividade: string;
        observacao?: string | null;
        lugar_id?: number | null;
        lugar?: { id: number; nome: string; tipo: string; cidade: string | null; capa_url: string | null; whatsapp: string | null } | null;
        km_do_anterior?: number | null;
      }[];
    }[];
  };
}
