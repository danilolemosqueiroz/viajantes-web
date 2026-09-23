import { useState } from 'react';
import { useT } from '@/i18n/Traducao';
import { recuperarSenha } from '@/lib/conta';

/**
 * Pede o link de nova senha.
 *
 * A resposta é a mesma exista a conta ou não — senão a página viraria um jeito
 * de descobrir quem tem cadastro. A página de criar a senha nova é a da API,
 * aberta pelo link do e-mail.
 */
export default function FormRecuperarSenha() {
  const t = useT();
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    const form = new FormData(evento.currentTarget);
    try {
      await recuperarSenha(String(form.get('email') ?? ''));
    } finally {
      setEnviado(true);
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <p role="status" className="rounded-cartao bg-ok/10 p-4 text-nota text-ok">
        {t('Se existir uma conta com esse e-mail, o link chegará em instantes.')}
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-mini font-semibold text-texto-2">
          {t('E-mail')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="campo text-nota"
        />
      </div>
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
