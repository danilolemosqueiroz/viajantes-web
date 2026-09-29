import { useEffect, useRef, useState } from 'react';
import { useIdioma, useT } from '@/i18n/Traducao';
import type { Idioma } from '@/i18n/categorias';
import { IconeApple } from '@/components/layout/IconesMarca';
import { carregarScript } from '@/lib/scriptExterno';
import { entrarComApple, useConcluirLogin, type AposEntrar } from '@/lib/conta';

/** O que o Sign in with Apple JS publica em `window`. */
interface AppleIdJs {
  auth: {
    init(opcoes: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }): void;
    signIn(): Promise<{
      authorization?: { id_token?: string };
      /** Só vem na primeira autorização da pessoa. */
      user?: { name?: { firstName?: string; lastName?: string } };
    }>;
  };
}

/** Idioma da janela da Apple. */
const LOCALE_APPLE: Record<Idioma, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE' };

const scriptApple = (idioma: Idioma) =>
  `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${LOCALE_APPLE[idioma]}/appleid.auth.js`;

/** Iniciar sessão com a Apple, na mesma conta do aplicativo. Só aparece com o Services ID
 * configurado e só funciona no domínio cadastrado (ver docs/DEPLOY.md). */
export default function BotaoApple({ aoEntrar, voltarPara }: AposEntrar) {
  const t = useT();
  const idioma = useIdioma();
  const concluir = useConcluirLogin({ aoEntrar, voltarPara });
  const [pronto, setPronto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const appleRef = useRef<AppleIdJs | null>(null);

  const servicesId = import.meta.env.VITE_APPLE_SERVICES_ID;
  // O endereço de retorno tem que ser exatamente um dos cadastrados na Apple.
  const retorno = import.meta.env.VITE_APPLE_REDIRECT_URI || `${window.location.origin}/`;

  useEffect(() => {
    if (!servicesId) return;
    let ativo = true;

    carregarScript(scriptApple(idioma))
      .then(() => {
        const apple = (window as unknown as { AppleID?: AppleIdJs }).AppleID;
        if (!ativo || !apple) return;
        apple.auth.init({ clientId: servicesId, scope: 'name email', redirectURI: retorno, usePopup: true });
        appleRef.current = apple;
        setPronto(true);
      })
      .catch(() => {
        if (ativo) setErro(t('Não foi possível fazer o login com a Apple'));
      });

    return () => {
      ativo = false;
    };
  }, [servicesId, retorno, idioma, t]);

  if (!servicesId) return null;

  async function entrar() {
    const apple = appleRef.current;
    if (!apple) return;
    setErro(null);
    setCarregando(true);
    try {
      // `signIn` precisa sair direto do clique: senão o navegador bloqueia a janela.
      const resposta = await apple.auth.signIn();
      const token = resposta.authorization?.id_token;
      if (!token) throw new Error('sem id_token');

      const nome = [resposta.user?.name?.firstName, resposta.user?.name?.lastName].filter(Boolean).join(' ');
      const resultado = await entrarComApple(token, nome);
      if ('erro' in resultado) {
        setErro(resultado.erro || t('Não foi possível fazer o login com a Apple'));
        return;
      }
      await concluir(resultado.usuario);
    } catch (falha) {
      // Fechar a janela da Apple não é erro: a pessoa desistiu.
      const codigo = (falha as { error?: string } | null)?.error;
      if (codigo !== 'popup_closed_by_user' && codigo !== 'user_cancelled_authorize') {
        setErro(t('Não foi possível fazer o login com a Apple'));
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={entrar}
        disabled={!pronto || carregando}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-pilula bg-black px-5 text-nota font-semibold text-white transition hover:bg-black/85 disabled:opacity-60"
      >
        <IconeApple size={17} />
        {t('Iniciar sessão com a Apple')}
      </button>
      {erro && (
        <p role="alert" className="text-center text-mini text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
