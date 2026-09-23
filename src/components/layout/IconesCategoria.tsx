import type { ComponentType } from 'react';
import { BedDouble, Church, Compass, Home, Milk, Palette, Signpost, Tent, UtensilsCrossed } from 'lucide-react';

/**
 * Ícones dos círculos de categoria — os do lucide mais os desenhados aqui.
 * Cachoeira não existe no lucide; Passeios usa a placa de direção, como o app.
 */
export interface PropsIcone {
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export type IconeCategoria = ComponentType<PropsIcone>;

/** Queda d'água sobre a borda de pedra, com o poço embaixo — mesmo traço do lucide. */
export function IconeCachoeira({ size = 24, className, strokeWidth = 2, ...resto }: PropsIcone) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...resto}
    >
      <path d="M3 17V9a3 3 0 0 1 3-3h14" />
      <path d="M11 6c.8 3-.8 4.5 0 7.5s.8 4.5 0 7" />
      <path d="M15.5 6c.8 3-.8 4.5 0 7.5s.8 4 0 6.5" />
      <path d="M20 6c.6 2.5-.6 4 0 6.5s.6 4 0 6" />
      <path d="M2 21c1.7-1.3 3.3-1.3 5 0s3.3 1.3 5 0 3.3-1.3 5 0 3.3 1.3 5 0" />
    </svg>
  );
}

const ICONES: Record<string, IconeCategoria> = {
  Cachoeira: IconeCachoeira,
  BedDouble,
  Signpost,
  UtensilsCrossed,
  Tent,
  Milk,
  Palette,
  Church,
  Home,
};

/** Pelo nome gravado em `categorias.ts`; desconhecido cai na bússola. */
export function iconeDaCategoria(nome: string): IconeCategoria {
  return ICONES[nome] ?? Compass;
}
