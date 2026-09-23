import { useEffect, useId, useRef, useState } from 'react';
import { CircleCheck, Star, X } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { apiPost } from '@/lib/api';

/**
 * "Avaliar este local": a mesma rota que o site antigo usava (`/site/avaliacaoAdd`).
 *
 * Não exige conta: a API acha ou cria o usuário pelo e-mail, e a avaliação
 * entra em moderação (só aparece depois de aprovada na gerência). Quem está
 * logado só vê nome e e-mail já preenchidos.
 */
export default function AvaliarLocal({
  aberto,
  aoFechar,
  idempresa,
  nome,
  usuario,
}: {
  aberto: boolean;
  aoFechar: () => void;
  idempresa: number;
  nome: string;
  usuario: { nome: string; email: string } | null;
}) {
  const t = useT();
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [nota, setNota] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);

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

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const nomeInformado = String(dados.get('nome') ?? '').trim();
    const email = String(dados.get('email') ?? '').trim();
    const mensagem = String(dados.get('mensagem') ?? '').trim();

    if (!nota) return setAviso(t('Escolha uma nota de 1 a 5 estrelas.'));
    if (nomeInformado.length < 2) return setAviso(t('Informe seu nome.'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setAviso(t('Informe um e-mail válido.'));
    if (mensagem.length < 5) return setAviso(t('Escreva um comentário com pelo menos 5 caracteres.'));

    setAviso(null);
    setEnviando(true);
    const resposta = await apiPost<{ message?: string }>('/site/avaliacaoAdd', {
      idempresa,
      nota,
      nome: nomeInformado,
      email,
      mensagem,
    });
    setEnviando(false);
    if (!resposta.ok) {
      setAviso(resposta.erro || t('Não foi possível enviar sua avaliação. Tente novamente mais tarde.'));
      return;
    }
    setEnviado(resposta.data?.message || t('Sua avaliação foi enviada e será exibida após aprovação.'));
  }

  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';

  return (
    <dialog
      ref={dialogo}
      tabIndex={-1}
      aria-labelledby={`${id}-titulo`}
      className="modal-folha"
      onClose={() => {
        setNota(0);
        setAviso(null);
        setEnviado(null);
        aoFechar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) fechar();
      }}
    >
      <div className="modal-folha__rolagem">
        <div className="flex items-start justify-between gap-3 border-b border-borda px-5 pb-4 pt-5 sm:px-6">
          <div>
            <h2 id={`${id}-titulo`} className="text-secao font-bold leading-tight text-brand">
              {t('Avaliar este local')}
            </h2>
            <p className="mt-0.5 line-clamp-1 text-nota text-texto-2">{nome}</p>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label={t('Fechar')}
            className="flex size-9 shrink-0 items-center justify-center rounded-pilula text-brand transition hover:bg-brand-suave"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {enviado ? (
          <div className="space-y-4 px-5 py-8 text-center sm:px-6">
            <CircleCheck size={40} className="mx-auto text-ok" aria-hidden="true" />
            <p className="text-nota text-texto" role="status">
              {enviado}
            </p>
            <button type="button" onClick={fechar} className="botao">
              {t('Fechar')}
            </button>
          </div>
        ) : (
          // A `key` refaz os valores iniciais quando a conta termina de carregar.
          <form key={usuario?.email ?? 'anonimo'} onSubmit={enviar} noValidate className="space-y-4 px-5 pb-6 pt-4 sm:px-6">
            <div>
              <span className={rotulo} id={`${id}-nota`}>
                {t('Sua nota')}
              </span>
              <div role="radiogroup" aria-labelledby={`${id}-nota`} className="flex gap-1">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    role="radio"
                    aria-checked={nota === valor}
                    aria-label={t('Nota {{nota}} de 5', { nota: valor })}
                    onClick={() => setNota(valor)}
                    className="flex size-10 items-center justify-center rounded-pilula transition hover:bg-acento-suave"
                  >
                    <Star size={24} className={valor <= nota ? 'fill-acento text-acento' : 'text-fio-forte'} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label htmlFor={`${id}-nome`} className={rotulo}>
                  {t('Seu nome')}
                </label>
                <input
                  id={`${id}-nome`}
                  name="nome"
                  maxLength={80}
                  autoComplete="name"
                  defaultValue={usuario?.nome ?? ''}
                  className="campo text-nota"
                />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className={rotulo}>
                  {t('Seu e-mail (não será publicado)')}
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  maxLength={120}
                  autoComplete="email"
                  defaultValue={usuario?.email ?? ''}
                  className="campo text-nota"
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${id}-mensagem`} className={rotulo}>
                {t('Como foi sua visita?')}
              </label>
              <textarea
                id={`${id}-mensagem`}
                name="mensagem"
                rows={4}
                maxLength={1000}
                placeholder={t('Conte o que achou do local, da estrutura e do atendimento.')}
                className="campo min-h-28 py-2.5 text-nota"
              />
            </div>

            {aviso && (
              <p role="alert" className="rounded-cartao bg-erro/10 p-3 text-mini text-erro">
                {aviso}
              </p>
            )}

            <p className="text-mini text-texto-3">{t('Sua avaliação será publicada após aprovação da nossa equipe.')}</p>

            <button type="submit" disabled={enviando} className="botao w-full disabled:opacity-60">
              {t('Enviar avaliação')}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
