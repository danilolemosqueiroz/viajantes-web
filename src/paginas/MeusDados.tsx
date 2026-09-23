import { Navigate } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useUsuario } from '@/lib/conta';
import { useMeta } from '@/lib/meta';
import FormMeusDados from '@/features/conta/FormMeusDados';
import FormSenha from '@/features/conta/FormSenha';
import VerificarEmail from '@/features/conta/VerificarEmail';
import AcoesConta from '@/features/conta/AcoesConta';
import Carregando from '@/components/layout/Carregando';

export default function MeusDados() {
  const t = useT();
  const idioma = useIdioma();
  const { data: usuario, isPending } = useUsuario();
  useMeta({ titulo: t('Meus dados'), caminho: href('/conta/meus-dados', idioma), naoIndexar: true });

  if (isPending) return <Carregando />;
  if (!usuario) return <Navigate to={href('/entrar', idioma)} replace />;

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold text-brand">{t('Meus dados')}</h1>

      <div className="mt-8 max-w-md space-y-10">
        {usuario.emailVerificado === false && <VerificarEmail />}
        <FormMeusDados usuario={usuario} />
        <section>
          <h2 className="rotulo-secao mb-4">{t('Alterar senha')}</h2>
          <FormSenha />
        </section>
        <AcoesConta />
      </div>
    </div>
  );
}
