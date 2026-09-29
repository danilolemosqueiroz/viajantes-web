import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomTabs from './BottomTabs';
import TrilhoCategorias from './TrilhoCategorias';
import Consentimento from './Consentimento';

/** A folha do site: cabeçalho, trilho de categorias, conteúdo, rodapé e a barra de abas no celular.
 * Também devolve a rolagem ao topo a cada troca de tela, o que o navegador não faz num SPA. */
export default function Moldura() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-full flex-col pb-16 antialiased md:pb-0">
      <Header />
      <TrilhoCategorias />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomTabs />
      <Consentimento />
    </div>
  );
}
