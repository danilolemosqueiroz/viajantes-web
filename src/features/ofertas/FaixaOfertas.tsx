import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { href } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import CardOferta from './CardOferta';
import { listarOfertas, type Oferta } from './dados';

/**
 * Faixa de ofertas na home — a porta de entrada do "Viajantes Recomenda".
 *
 * A Central é um serviço de fora: se ela estiver fora do ar ou ainda não tiver
 * nada publicado, a seção inteira some da home em silêncio. Uma faixa vazia (ou
 * um aviso de erro) na página inicial custa mais do que a faixa entrega.
 */
export default function FaixaOfertas() {
  const t = useT();
  const idioma = useIdioma();

  const { data: ofertas = [] } = useQuery<Oferta[]>({
    // Chave própria: a página /ofertas guarda as MESMAS ofertas sob
    // `['ofertas', categoria, busca]`, mas como consulta paginada. Misturar os
    // dois formatos no mesmo cache quebra a paginação de lá.
    queryKey: ['ofertas-faixa'],
    queryFn: () => listarOfertas({ pagina: 1 }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (ofertas.length === 0) return null;

  return (
    <section>
      <h2 className="rotulo-secao mb-5">
        {t('Viajantes Recomenda')}
        <Link to={href('/ofertas', idioma)}>{t('Ver todos')}</Link>
      </h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {ofertas.slice(0, 4).map((oferta) => (
          <CardOferta key={oferta.id} oferta={oferta} />
        ))}
      </div>
    </section>
  );
}
