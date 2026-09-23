import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { useT } from '@/i18n/Traducao';

export interface FotoGaleria {
  id: number | string;
  url: string;
  legenda?: string;
}

/**
 * Grade de fotos do mesmo tamanho, de 12 em 12 (há empresa com 50+ fotos), e
 * um visor de tela inteira ao tocar numa delas — as setas do teclado trocam.
 */
export default function Galeria({
  fotos,
  nome,
  porPagina = 12,
}: {
  fotos: FotoGaleria[];
  /** Nome do lugar, para o texto alternativo. */
  nome: string;
  porPagina?: number;
}) {
  const t = useT();
  const [visiveis, setVisiveis] = useState(porPagina);
  const [aberta, setAberta] = useState<number | null>(null);
  const visor = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = visor.current;
    if (!el) return;
    if (aberta !== null && !el.open) {
      el.showModal();
      el.focus();
    }
    if (aberta === null && el.open) el.close();
  }, [aberta]);

  if (fotos.length === 0) return null;

  const restantes = fotos.length - visiveis;
  const atual = aberta === null ? null : fotos[aberta];
  const anterior = () => setAberta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));
  const proxima = () => setAberta((i) => (i === null ? null : (i + 1) % fotos.length));

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fotos.slice(0, visiveis).map((foto, indice) => (
          <li key={foto.id}>
            <button
              type="button"
              onClick={() => setAberta(indice)}
              aria-label={foto.legenda || t('Ampliar foto')}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-cartao bg-brand-suave"
            >
              <img
                src={foto.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              {foto.legenda && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6 text-left text-mini font-semibold text-white">
                  {foto.legenda}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {restantes > 0 && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setVisiveis((n) => n + porPagina)} className="botao-fio">
            <Images size={15} aria-hidden="true" />
            {t('Ver mais fotos ({{n}})', { n: restantes })}
          </button>
        </div>
      )}

      <dialog
        ref={visor}
        tabIndex={-1}
        aria-label={`${nome} — ${t('Fotos')}`}
        className="visor-foto"
        onClose={() => setAberta(null)}
        // Clique fora da foto (e fora dos botões) fecha.
        onClick={(evento) => {
          if (!(evento.target as HTMLElement).closest('img, button')) setAberta(null);
        }}
        onKeyDown={(evento) => {
          if (evento.key === 'ArrowLeft') anterior();
          if (evento.key === 'ArrowRight') proxima();
        }}
      >
        {atual && (
          <figure className="flex h-full w-full flex-col items-center justify-center">
            <img src={atual.url} alt={atual.legenda ? `${atual.legenda} — ${nome}` : nome} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-center text-nota">
              {atual.legenda && <span className="block font-semibold">{atual.legenda}</span>}
              {t('Foto {{n}} de {{total}}', { n: (aberta ?? 0) + 1, total: fotos.length })}
            </figcaption>
          </figure>
        )}

        <button
          type="button"
          onClick={() => setAberta(null)}
          aria-label={t('Fechar')}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-pilula bg-white/15 text-white transition hover:bg-white/30"
        >
          <X size={22} aria-hidden="true" />
        </button>
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label={t('Foto anterior')}
              className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-pilula bg-white/15 text-white transition hover:bg-white/30"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={proxima}
              aria-label={t('Próxima foto')}
              className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-pilula bg-white/15 text-white transition hover:bg-white/30"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
