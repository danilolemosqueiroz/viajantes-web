import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';

/**
 * Aviso de cookies (LGPD).
 *
 * Enquanto a pessoa não aceita, nenhuma ferramenta de terceiro é carregada — o
 * `Analytics` só entra em cena depois do aceite. A escolha fica num cookie que
 * o próprio navegador grava, para o servidor já saber na próxima visita.
 */
export const COOKIE_CONSENTIMENTO = 'vj_cookies';

export default function ConsentBanner({ decidido }: { decidido: boolean }) {
  const t = useT();
  const idioma = useIdioma();
  const [respondeuAgora, setRespondeuAgora] = useState(false);

  // Quem decide se o banner aparece é o `Consentimento`, que leu o cookie.
  const visivel = !decidido && !respondeuAgora;

  function responder(aceitou: boolean) {
    document.cookie = `${COOKIE_CONSENTIMENTO}=${aceitou ? 'todos' : 'essenciais'}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; samesite=lax`;
    setRespondeuAgora(true);
    // O `Consentimento` observa o cookie e injeta a medição na hora; não há
    // motivo para recarregar a página.
  }

  if (!visivel) return null;

  return (
    <div
      role="dialog"
      aria-label={t('Aviso de cookies')}
      className="fixed inset-x-0 bottom-16 z-50 border-t border-borda bg-cartao p-4 shadow-flutua md:bottom-0"
    >
      <div className="folha flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-mini text-texto-2">
          {t(
            'Usamos cookies para melhorar sua experiência, medir o tráfego e exibir anúncios, conforme a LGPD.',
          )}{' '}
          <Link to={href('/privacidade', idioma)} className="font-semibold text-acento-escuro hover:underline">
            {t('Política de Privacidade')}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => responder(false)}
            className="botao-fio"
          >
            {t('Apenas essenciais')}
          </button>
          <button
            type="button"
            onClick={() => responder(true)}
            className="botao"
          >
            {t('Aceitar todos')}
          </button>
        </div>
      </div>
    </div>
  );
}
