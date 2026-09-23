import { useState } from 'react';
import { useT } from '@/i18n/Traducao';
import { apiPost } from '@/lib/api';

/** Fale conosco. Substitui o formulário do site antigo, que não enviava nada. */
export default function FormContato() {
  const t = useT();
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setAviso(null);
    setEnviando(true);

    const form = evento.currentTarget;
    const dadosForm = new FormData(form);
    try {
      const resposta = await apiPost('/site/contato', {
        nome: dadosForm.get('nome'),
        email: dadosForm.get('email'),
        telefone: dadosForm.get('telefone'),
        mensagem: dadosForm.get('mensagem'),
      });
      if (!resposta.ok) {
        setAviso({ tipo: 'erro', texto: resposta.erro || t('Não foi possível concluir. Tente novamente.') });
        return;
      }
      setAviso({ tipo: 'ok', texto: t('Mensagem enviada. Responderemos por e-mail.') });
      form.reset();
    } catch {
      setAviso({ tipo: 'erro', texto: t('Não foi possível concluir. Tente novamente.') });
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    'campo text-nota';
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="nome" className={rotulo}>
          {t('Qual o seu nome?')}
        </label>
        <input id="nome" name="nome" required className={campo} />
      </div>
      <div>
        <label htmlFor="email" className={rotulo}>
          {t('E-mail')}
        </label>
        <input id="email" name="email" type="email" required className={campo} />
      </div>
      <div>
        <label htmlFor="telefone" className={rotulo}>
          {t('Celular com DDD?')}
        </label>
        <input id="telefone" name="telefone" type="tel" className={campo} />
      </div>
      <div>
        <label htmlFor="mensagem" className={rotulo}>
          {t('Mensagem')}
        </label>
        <textarea id="mensagem" name="mensagem" required rows={5} className={`${campo} min-h-32 py-2.5`} />
      </div>

      {aviso && (
        <p
          role="alert"
          className={`rounded-cartao p-3 text-mini ${aviso.tipo === 'ok' ? 'bg-ok/10 text-ok' : 'bg-erro/10 text-erro'}`}
        >
          {aviso.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="botao w-full disabled:opacity-60"
      >
        {t('Enviar')}
      </button>
    </form>
  );
}
