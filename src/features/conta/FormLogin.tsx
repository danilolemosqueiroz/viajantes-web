import { useState } from 'react';
import { useT } from '@/i18n/Traducao';
import { entrar, useConcluirLogin, type AposEntrar } from '@/lib/conta';

/** Entrar com e-mail e senha. */
export default function FormLogin({ aoEntrar, voltarPara, prefixoId = '' }: AposEntrar & { prefixoId?: string }) {
  const t = useT();
  const concluir = useConcluirLogin({ aoEntrar, voltarPara });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const form = new FormData(evento.currentTarget);
    try {
      const resultado = await entrar(String(form.get('email') ?? ''), String(form.get('senha') ?? ''));
      if ('erro' in resultado) {
        setErro(resultado.erro || t('E-mail ou senha inválidos.'));
        return;
      }
      await concluir(resultado.usuario);
    } catch {
      setErro(t('Não foi possível concluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor={`${prefixoId}email`} className="mb-1 block text-mini font-semibold text-texto-2">
          {t('E-mail')}
        </label>
        <input
          id={`${prefixoId}email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className="campo text-nota"
        />
      </div>

      <div>
        <label htmlFor={`${prefixoId}senha`} className="mb-1 block text-mini font-semibold text-texto-2">
          {t('Senha')}
        </label>
        <input
          id={`${prefixoId}senha`}
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="campo text-nota"
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-cartao bg-erro/10 p-3 text-mini text-erro">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="botao w-full disabled:opacity-60"
      >
        {t('Entrar')}
      </button>
    </form>
  );
}
