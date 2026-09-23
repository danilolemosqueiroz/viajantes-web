import { Zap } from 'lucide-react';
import { IconeAppStore, IconeGooglePlay } from '@/components/layout/IconesMarca';
import { useT } from '@/i18n/Traducao';
import { LOJA_ANDROID, LOJA_IOS } from '@/lib/lojas';
import { Sobrancelha, TituloSecao } from './Partes';
import { publico } from '@/lib/publico';

/**
 * Download do aplicativo. O `id` é o alvo do botão "Baixar o aplicativo" da
 * abertura e do fechamento da página.
 */
export default function Aplicativo() {
  const t = useT();

  return (
    <section id="baixar-o-app" className="scroll-mt-20" aria-labelledby="app-titulo">
      <div className="recuo grid items-center gap-8 p-8 sm:p-10 md:grid-cols-2">
        <div>
          <Sobrancelha Icone={Zap}>{t('Aplicativo')}</Sobrancelha>
          <TituloSecao id="app-titulo">{t('Leve o Viajantes com você.')}</TituloSecao>
          <p className="mt-4 text-corpo font-light leading-relaxed text-texto-2">
            {t(
              'Descubra lugares, consulte informações e planeje sua próxima experiência direto do celular — com rota traçada até a cachoeira, mesmo sem sinal.',
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a href={LOJA_IOS} target="_blank" rel="noopener" className="botao">
              <IconeAppStore size={15} />
              App Store
            </a>
            <a href={LOJA_ANDROID} target="_blank" rel="noopener" className="botao-acao">
              <IconeGooglePlay size={15} />
              Google Play
            </a>
          </div>

          <p className="mt-3 text-mini text-texto-3">{t('Gratuito, para iPhone e Android.')}</p>
        </div>

        <div className="flex justify-center">
          {/* Moldura de celular em CSS: o filete grosso e o canto bem redondo
              bastam para ler como aparelho, sem uma imagem de moldura. */}
          <div className="w-52 overflow-hidden rounded-[2rem] border-[6px] border-brand bg-brand shadow-flutua sm:w-60">
            <img
              src={publico('images/app-screenshot.jpg')}
              alt={t('Tela do aplicativo Viajantes App')}
              width={720}
              height={1513}
              loading="lazy"
              decoding="async"
              className="block size-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
