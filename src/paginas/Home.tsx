import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIAS } from '@/i18n/categorias';
import { href, hrefCategoria, hrefPorIdioma } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useEmpresas, useRoteiros } from '@/lib/consultas';
import { useRegiao } from '@/lib/regiao';
import { useMeta } from '@/lib/meta';
import { JsonLd } from '@/lib/seo/jsonld';
import FaixaEmpresas from '@/features/catalogo/FaixaEmpresas';
import FaixaRoteiros from '@/features/roteiros/FaixaRoteiros';
import { sortearRoteiros } from '@/features/roteiros/dados';
import FaixaOfertas from '@/features/ofertas/FaixaOfertas';
import Hero from '@/features/home/Hero';
import Mosaico from '@/features/home/Mosaico';
import Destinos from '@/features/home/Destinos';
import Numeros from '@/features/home/Numeros';
import Conectado from '@/features/home/Conectado';
import Historia from '@/features/home/Historia';
import Aplicativo from '@/features/home/Aplicativo';
import Parceiros from '@/features/home/Parceiros';
import Redes from '@/features/home/Redes';
import CtaFinal from '@/features/home/CtaFinal';

/** A home. Primeiro entrega (as faixas de conteúdo), depois explica (quem somos, o aplicativo).
 * A faixa de "Roteiros prontos" fica no meio, junto dos destinos. */
const SECOES = ['cachoeiras', 'pousadas', 'passeios', 'restaurantes'] as const;

export default function Home() {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();
  const { data: roteiros = [] } = useRoteiros(regiao?.id);
  // Sem região a ordem por destaque mostrava sempre os mesmos destinos; aqui ela é sorteada.
  const naFaixa = useMemo(
    () => (regiao ? roteiros : sortearRoteiros(roteiros)).slice(0, 10),
    [roteiros, regiao],
  );

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
        {SECOES.map((id) => (
          <SecaoCategoria key={id} id={id} />
        ))}

        <Mosaico />
        <Destinos />

        {naFaixa.length > 0 && (
          <section>
            <h2 className="rotulo-secao mb-5">
              {t('Roteiros prontos')}
              <Link to={href('/roteiros', idioma)}>{t('Ver todos')}</Link>
            </h2>
            <FaixaRoteiros roteiros={naFaixa} />
          </section>
        )}

        <FaixaOfertas />

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
