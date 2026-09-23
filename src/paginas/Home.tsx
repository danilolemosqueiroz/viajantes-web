import { Link } from 'react-router-dom';
import { CATEGORIAS } from '@/i18n/categorias';
import { href, hrefCategoria, hrefPorIdioma } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useEmpresas } from '@/lib/consultas'; // ROTEIROS PRONTOS (escondido): volta o `useRoteiros` aqui
import { useRegiao } from '@/lib/regiao';
import { useMeta } from '@/lib/meta';
import { JsonLd } from '@/lib/seo/jsonld';
import FaixaEmpresas from '@/features/catalogo/FaixaEmpresas';
// ROTEIROS PRONTOS (escondido): import { default as FaixaRoteiros } from '@/features/roteiros/FaixaRoteiros';
import FaixaOfertas from '@/features/ofertas/FaixaOfertas';
import Hero from '@/features/home/Hero';
import Blog from '@/features/home/Blog';
import Mosaico from '@/features/home/Mosaico';
import Destinos from '@/features/home/Destinos';
import Numeros from '@/features/home/Numeros';
import Conectado from '@/features/home/Conectado';
import Historia from '@/features/home/Historia';
import Aplicativo from '@/features/home/Aplicativo';
import Parceiros from '@/features/home/Parceiros';
import Redes from '@/features/home/Redes';
import CtaFinal from '@/features/home/CtaFinal';

/**
 * A home.
 *
 * Ela faz duas coisas em sequência, nesta ordem de propósito: primeiro ENTREGA
 * (as faixas de conteúdo real — atrativos, destinos, ofertas — para quem já
 * chegou querendo viajar), depois EXPLICA (quem somos, a comunidade, o
 * aplicativo, os parceiros) para quem chegou sem saber o que é o Viajantes.
 *
 * A faixa de "Roteiros prontos" está comentada por ora (procure por
 * ROTEIROS PRONTOS neste arquivo). A página /roteiros segue no ar.
 *
 * Todo o conteúdo vem da API: não há lista de destino nem de experiência
 * escrita aqui dentro. O que é fixo são os textos institucionais e os números
 * da plataforma, que ficam em `features/home/config.ts`.
 */
const SECOES = ['cachoeiras', 'pousadas', 'passeios', 'restaurantes'] as const;

export default function Home() {
  const t = useT();
  const idioma = useIdioma();
  // ROTEIROS PRONTOS (escondido) — só a faixa de roteiros usava a região aqui
  // (cada faixa de categoria pede a sua). Ao reativar, volte as duas linhas:
  // const { regiao } = useRegiao();
  // const { data: roteiros = [] } = useRoteiros(regiao?.id);

  useMeta({
    titulo: t('Viajantes App — Guia de Cachoeiras, Pousadas e Turismo'),
    descricao: t(
      'O Viajantes App é o guia turístico com mais de 1500 cachoeiras com rotas traçadas, pousadas, passeios, restaurantes e roteiros em Minas Gerais e no Brasil.',
    ),
    caminho: href('/', idioma),
    porIdioma: hrefPorIdioma('/'),
  });

  return (
    <>
      <JsonLd />

      <Hero />

      <div className="folha space-y-14 pb-16 pt-12 sm:space-y-16">
        {/* ROTEIROS PRONTOS (escondido) — para reativar, descomente este bloco
            e as três linhas marcadas do mesmo jeito acima: o import do
            `FaixaRoteiros`, o `useRoteiros` e o `roteiros` do corpo.
            A página /roteiros continua no ar; o que saiu foi só a faixa aqui. */}
        {/*
        {roteiros.length > 0 && (
          <section>
            <h2 className="rotulo-secao mb-5">
              {t('Roteiros prontos')}
              <Link to={href('/roteiros', idioma)}>{t('Ver todos')}</Link>
            </h2>
            <FaixaRoteiros roteiros={roteiros.slice(0, 10)} />
          </section>
        )}
        */}

        {SECOES.map((id) => (
          <SecaoCategoria key={id} id={id} />
        ))}

        <Mosaico />
        <Destinos />
        <FaixaOfertas />
        <Blog />

        <Numeros />
        <Conectado />
        <Historia />
        <Aplicativo />
        <Parceiros />
        <Redes />
        <CtaFinal />
      </div>
    </>
  );
}

/** Uma faixa por categoria, filtrada pela região escolhida (se houver). */
function SecaoCategoria({ id }: { id: string }) {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();
  const categoria = CATEGORIAS.find((c) => c.id === id)!;
  const { data: empresas = [] } = useEmpresas({ categoria, regiao: regiao?.id, limite: 10 });

  if (empresas.length === 0) return null;

  return (
    <section>
      <h2 className="rotulo-secao mb-5">
        {t(categoria.tituloCurto)}
        <Link to={hrefCategoria(categoria, idioma)}>{t('Ver todos')}</Link>
      </h2>
      <FaixaEmpresas empresas={empresas} categoria={categoria} idioma={idioma} />
    </section>
  );
}
