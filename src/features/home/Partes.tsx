import type { LucideIcon } from 'lucide-react';

/** Peças repetidas pelas seções de apresentação da home. O título é maior que o `.rotulo-secao`,
 * com a sobrancelha em laranja e o título em verde, como no resto da folha. */

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
