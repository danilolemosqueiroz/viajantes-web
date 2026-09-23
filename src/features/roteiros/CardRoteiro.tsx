import { CalendarRange, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Roteiro } from '@/lib/tipos';
import { caminhoRoteiro, rotuloDias } from './dados';
import { hrefRoteiro } from '@/i18n/caminhos';
import { useIdioma } from '@/i18n/Traducao';

/**
 * Card de roteiro pronto: SÓ a capa, com o título por cima. Nada de descrição,
 * cidades ou paradas aqui — o conteúdo é o que se compra.
 */
export default function CardRoteiro({
  roteiro,
  formato = 'grade',
  prioridade = false,
}: {
  roteiro: Roteiro;
  formato?: 'grade' | 'retrato';
  prioridade?: boolean;
}) {
  const idioma = useIdioma();
  const destaque = Number(roteiro.destaque) === 1;
  const destino = hrefRoteiro(caminhoRoteiro(roteiro), idioma);
  const retrato = formato === 'retrato';

  return (
    <article className={retrato ? undefined : 'h-full'}>
      <Link to={destino} className={`group block ${retrato ? 'w-[13rem]' : ''}`}>
        <div className={`relative ${retrato ? 'aspect-[171/233]' : 'aspect-[4/5]'} overflow-hidden rounded-cartao bg-brand-suave`}>
          {roteiro.foto_capa ? (
            <img
              src={roteiro.foto_capa}
              alt=""
              loading={prioridade ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 bg-brand-suave" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {destaque && (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-acento px-2 py-1 text-mini font-bold text-white">
              <Star size={10} className="fill-white" aria-hidden="true" />
              Destaque
            </span>
          )}
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-mini font-semibold text-white backdrop-blur-sm">
            <CalendarRange size={10} aria-hidden="true" />
            {rotuloDias(roteiro.total_dias)}
          </span>

          <h3 className={`absolute inset-x-3 bottom-3 font-bold leading-snug text-white ${retrato ? 'text-nota' : 'text-base'}`}>
            {roteiro.titulo}
          </h3>
        </div>
      </Link>
    </article>
  );
}
