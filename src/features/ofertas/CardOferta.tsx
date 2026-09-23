import { ArrowRight, MapPin, Tag } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { formatarPreco, linkClique, rotuloCta, temPreco, type Oferta } from './dados';

/**
 * Card de oferta.
 *
 * Segue o mesmo cartão do catálogo (`CardEmpresa`): sem moldura nem sombra, a
 * foto É o cartão e o texto respira embaixo. O laranja aparece só onde é ação
 * — o selo de desconto e a chamada do rodapé.
 *
 * O card inteiro é UM link. Tem três alvos de clique no desenho do site em PHP
 * (foto, título e botão), o que faz o leitor de tela anunciar a mesma oferta
 * três vezes; aqui a área toda leva ao mesmo lugar e é anunciada uma vez só.
 */
export default function CardOferta({ oferta }: { oferta: Oferta }) {
  const t = useT();
  const idioma = useIdioma();

  const categoria = oferta.category;
  const local = oferta.destination || oferta.city;
  const desconto = oferta.discount ? Math.round(oferta.discount) : null;

  return (
    <article className="h-full">
      <a
        href={linkClique(oferta.id, categoria)}
        target="_blank"
        // `sponsored` porque é link de afiliado: o Google pede a marcação, e
        // sem ela o site empresta autoridade para a loja de destino.
        rel="noopener nofollow sponsored"
        className="group flex h-full flex-col"
      >
        <div className="relative aspect-square overflow-hidden rounded-cartao bg-brand-suave">
          {oferta.image && (
            <img
              src={oferta.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
              // Foto de terceiro (Amazon, Mercado Livre...) pode sair do ar a
              // qualquer momento: some com a imagem e fica o fundo da marca,
              // em vez do ícone de imagem quebrada.
              onError={(evento) => evento.currentTarget.remove()}
            />
          )}
          {desconto !== null && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-acento px-2 py-1 text-mini font-bold text-white">
              {t('{{n}}% OFF', { n: desconto })}
            </span>
          )}
        </div>

        <h3 className="linhas-2 mt-2.5 text-base font-semibold leading-snug text-brand transition group-hover:text-acento-escuro">
          {oferta.title}
        </h3>

        {local && (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-nota text-texto-3">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{local}</span>
          </p>
        )}

        {oferta.coupon && (
          <p className="mt-2 flex items-center gap-1.5 text-nota text-texto-2">
            <Tag size={12} className="shrink-0 text-acento" aria-hidden="true" />
            {t('Cupom')} <code className="font-semibold text-brand">{oferta.coupon}</code>
          </p>
        )}

        {temPreco(oferta) && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
            {oferta.original_price && oferta.original_price > oferta.price ? (
              <s className="text-nota text-texto-3">{formatarPreco(oferta.original_price, idioma)}</s>
            ) : null}
            <strong className="text-corpo font-bold text-brand">{formatarPreco(oferta.price, idioma)}</strong>
          </p>
        )}

        {/* Empurra o rodapé para baixo: numa grade, os cards têm alturas
            diferentes e as chamadas precisam ficar alinhadas. */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {oferta.provider && <span className="truncate text-mini text-texto-3">{oferta.provider}</span>}
          <span className="flex shrink-0 items-center gap-1 text-nota font-semibold text-acento-escuro">
            {t(rotuloCta(categoria, oferta.coupon))}
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </a>
    </article>
  );
}
