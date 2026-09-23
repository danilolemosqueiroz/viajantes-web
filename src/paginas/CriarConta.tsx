import { Link, Navigate } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useUsuario } from '@/lib/conta';
import { useMeta } from '@/lib/meta';
import FormCadastro from '@/features/conta/FormCadastro';
import BotaoGoogle from '@/features/conta/BotaoGoogle';
import BotaoApple from '@/features/conta/BotaoApple';
import Carregando from '@/components/layout/Carregando';

export default function CriarConta() {
  const t = useT();
  const idioma = useIdioma();
  const { data: usuario, isPending } = useUsuario();
  useMeta({ titulo: t('Criar conta'), caminho: href('/criar-conta', idioma), naoIndexar: true });

  if (isPending) return <Carregando />;
  if (usuario) return <Navigate to={href('/conta', idioma)} replace />;

  return (
    <div className="folha flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-titulo font-bold text-brand">{t('Criar conta')}</h1>
        <p className="mt-1 text-nota text-texto-2">{t('A mesma conta do aplicativo.')}</p>

        <div className="mt-6 space-y-2.5">
          <BotaoApple />
          <BotaoGoogle />
        </div>

        <div className="my-6 flex items-center gap-3 text-mini text-texto-3">
          <span className="h-px flex-1 bg-borda" />
          {t('ou')}
          <span className="h-px flex-1 bg-borda" />
        </div>

        <FormCadastro />

        <p className="mt-4 text-center text-nota text-texto-2">
          <Link to={href('/entrar', idioma)} className="font-semibold text-acento-escuro hover:underline">
            {t('Entrar')}
          </Link>
        </p>
      </div>
    </div>
  );
}
