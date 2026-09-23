import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EmpresaResumo } from '@/lib/tipos';
import type { Categoria, Idioma } from '@/i18n/categorias';
import { hrefEmpresa } from '@/i18n/caminhos';
import { capaEmpresa } from './dados';

/**
 * Card de atrativo.
 *
 * Não tem moldura, borda nem sombra: numa folha branca o cartão é a própria
 * foto, e o texto respira embaixo dela. É assim que o app mostra o conteúdo —
 * o que muda de plataforma é só a quantidade de colunas.
 *
 * `formato`:
 *  - `grade`   → foto 4:3 com título embaixo (listagens);
 *  - `retrato` → foto 171:233 com o título por cima (faixas horizontais, o
 *    mesmo formato dos cards de cachoeira da home do aplicativo).
 */
export default function CardEmpresa({
  empresa,
  categoria,
  idioma,
  formato = 'grade',
  prioridade = false,
}: {
  empresa: EmpresaResumo;
  categoria: Categoria;
  idioma: Idioma;
  formato?: 'grade' | 'retrato';
  prioridade?: boolean;
}) {
  const capa = capaEmpresa(empresa);
  const destaque = empresa.destaquesite === 1;
  const complexo = Number(empresa.total_atrativos ?? 0);
  const nota = Number(empresa.nota ?? 0);
  const destino = hrefEmpresa(empresa, categoria, idioma);

  const foto = (
    <>
      {capa ? (
        <img
          src={capa}
          alt=""
          loading={prioridade ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-brand-suave" />
      )}
      {destaque && (
        <span className="absolute left-2.5 top-2.5 rounded-md bg-acento px-2 py-1 text-mini font-bold text-white">
          Destaque
        </span>
      )}
      {complexo > 0 && (
        <span className="absolute right-2.5 top-2.5 rounded-md bg-black/50 px-2 py-1 text-mini font-semibold text-white backdrop-blur-sm">
          {complexo === 1 ? '1 atrativo' : `${complexo} atrativos`}
        </span>
      )}
    </>
  );

  if (formato === 'retrato') {
    return (
      <article>
        <Link to={destino} className="group block w-[10.5rem] sm:w-[11.5rem]">
          <div className="relative aspect-[171/233] overflow-hidden rounded-cartao bg-brand-suave">
            {foto}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <h3 className="absolute inset-x-2.5 bottom-2.5 text-nota font-bold leading-snug text-white">
              {empresa.nome}
            </h3>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="h-full">
      <Link to={destino} className="group flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-cartao bg-brand-suave">{foto}</div>

        <h3 className="mt-2.5 text-base font-semibold leading-snug text-brand transition group-hover:text-acento-escuro">
          {empresa.nome}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-3 text-nota text-texto-3">
          {empresa.cidade && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{empresa.cidade}</span>
            </span>
          )}
          {nota > 0 && (
            <span className="flex shrink-0 items-center gap-1 font-semibold text-texto-2">
              <Star size={12} className="fill-acento text-acento" aria-hidden="true" />
              {nota.toFixed(1).replace('.', ',')}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
