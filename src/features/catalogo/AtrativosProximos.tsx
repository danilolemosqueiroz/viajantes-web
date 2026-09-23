import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { categoriaPorEavmoda, type Idioma } from '@/i18n/categorias';
import { hrefEmpresa } from '@/i18n/caminhos';
import type { AtrativoProximo } from '@/lib/tipos';
import { abasProximos } from './dados';

/**
 * Atrativos num raio de 30 km, em abas por categoria como no aplicativo:
 * numa cachoeira, Restaurantes e Hospedagens; numa pousada, Cachoeiras e
 * Restaurantes (a API já tira a categoria do próprio lugar).
 */
export default function AtrativosProximos({ proximos, idioma }: { proximos: AtrativoProximo[]; idioma: Idioma }) {
  const t = useT();
  const abas = abasProximos(proximos);
  const [escolhida, setEscolhida] = useState<number | null>(null);

  if (abas.length === 0) return null;
  const ativa = abas.find((aba) => aba.eavmoda === escolhida) ?? abas[0];

  return (
    <section>
      <h2 className="rotulo-secao mb-1">{t('Atrativos próximos')}</h2>
      <p className="mb-4 text-mini text-texto-3">{t('Num raio de 30 km deste local')}</p>

      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {abas.map((aba) => (
          <button
            key={aba.eavmoda}
            type="button"
            role="tab"
            id={`aba-proximos-${aba.eavmoda}`}
            aria-selected={aba === ativa}
            aria-controls={`painel-proximos-${aba.eavmoda}`}
            onClick={() => setEscolhida(aba.eavmoda)}
            className={aba === ativa ? 'chip chip--ativo' : 'chip'}
          >
            {t(aba.rotulo)}
            <span className="text-mini opacity-80">{aba.itens.length}</span>
          </button>
        ))}
      </div>

      <ul
        role="tabpanel"
        id={`painel-proximos-${ativa.eavmoda}`}
        aria-labelledby={`aba-proximos-${ativa.eavmoda}`}
        className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3"
      >
        {ativa.itens.map((atrativo) => {
          const categoria = categoriaPorEavmoda(atrativo.eavmoda);
          const destino = categoria ? hrefEmpresa(atrativo, categoria, idioma) : `/e/${atrativo.idempresa}`;
          const lugar = atrativo.cidade || atrativo.endereco || '';
          return (
            <li key={atrativo.idempresa}>
              <Link to={destino} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-cartao bg-brand-suave">
                  {atrativo.capa && (
                    <img
                      src={atrativo.capa}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                  {atrativo.distancia_km != null && (
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-mini font-semibold text-white backdrop-blur-sm">
                      <MapPin size={11} aria-hidden="true" />
                      {Number(atrativo.distancia_km).toFixed(1).replace('.', ',')} km
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-nota font-semibold leading-snug text-brand transition group-hover:text-acento-escuro">
                  {atrativo.nome}
                </span>
                {lugar && <span className="mt-0.5 block truncate text-mini text-texto-3">{lugar}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
