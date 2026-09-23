import { Link, useParams } from 'react-router-dom';
import { CalendarRange, CircleCheck, MapPin } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href, hrefRoteiro } from '@/i18n/caminhos';
import { lerSlugComId } from '@/lib/slug';
import { useAssinaturaSite, useItensRoteiro, useRoteiro } from '@/lib/consultas';
import { useMeta } from '@/lib/meta';
import { formatarData } from '@/lib/moeda';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import { caminhoRoteiro, cidadesDoRoteiro, rotuloDias } from '@/features/roteiros/dados';
import Assinar from '@/features/roteiros/Assinar';
import RoteiroCompleto from '@/features/roteiros/RoteiroCompleto';
import Carregando from '@/components/layout/Carregando';
import NaoEncontrada from './NaoEncontrada';

/**
 * Detalhe de um roteiro pronto: capa, descrição e o dia a dia. O dia a dia só
 * aparece para quem assina o Plano Viajantes (loja ou site) — docs/roteiros.md.
 */
export default function Roteiro() {
  const { slug = '' } = useParams();
  const t = useT();
  const idioma = useIdioma();
  const comId = lerSlugComId(slug);

  const { data: roteiro, isPending } = useRoteiro(comId?.id);
  const { data: assinatura } = useAssinaturaSite();
  const liberado = assinatura?.assinado === true;
  const { data: itens = [], isPending: carregandoItens } = useItensRoteiro(comId?.id, liberado);

  useMeta({
    titulo: roteiro?.titulo ?? '',
    descricao: roteiro?.descricao ?? '',
    caminho: roteiro ? hrefRoteiro(caminhoRoteiro(roteiro), idioma) : undefined,
    imagem: roteiro?.foto_capa,
  });

  if (!comId) return <NaoEncontrada />;
  if (isPending) return <Carregando />;
  if (!roteiro) return <NaoEncontrada />;

  const cidades = cidadesDoRoteiro(roteiro);
  const ativa = assinatura?.assinatura;

  return (
    <>
      <JsonLd
        blocos={[
          migalhas([
            { nome: 'Home', caminho: '/' },
            { nome: t('Roteiros'), caminho: href('/roteiros', idioma) },
            { nome: roteiro.titulo, caminho: hrefRoteiro(caminhoRoteiro(roteiro), idioma) },
          ]),
        ]}
      />

      {roteiro.foto_capa && (
        <div className="relative isolate h-64 overflow-hidden bg-brand sm:h-80">
          <img src={roteiro.foto_capa} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/85 via-brand/35 to-brand/10" />
          <div className="folha relative flex h-full flex-col justify-end pb-8">
            <h1 className="max-w-3xl text-titulo font-bold leading-tight text-balance text-white sm:text-heroi">
              {roteiro.titulo}
            </h1>
          </div>
        </div>
      )}

      <div className="folha py-8">
        {!roteiro.foto_capa && (
          <h1 className="max-w-3xl text-titulo font-bold leading-tight text-balance text-brand sm:text-heroi">
            {roteiro.titulo}
          </h1>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-nota text-texto-3">
          <span className="flex items-center gap-1">
            <CalendarRange size={14} aria-hidden="true" />
            {rotuloDias(roteiro.total_dias)}
          </span>
          {cidades.length > 0 && (
            <span className="flex items-center gap-1">
              <MapPin size={14} aria-hidden="true" />
              {cidades.join(', ')}
            </span>
          )}
        </div>

        {roteiro.descricao && <p className="mt-4 max-w-3xl text-corpo text-texto-2">{roteiro.descricao}</p>}

        {liberado ? (
          <>
            {ativa && (
              <p className="mt-6 flex flex-wrap items-center gap-2 rounded-cartao bg-ok/10 p-3 text-nota text-ok">
                <CircleCheck size={16} aria-hidden="true" />
                {ativa.data_expiracao
                  ? t('{{plano}} ativo até {{data}}.', { plano: ativa.plano, data: formatarData(ativa.data_expiracao, idioma) })
                  : t('{{plano}} ativo.', { plano: ativa.plano })}
                <Link to={href('/conta/roteiros', idioma)} className="font-semibold underline">
                  {t('Meus roteiros')}
                </Link>
              </p>
            )}
            {carregandoItens ? <Carregando altura="min-h-[30vh]" /> : <RoteiroCompleto itens={itens} idioma={idioma} />}
          </>
        ) : (
          <Assinar contexto={roteiro.titulo} />
        )}

        <p className="mt-8">
          <Link to={href('/roteiros', idioma)} className="text-nota font-semibold text-acento-escuro hover:underline">
            {t('Ver todos os roteiros')}
          </Link>
        </p>
      </div>
    </>
  );
}
