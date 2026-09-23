import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, X } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { hrefPaginaDestino } from '@/i18n/caminhos';
import type { Idioma } from '@/i18n/categorias';
import { contarRegioes, filtrarEstados, type EstadoFiltravel } from './filtrar';

/**
 * Filtro da página Destinos: um campo de busca e as pílulas de estado.
 *
 * Com 193 regiões em vários estados, rolar a lista inteira é o caminho mais
 * lento para achar um lugar. Aqui a pessoa digita o nome (da região OU de uma
 * cidade dela) e/ou escolhe o estado, e a lista responde na hora — sem ida ao
 * servidor, porque a geografia inteira já veio com a página.
 */
export default function FiltroDestinos({
  estados,
  idioma,
}: {
  estados: EstadoFiltravel[];
  /** O idioma da tela: o endereço da região muda de nome em cada um. */
  idioma: Idioma;
}) {
  const t = useT();
  const [texto, setTexto] = useState('');
  const [estadoId, setEstadoId] = useState<number | null>(null);

  const visiveis = useMemo(
    () => filtrarEstados(estados, { texto, estadoId }),
    [estados, texto, estadoId],
  );
  const quantas = contarRegioes(visiveis);
  const filtrando = texto.trim() !== '' || estadoId !== null;

  const limpar = () => {
    setTexto('');
    setEstadoId(null);
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="pilula-busca max-w-xl">
          <Search size={18} className="shrink-0 text-texto-3" aria-hidden="true" />
          <input
            type="search"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder={t('Buscar região ou cidade...')}
            aria-label={t('Buscar região ou cidade...')}
          />
          {texto !== '' && (
            <button
              type="button"
              onClick={() => setTexto('')}
              aria-label={t('Limpar')}
              // Neutro: o botão da pílula de busca é verde quando ENVIA algo.
              // Aqui ele só apaga o que foi digitado, então não compete.
              className="!bg-transparent !text-texto-3 hover:!text-brand"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEstadoId(null)}
            aria-pressed={estadoId === null}
            className={estadoId === null ? 'chip chip--ativo' : 'chip'}
          >
            {t('Todos os estados')}
          </button>

          {estados.map((estado) => (
            <button
              key={estado.id}
              type="button"
              onClick={() => setEstadoId(estado.id === estadoId ? null : estado.id)}
              aria-pressed={estado.id === estadoId}
              className={estado.id === estadoId ? 'chip chip--ativo' : 'chip'}
            >
              {estado.nome}
            </button>
          ))}
        </div>

        {filtrando && (
          <p className="flex flex-wrap items-center gap-3 text-nota text-texto-3">
            <span>
              {quantas} {t(quantas === 1 ? 'região' : 'regiões')}
            </span>
            <button
              type="button"
              onClick={limpar}
              className="font-semibold text-acento-escuro hover:underline"
            >
              {t('Limpar')}
            </button>
          </p>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="recuo p-10 text-center">
          <p className="font-semibold text-texto">{t('Nenhum resultado encontrado')}</p>
          <p className="mt-1 text-nota text-texto-2">{t('Tente outro nome ou região.')}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {visiveis.map((estado) => (
            <section key={estado.id}>
              <h2 className="rotulo-secao mb-5">{estado.nome}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {estado.regioes.map((regiao) => (
                  <li key={regiao.id}>
                    <Link
                      to={hrefPaginaDestino(regiao.slug, idioma)}
                      className="group flex items-center gap-3 overflow-hidden rounded-cartao border border-borda p-2 transition hover:border-brand"
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-cartao bg-brand-suave">
                        {regiao.foto && (
                          <img
                            src={regiao.foto}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-texto group-hover:text-acento-escuro">
                          {regiao.nome}
                        </span>
                        <span className="flex items-center gap-1 text-mini text-texto-3">
                          <MapPin size={11} aria-hidden="true" />
                          {regiao.quantidade} {t(regiao.quantidade === 1 ? 'atrativo' : 'atrativos')}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
