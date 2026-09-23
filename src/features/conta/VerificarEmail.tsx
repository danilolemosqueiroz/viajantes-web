import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { useAtualizarUsuario } from '@/lib/conta';
import { apiPost } from '@/lib/api';

/**
 * Verificação do e-mail: pede o código, depois confirma. É o mesmo fluxo do
 * aplicativo, e o e-mail verificado conta para o cadastro completo nos dois.
 */
export default function VerificarEmail() {
  const t = useT();
  const atualizarUsuario = useAtualizarUsuario();
  const [etapa, setEtapa] = useState<'inicio' | 'codigo'>('inicio');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function chamar(codigo?: string) {
    setOcupado(true);
    setAviso(null);
    try {
      const resposta = codigo
        ? await apiPost('/site/auth/verificar-email/confirmar', { codigo })
        : await apiPost('/site/auth/verificar-email/enviar', {});
      if (!resposta.ok) {
        setAviso({ tipo: 'erro', texto: resposta.erro || t('Não foi possível concluir. Tente novamente.') });
        return;
      }
      if (codigo) {
        setAviso({ tipo: 'ok', texto: t('E-mail verificado.') });
        await atualizarUsuario();
      } else {
        setEtapa('codigo');
        setAviso({ tipo: 'ok', texto: t('Enviamos um código para o seu e-mail.') });
      }
    } catch {
      setAviso({ tipo: 'erro', texto: t('Não foi possível concluir. Tente novamente.') });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="mt-4 rounded-cartao border border-borda p-4">
      <p className="flex items-start gap-2 text-nota text-texto">
        <MailCheck size={17} className="mt-0.5 shrink-0 text-acento" aria-hidden="true" />
        {t('Confirme seu e-mail para completar o cadastro.')}
      </p>

      {etapa === 'inicio' ? (
        <button
          type="button"
          onClick={() => chamar()}
          disabled={ocupado}
          className="mt-3 botao-fio min-h-10 disabled:opacity-60"
        >
          {t('Enviar código')}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            chamar(String(new FormData(e.currentTarget).get('codigo') ?? ''));
          }}
          className="mt-3 flex gap-2"
        >
          <label htmlFor="codigo" className="sr-only">
            {t('Código')}
          </label>
          <input
            id="codigo"
            name="codigo"
            inputMode="numeric"
            required
            className="min-h-10 flex-1 rounded-cartao border border-borda px-3 text-nota outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={ocupado}
            className="botao min-h-10 disabled:opacity-60"
          >
            {t('Confirmar')}
          </button>
        </form>
      )}

      {aviso && (
        <p role="alert" className={`mt-2 text-mini ${aviso.tipo === 'ok' ? 'text-ok' : 'text-erro'}`}>
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
