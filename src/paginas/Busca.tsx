import { useSearchParams } from 'react-router-dom';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useEmpresas } from '@/lib/consultas';
import { useRegiao } from '@/lib/regiao';
import { useMeta } from '@/lib/meta';
import { CATEGORIAS, categoriaPorEavmoda } from '@/i18n/categorias';
import CardEmpresa from '@/features/catalogo/CardEmpresa';
import Carregando from '@/components/layout/Carregando';

/** Busca em todos os tipos de atrativo, como no site antigo. */
export default function Busca() {
  const [parametros] = useSearchParams();
  const termo = (parametros.get('q') ?? '').trim();
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();

  const { data: resultados = [], isPending } = useEmpresas(
    { busca: termo, regiao: regiao?.id },
    termo.length > 1,
  );

  // Resultado de busca não é página de conteúdo: fora do índice.
  useMeta({ titulo: termo ? `${t('Buscar')}: ${termo}` : t('Buscar'), caminho: href('/busca', idioma), naoIndexar: true });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold leading-tight text-brand">
        {termo ? `${t('Buscar')}: ${termo}` : t('Buscar')}
      </h1>

      {termo.length <= 1 ? (
        <p className="mt-4 text-texto-2">{t('Buscar cachoeira, pousada, cidade...')}</p>
      ) : isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : resultados.length === 0 ? (
        <div className="recuo mt-6 p-10 text-center">
          <p className="font-semibold text-texto">{t('Nenhum resultado encontrado')}</p>
          <p className="mt-1 text-nota text-texto-2">{t('Tente outro nome ou região.')}</p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-nota text-texto-3">
            {resultados.length} {t(resultados.length === 1 ? 'resultado' : 'resultados')}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
            {resultados.map((empresa) => (
              <CardEmpresa
                key={empresa.idempresa}
                empresa={empresa}
                categoria={categoriaPorEavmoda(empresa.eavmoda) ?? CATEGORIAS[0]}
                idioma={idioma}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
