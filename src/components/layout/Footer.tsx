import { Link } from 'react-router-dom';
import {
  IconeAppStore,
  IconeFacebook,
  IconeGooglePlay,
  IconeInstagram,
  IconeTiktok,
  IconeYoutube,
} from './IconesMarca';
import { CONEXOES, REDES_SOCIAIS } from '@/features/home/config';
import { CATEGORIAS } from '@/i18n/categorias';
import { href, hrefCategoria, type RotaFixa } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { LOJA_ANDROID, LOJA_IOS } from '@/lib/lojas';

/**
 * Os perfis saem de `features/home/config.ts`, a mesma lista da seção de redes
 * da home — antes o rodapé apontava para os perfis antigos
 * (@viajantesdacanastra) e a home, para os oficiais.
 */
const ICONES = {
  instagram: IconeInstagram,
  facebook: IconeFacebook,
  tiktok: IconeTiktok,
  youtube: IconeYoutube,
} as const;

/**
 * Rodapé — o fim da folha, não outro produto.
 *
 * Fundo quase branco, um filete em cima, títulos em tinta verde e os círculos
 * das redes com o mesmo contorno dos círculos de categoria do topo.
 */
export default function Footer() {
  const t = useT();
  const idioma = useIdioma();

  const colunas = [
    { titulo: t('O que fazer'), categorias: CATEGORIAS.slice(0, 5) },
    { titulo: t('Também'), categorias: CATEGORIAS.slice(5) },
  ];

  const institucional: { rota: RotaFixa; rotulo: string }[] = [
    { rota: '/roteiros', rotulo: t('Roteiros') },
    { rota: '/destinos', rotulo: t('Destinos') },
    { rota: '/ofertas', rotulo: t('Viajantes Recomenda') },
    { rota: '/mapeadores', rotulo: t('Ranking de Mapeadores') },
    { rota: '/sobre', rotulo: t('Sobre Nós') },
    { rota: '/contato', rotulo: t('Fale Conosco') },
    { rota: '/termos', rotulo: t('Termos e condições') },
    { rota: '/privacidade', rotulo: t('Política de Privacidade') },
  ];

  return (
    <footer className="mt-16 border-t border-borda bg-papel-2">
      <div className="folha py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {colunas.map((coluna) => (
            <nav key={coluna.titulo} aria-label={coluna.titulo}>
              <h3 className="text-mini font-bold uppercase tracking-[0.13em] text-brand">{coluna.titulo}</h3>
              <ul className="mt-3 space-y-2 text-nota text-texto-2">
                {coluna.categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <Link to={hrefCategoria(categoria, idioma)} className="transition hover:text-brand">
                      {t(categoria.tituloCurto)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label={t('Viajantes App')}>
            <h3 className="text-mini font-bold uppercase tracking-[0.13em] text-brand">{t('Viajantes App')}</h3>
            <ul className="mt-3 space-y-2 text-nota text-texto-2">
              {institucional.map(({ rota, rotulo }) => (
                <li key={rota}>
                  <Link to={href(rota, idioma)} className="transition hover:text-brand">
                    {rotulo}
                  </Link>
                </li>
              ))}
              <li>
                <a href={CONEXOES.blog} target="_blank" rel="noopener" className="transition hover:text-brand">
                  Blog Viajantes
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-mini font-bold uppercase tracking-[0.13em] text-brand">{t('Baixar o aplicativo')}</h3>
            <div className="mt-3 flex flex-col items-start gap-2">
              <a href={LOJA_IOS} target="_blank" rel="noopener" className="chip">
                <IconeAppStore size={14} />
                App Store
              </a>
              <a href={LOJA_ANDROID} target="_blank" rel="noopener" className="chip">
                <IconeGooglePlay size={14} />
                Google Play
              </a>
            </div>

            <h3 className="mt-6 text-mini font-bold uppercase tracking-[0.13em] text-brand">{t('Siga')}</h3>
            <ul className="mt-3 flex gap-2">
              {REDES_SOCIAIS.map(({ id, href: link, rotulo }) => {
                const Icone = ICONES[id];
                return (
                <li key={rotulo}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener"
                    aria-label={rotulo}
                    className="flex size-10 items-center justify-center rounded-pilula border border-fio-forte text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                  >
                    <Icone size={16} />
                  </a>
                </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-borda pt-6 text-mini text-texto-3">
          © {new Date().getFullYear()} Viajantes App
        </p>
      </div>
    </footer>
  );
}
