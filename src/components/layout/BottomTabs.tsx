import { Compass, House, Map, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';

/**
 * Barra de abas do celular — a mesma do aplicativo, inclusive nos detalhes que
 * a pessoa não sabe que está vendo: cantos de cima arredondados em 10px, fundo
 * branco sem borda dura e a aba ativa em LARANJA (no app, verde é tinta de
 * título; laranja é o que está ativo ou é ação).
 */
const ABAS = [
  { rota: '/', rotulo: 'Início', Icone: House },
  { rota: '/destinos', rotulo: 'Explorar', Icone: Compass },
  { rota: '/roteiros', rotulo: 'Roteiros', Icone: Map },
  { rota: '/conta', rotulo: 'Conta', Icone: User },
] as const;

export default function BottomTabs() {
  const { pathname } = useLocation();
  const idioma = useIdioma();
  const t = useT();

  return (
    <nav
      aria-label={t('Navegação principal')}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 rounded-t-cartao bg-cartao pb-[env(safe-area-inset-bottom)] shadow-flutua md:hidden"
    >
      {ABAS.map(({ rota, rotulo, Icone }) => {
        const destino = href(rota, idioma);
        const atual = rota === '/' ? pathname === destino : pathname.startsWith(destino);
        return (
          <Link
            key={rota}
            to={destino}
            aria-current={atual ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1 text-mini ${
              atual ? 'font-semibold text-acento' : 'text-texto-3'
            }`}
          >
            <Icone size={21} strokeWidth={atual ? 2.2 : 1.7} aria-hidden="true" />
            {t(rotulo)}
          </Link>
        );
      })}
    </nav>
  );
}
