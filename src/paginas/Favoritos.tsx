import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { apiGet } from '@/lib/api';
import { useUsuario } from '@/lib/conta';
import { useMeta } from '@/lib/meta';
import { CATEGORIAS, categoriaPorEavmoda } from '@/i18n/categorias';
import type { EmpresaResumo } from '@/lib/tipos';
import CardEmpresa from '@/features/catalogo/CardEmpresa';
import Carregando from '@/components/layout/Carregando';

/** Os favoritos da conta — os mesmos que a pessoa marcou no aplicativo. */
export default function Favoritos() {
  const t = useT();
  const idioma = useIdioma();
  const { data: usuario, isPending: carregandoUsuario } = useUsuario();

  const { data: favoritos = [], isPending } = useQuery<EmpresaResumo[]>({
    queryKey: ['favoritos'],
    queryFn: async () => {
      const r = await apiGet<EmpresaResumo[]>('/site/favoritos');
      return r.ok && Array.isArray(r.data) ? r.data : [];
    },
    enabled: Boolean(usuario),
  });

  useMeta({ titulo: t('Favoritos'), caminho: href('/conta/favoritos', idioma), naoIndexar: true });

  if (carregandoUsuario) return <Carregando />;
  if (!usuario) return <Navigate to={href('/entrar', idioma)} replace />;

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold text-brand">{t('Favoritos')}</h1>

      {isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : favoritos.length === 0 ? (
        <div className="recuo mt-6 p-10 text-center text-texto-2">
          {t('Você ainda não favoritou nenhum lugar.')}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
          {favoritos.map((empresa) => (
            <CardEmpresa
              key={empresa.idempresa}
              empresa={empresa}
              categoria={categoriaPorEavmoda(empresa.eavmoda) ?? CATEGORIAS[0]}
              idioma={idioma}
            />
          ))}
        </div>
      )}
    </div>
  );
}
