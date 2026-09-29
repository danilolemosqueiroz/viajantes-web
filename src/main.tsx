import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './estilos.css';

/** Ponto de entrada do site. O TanStack Query guarda em memória o que já veio da API,
 * e ao reabrir a aba tudo é buscado de novo. */
/** Pasta em que o site foi publicado (`/` na raiz, `/new/` numa subpasta). Sem passar isso ao
 * roteador nenhuma rota casa. O React Router quer o prefixo sem a barra final. */
const RAIZ = import.meta.env.BASE_URL.replace(/\/$/, '');

const cliente = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutos: dentro desse tempo a navegação usa o que está em memória.
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
      <BrowserRouter basename={RAIZ}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
