import { useEffect, useId, useRef, useState } from 'react';
import { ChevronRight, Map, X } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { useRoteiroGuia } from './consultas';
import type { Periodo } from './tipos';

const PERIODOS: Record<Periodo, string> = {
  manha: 'Manhã',
  almoco: 'Almoço',
  tarde: 'Tarde',
  noite: 'Noite',
  hospedagem: 'Hospedagem',
};

/** O roteiro que o guia salvou: um botão na resposta que abre o dia a dia num modal em folha. */
export default function CartaoRoteiro({ id, abrirLugar }: { id: string; abrirLugar: (id: number) => void }) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const { data: roteiro, isPending, isError, refetch } = useRoteiroGuia(aberto ? id : null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (aberto && !el.open) {
      el.showModal();
      el.focus();
    }
    if (!aberto && el.open) el.close();
  }, [aberto]);

  const fechar = () => dialogo.current?.close();
  const dados = roteiro?.dados;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 flex w-full items-center gap-3 rounded-cartao border border-borda p-3 text-left hover:bg-papel-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-pilula bg-acento-suave text-acento-escuro">
          <Map size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-nota font-semibold text-brand">{t('Ver roteiro')}</span>
          <span className="block text-mini text-texto-3">{t('Salvo na sua conta, com o dia a dia completo')}</span>
        </span>
        <ChevronRight size={18} className="text-texto-3" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogo}
        tabIndex={-1}
        aria-labelledby={idTitulo}
        className="modal-folha modal-folha--largo"
        onClose={() => setAberto(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) fechar();
        }}
      >
        <div className="modal-folha__rolagem px-5 pb-6 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id={idTitulo} className="text-secao font-bold leading-tight text-brand">
              {dados?.titulo ?? t('Roteiro')}
            </h2>
            <button
              type="button"
              onClick={fechar}
              aria-label={t('Fechar')}
              className="-mr-2 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-pilula text-texto-2 hover:bg-brand-suave hover:text-brand"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {aberto && isPending && <p className="mt-4 text-nota text-texto-3">{t('Carregando...')}</p>}
          {isError && (
            <div className="mt-4 space-y-2">
              <p className="text-nota text-texto-2">{t('Não conseguimos abrir o roteiro agora.')}</p>
              <button type="button" className="botao-fio" onClick={() => refetch()}>
                {t('Tentar de novo')}
              </button>
            </div>
          )}

          {dados && (
            <div className="mt-2 space-y-5">
              {dados.resumo && <p className="text-nota text-texto-2">{dados.resumo}</p>}
              {dados.perfil && <p className="text-mini text-texto-3">{dados.perfil}</p>}

              {dados.dias.map((dia) => (
                <section key={dia.dia}>
                  <h3 className="rotulo-secao">
                    {t('Dia {{n}}', { n: dia.dia })}
                    {dia.titulo ? ` · ${dia.titulo}` : ''}
                  </h3>
                  <ol className="mt-2 space-y-3 border-l border-borda pl-4">
                    {dia.itens.map((item, i) => (
                      <li key={i}>
                        <p className="text-mini font-semibold uppercase tracking-[0.08em] text-acento-escuro">
                          {t(PERIODOS[item.periodo] ?? item.periodo)}
                          {item.horario ? ` · ${item.horario}` : ''}
                          {item.km_do_anterior ? ` · ~${item.km_do_anterior} km` : ''}
                        </p>
                        <p className="text-nota text-texto">
                          {item.lugar ? (
                            <button
                              type="button"
                              onClick={() => {
                                fechar();
                                abrirLugar(item.lugar!.id);
                              }}
                              className="font-semibold text-brand underline decoration-borda underline-offset-2 hover:decoration-acento"
                            >
                              {item.lugar.nome}
                            </button>
                          ) : null}
                          {item.lugar ? ' — ' : ''}
                          {item.atividade}
                        </p>
                        {item.observacao && <p className="text-mini text-texto-3">{item.observacao}</p>}
                      </li>
                    ))}
                  </ol>
                </section>
              ))}

              {!!dados.dicas?.length && (
                <section>
                  <h3 className="rotulo-secao">{t('Dicas')}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-nota text-texto-2 marker:text-acento">
                    {dados.dicas.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </section>
              )}
              {!!dados.avisos?.length && (
                <ul className="recuo space-y-1 p-3 text-mini text-alerta">
                  {dados.avisos.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
