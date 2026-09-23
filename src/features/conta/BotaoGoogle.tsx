import { useEffect, useRef, useState } from 'react';
import { useIdioma, useT } from '@/i18n/Traducao';
import type { Idioma } from '@/i18n/categorias';
import { carregarScript } from '@/lib/scriptExterno';
import { entrarComGoogle, useConcluirLogin, type AposEntrar } from '@/lib/conta';

/** O que o script do Google Identity Services publica em `window`. */
interface GoogleIdentity {
  accounts?: {
    id?: {
      initialize(opcoes: { client_id: string; callback: (resposta: { credential?: string }) => void }): void;
      renderButton(elemento: HTMLElement, opcoes: Record<string, string | number>): void;
    };
  };
}

const SCRIPT_GOOGLE = 'https://accounts.google.com/gsi/client';

/** Idioma do texto do botão, que é desenhado pelo próprio Google. */
const LOCALE_GOOGLE: Record<Idioma, string> = { pt: 'pt-BR', en: 'en', es: 'es', fr: 'fr', de: 'de' };

/**
 * Entrar com Google — a MESMA conta do aplicativo.
 *
 * Usa o client id WEB do projeto 313706555234, o mesmo projeto dos client ids
 * de iOS e Android que o app usa. A API aceita os três, e o Google identifica a
 * pessoa pelo mesmo `sub` em todos eles: quem entrou pelo celular cai na mesma
 * conta aqui.
 *
 * Para o botão aparecer, o domínio do site precisa estar em "Origens
 * JavaScript autorizadas" desse client id no Google Cloud (ver docs/DEPLOY.md).
 */
export default function BotaoGoogle({ aoEntrar, voltarPara }: AposEntrar) {
  const t = useT();
  const idioma = useIdioma();
  const concluir = useConcluirLogin({ aoEntrar, voltarPara });
  const caixa = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

  // O callback do Google é registrado uma vez; ele lê a versão mais recente
  // de `concluir` por aqui, sem precisar reiniciar o botão a cada render.
  const concluirRef = useRef(concluir);
  useEffect(() => {
    concluirRef.current = concluir;
  });

  useEffect(() => {
    if (!clientId) return;
    let ativo = true;

    carregarScript(SCRIPT_GOOGLE)
      .then(() => {
        const google = (window as unknown as { google?: GoogleIdentity }).google;
        if (!ativo || !google?.accounts?.id || !caixa.current) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setErro(t('Não foi possível fazer o login com Google'));
              return;
            }
            setCarregando(true);
            setErro(null);
            try {
              const resultado = await entrarComGoogle(credential);
              if ('erro' in resultado) {
                setErro(resultado.erro || t('Não foi possível fazer o login com Google'));
                return;
              }
              await concluirRef.current(resultado.usuario);
            } catch {
              setErro(t('Não foi possível fazer o login com Google'));
            } finally {
              setCarregando(false);
            }
          },
        });

        // Trocar de idioma redesenha o botão: limpa o anterior antes.
        caixa.current.replaceChildren();
        google.accounts.id.renderButton(caixa.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: Math.min(caixa.current.offsetWidth || 320, 400),
          text: 'continue_with',
          locale: LOCALE_GOOGLE[idioma],
        });
      })
      .catch(() => {
        if (ativo) setErro(t('Login com Google indisponível'));
      });

    return () => {
      ativo = false;
    };
  }, [clientId, idioma, t]);

  if (!clientId) {
    return (
      <p className="rounded-cartao border border-borda bg-papel-2 p-3 text-mini text-texto-3">
        {t('Login com Google indisponível')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={caixa} className="flex min-h-11 justify-center" aria-busy={carregando} />
      {erro && (
        <p role="alert" className="text-center text-mini text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
