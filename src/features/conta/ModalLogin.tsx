import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import BotaoApple from './BotaoApple';
import BotaoGoogle from './BotaoGoogle';
import FormCadastro from './FormCadastro';
import FormLogin from './FormLogin';

/** Um ícone da lucide, com o que a lista de benefícios passa a ele. */
type Icone = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;

/**
 * Modal de login em folha: entrar (Apple, Google ou e-mail) ou criar conta —
 * a MESMA do aplicativo. Quem chama diz o motivo: o convite ao abrir um
 * atrativo (`catalogo/ConviteConta`) e o Plano Viajantes (`roteiros/Assinar`).
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
  beneficios,
  continuarNoSite = false,
}: {
  aberto: boolean;
  aoFechar: () => void;
  /** Nome do atrativo (ou do plano), na faixa de cima. */
  nome: string;
  capa: string | null;
  titulo: string;
  /** Uma frase sob o título… */
  texto?: string;
  /** …ou uma lista curta do que a conta dá. */
  beneficios?: { Icone: Icone; texto: string }[];
  /** Põe "Continuar no site" no rodapé: deixa claro que fechar não custa nada. */
  continuarNoSite?: boolean;
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

  const continuar = continuarNoSite && (
    <p className="text-center">
      <button type="button" onClick={fechar} className="text-nota font-semibold text-texto-2 hover:text-brand hover:underline">
        {t('Continuar no site')}
      </button>
    </p>
  );

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
                  {titulo}
                </h2>
                {texto && <p className="mt-2 text-nota text-texto-2">{texto}</p>}
                {beneficios && beneficios.length > 0 && (
                  <ul className="mt-3 space-y-2 text-nota text-texto-2">
                    {beneficios.map(({ Icone, texto: frase }) => (
                      <li key={frase} className="flex items-center gap-2.5">
                        <Icone size={15} className="shrink-0 text-acento" aria-hidden />
                        {frase}
                      </li>
                    ))}
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

              {continuar}
            </>
          ) : (
            <>
              <div>
                <h2 id={idTitulo} className="text-secao font-bold leading-tight text-brand">
                  {t('Criar conta')}
                </h2>
                <p className="mt-1 text-nota text-texto-2">
                  {t('Vale no site e no aplicativo, com a mesma conta.')}
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

              {continuar}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
