import { useT } from '@/i18n/Traducao';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIAS, type Categoria, type Idioma } from '@/i18n/categorias';
import { destinoPorIdioma, hrefCategoria, hrefDestino, hrefEmpresa, raiz } from '@/i18n/caminhos';
import type { Destino } from '@/lib/geo/indice';
import { JsonLd, listaDeItens, migalhas } from '@/lib/seo/jsonld';
import { useMeta } from '@/lib/meta';
import { useEmpresas } from '@/lib/consultas';
import Carregando from '@/components/layout/Carregando';
import FiltroLocal from './FiltroLocal';
import GradeEmpresas from './GradeEmpresas';

/**
 * Atrativos de uma categoria em um destino — a página que responde à busca
 * mais comum do site: "cachoeiras em Capitólio".
 *
 * O destino pode ser uma região ou uma cidade; para quem busca dá no mesmo, e
 * o índice de geografia já resolveu qual é qual.
 */

interface Props {
  destino: Destino;
  categoria: Categoria;
  idioma: Idioma;
}

export default function PaginaDestino({ destino, categoria, idioma }: Props) {
  const t = useT();
  const { data: empresas = [], isPending } = useEmpresas({ categoria, destino });

  const inicio = raiz(idioma) || '/';
  const caminhoCategoria = hrefCategoria(categoria, idioma);
  const caminhoDestino = hrefDestino(categoria, destino.slug, idioma);

  // As outras categorias no mesmo destino: é o caminho natural de quem já
  // escolheu para onde vai e agora quer onde dormir e onde comer.
  const outras = CATEGORIAS.filter((c) => c.id !== categoria.id);

  const quantos = destino.quantidade > 0 ? ` — ${destino.quantidade} ${t('lugares')}` : '';
  useMeta({
    titulo: `${t(categoria.titulo)} em ${destino.nome}${quantos}`,
    descricao: `${t(categoria.titulo)} em ${destino.nome}${
      destino.estado ? `, ${destino.estado.nome}` : ''
    }. ${t(categoria.descricao)}`,
    caminho: caminhoDestino,
    porIdioma: destinoPorIdioma(categoria, destino.slug),
    imagem: destino.foto,
  });

  return (
    <>
      <JsonLd
        blocos={[
          migalhas([
            { nome: 'Home', caminho: inicio },
            { nome: t(categoria.titulo), caminho: caminhoCategoria },
            { nome: destino.nome, caminho: caminhoDestino },
          ]),
          ...(empresas.length > 0
            ? [
                listaDeItens(
                  `${t(categoria.titulo)} em ${destino.nome}`,
                  empresas.slice(0, 30).map((empresa) => ({
                    nome: empresa.nome,
                    caminho: hrefEmpresa(empresa, categoria, idioma),
                  })),
                ),
              ]
            : []),
        ]}
      />

      {/* Cabeçalho na folha branca: o texto vem primeiro (é o que o Google lê
          e o que a pessoa veio buscar); a foto entra como um painel, não como
          uma faixa que pinta a página. */}
      <div className="folha pt-6">
        <nav aria-label={t('Você está em')} className="flex flex-wrap items-center gap-2 text-mini text-texto-3">
          <Link to="/" className="transition hover:text-brand">
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <Link to={caminhoCategoria} className="transition hover:text-brand">
            {t(categoria.titulo)}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-texto-2">{destino.nome}</span>
        </nav>

        <h1 className="mt-3 max-w-3xl text-titulo font-bold leading-tight tracking-tight text-balance text-brand sm:text-heroi">
          {t(categoria.titulo)} em {destino.nome}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-nota text-texto-3">
          <MapPin size={14} className="text-acento" aria-hidden="true" />
          {destino.tipo === 'cidade' && destino.regiao ? `${destino.regiao.nome} · ` : ''}
          {destino.estado?.nome}
          {empresas.length > 0 && ` · ${empresas.length} ${t('lugares')}`}
        </p>

        <FiltroLocal categoria={categoria} idioma={idioma} destino={destino} />
      </div>

      <div className="folha py-8">
        {isPending ? (
          <Carregando altura="min-h-[30vh]" />
        ) : empresas.length > 0 ? (
          <GradeEmpresas
            empresas={empresas}
            categoria={categoria}
            idioma={idioma}
            prioridadeNosPrimeiros={4}
          />
        ) : (
          <div className="recuo p-10 text-center">
            <p className="text-texto-2">
              {t('Ainda não há nada por aqui. Escolha outro destino ou volte em breve.')}
            </p>
            <Link
              to={caminhoCategoria}
              className="mt-4 inline-block font-semibold text-acento-escuro hover:underline"
            >
              {t('Ver todos os destinos')}
            </Link>
          </div>
        )}

        {destino.tipo === 'regiao' && (destino.cidades?.length ?? 0) > 1 && (
          <section className="mt-12">
            <h2 className="rotulo-secao mb-5">{t('Cidades')}</h2>
            <ul className="flex flex-wrap gap-2">
              {destino.cidades!.map((cidade) => (
                <li key={cidade.id}>
                  <Link
                    to={hrefDestino(categoria, cidade.slug, idioma)}
                    className="inline-flex items-center gap-1.5 rounded-pilula border border-borda bg-cartao px-3.5 py-1.5 text-nota text-texto transition hover:border-brand hover:text-brand"
                  >
                    <MapPin size={12} className="text-acento" aria-hidden="true" />
                    {cidade.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2 className="rotulo-secao mb-5">
            {t('Também em')} {destino.nome}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {outras.map((outra) => (
              <li key={outra.id}>
                <Link
                  to={hrefDestino(outra, destino.slug, idioma)}
                  className="inline-flex rounded-pilula border border-borda bg-cartao px-3.5 py-1.5 text-nota text-texto transition hover:border-brand hover:text-brand"
                >
                  {t(outra.titulo)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
