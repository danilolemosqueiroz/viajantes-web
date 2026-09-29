import { useParams } from 'react-router-dom';
import { categoriaPorEavmoda, categoriaPorSlug } from '@/i18n/categorias';
import { useIdioma } from '@/i18n/Traducao';
import { lerSlugComId } from '@/lib/slug';
import { useDestino, useEmpresa } from '@/lib/consultas';
import Carregando from '@/components/layout/Carregando';
import PaginaDestino from '@/features/catalogo/PaginaDestino';
import PaginaAtrativo from '@/features/catalogo/PaginaAtrativo';
import NaoEncontrada from './NaoEncontrada';

/** O segundo segmento serve a duas páginas: a categoria num destino (`/cachoeiras/capitolio`)
 * e o detalhe de um atrativo (`/cachoeiras/cachoeira-do-cristal-1234`), que termina em `-id`. */
export default function CategoriaSlug() {
  const { categoria: slugCategoria, slug = '' } = useParams();
  const idioma = useIdioma();
  const categoria = categoriaPorSlug(slugCategoria ?? '', idioma);

  const comId = lerSlugComId(slug);
  const empresa = useEmpresa(comId?.id);
  const destino = useDestino(comId ? undefined : slug);

  if (!categoria) return <NaoEncontrada />;

  if (comId) {
    if (empresa.isPending) return <Carregando />;
    if (!empresa.data) return <NaoEncontrada />;
    // A categoria da URL pode não ser a do atrativo (link antigo): manda a
    // verdadeira para a tela, que é quem monta o endereço canônico.
    const real = categoriaPorEavmoda(empresa.data.eavmoda) ?? categoria;
    return (
      <PaginaAtrativo
        // Um atrativo novo começa do zero (inclusive o modal de login).
        key={empresa.data.idempresa}
        empresa={empresa.data}
        categoria={real}
        idioma={idioma}
        slug={slug}
      />
    );
  }

  if (destino.isPending) return <Carregando />;
  if (!destino.data) return <NaoEncontrada />;
  return <PaginaDestino destino={destino.data} categoria={categoria} idioma={idioma} />;
}
