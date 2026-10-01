import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import PainelGuia from './PainelGuia';

const CHAVE_ABERTO = 'vj_guia_aberto';

function lerAberto(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_ABERTO) === '1';
  } catch {
    return false;
  }
}

function salvarAberto(aberto: boolean) {
  try {
    if (aberto) sessionStorage.setItem(CHAVE_ABERTO, '1');
    else sessionStorage.removeItem(CHAVE_ABERTO);
  } catch {
    /* armazenamento bloqueado: o painel fecha ao recarregar */
  }
}

/** Enquanto o aviso de cookies está na tela, quanto o botão precisa subir para ficar acima dele
 * (em px, a partir do fundo da janela). `null` sem aviso. */
function useAcimaDoAviso(): number | null {
  const [acima, setAcima] = useState<number | null>(null);
  useEffect(() => {
    let medido: Element | null = null;
    const medir = () => {
      const aviso = document.querySelector('[data-aviso-cookies]');
      setAcima(aviso ? Math.round(window.innerHeight - aviso.getBoundingClientRect().top) + 12 : null);
      if (aviso !== medido) {
        if (medido) tamanho.unobserve(medido);
        if (aviso) tamanho.observe(aviso);
        medido = aviso;
      }
    };
    const tamanho = new ResizeObserver(medir);
    // O aviso aparece e some por conta própria (resposta, cookie já gravado): observa a página.
    const arvore = new MutationObserver(medir);
    arvore.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', medir);
    medir();
    return () => {
      arvore.disconnect();
      tamanho.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, []);
  return acima;
}

/** Guia Viajantes: o botão laranja no canto e o painel de conversa. Visível para todos; quem não
 * entrou ou não assina vê, ao abrir, o convite para entrar ou a oferta do plano. */
export default function GuiaIA() {
  const t = useT();
  const idioma = useIdioma();
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(lerAberto);
  const botao = useRef<HTMLButtonElement>(null);
  const acimaDoAviso = useAcimaDoAviso();
  const devolverFoco = useRef(false);

  // Nas telas de entrar e criar conta o botão só atrapalharia.
  const escondido = (['/entrar', '/criar-conta', '/recuperar-senha'] as const).some((rota) => pathname === href(rota, idioma));

  useEffect(() => {
    if (!aberto && devolverFoco.current) {
      devolverFoco.current = false;
      botao.current?.focus();
    }
  }, [aberto]);

  const mudar = (valor: boolean) => {
    salvarAberto(valor);
    devolverFoco.current = !valor;
    setAberto(valor);
  };

  if (escondido) return null;
  if (aberto) return <PainelGuia fechar={() => mudar(false)} />;

  return (
    <button
      ref={botao}
      type="button"
      onClick={() => mudar(true)}
      aria-label={t('Abrir o Guia Viajantes')}
      style={acimaDoAviso === null ? undefined : { bottom: acimaDoAviso }}
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-12 items-center gap-2 rounded-pilula bg-acento px-3.5 text-nota font-semibold text-white shadow-flutua transition hover:bg-acento-escuro sm:pr-5 md:bottom-6 md:right-6"
    >
      <Sparkles size={20} aria-hidden="true" />
      <span className="hidden sm:inline">{t('Guia IA')}</span>
    </button>
  );
}
