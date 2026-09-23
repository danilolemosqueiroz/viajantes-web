import type { LucideIcon } from 'lucide-react';

/**
 * Peças repetidas pelas seções da home.
 *
 * A home é a única tela do site com seções de apresentação (história, números,
 * parceiros). Elas precisam de um título maior que o `.rotulo-secao` das faixas
 * de catálogo, mas sem inventar uma segunda identidade: a sobrancelha usa o
 * laranja de etiqueta e o título, o verde de tinta — como no resto da folha.
 */

export function Sobrancelha({ Icone, children }: { Icone: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-mini font-bold uppercase tracking-[0.13em] text-acento-escuro">
      <Icone size={14} aria-hidden="true" />
      {children}
    </p>
  );
}

export function TituloSecao({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-2 text-titulo font-bold leading-tight tracking-tight text-brand text-balance sm:text-[2rem]"
    >
      {children}
    </h2>
  );
}
