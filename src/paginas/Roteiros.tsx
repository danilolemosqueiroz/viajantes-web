import { useIdioma, useT } from '@/i18n/Traducao';
import { href, hrefPorIdioma } from '@/i18n/caminhos';
import { useRoteiros } from '@/lib/consultas';
import { useMeta } from '@/lib/meta';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import Assinar from '@/features/roteiros/Assinar';
import CardRoteiro from '@/features/roteiros/CardRoteiro';
import Carregando from '@/components/layout/Carregando';

/** Lista de roteiros prontos: só a capa de cada um, e a oferta do plano para quem não assina. */
export default function Roteiros() {
  const t = useT();
  const idioma = useIdioma();
  const { data: roteiros = [], isPending } = useRoteiros();

  const caminho = href('/roteiros', idioma);
  useMeta({
    titulo: t('Roteiros prontos'),
    descricao: t('Roteiros de viagem prontos, dia a dia, com os atrativos já organizados por logística.'),
    caminho,
    porIdioma: hrefPorIdioma('/roteiros'),
  });

  return (
    <>
      <JsonLd blocos={[migalhas([{ nome: 'Home', caminho: '/' }, { nome: t('Roteiros'), caminho }])]} />

      <div className="folha py-10">
        <header className="max-w-2xl">
          <h1 className="text-titulo font-bold leading-tight tracking-tight text-brand text-balance sm:text-heroi">
            {t('Roteiros prontos')}
          </h1>
          <p className="mt-2 text-corpo font-light text-texto-2">
            {t('Roteiros de viagem prontos, dia a dia, com os atrativos já organizados por logística.')}
          </p>
        </header>

        <Assinar compacto />

        {isPending ? (
          <Carregando altura="min-h-[30vh]" />
        ) : roteiros.length === 0 ? (
          <div className="recuo mt-8 p-10 text-center text-texto-2">{t('Nenhum resultado encontrado')}</div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
            {roteiros.map((roteiro, indice) => (
              <CardRoteiro
                key={roteiro.idroteiro_personalizado}
                roteiro={roteiro}
                prioridade={indice < 4}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
