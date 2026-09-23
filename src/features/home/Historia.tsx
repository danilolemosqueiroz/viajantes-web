import { ArrowRight, Heart } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { HISTORIA_HREF } from './config';
import { Sobrancelha, TituloSecao } from './Partes';
import { publico } from '@/lib/publico';

/** Como o aplicativo começou — o texto institucional curto, com a foto real. */
export default function Historia() {
  const t = useT();

  return (
    <section className="grid items-center gap-8 md:grid-cols-2" aria-labelledby="historia-titulo">
      <div className="order-last overflow-hidden rounded-heroi bg-brand-suave md:order-first">
        <img
          src={publico('images/viajantes-camper.jpg')}
          alt={t('Danilo e Brenda ao lado do camper do Viajantes App, em meio à mata')}
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] size-full object-cover"
        />
      </div>

      <div>
        <Sobrancelha Icone={Heart}>{t('Nossa história')}</Sobrancelha>
        <TituloSecao id="historia-titulo">{t('O Viajantes nasceu viajando.')}</TituloSecao>

        <div className="mt-4 space-y-3 text-nota font-light leading-relaxed text-texto-2">
          <p>{t('Antes de existir um aplicativo, existiam duas pessoas tentando descobrir o Brasil.')}</p>
          <p>
            {t(
              'Danilo e Brenda deixaram carreiras consolidadas para viver a estrada. Viajaram de barraca, trailer e camper, conhecendo destinos e percebendo um problema que se repetia: alguns dos lugares mais incríveis do Brasil também eram os mais difíceis de descobrir e planejar.',
            )}
          </p>
          <p>
            <span className="font-semibold text-brand">{t('Começamos mapeando a Serra da Canastra.')}</span>{' '}
            {t('Depois vieram novas cidades, regiões e milhares de lugares.')}
          </p>
          <p>{t('O que começou como uma necessidade nossa se transformou no Viajantes App.')}</p>
        </div>

        <a
          href={HISTORIA_HREF}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex items-center gap-1.5 text-nota font-semibold text-acento-escuro hover:underline"
        >
          {t('Conheça nossa história')}
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
