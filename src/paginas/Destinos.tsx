import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useGeografia } from '@/lib/consultas';
import { useMeta } from '@/lib/meta';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import { prepararEstados } from '@/features/destinos/filtrar';
import FiltroDestinos from '@/features/destinos/FiltroDestinos';
import Carregando from '@/components/layout/Carregando';
import { hrefPorIdioma } from '@/i18n/caminhos';

/** Todos os destinos, por estado — a página "Explorar" do site. */
export default function Destinos() {
  const t = useT();
  const idioma = useIdioma();
  const { data: geografia, isPending } = useGeografia();

  const caminho = href('/destinos', idioma);
  useMeta({
    titulo: t('Destinos'),
    descricao: t('Todas as regiões e cidades com atrativos mapeados, estado por estado.'),
    caminho,
    porIdioma: hrefPorIdioma('/destinos'),
  });

  return (
    <>
      <JsonLd blocos={[migalhas([{ nome: 'Home', caminho: '/' }, { nome: t('Destinos'), caminho }])]} />

      <div className="folha py-10">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-titulo font-bold leading-tight tracking-tight text-brand text-balance sm:text-heroi">
            {t('Destinos')}
          </h1>
          <p className="mt-2 text-corpo font-light text-texto-2">
            {t('Todas as regiões e cidades com atrativos mapeados, estado por estado.')}
          </p>
        </header>

        {isPending || !geografia ? (
          <Carregando altura="min-h-[30vh]" />
        ) : (
          <FiltroDestinos estados={prepararEstados(geografia)} idioma={idioma} />
        )}
      </div>
    </>
  );
}
