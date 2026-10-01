import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Ticket } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { hrefEmpresa } from '@/i18n/caminhos';
import { categoriaPorEavmoda, CATEGORIAS } from '@/i18n/categorias';
import { buscarEmpresa } from '@/features/catalogo/dados';
import { IconeWhatsapp } from '@/components/layout/IconesMarca';
import { publico } from '@/lib/publico';
import type { CartaoLugar } from './tipos';

/** Abre a página do lugar no idioma atual, sem sair do site (e sem fechar o guia no computador).
 * O `link_site` do serviço passa pela ponte `/empresa/:id`, que sempre cai em português. */
export function useAbrirLugar(aoNavegar?: () => void) {
  const cliente = useQueryClient();
  const navegar = useNavigate();
  const idioma = useIdioma();
  return async (id: number) => {
    const empresa = await cliente.fetchQuery({ queryKey: ['empresa', id], queryFn: () => buscarEmpresa(id) }).catch(() => null);
    aoNavegar?.();
    if (!empresa) {
      navegar(`/empresa/${id}`);
      return;
    }
    navegar(hrefEmpresa(empresa, categoriaPorEavmoda(empresa.eavmoda) ?? CATEGORIAS[0], idioma));
  };
}

/** `/empresa/ID/slug` do serviço, sem o domínio e com a base do site: serve de `href` para abrir
 * em outra aba (a ponte leva ao atrativo). */
export function caminhoDoLugar(lugar: Pick<CartaoLugar, 'id' | 'link_site'>): string {
  let caminho = `/empresa/${lugar.id}`;
  try {
    caminho = new URL(lugar.link_site).pathname;
  } catch {
    /* link_site fora do formato: fica a ponte só com o id */
  }
  return publico(caminho);
}

/** Selo logo depois do nome do lugar no texto. */
export function SeloLugar({ lugar, abrir }: { lugar: CartaoLugar; abrir: (id: number) => void }) {
  const t = useT();
  return (
    <a
      href={caminhoDoLugar(lugar)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        abrir(lugar.id);
      }}
      aria-label={t('Ver {{nome}}', { nome: lugar.nome })}
      title={lugar.nome}
      className="mx-0.5 inline-flex translate-y-[2px] items-center rounded-pilula bg-acento-suave px-1.5 py-0.5 text-acento-escuro hover:bg-acento hover:text-white"
    >
      <MapPin size={12} aria-hidden="true" />
    </a>
  );
}

export function CartoesLugares({ lugares, abrir }: { lugares: CartaoLugar[]; abrir: (id: number) => void }) {
  const t = useT();
  if (!lugares.length) return null;
  return (
    <ul className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1" aria-label={t('Lugares citados')}>
      {lugares.map((l) => (
        <li key={l.id} className="w-52 shrink-0 snap-start overflow-hidden rounded-cartao border border-borda bg-cartao">
          <a
            href={caminhoDoLugar(l)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              abrir(l.id);
            }}
            className="block hover:bg-papel-2"
          >
            <div className="relative h-24 bg-brand-suave">
              {l.capa_url && <img src={l.capa_url} alt="" loading="lazy" className="size-full object-cover" />}
              <div className="absolute left-2 top-2 flex gap-1">
                {l.passaporte && (
                  <span className="inline-flex items-center gap-1 rounded-pilula bg-white/95 px-2 py-0.5 text-mini font-semibold text-brand">
                    <Ticket size={12} aria-hidden="true" />
                    {t('Passaporte')}
                  </span>
                )}
                {l.desconto_percentual ? (
                  <span className="rounded-pilula bg-acento px-2 py-0.5 text-mini font-semibold text-white">
                    -{Math.round(l.desconto_percentual)}%
                  </span>
                ) : null}
              </div>
            </div>
            <div className="p-2.5">
              <p className="linhas-2 text-nota font-semibold leading-snug text-brand">{l.nome}</p>
              <p className="mt-0.5 truncate text-mini text-texto-3">{[l.cidade].filter(Boolean).join(' · ')}</p>
              {l.nota ? (
                <p className="mt-1 flex items-center gap-1 text-mini text-texto-2">
                  <Star size={12} className="fill-acento text-acento" aria-hidden="true" />
                  {l.nota.toFixed(1)}
                  {l.avaliacoes > 0 && <span className="text-texto-3">({l.avaliacoes})</span>}
                </p>
              ) : null}
            </div>
          </a>
          {l.whatsapp && (
            <a
              href={l.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border-t border-borda py-2 text-mini font-semibold text-ok hover:bg-papel-2"
            >
              <IconeWhatsapp size={14} />
              WhatsApp
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
