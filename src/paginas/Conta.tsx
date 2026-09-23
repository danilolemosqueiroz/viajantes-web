import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Map, UserCog } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { sair, useAtualizarUsuario, useUsuario } from '@/lib/conta';
import { useMeta } from '@/lib/meta';
import Carregando from '@/components/layout/Carregando';

export default function Conta() {
  const t = useT();
  const idioma = useIdioma();
  const navegar = useNavigate();
  const atualizar = useAtualizarUsuario();
  const { data: usuario, isPending } = useUsuario();
  useMeta({ titulo: t('Conta'), caminho: href('/conta', idioma), naoIndexar: true });

  if (isPending) return <Carregando />;
  if (!usuario) return <Navigate to={href('/entrar', idioma)} replace />;

  const atalhos = [
    { rota: '/conta/meus-dados' as const, rotulo: t('Meus dados'), Icone: UserCog },
    { rota: '/conta/favoritos' as const, rotulo: t('Favoritos'), Icone: Heart },
    { rota: '/conta/roteiros' as const, rotulo: t('Meus roteiros'), Icone: Map },
  ];

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold text-brand">{t('Conta')}</h1>
      <p className="mt-1 text-nota text-texto-2">{usuario.nome}</p>

      <ul className="mt-8 max-w-md divide-y divide-borda border-y border-borda">
        {atalhos.map(({ rota, rotulo, Icone }) => (
          <li key={rota}>
            <Link to={href(rota, idioma)} className="flex items-center gap-3 py-4 transition hover:text-brand">
              <Icone size={18} className="text-acento" aria-hidden="true" />
              {rotulo}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={async () => {
              await sair();
              await atualizar();
              navegar(href('/', idioma), { replace: true });
            }}
            className="flex w-full items-center gap-3 py-4 text-left text-erro transition hover:opacity-80"
          >
            <LogOut size={18} aria-hidden="true" />
            {t('Sair')}
          </button>
        </li>
      </ul>
    </div>
  );
}
