import { useState } from 'react';
import { useT } from '@/i18n/Traducao';
import type { UsuarioSessao } from '@/lib/tipos';
import { useAtualizarUsuario } from '@/lib/conta';
import { apiPost } from '@/lib/api';

/**
 * Meus dados. Nome, telefone, CPF e nascimento vão para a API antiga (a mesma
 * que o aplicativo usa); a troca de senha é um formulário separado, para não
 * misturar dois pedidos num botão só.
 */
export default function FormMeusDados({ usuario }: { usuario: UsuarioSessao }) {
  const t = useT();
  const atualizarUsuario = useAtualizarUsuario();
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setAviso(null);
    setEnviando(true);

    const form = new FormData(evento.currentTarget);
    try {
      const resposta = await apiPost('/site/usuario/atualizar', {
        nome: form.get('nome'),
        telefone: form.get('telefone'),
        cpf: form.get('cpf'),
        dtnascimento: form.get('dtnascimento'),
      });
      if (!resposta.ok) {
        setAviso({ tipo: 'erro', texto: resposta.erro || t('Não foi possível concluir. Tente novamente.') });
        return;
      }
      setAviso({ tipo: 'ok', texto: t('Dados salvos.') });
      await atualizarUsuario();
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
        <input id="nome" name="nome" required defaultValue={usuario.nome ?? ''} className={campo} />
      </div>

      <div>
        <label htmlFor="telefone" className={rotulo}>
          {t('Celular com DDD?')}
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          inputMode="tel"
          required
          defaultValue={usuario.telefone ?? ''}
          className={campo}
          placeholder="(35) 99999-9999"
        />
        {usuario.faltando?.includes('telefone') && (
          <p className="mt-1 text-mini text-alerta">{t('Informe seu celular')}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cpf" className={rotulo}>
            CPF
          </label>
          <input id="cpf" name="cpf" inputMode="numeric" defaultValue={usuario.cpf ?? ''} className={campo} />
        </div>
        <div>
          <label htmlFor="dtnascimento" className={rotulo}>
            {t('Data de Nascimento')}
          </label>
          <input
            id="dtnascimento"
            name="dtnascimento"
            placeholder="dd/mm/aaaa"
            defaultValue={usuario.dtnascimento ?? ''}
            className={campo}
          />
        </div>
      </div>

      {aviso && (
        <p
          role="alert"
          className={`rounded-cartao p-3 text-mini ${
            aviso.tipo === 'ok' ? 'bg-ok/10 text-ok' : 'bg-erro/10 text-erro'
          }`}
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
