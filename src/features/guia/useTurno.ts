import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { enviarMensagem } from '@/lib/guia';
import { chaves } from './consultas';
import { comoEventoTurno, type Conversa, type ConversaComMensagens, type ErroGuia, type Mensagem, type RespostaTurno } from './tipos';

/** A resposta que está chegando agora. Some quando o `final` entra no cache da conversa. */
export interface TurnoAtual {
  conversaId: string;
  pergunta: string;
  mensagemId: string | null;
  texto: string;
  /** Rótulo da ferramenta em uso ("Procurando na base do Viajantes…"). */
  rotulo: string | null;
}

export type FalhaTurno = Pick<ErroGuia, 'status' | 'erro'> & { dados?: Record<string, unknown>; pergunta: string };

/** Um turno de conversa via SSE: inicio → ferramenta* → texto* → final | erro.
 * O `final` SUBSTITUI o texto acumulado (o serviço tira narração e marcações sem lastro). */
export function useTurno() {
  const cliente = useQueryClient();
  const [turno, setTurno] = useState<TurnoAtual | null>(null);
  const [falha, setFalha] = useState<FalhaTurno | null>(null);
  const controle = useRef<AbortController | null>(null);

  // Fechar o guia de vez (desmontar) cancela o turno; o serviço grava como "cancelada".
  useEffect(() => () => controle.current?.abort(), []);

  const concluir = useCallback(
    (conversaId: string, pergunta: string, r: RespostaTurno) => {
      const agora = new Date().toISOString();
      const doUsuario: Mensagem = {
        id: `local-${r.mensagem_id}`,
        papel: 'usuario',
        texto: pergunta,
        lugares: [],
        roteiro_id: null,
        status: 'ok',
        feedback: null,
        criada_em: agora,
      };
      const doGuia: Mensagem = {
        id: r.mensagem_id,
        papel: 'assistente',
        texto: r.texto,
        lugares: r.lugares,
        roteiro_id: r.roteiro_id,
        status: r.status,
        feedback: null,
        criada_em: agora,
      };
      cliente.setQueryData<ConversaComMensagens>(chaves.conversa(conversaId), (atual) =>
        atual ? { ...atual, mensagens: [...atual.mensagens, doUsuario, doGuia] } : atual,
      );
      cliente.setQueryData(chaves.saldo(), r.saldo);
      // O título nasce da primeira pergunta e a ordem da lista muda: recarrega a lista.
      cliente.invalidateQueries({ queryKey: chaves.conversas() });
    },
    [cliente],
  );

  const enviar = useCallback(
    async (conversa: Conversa, pergunta: string) => {
      controle.current?.abort();
      const abortar = new AbortController();
      controle.current = abortar;
      setFalha(null);
      setTurno({ conversaId: conversa.id, pergunta, mensagemId: null, texto: '', rotulo: null });

      let terminou = false;
      const resultado = await enviarMensagem(conversa.id, pergunta, {
        sinal: abortar.signal,
        aoEvento: (bruto) => {
          const e = comoEventoTurno(bruto);
          if (!e || abortar.signal.aborted) return;
          if (e.evento === 'inicio') setTurno((t) => t && { ...t, mensagemId: e.dados.mensagem_id });
          else if (e.evento === 'ferramenta') setTurno((t) => t && { ...t, rotulo: e.dados.rotulo });
          else if (e.evento === 'texto') setTurno((t) => t && { ...t, texto: t.texto + e.dados.delta, rotulo: null });
          else if (e.evento === 'final') {
            terminou = true;
            concluir(conversa.id, pergunta, e.dados);
            setTurno(null);
          } else if (e.evento === 'erro') {
            terminou = true;
            const { status, erro, ...resto } = e.dados;
            setFalha({ status, erro, dados: resto, pergunta });
            setTurno(null);
          }
        },
      });

      if (controle.current === abortar) controle.current = null;
      if (abortar.signal.aborted) {
        // Parado pela pessoa: o serviço gravou a resposta como cancelada; relê a conversa.
        setTurno(null);
        cliente.invalidateQueries({ queryKey: chaves.conversa(conversa.id) });
        return;
      }
      if (!resultado.ok) {
        setFalha({ status: resultado.status, erro: resultado.codigo ?? '', dados: resultado.dados, pergunta });
        setTurno(null);
      } else if (!terminou) {
        // O stream fechou sem `final` nem `erro` (proxy derrubou a conexão): relê do servidor.
        setFalha({ status: 0, erro: 'rede', pergunta });
        setTurno(null);
        cliente.invalidateQueries({ queryKey: chaves.conversa(conversa.id) });
      }
    },
    [cliente, concluir],
  );

  const parar = useCallback(() => controle.current?.abort(), []);
  const limparFalha = useCallback(() => setFalha(null), []);

  return { turno, falha, enviar, parar, limparFalha };
}
