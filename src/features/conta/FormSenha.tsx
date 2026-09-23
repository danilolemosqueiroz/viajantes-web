import { useState } from 'react';
import { useT } from '@/i18n/Traducao';
import { apiPost } from '@/lib/api';

/** Troca de senha, separada dos dados para cada botão fazer uma coisa só. */
export default function FormSenha() {
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
      if (dadosForm.get('novasenha') !== dadosForm.get('senhaconfirm')) {
        setAviso({ tipo: 'erro', texto: t('A confirmação não confere com a nova senha.') });
        return;
      }
      const resposta = await apiPost('/site/usuario/atualizar', {
        senha: dadosForm.get('senha'),
        novasenha: dadosForm.get('novasenha'),
      });
      if (!resposta.ok) {
        setAviso({ tipo: 'erro', texto: resposta.erro || t('Não foi possível concluir. Tente novamente.') });
        return;
      }
      setAviso({ tipo: 'ok', texto: t('Senha alterada.') });
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
        <label htmlFor="senha-atual" className={rotulo}>
          {t('Senha Atual')}
        </label>
        <input id="senha-atual" name="senha" type="password" required autoComplete="current-password" className={campo} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nova-senha" className={rotulo}>
            {t('Nova senha')}
          </label>
          <input
            id="nova-senha"
            name="novasenha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="repete-senha" className={rotulo}>
            {t('Repita a nova senha')}
          </label>
          <input
            id="repete-senha"
            name="senhaconfirm"
            type="password"
            required
            autoComplete="new-password"
            className={campo}
          />
        </div>
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
        className="botao disabled:opacity-60"
      >
        {t('Salvar Alterações')}
      </button>
    </form>
  );
}
