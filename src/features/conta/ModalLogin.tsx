import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Navigation, Star, X } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import BotaoApple from './BotaoApple';
import BotaoGoogle from './BotaoGoogle';
import FormCadastro from './FormCadastro';
import FormLogin from './FormLogin';

/**
 * Modal de login em folha (hoje, quem quer assinar o Plano Viajantes sem conta).
 *
 * Usa o `<dialog>` nativo com `showModal()`: o navegador já prende o foco
 * dentro dele, fecha com Esc, deixa o resto da página inerte e devolve o foco
 * para onde estava ao fechar — nada disso precisa ser reimplementado aqui.
 *
 * O login feito aqui NÃO leva para a conta: ele fecha o modal e a pessoa
 * continua exatamente onde estava.
 *
 * No celular vira uma folha que sobe de baixo, como no aplicativo.
 */
export default function ModalLogin({
  aberto,
  aoFechar,
  nome,
  capa,
  titulo,
  texto,
}: {
  aberto: boolean;
  aoFechar: () => void;
  /** Nome do atrativo, para o modal dizer o que está sendo liberado. */
  nome: string;
  capa: string | null;
  /** Título e frase próprios (ex.: comprar roteiro); sem eles, o texto do atrativo. */
  titulo?: string;
  texto?: string;
}) {
  const t = useT();
  const idioma = useIdioma();
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const [tela, setTela] = useState<'entrar' | 'criar'>('entrar');

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (aberto && !el.open) {
      el.showModal();
      // Foco inicial no PRÓPRIO modal, e não no primeiro botão (que é onde o
      // navegador o põe): o leitor de tela anuncia o título, o botão de fechar
      // não abre com contorno de foco e, no celular, o teclado não sobe sozinho.
      // O Tab continua entrando nos controles normalmente.
      el.focus();
    }
    if (!aberto && el.open) el.close();
  }, [aberto]);

  // Fechar pela página (depois do login) ou por Esc passa pelo evento `close`.
  const fechar = () => dialogo.current?.close();

  return (
    <dialog
      ref={dialogo}
      tabIndex={-1}
      aria-labelledby={idTitulo}
      className="modal-folha"
      onClose={() => {
        setTela('entrar');
        aoFechar();
      }}
      // Clique no fundo escurecido fecha. Dentro do modal o alvo nunca é o
      // próprio <dialog>, porque o conteúdo o preenche por inteiro.
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fechar();
      }}
    >
      <div className="modal-folha__rolagem">
        <div className="relative h-32 overflow-hidden bg-brand sm:h-36">
          {capa && <img src={capa} alt="" className="absolute inset-0 size-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/45 to-brand/15" />
          <p className="absolute inset-x-5 bottom-3 line-clamp-2 text-nota font-semibold leading-snug text-white">
            {nome}
          </p>
          <button
            type="button"
            onClick={fechar}
            aria-label={t('Fechar')}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-pilula bg-white/90 text-brand shadow-flutua transition hover:bg-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 pt-5 sm:px-6">
          {tela === 'entrar' ? (
            <>
              <div>
                <h2 id={idTitulo} className="text-secao font-bold leading-tight text-brand">
                  {titulo ?? t('Entre para ver os detalhes')}
                </h2>
                {titulo ? (
                  <p className="mt-2 text-nota text-texto-2">{texto}</p>
                ) : (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-mini text-texto-2">
                  <li className="flex items-center gap-1.5">
                    <Navigation size={13} className="text-acento" aria-hidden="true" />
                    {t('Como chegar')}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MessageCircle size={13} className="text-acento" aria-hidden="true" />
                    WhatsApp
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Star size={13} className="text-acento" aria-hidden="true" />
                    {t('Avaliações')}
                  </li>
                </ul>
                )}
                <p className="mt-2 text-mini text-texto-3">{t('É grátis e usa a mesma conta do aplicativo.')}</p>
              </div>

              <div className="space-y-2.5">
                <BotaoApple aoEntrar={fechar} />
                <BotaoGoogle aoEntrar={fechar} />
              </div>

              <div className="flex items-center gap-3 text-mini text-texto-3">
                <span className="h-px flex-1 bg-borda" />
                {t('ou')}
                <span className="h-px flex-1 bg-borda" />
              </div>

              <FormLogin aoEntrar={fechar} prefixoId="modal-" />

              <div className="flex flex-wrap items-center justify-between gap-2 text-nota">
                <Link
                  to={href('/recuperar-senha', idioma)}
                  className="text-texto-2 hover:text-brand hover:underline"
                >
                  {t('Esqueci minha senha')}
                </Link>
                <button
                  type="button"
                  onClick={() => setTela('criar')}
                  className="font-semibold text-acento-escuro hover:underline"
                >
                  {t('Criar conta')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 id={idTitulo} className="text-secao font-bold leading-tight text-brand">
                  {t('Criar conta')}
                </h2>
                <p className="mt-1 text-nota text-texto-2">
                  {t('Crie a sua em um minuto e veja todos os detalhes.')}
                </p>
              </div>

              <FormCadastro aoEntrar={fechar} prefixoId="modal-" />

              <p className="text-center text-nota">
                <button
                  type="button"
                  onClick={() => setTela('entrar')}
                  className="font-semibold text-acento-escuro hover:underline"
                >
                  {t('Já tenho uma conta')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
