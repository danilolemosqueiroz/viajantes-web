import { Compass } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { B2B } from './config';
import { Sobrancelha, TituloSecao } from './Partes';

/** Área B2B. Vem depois de todo o conteúdo do viajante, de propósito:
 * a home é para quem viaja, e quem vende só precisa achar a entrada no fim dela. */
export default function Parceiros() {
  const t = useT();

  return (
    <section aria-labelledby="parceiros-titulo">
      <div className="flex flex-col gap-8 border-y border-borda py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-2xl">
          <Sobrancelha Icone={Compass}>{t('Para o turismo')}</Sobrancelha>
          <TituloSecao id="parceiros-titulo">{t('Você faz parte do turismo da sua região?')}</TituloSecao>
          <p className="mt-3 text-nota font-light leading-relaxed text-texto-2">
            {t(
              'Guias, agências, hospedagens, restaurantes e negócios turísticos também podem fazer parte do Viajantes.',
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a href={B2B.cadastro} target="_blank" rel="noopener" className="botao-acao">
              {t('Cadastre seu negócio')}
            </a>
            <a href={B2B.mapeador} target="_blank" rel="noopener" className="botao-fio">
              {t('Ajude a mapear sua região')}
            </a>
          </div>
        </div>

        {/* nocookie: o site atende cinco idiomas, e o embed normal grava rastreador antes do play. */}
        <div className="w-full shrink-0 overflow-hidden rounded-cartao border border-borda bg-brand lg:w-[26rem]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${B2B.video}`}
            title={t('Vídeo: como funciona o Viajantes para negócios de turismo')}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
