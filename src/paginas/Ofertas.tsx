import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, Tag, TriangleAlert, X } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href, hrefPorIdioma } from '@/i18n/caminhos';
import { useMeta } from '@/lib/meta';
import { JsonLd, migalhas } from '@/lib/seo/jsonld';
import CardOferta from '@/features/ofertas/CardOferta';
import { listarCategorias, listarOfertas, POR_PAGINA, type CategoriaOferta } from '@/features/ofertas/dados';

/**
 * "Viajantes Recomenda" — ofertas e descontos do ecossistema.
 *
 * O conteúdo não é nosso: vem da Central de Ofertas (`features/ofertas/dados`),
 * onde o time publica. Esta tela só exibe, filtra e conta o clique.
 *
 * Se a Central cair, a página mostra o aviso e um botão de tentar de novo — e
 * nenhuma outra parte do site sente: é a única tela que depende dela.
 */
export default function Ofertas() {
  const t = useT();
  const idioma = useIdioma();

  const [categoria, setCategoria] = useState('todos');
  const [digitado, setDigitado] = useState('');
  const [busca, setBusca] = useState('');

  // A Central é pública e sem limite de chamadas conhecido: esperar a pessoa
  // parar de digitar evita disparar uma consulta por tecla.
  useEffect(() => {
    const relogio = setTimeout(() => setBusca(digitado.trim()), 400);
    return () => clearTimeout(relogio);
  }, [digitado]);

  const caminho = href('/ofertas', idioma);
  useMeta({
    titulo: t('Viajantes Recomenda — ofertas e descontos para viajar'),
    descricao: t(
      'Ofertas, descontos e cupons escolhidos pelo Viajantes App: hospedagens, camping, tecnologia e muito mais para economizar na próxima viagem.',
    ),
    caminho,
    porIdioma: hrefPorIdioma('/ofertas'),
  });

  const { data: categorias } = useQuery<CategoriaOferta[]>({
    queryKey: ['ofertas-categorias'],
    queryFn: listarCategorias,
    staleTime: 60 * 60 * 1000, // categoria nova é raro
  });

  const consulta = useInfiniteQuery({
    queryKey: ['ofertas', categoria, busca],
    queryFn: ({ pageParam }) => listarOfertas({ categoria, busca, pagina: pageParam }),
    initialPageParam: 1,
    // Página curta significa que acabou — a Central não devolve o total.
    getNextPageParam: (ultima, todas) => (ultima.length < POR_PAGINA ? undefined : todas.length + 1),
  });

  const ofertas = useMemo(() => consulta.data?.pages.flat() ?? [], [consulta.data]);
  const filtrando = categoria !== 'todos' || busca !== '';

  const limpar = () => {
    setCategoria('todos');
    setDigitado('');
    setBusca('');
  };

  return (
    <>
      <JsonLd
        blocos={[migalhas([{ nome: 'Home', caminho: '/' }, { nome: t('Viajantes Recomenda'), caminho }])]}
      />

      <div className="folha py-10">
        <header className="max-w-2xl">
          <p className="flex items-center gap-2 text-mini font-bold uppercase tracking-[0.13em] text-acento-escuro">
            <Tag size={14} aria-hidden="true" />
            {t('Viajantes Recomenda')}
          </p>
          <h1 className="mt-2 text-titulo font-bold leading-tight tracking-tight text-brand text-balance sm:text-heroi">
            {t('Ofertas e descontos para viajar mais')}
          </h1>
          <p className="mt-2 text-corpo font-light text-texto-2">
            {t(
              'Hospedagens, camping, equipamento e muito mais — escolhidos pelo Viajantes App, direto da nossa Central de Ofertas.',
            )}
          </p>
        </header>

        <div className="mt-8 max-w-md">
          <label className="pilula-busca">
            <Search size={18} className="shrink-0 text-texto-3" aria-hidden="true" />
            <span className="sr-only">{t('Buscar oferta')}</span>
            <input
              type="search"
              value={digitado}
              onChange={(evento) => setDigitado(evento.target.value)}
              placeholder={t('Buscar por barraca, mochila, hotel...')}
              autoComplete="off"
            />
            {digitado && (
              <button type="button" onClick={() => setDigitado('')} aria-label={t('Limpar')}>
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>
        </div>

        {categorias && categorias.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label={t('Categorias de ofertas')}>
            {categorias.map((c) => {
              // `own_data: false` = a categoria existe na Central mas ainda não
              // tem oferta própria (hoje Atrativos e Patrocinadores, que vivem
              // na nossa API). Fica visível e desligada, em vez de sumir.
              const embreve = !c.own_data && c.value !== 'todos';
              const ativa = c.value === categoria;

              return (
                <button
                  key={c.value}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  disabled={embreve}
                  onClick={() => setCategoria(c.value)}
                  title={embreve ? t('Em breve') : undefined}
                  className={`chip ${ativa ? 'chip--ativo font-semibold' : ''} ${
                    embreve ? 'cursor-not-allowed opacity-45 hover:border-borda hover:text-texto-2' : ''
                  }`}
                >
                  {t(c.label)}
                  {embreve && <em className="not-italic text-mini text-texto-3">· {t('Em breve')}</em>}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          {consulta.isPending ? (
            <p className="py-16 text-center text-nota text-texto-3" role="status" aria-live="polite">
              {t('Carregando ofertas...')}
            </p>
          ) : consulta.isError ? (
            <div className="recuo flex flex-col items-center gap-4 p-10 text-center">
              <TriangleAlert size={22} className="text-alerta" aria-hidden="true" />
              <p className="text-nota text-texto-2">
                {t('Não conseguimos carregar as ofertas agora. Tente novamente em instantes.')}
              </p>
              <button type="button" className="botao" onClick={() => consulta.refetch()}>
                {t('Tentar de novo')}
              </button>
            </div>
          ) : ofertas.length === 0 ? (
            <div className="recuo flex flex-col items-center gap-4 p-10 text-center">
              <Search size={22} className="text-texto-3" aria-hidden="true" />
              <p className="text-nota text-texto-2">
                {filtrando
                  ? t('Nenhuma oferta encontrada para esta busca.')
                  : t('Nenhuma oferta publicada por aqui ainda. Volte em breve!')}
              </p>
              {filtrando && (
                <button type="button" className="botao-fio" onClick={limpar}>
                  {t('Ver todas as ofertas')}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-nota text-texto-3" aria-live="polite">
                {ofertas.length === 1
                  ? t('1 oferta encontrada')
                  : t('{{n}} ofertas encontradas', { n: ofertas.length })}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {ofertas.map((oferta) => (
                  <CardOferta key={oferta.id} oferta={oferta} />
                ))}
              </div>

              {consulta.hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    className="botao-fio"
                    onClick={() => consulta.fetchNextPage()}
                    disabled={consulta.isFetchingNextPage}
                  >
                    {consulta.isFetchingNextPage ? t('Carregando ofertas...') : t('Carregar mais ofertas')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-12 border-t border-borda pt-6 text-mini text-texto-3">
          {t(
            'Os preços e a disponibilidade são de responsabilidade de cada loja e podem mudar sem aviso. Alguns links são de parceria: ao comprar por eles, você ajuda a manter o Viajantes App.',
          )}
        </p>
      </div>
    </>
  );
}
