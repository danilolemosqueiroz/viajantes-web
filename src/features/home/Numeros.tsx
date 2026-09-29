import { Star } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { NUMEROS } from './config';
import { Sobrancelha, TituloSecao } from './Partes';

/** Prova social. A folha segue branca, separada por um filete,
 * e o destaque fica por conta do número grande em tinta verde. */
export default function Numeros() {
  const t = useT();

  return (
    <section aria-labelledby="numeros-titulo">
      <div className="max-w-2xl">
        <Sobrancelha Icone={Star}>{t('Comunidade')}</Sobrancelha>
        <TituloSecao id="numeros-titulo">
          {t('Uma comunidade que não para de descobrir o Brasil.')}
        </TituloSecao>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-heroi bg-borda lg:grid-cols-4">
        {NUMEROS.map((numero) => (
          <div key={numero.rotulo} className="bg-cartao px-5 py-7 text-center">
            <dt className="sr-only">{t(numero.rotulo)}</dt>
            <dd>
              <span className="block text-titulo font-bold leading-none text-brand sm:text-[2rem]">
                {t(numero.valor)}
              </span>
              <span className="mt-2 block text-nota font-light text-texto-2">{t(numero.rotulo)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
