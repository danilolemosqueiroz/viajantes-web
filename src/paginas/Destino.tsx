import { Link, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { iconeDaCategoria } from '@/components/layout/IconesCategoria';
import { CATEGORIAS } from '@/i18n/categorias';
import { href, hrefDestino, hrefPaginaDestino } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useDestino, useEmpresas, useRoteiros } from '@/lib/consultas';
import { useMeta } from '@/lib/meta';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import GradeEmpresas from '@/features/catalogo/GradeEmpresas';
import FaixaRoteiros from '@/features/roteiros/FaixaRoteiros';
import Carregando from '@/components/layout/Carregando';
import NaoEncontrada from './NaoEncontrada';
import { paginaDestinoPorIdioma } from '@/i18n/caminhos';

/** Página do destino: /destinos/capitolio — "o que fazer em Capitólio". */
export default function Destino() {
  const { destino: slug = '' } = useParams();
  const t = useT();
  const idioma = useIdioma();
  const { data: destino, isPending } = useDestino(slug);

  const idRegiao = destino ? (destino.tipo === 'regiao' ? destino.id : destino.regiao?.id) : undefined;
  const { data: roteiros = [] } = useRoteiros(idRegiao);
  const { data: cachoeiras = [] } = useEmpresas(
    { categoria: CATEGORIAS[0], destino, limite: 8 },
    Boolean(destino),
  );

  const caminho = hrefPaginaDestino(slug, idioma);
  useMeta({
    titulo: destino ? t('O que fazer em {{destino}}', { destino: destino.nome }) : '',
    descricao: destino
      ? t(
          'Cachoeiras, hospedagens, passeios e restaurantes em {{destino}}{{estado}}, com rota traçada e informações de quem já foi.',
          { destino: destino.nome, estado: destino.estado ? `, ${destino.estado.nome}` : '' },
        )
      : '',
    caminho,
    porIdioma: paginaDestinoPorIdioma(slug),
    imagem: destino?.foto,
  });

  if (isPending) return <Carregando />;
  if (!destino) return <NaoEncontrada />;

  const local = (
    <>
      {destino.tipo === 'cidade' && destino.regiao ? `${destino.regiao.nome} · ` : ''}
      {destino.estado?.nome}
      {destino.quantidade > 0 &&
        ` · ${destino.quantidade} ${t(destino.quantidade === 1 ? 'atrativo' : 'atrativos')}`}
    </>
  );

  return (
    <>
      <JsonLd
        blocos={[
          migalhas([
            { nome: 'Home', caminho: '/' },
            { nome: t('Destinos'), caminho: href('/destinos', idioma) },
            { nome: destino.nome, caminho },
          ]),
        ]}
      />

      {/* Abertura igual à da home: a foto do destino ocupa o topo inteiro e o
          título vive DENTRO dela. O h1 continua sendo texto de verdade. */}
      {destino.foto ? (
        <section className="relative isolate h-72 overflow-hidden bg-brand sm:h-96">
          <img src={destino.foto} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/85 via-brand/40 to-brand/10" />

          <div className="folha relative flex h-full flex-col justify-end pb-8 sm:pb-10">
            <nav aria-label={t('Você está em')} className="mb-3 flex flex-wrap items-center gap-2 text-mini text-white/75">
              <Link to={href('/', idioma)} className="transition hover:text-white">Home</Link>
              <span aria-hidden="true">›</span>
              <Link to={href('/destinos', idioma)} className="transition hover:text-white">{t('Destinos')}</Link>
            </nav>

            <h1 className="max-w-3xl text-heroi font-bold leading-[1.1] tracking-tight text-balance text-white">
              {t('O que fazer em {{destino}}', { destino: destino.nome })}
            </h1>
            <p className="mt-3 flex items-start gap-1.5 text-nota text-white/90">
              <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0" />
              <span>{local}</span>
            </p>
          </div>
        </section>
      ) : (
        <div className="folha pt-6">
          <h1 className="max-w-3xl text-titulo font-bold leading-tight tracking-tight text-balance text-brand sm:text-heroi">
            {t('O que fazer em {{destino}}', { destino: destino.nome })}
          </h1>
          <p className="mt-2 text-nota text-texto-3">{local}</p>
        </div>
      )}

      <div className="folha space-y-12 py-10">
        <section>
          <h2 className="rotulo-secao mb-5">{t('O que fazer')}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIAS.map((categoria) => {
              const Icone = iconeDaCategoria(categoria.icone);
              return (
                <li key={categoria.id}>
                  <Link
                    to={hrefDestino(categoria, slug, idioma)}
                    className="flex h-full flex-col items-center gap-2 rounded-cartao border border-borda p-4 text-center transition hover:border-brand"
                  >
                    <span className="flex size-12 items-center justify-center rounded-pilula bg-brand-suave text-brand">
                      <Icone size={22} />
                    </span>
                    <span className="text-mini font-medium leading-tight text-texto-2">
                      {t(categoria.tituloCurto)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {roteiros.length > 0 && (
          <section>
            <h2 className="rotulo-secao mb-5">{t('Roteiros prontos')}</h2>
            <FaixaRoteiros roteiros={roteiros.slice(0, 4)} />
          </section>
        )}

        {cachoeiras.length > 0 && (
          <section>
            <h2 className="rotulo-secao mb-5">{t(CATEGORIAS[0].titulo)}</h2>
            <GradeEmpresas empresas={cachoeiras} categoria={CATEGORIAS[0]} idioma={idioma} />
            <p className="mt-4 text-center">
              <Link
                to={hrefDestino(CATEGORIAS[0], slug, idioma)}
                className="text-nota font-semibold text-acento-escuro hover:underline"
              >
                {t('Ver tudo')}
              </Link>
            </p>
          </section>
        )}

        {destino.tipo === 'regiao' && (destino.cidades?.length ?? 0) > 1 && (
          <section>
            <h2 className="rotulo-secao mb-5">{t('Cidades')}</h2>
            <ul className="flex flex-wrap gap-2">
              {destino.cidades!.map((cidade) => (
                <li key={cidade.id}>
                  <Link to={hrefPaginaDestino(cidade.slug, idioma)} className="chip">
                    <MapPin size={12} className="text-acento" aria-hidden="true" />
                    {cidade.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
