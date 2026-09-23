import { Link, useParams, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { CATEGORIAS, categoriaPorSlug } from '@/i18n/categorias';
import { categoriaPorIdioma, hrefCategoria, hrefDestino } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useEmpresas, useGeografia } from '@/lib/consultas';
import { useRegiao } from '@/lib/regiao';
import { useMeta } from '@/lib/meta';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import FiltroLocal from '@/features/catalogo/FiltroLocal';
import GradeEmpresas from '@/features/catalogo/GradeEmpresas';
import Carregando from '@/components/layout/Carregando';
import NaoEncontrada from './NaoEncontrada';

/**
 * Hub de uma categoria: /cachoeiras · /en/waterfalls.
 * `?estado=ID` filtra pelo estado (o filtro Estado › Região › Cidade); região
 * e cidade têm página própria e não passam por aqui.
 */
export default function Categoria() {
  const { categoria: slug } = useParams();
  const [params] = useSearchParams();
  const idioma = useIdioma();
  const t = useT();
  const { regiao } = useRegiao();
  const categoria = categoriaPorSlug(slug ?? '', idioma);

  const estadoId = Number(params.get('estado')) || null;
  const { data: empresas = [], isPending } = useEmpresas(
    { categoria: categoria ?? undefined, estado: estadoId ?? undefined, regiao: estadoId ? undefined : regiao?.id },
    Boolean(categoria),
  );
  const { data: geografia } = useGeografia();

  const caminho = categoria ? hrefCategoria(categoria, idioma) : '/';
  useMeta({
    titulo: categoria ? t(categoria.titulo) : '',
    descricao: categoria ? t(categoria.descricao) : '',
    caminho,
    porIdioma: categoria ? categoriaPorIdioma(categoria) : undefined,
  });

  if (!categoria) return <NaoEncontrada />;

  const estado = estadoId ? geografia?.estados.find((e) => e.id === estadoId) : null;
  const destinos = (estado?.regioes ?? geografia?.regioes ?? []).filter((r) => r.quantidade > 0).slice(0, 24);

  return (
    <>
      <JsonLd blocos={[migalhas([{ nome: 'Home', caminho: '/' }, { nome: t(categoria.titulo), caminho }])]} />

      <div className="folha pt-6">
        <h1 className="max-w-3xl text-titulo font-bold leading-tight tracking-tight text-balance text-brand sm:text-heroi">
          {t(categoria.titulo)}
          {estado ? ` — ${estado.nome}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-corpo font-light text-texto-2">{t(categoria.descricao)}</p>

        <FiltroLocal categoria={categoria} idioma={idioma} estadoId={estadoId} />
      </div>

      <div className="folha py-8">
        {isPending ? (
          <Carregando altura="min-h-[30vh]" />
        ) : empresas.length > 0 ? (
          <GradeEmpresas empresas={empresas} categoria={categoria} idioma={idioma} prioridadeNosPrimeiros={4} />
        ) : (
          <div className="recuo p-10 text-center text-texto-2">
            {t('Ainda não há nada por aqui. Escolha outro destino ou volte em breve.')}
          </div>
        )}

        {destinos.length > 0 && (
          <section className="mt-12">
            <h2 className="rotulo-secao mb-5">{t('Destinos')}</h2>
            <ul className="flex flex-wrap gap-2">
              {destinos.map((destino) => (
                <li key={destino.id}>
                  <Link to={hrefDestino(categoria, destino.slug, idioma)} className="chip">
                    <MapPin size={12} className="text-acento" aria-hidden="true" />
                    {destino.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2 className="rotulo-secao mb-5">{t('Categorias')}</h2>
          <ul className="flex flex-wrap gap-2">
            {CATEGORIAS.filter((c) => c.id !== categoria.id).map((outra) => (
              <li key={outra.id}>
                <Link to={hrefCategoria(outra, idioma)} className="chip">
                  {t(outra.tituloCurto)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
