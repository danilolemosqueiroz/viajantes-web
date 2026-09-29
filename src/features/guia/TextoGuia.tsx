import { Fragment, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { analisarTexto, type Bloco, type Trecho } from './texto';
import { SeloLugar } from './lugares';
import type { CartaoLugar } from './tipos';

interface Props {
  texto: string;
  /** `null` enquanto a resposta chega: as marcações ficam escondidas até o `final`. */
  lugares: CartaoLugar[] | null;
  abrir: (id: number) => void;
}

function Trechos({ trechos, porId, abrir }: { trechos: Trecho[]; porId: Map<number, CartaoLugar>; abrir: (id: number) => void }) {
  return trechos.map((tr, i) => {
    if (tr.tipo === 'texto') return <Fragment key={i}>{tr.texto}</Fragment>;
    if (tr.tipo === 'negrito')
      return (
        <strong key={i} className="font-semibold text-brand">
          <Trechos trechos={tr.filhos} porId={porId} abrir={abrir} />
        </strong>
      );
    if (tr.tipo === 'italico')
      return (
        <em key={i}>
          <Trechos trechos={tr.filhos} porId={porId} abrir={abrir} />
        </em>
      );
    const lugar = porId.get(tr.id);
    return lugar ? <SeloLugar key={i} lugar={lugar} abrir={abrir} /> : null;
  });
}

function Blocos({ blocos, porId, abrir }: { blocos: Bloco[]; porId: Map<number, CartaoLugar>; abrir: (id: number) => void }) {
  return blocos.map((b, i) => {
    if (b.tipo === 'titulo')
      return (
        <h3 key={i} className="mt-3 text-base font-bold text-brand first:mt-0">
          <Trechos trechos={b.trechos} porId={porId} abrir={abrir} />
        </h3>
      );
    if (b.tipo === 'lista') {
      const Lista = b.ordenada ? 'ol' : 'ul';
      return (
        <Lista key={i} className={`space-y-1 pl-5 ${b.ordenada ? 'list-decimal' : 'list-disc'} marker:text-acento`}>
          {b.itens.map((item, j) => (
            <li key={j}>
              <Trechos trechos={item} porId={porId} abrir={abrir} />
            </li>
          ))}
        </Lista>
      );
    }
    return (
      <p key={i} className="whitespace-pre-line">
        <Trechos trechos={b.trechos} porId={porId} abrir={abrir} />
      </p>
    );
  });
}

/** Resposta do guia desenhada como texto do React: nada vira HTML. */
export default function TextoGuia({ texto, lugares, abrir }: Props) {
  const t = useT();
  const porId = useMemo(() => new Map((lugares ?? []).map((l) => [l.id, l])), [lugares]);
  const { blocos, foraDoApp } = useMemo(
    () => analisarTexto(texto, lugares ? new Set(porId.keys()) : null),
    [texto, lugares, porId],
  );

  return (
    <div className="space-y-2 text-nota leading-relaxed text-texto">
      <Blocos blocos={blocos} porId={porId} abrir={abrir} />
      {foraDoApp && (
        <aside className="recuo mt-3 space-y-2 p-3 text-texto-2">
          <p className="flex items-center gap-1.5 text-mini font-bold uppercase tracking-[0.1em] text-texto-3">
            <Globe size={13} aria-hidden="true" />
            {t('Fora do app')}
          </p>
          <Blocos blocos={foraDoApp} porId={porId} abrir={abrir} />
        </aside>
      )}
    </div>
  );
}
