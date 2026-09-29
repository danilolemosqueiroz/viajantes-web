import { useEffect, useRef } from 'react';
import { CircleAlert, MapPin, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import TextoGuia from './TextoGuia';
import CartaoRoteiro from './CartaoRoteiro';
import { CartoesLugares } from './lugares';
import type { ErroExibido } from './erros';
import type { Mensagem } from './tipos';
import type { TurnoAtual } from './useTurno';
import type { RegiaoDoGuia } from './contexto';

interface Props {
  mensagens: Mensagem[];
  carregando: boolean;
  turno: TurnoAtual | null;
  erro: ErroExibido | null;
  regiao: RegiaoDoGuia | null;
  sugestoes: string[];
  aoSugerir: (texto: string) => void;
  abrirLugar: (id: number) => void;
  aoAvaliar: (mensagemId: string, nota: 1 | -1) => void;
}

function Pensando({ rotulo }: { rotulo: string | null }) {
  const t = useT();
  return (
    <p className="flex items-center gap-2 text-mini text-texto-3" role="status">
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-bounce rounded-pilula bg-acento [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-pilula bg-acento [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-pilula bg-acento" />
      </span>
      {rotulo ? t(rotulo) : t('Pensando…')}
    </p>
  );
}

function DoUsuario({ texto }: { texto: string }) {
  return (
    <li className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-line rounded-heroi rounded-br-sm bg-brand-suave px-3.5 py-2 text-nota text-brand">
        {texto}
      </p>
    </li>
  );
}

function DoGuia({ m, abrirLugar, aoAvaliar }: { m: Mensagem; abrirLugar: (id: number) => void; aoAvaliar: Props['aoAvaliar'] }) {
  const t = useT();
  if (m.status === 'erro' || (m.status === 'cancelada' && !m.texto.trim())) {
    return (
      <li className="text-mini italic text-texto-3">
        {m.status === 'cancelada' ? t('Resposta interrompida.') : t('Não consegui responder esta mensagem.')}
      </li>
    );
  }
  return (
    <li>
      <TextoGuia texto={m.texto} lugares={m.lugares} abrir={abrirLugar} />
      <CartoesLugares lugares={m.lugares} abrir={abrirLugar} />
      {m.roteiro_id && <CartaoRoteiro id={m.roteiro_id} abrirLugar={abrirLugar} />}
      {(m.status === 'parcial' || m.status === 'cancelada') && (
        <p className="mt-1 text-mini italic text-texto-3">{t('Resposta incompleta.')}</p>
      )}
      <div className="mt-1.5 flex gap-1 text-texto-3">
        {([1, -1] as const).map((nota) => {
          const Icone = nota === 1 ? ThumbsUp : ThumbsDown;
          const marcado = m.feedback === nota;
          return (
            <button
              key={nota}
              type="button"
              aria-pressed={marcado}
              aria-label={nota === 1 ? t('Resposta útil') : t('Resposta não ajudou')}
              onClick={() => !marcado && aoAvaliar(m.id, nota)}
              className={`flex size-7 items-center justify-center rounded-pilula hover:bg-brand-suave ${marcado ? 'text-acento' : ''}`}
            >
              <Icone size={14} className={marcado ? 'fill-current' : ''} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </li>
  );
}

/** A conversa: mensagens salvas, a resposta que está chegando e, no começo, as sugestões. */
export default function Conversa({ mensagens, carregando, turno, erro, regiao, sugestoes, aoSugerir, abrirLugar, aoAvaliar }: Props) {
  const t = useT();
  const rolagem = useRef<HTMLDivElement>(null);
  const vazia = !carregando && mensagens.length === 0 && !turno;

  // Acompanha o fim da conversa enquanto a resposta chega.
  useEffect(() => {
    const el = rolagem.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens.length, turno?.texto, turno?.rotulo, erro]);

  return (
    <div ref={rolagem} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
      {carregando && <p className="text-center text-mini text-texto-3">{t('Carregando...')}</p>}

      {vazia && (
        <div className="flex flex-col items-center pt-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-pilula bg-acento-suave text-acento">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <p className="mt-3 text-base font-semibold text-brand">{t('Para onde vamos?')}</p>
          <p className="mt-1 max-w-xs text-nota text-texto-2">
            {t('Pergunte sobre atrativos, hospedagem, onde comer ou peça um roteiro. Eu respondo com o que está no Viajantes.')}
          </p>
          {regiao && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-pilula bg-brand-suave px-3 py-1 text-mini font-semibold text-brand">
              <MapPin size={12} aria-hidden="true" />
              {regiao.nome}
            </p>
          )}
          {sugestoes.length > 0 && (
            <ul className="mt-4 flex w-full flex-col gap-2">
              {sugestoes.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => aoSugerir(s)}
                    className="w-full rounded-cartao border border-borda px-3 py-2 text-left text-nota text-texto hover:border-acento hover:bg-acento-suave"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ul className="space-y-4">
        {mensagens.map((m) =>
          m.papel === 'usuario' ? (
            <DoUsuario key={m.id} texto={m.texto} />
          ) : (
            <DoGuia key={m.id} m={m} abrirLugar={abrirLugar} aoAvaliar={aoAvaliar} />
          ),
        )}
        {turno && (
          <>
            <DoUsuario texto={turno.pergunta} />
            <li aria-live="polite" aria-busy="true">
              {turno.texto ? <TextoGuia texto={turno.texto} lugares={null} abrir={abrirLugar} /> : null}
              {(!turno.texto || turno.rotulo) && (
                <div className={turno.texto ? 'mt-2' : ''}>
                  <Pensando rotulo={turno.rotulo} />
                </div>
              )}
            </li>
          </>
        )}
      </ul>

      {erro && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-cartao bg-erro/10 p-3 text-nota text-erro">
          <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {erro.texto}
        </p>
      )}
    </div>
  );
}
