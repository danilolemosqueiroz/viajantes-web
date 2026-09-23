import { useEffect, useId, useRef } from 'react';
import { MapPin, Navigation, Percent, X } from 'lucide-react';
import { IconeAppStore, IconeGooglePlay } from '@/components/layout/IconesMarca';
import { useT } from '@/i18n/Traducao';
import { LOJA_ANDROID, LOJA_IOS } from '@/lib/lojas';

/**
 * Convite para baixar o aplicativo, ao abrir um atrativo.
 *
 * É só um convite: "Continuar no site" (ou Esc, ou o X) fecha e a página fica
 * inteira, sem nada bloqueado. Quem decide quando mostrar é a página
 * (`convites.ts`): no 2º atrativo da visita, no máximo uma vez por semana.
 */
export default function ConviteApp({
  aberto,
  aoFechar,
  nome,
  capa,
}: {
  aberto: boolean;
  aoFechar: () => void;
  nome: string;
  capa: string | null;
}) {
  const t = useT();
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (aberto && !el.open) {
      el.showModal();
      el.focus();
    }
    if (!aberto && el.open) el.close();
  }, [aberto]);

  const fechar = () => dialogo.current?.close();

  // A loja do aparelho vem primeiro; no computador, a App Store.
  const android = /android/i.test(navigator.userAgent);
  const lojas = [
    { href: LOJA_IOS, rotulo: 'App Store', Icone: IconeAppStore },
    { href: LOJA_ANDROID, rotulo: 'Google Play', Icone: IconeGooglePlay },
  ];
  if (android) lojas.reverse();

  return (
    <dialog
      ref={dialogo}
      tabIndex={-1}
      aria-labelledby={idTitulo}
      className="modal-folha"
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fechar();
      }}
    >
      <div className="modal-folha__rolagem">
        <div className="relative h-32 overflow-hidden bg-brand sm:h-36">
          {capa && <img src={capa} alt="" className="absolute inset-0 size-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/45 to-brand/15" />
          <p className="absolute inset-x-5 bottom-3 line-clamp-2 text-nota font-semibold leading-snug text-white">
            {nome}
          </p>
          <button
            type="button"
            onClick={fechar}
            aria-label={t('Fechar')}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-pilula bg-white/90 text-brand shadow-flutua transition hover:bg-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 pt-5 sm:px-6">
          <div>
            <h2 id={idTitulo} className="text-secao font-bold leading-tight text-brand">
              {t('Baixe o aplicativo Viajantes')}
            </h2>
            <p className="mt-1 text-nota text-texto-2">{t('Este lugar e milhares de outros no seu celular.')}</p>
          </div>

          <ul className="space-y-2 text-nota text-texto-2">
            <li className="flex items-center gap-2.5">
              <Navigation size={15} className="shrink-0 text-acento" aria-hidden="true" />
              {t('Rota até o atrativo, mesmo sem sinal')}
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="shrink-0 text-acento" aria-hidden="true" />
              {t('Check-in nas cachoeiras')}
            </li>
            <li className="flex items-center gap-2.5">
              <Percent size={15} className="shrink-0 text-acento" aria-hidden="true" />
              {t('Roteiros prontos e descontos exclusivos')}
            </li>
          </ul>

          <div className="grid gap-2.5">
            {lojas.map(({ href, rotulo, Icone }, indice) => (
              <a
                key={rotulo}
                href={href}
                target="_blank"
                rel="noopener"
                onClick={fechar}
                className={indice === 0 ? 'botao-acao w-full' : 'botao-fio w-full'}
              >
                <Icone size={15} />
                {rotulo}
              </a>
            ))}
          </div>

          <div className="space-y-2 text-center">
            <button type="button" onClick={fechar} className="text-nota font-semibold text-texto-2 hover:text-brand hover:underline">
              {t('Continuar no site')}
            </button>
            <p className="text-mini text-texto-3">{t('Gratuito, para iPhone e Android.')}</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
