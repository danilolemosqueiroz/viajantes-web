import { useEffect, useRef, useState } from 'react';
import { SendHorizontal, Square } from 'lucide-react';
import { useT } from '@/i18n/Traducao';

const LIMITE = 2000;

/** Caixa de mensagem: Enter envia, Shift+Enter quebra a linha. Durante a resposta, o botão vira "parar". */
export default function Compositor({
  respondendo,
  aoEnviar,
  aoParar,
  textoInicial,
  focar,
}: {
  respondendo: boolean;
  aoEnviar: (texto: string) => void;
  aoParar: () => void;
  /** Devolve à caixa a pergunta que não chegou a ser respondida. */
  textoInicial?: { texto: string } | null;
  focar: boolean;
}) {
  const t = useT();
  const [texto, setTexto] = useState('');
  const campo = useRef<HTMLTextAreaElement>(null);

  // Pergunta devolvida (a resposta falhou): volta para a caixa, uma vez por falha.
  const [devolvido, setDevolvido] = useState(textoInicial);
  if (textoInicial !== devolvido) {
    setDevolvido(textoInicial);
    if (textoInicial) setTexto(textoInicial.texto);
  }

  useEffect(() => {
    if (focar) campo.current?.focus();
  }, [focar]);

  // Cresce com o texto até ~5 linhas.
  useEffect(() => {
    const el = campo.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [texto]);

  const limpo = texto.trim();
  const enviar = () => {
    if (!limpo || respondendo || limpo.length > LIMITE) return;
    aoEnviar(limpo);
    setTexto('');
  };

  return (
    <form
      className="flex items-end gap-2 border-t border-borda bg-cartao p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
    >
      <label className="sr-only" htmlFor="guia-mensagem">
        {t('Sua pergunta para o guia')}
      </label>
      <textarea
        id="guia-mensagem"
        ref={campo}
        rows={1}
        value={texto}
        maxLength={LIMITE}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            enviar();
          }
        }}
        placeholder={t('Pergunte sobre seu destino…')}
        className="campo max-h-36 flex-1 resize-none leading-snug"
      />
      {respondendo ? (
        <button
          type="button"
          onClick={aoParar}
          aria-label={t('Parar a resposta')}
          className="flex size-11 shrink-0 items-center justify-center rounded-pilula border border-fio-forte text-brand hover:bg-brand-suave"
        >
          <Square size={16} className="fill-current" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!limpo}
          aria-label={t('Enviar')}
          className="flex size-11 shrink-0 items-center justify-center rounded-pilula bg-acento text-white transition hover:bg-acento-escuro disabled:opacity-40"
        >
          <SendHorizontal size={18} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
