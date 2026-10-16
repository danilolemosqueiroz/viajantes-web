import type { ReactNode } from 'react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href, type RotaFixa } from '@/i18n/caminhos';
import { useMeta } from '@/lib/meta';

/** Moldura das páginas legais (termos, privacidade). O texto é jurídico e vale em
 * português; nos outros idiomas a página avisa isso no topo em vez de traduzir. */
export function PaginaLegal({ rota, titulo, descricao, atualizadoEm, children }: {
  rota: RotaFixa;
  titulo: string;
  descricao: string;
  atualizadoEm: string;
  children: ReactNode;
}) {
  const t = useT();
  const idioma = useIdioma();
  useMeta({ titulo: t(titulo), descricao: t(descricao), caminho: href(rota, idioma) });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold leading-tight text-brand sm:text-heroi">{t(titulo)}</h1>
      <p className="mt-2 text-sm text-texto-2">Viajantes App · {t('Última atualização')}: {atualizadoEm}</p>
      {idioma !== 'pt' && (
        <p className="mt-4 max-w-3xl rounded-lg bg-papel-2 px-4 py-3 text-sm text-texto-2">{t('Este documento está disponível somente em português.')}</p>
      )}
      <div className="mt-8 max-w-3xl space-y-8 text-corpo leading-relaxed text-texto-2">{children}</div>
    </div>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-b border-borda pb-2 text-xl font-bold text-brand">{titulo}</h2>
      {children}
    </section>
  );
}

export function Sub({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2 pt-2">
      <h3 className="font-semibold text-texto">{titulo}</h3>
      {children}
    </div>
  );
}

export function Lista({ itens, ordenada = false }: { itens: ReactNode[]; ordenada?: boolean }) {
  const Tag = ordenada ? 'ol' : 'ul';
  return (
    <Tag className={`space-y-1 pl-6 ${ordenada ? 'list-decimal' : 'list-disc'}`}>
      {itens.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export function Nota({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border-l-4 border-acento bg-papel-2 px-4 py-3">{children}</div>;
}

export function Mail() {
  return (
    <a className="font-semibold text-brand underline-offset-2 hover:underline" href="mailto:contato@viajantesapp.com.br">
      contato@viajantesapp.com.br
    </a>
  );
}
