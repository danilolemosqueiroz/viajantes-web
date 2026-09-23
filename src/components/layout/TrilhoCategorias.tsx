import { Link, useLocation } from 'react-router-dom';
import { CATEGORIAS } from '@/i18n/categorias';
import { hrefCategoria } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { iconeDaCategoria } from './IconesCategoria';

/**
 * O trilho de círculos que abre a tela Explorar do aplicativo — aqui ele fica
 * em TODA página, logo abaixo do cabeçalho. É o atalho principal do site.
 */

export default function TrilhoCategorias() {
  const t = useT();
  const idioma = useIdioma();
  const { pathname } = useLocation();

  return (
    <nav aria-label={t('Categorias')} className="border-b border-borda bg-cartao">
      <div className="folha">
        <ul className="trilho trilho--desvanece py-4">
          {CATEGORIAS.map((categoria) => {
            const Icone = iconeDaCategoria(categoria.icone);
            const destino = hrefCategoria(categoria, idioma);
            const ativa = pathname === destino || pathname.startsWith(`${destino}/`);
            return (
              <li key={categoria.id}>
                <Link to={destino} className="grupo-cat flex w-20 flex-col items-center gap-1.5 text-center">
                  <span className={`circulo-cat ${ativa ? 'circulo-cat--ativo' : ''}`}>
                    <Icone size={22} aria-hidden="true" />
                  </span>
                  <span className={`text-mini leading-tight ${ativa ? 'font-semibold text-brand' : 'text-texto-2'}`}>
                    {t(categoria.tituloCurto)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
