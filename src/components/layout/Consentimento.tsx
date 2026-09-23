'use client';

import { useCallback, useSyncExternalStore } from 'react';
import Analytics from './Analytics';
import ConsentBanner, { COOKIE_CONSENTIMENTO } from './ConsentBanner';

/**
 * Aviso de cookies e medição, decididos NO NAVEGADOR.
 *
 * Antes quem lia o cookie era o servidor, o que não existe no site exportado
 * como arquivos (hospedagem sem Node): lá o HTML é o mesmo para todo mundo.
 * Ler no navegador não muda nada para a LGPD — o que importa é que nenhuma
 * ferramenta de terceiro carregue antes do aceite, e elas continuam entrando
 * só depois dele.
 *
 * `useSyncExternalStore` em vez de `useEffect`: é a forma que o React tem para
 * ler estado que vive fora dele (aqui, o cookie), sem uma renderização a mais
 * e sem divergir entre servidor e navegador.
 */
function lerConsentimento(): string | null {
  try {
    const achado = document.cookie
      .split(';')
      .map((parte) => parte.trim())
      .find((parte) => parte.startsWith(`${COOKIE_CONSENTIMENTO}=`));
    return achado ? decodeURIComponent(achado.slice(COOKIE_CONSENTIMENTO.length + 1)) : null;
  } catch {
    return null;
  }
}

/** No servidor ninguém decidiu ainda: o banner só aparece depois da hidratação. */
const noServidor = () => 'desconhecido';

export default function Consentimento() {
  // O cookie só muda por ação nossa (que recarrega a página ou esconde o
  // banner), então não há o que assinar.
  const assinar = useCallback(() => () => {}, []);
  const resposta = useSyncExternalStore(assinar, lerConsentimento, noServidor);

  // 'desconhecido' = ainda renderizando no servidor: não mostra o banner para
  // ele não piscar em quem já respondeu.
  const jaDecidiu = resposta !== null;

  return (
    <>
      <ConsentBanner decidido={jaDecidiu} />
      {resposta === 'todos' && <Analytics />}
    </>
  );
}
