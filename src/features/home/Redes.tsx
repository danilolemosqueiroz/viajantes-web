import {
  IconeFacebook,
  IconeInstagram,
  IconeTiktok,
  IconeYoutube,
} from '@/components/layout/IconesMarca';
import { useT } from '@/i18n/Traducao';
import { REDES_SOCIAIS } from './config';

const ICONES = {
  instagram: IconeInstagram,
  facebook: IconeFacebook,
  tiktok: IconeTiktok,
  youtube: IconeYoutube,
} as const;

/** Os perfis oficiais, no mesmo círculo contornado dos ícones do rodapé. */
export default function Redes() {
  const t = useT();

  return (
    <section aria-labelledby="redes-titulo" className="text-center">
      <h2 id="redes-titulo" className="text-secao font-bold text-brand">
        {t('Conheça nossas redes sociais')}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-nota font-light text-texto-2">
        {t('Dicas de destino, bastidores e novidades do Brasil todo dia. Segue a gente:')}
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-3">
        {REDES_SOCIAIS.map((rede) => {
          const Icone = ICONES[rede.id];
          return (
            <li key={rede.id}>
              <a
                href={rede.href}
                target="_blank"
                rel="noopener"
                className="chip gap-2 px-4 py-2.5 hover:border-brand"
              >
                <Icone size={16} />
                {rede.rotulo}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
