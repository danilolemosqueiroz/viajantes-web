import { Link } from 'react-router-dom';
import { MapPin, Newspaper, User } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useRegiao } from '@/lib/regiao';
import PilulaBusca from './PilulaBusca';
import SeletorIdioma from './SeletorIdioma';
import { publico } from '@/lib/publico';
import { CONEXOES } from '@/features/home/config';

/**
 * Cabeçalho: folha branca com um filete embaixo — nada de faixa colorida.
 * O verde é tinta de título; aqui ele só aparece no logotipo e nos links.
 */
export default function Header() {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();

  return (
    <header className="z-40 border-b border-borda bg-cartao md:sticky md:top-0">
      <div className="folha">
        <div className="flex h-16 items-center gap-3">
          <Link to={href('/', idioma)} className="flex shrink-0 items-center" aria-label={t('Viajantes App')}>
            <img src={publico('images/logo-verde.png')} alt="Viajantes App" width={600} height={233} className="h-9 w-auto" />
          </Link>

          <div className="mx-auto hidden w-full max-w-md md:block">
            <PilulaBusca id="busca-topo" />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              to={href('/destinos', idioma)}
              className="flex min-h-10 items-center gap-1.5 rounded-pilula border border-borda px-3 text-mini font-semibold text-texto-2 transition hover:border-brand hover:text-brand"
            >
              <MapPin size={14} className="text-acento" aria-hidden="true" />
              <span className="max-w-28 truncate">{regiao ? regiao.nome : t('Todas as regiões')}</span>
            </Link>

            <a
              href={CONEXOES.blog}
              target="_blank"
              rel="noopener"
              className="hidden min-h-10 items-center gap-1.5 rounded-pilula border border-borda px-3 text-mini font-semibold text-texto-2 transition hover:border-brand hover:text-brand sm:flex"
            >
              <Newspaper size={14} className="text-acento" aria-hidden="true" />
              Blog
            </a>

            <SeletorIdioma />

            <Link
              to={href('/conta', idioma)}
              aria-label={t('Conta')}
              className="hidden min-h-10 min-w-10 items-center justify-center rounded-pilula text-texto-2 transition hover:bg-brand-suave hover:text-brand md:flex"
            >
              <User size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <PilulaBusca id="busca-celular" />
        </div>
      </div>
    </header>
  );
}
