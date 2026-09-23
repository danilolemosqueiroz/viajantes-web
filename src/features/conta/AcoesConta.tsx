import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdioma } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { sair, useAtualizarUsuario } from '@/lib/conta';
import { apiPost } from '@/lib/api';

/**
 * Sair e excluir a conta.
 *
 * A exclusão pede confirmação em dois passos, como o aplicativo: apaga os dados
 * e derruba todas as sessões, inclusive a do celular.
 */
export default function AcoesConta() {
  const t = useT();
  const navegar = useNavigate();
  const idioma = useIdioma();
  const atualizarUsuario = useAtualizarUsuario();
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function chamar(acao: 'sair' | 'excluir') {
    setOcupado(true);
    setErro(null);
    try {
      if (acao === 'excluir') {
        const resposta = await apiPost('/site/usuario/excluir', {});
        if (!resposta.ok) {
          setErro(resposta.erro || t('Não foi possível concluir. Tente novamente.'));
          return;
        }
      }
      await sair();
      await atualizarUsuario();
      navegar(href('/', idioma), { replace: true });
    } catch {
      setErro(t('Não foi possível concluir. Tente novamente.'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => chamar('sair')}
        disabled={ocupado}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-cartao border border-borda font-semibold text-texto transition hover:border-brand hover:text-brand disabled:opacity-60"
      >
        <LogOut size={16} aria-hidden="true" />
        {t('Sair')}
      </button>

      {!confirmando ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 text-mini font-semibold text-erro hover:underline"
        >
          <ShieldAlert size={15} aria-hidden="true" />
          {t('Excluir a conta')}
        </button>
      ) : (
        <div className="rounded-cartao border border-erro/30 bg-erro/5 p-4">
          <p className="text-nota text-texto">
            {t('Tem certeza? Sua conta e seus dados serão apagados, no site e no aplicativo.')}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="min-h-10 flex-1 rounded-cartao border border-borda text-nota font-semibold text-texto"
            >
              {t('Cancelar')}
            </button>
            <button
              type="button"
              onClick={() => chamar('excluir')}
              disabled={ocupado}
              className="min-h-10 flex-1 rounded-cartao bg-erro text-nota font-semibold text-white disabled:opacity-60"
            >
              {t('Excluir')}
            </button>
          </div>
        </div>
      )}

      {erro && (
        <p role="alert" className="text-mini text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
