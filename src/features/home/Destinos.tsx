import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { href, hrefPaginaDestino } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useGeografia } from '@/lib/consultas';

/**
 * "Por onde você quer começar?" — as regiões com mais atrativos mapeados.
 *
 * Na entrega em PHP esta seção tinha seis destinos escritos à mão, todos
 * levando ao seletor de região em vez de a uma página — e o próprio autor
 * deixou anotado que era para ligar em `/site/regioes`. Aqui ela sai do
 * catálogo: nome, foto, contagem de atrativos e o endereço real da região.
 *
 * A ordem vem pronta do índice de geografia (da região com mais atrativos para
 * a com menos), então o que aparece primeiro é o que temos de mais completo —
 * e muda sozinho conforme o mapeamento cresce.
 */
const QUANTOS = 8;

export default function Destinos() {
  const t = useT();
  const idioma = useIdioma();
  const { data: geografia } = useGeografia();

  const regioes = (geografia?.regioes ?? []).slice(0, QUANTOS);
  if (regioes.length === 0) return null;

  return (
    <section aria-labelledby="destinos-titulo">
      <h2 className="rotulo-secao mb-5" id="destinos-titulo">
        {t('Por onde você quer começar?')}
        <Link to={href('/destinos', idioma)}>{t('Ver todos')}</Link>
      </h2>

      <ul className="trilho trilho--desvanece pb-1">
        {regioes.map((regiao) => (
          <li key={regiao.id}>
            <Link
              to={hrefPaginaDestino(regiao.slug, idioma)}
              className="group block w-56 sm:w-64"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-cartao bg-brand-suave">
                {regiao.foto && (
                  <img
                    src={regiao.foto}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {regiao.estado && (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-black/45 px-2 py-1 text-mini font-semibold text-white backdrop-blur-sm">
                    {regiao.estado.nome}
                  </span>
                )}

                <div className="absolute inset-x-3 bottom-3">
                  <h3 className="text-corpo font-bold leading-snug text-white">{regiao.nome}</h3>
                  {/* O "título turístico" é como o app apresenta a região
                      (ex.: "Circuito Canastra") — some quando repete o nome. */}
                  {regiao.tituloturistico && regiao.tituloturistico !== regiao.nome && (
                    <p className="mt-0.5 truncate text-mini text-white/80">{regiao.tituloturistico}</p>
                  )}
                  <p className="mt-1.5 flex items-center gap-1 text-mini font-semibold text-white/90">
                    <MapPin size={11} aria-hidden="true" />
                    {t('{{n}} atrativos', { n: regiao.quantidade })}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center">
        <Link to={href('/destinos', idioma)} className="botao-fio">
          {t('Ver todos os destinos')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
