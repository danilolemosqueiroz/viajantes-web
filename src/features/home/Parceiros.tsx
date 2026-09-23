import { Compass } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { B2B } from './config';
import { Sobrancelha, TituloSecao } from './Partes';

/**
 * Área B2B — vem depois de toda a experiência do viajante, de propósito: a
 * home é para quem viaja; quem vende só precisa encontrar a porta no fim.
 */
export default function Parceiros() {
  const t = useT();

  return (
    <section aria-labelledby="parceiros-titulo">
      <div className="flex flex-col gap-6 border-y border-borda py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <Sobrancelha Icone={Compass}>{t('Para o turismo')}</Sobrancelha>
          <TituloSecao id="parceiros-titulo">{t('Você faz parte do turismo da sua região?')}</TituloSecao>
          <p className="mt-3 text-nota font-light leading-relaxed text-texto-2">
            {t(
              'Guias, agências, hospedagens, restaurantes e negócios turísticos também podem fazer parte do Viajantes.',
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={B2B.cadastro} target="_blank" rel="noopener" className="botao-acao">
            {t('Cadastre seu negócio')}
          </a>
          <a href={B2B.mapeador} target="_blank" rel="noopener" className="botao-fio">
            {t('Ajude a mapear sua região')}
          </a>
        </div>
      </div>
    </section>
  );
}
