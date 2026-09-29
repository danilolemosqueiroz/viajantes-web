import { Plus, Trash2 } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useArquivarConversa, useConversas } from './consultas';

/** Conversas anteriores, da mais recente para a mais antiga. */
export default function ListaConversas({
  atual,
  aoEscolher,
  aoNova,
}: {
  atual: string | null;
  aoEscolher: (id: string) => void;
  aoNova: () => void;
}) {
  const t = useT();
  const idioma = useIdioma();
  const { data: conversas, isPending, isError, refetch } = useConversas(true);
  const arquivar = useArquivarConversa();

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
      <button type="button" onClick={aoNova} className="botao-acao w-full justify-center">
        <Plus size={16} aria-hidden="true" />
        {t('Nova conversa')}
      </button>

      {isPending && <p className="mt-4 text-center text-mini text-texto-3">{t('Carregando...')}</p>}
      {isError && (
        <div className="mt-4 text-center">
          <p className="text-nota text-texto-2">{t('Não conseguimos carregar suas conversas.')}</p>
          <button type="button" className="botao-fio mt-2" onClick={() => refetch()}>
            {t('Tentar de novo')}
          </button>
        </div>
      )}
      {conversas?.length === 0 && <p className="mt-4 text-center text-nota text-texto-3">{t('Nenhuma conversa ainda.')}</p>}

      <ul className="mt-4 divide-y divide-borda">
        {conversas?.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => aoEscolher(c.id)}
              aria-current={c.id === atual ? 'true' : undefined}
              className="min-w-0 flex-1 py-3 text-left"
            >
              <span className={`block truncate text-nota ${c.id === atual ? 'font-semibold text-acento-escuro' : 'text-brand'}`}>
                {c.titulo || t('Conversa sem título')}
              </span>
              <span className="block text-mini text-texto-3">
                {new Date(c.atualizada_em).toLocaleDateString(idioma, { day: 'numeric', month: 'short' })}
              </span>
            </button>
            <button
              type="button"
              aria-label={t('Apagar conversa')}
              disabled={arquivar.isPending}
              onClick={() => {
                if (window.confirm(t('Apagar esta conversa?'))) arquivar.mutate(c.id);
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-pilula text-texto-3 hover:bg-brand-suave hover:text-erro"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
