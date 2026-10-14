import { lazy, Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import Header from './Header';
import Footer from './Footer';
import BottomTabs from './BottomTabs';
import TrilhoCategorias from './TrilhoCategorias';
import Consentimento from './Consentimento';

/** O Guia Viajantes (chat com IA) vem num pedaço à parte, e só existe com `VITE_IA_URL` no build. */
const GuiaIA = lazy(() => import('@/features/guia/GuiaIA'));
const guiaLigado = Boolean(import.meta.env.VITE_IA_URL);

/** Switch "Guia IA" da gerência (`geral.guia_ia`). Só 0 desliga: erro ou API antiga mantêm o botão. */
function useGuiaPermitido(): boolean {
  const { data } = useQuery({
    queryKey: ['guia-ia-ligado'],
    queryFn: async () => {
      const r = await apiGet<{ guia_ia?: number | string }>('/site/geral');
      return !r.ok || String(r.data?.guia_ia) !== '0';
    },
    enabled: guiaLigado,
  });
  return data === true;
}

/** A folha do site: cabeçalho, trilho de categorias, conteúdo, rodapé e a barra de abas no celular.
 * Também devolve a rolagem ao topo a cada troca de tela, o que o navegador não faz num SPA. */
export default function Moldura() {
  const { pathname } = useLocation();
  const guiaPermitido = useGuiaPermitido();

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
      {guiaLigado && guiaPermitido && (
        <Suspense fallback={null}>
          <GuiaIA />
        </Suspense>
      )}
    </div>
  );
}
