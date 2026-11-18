/** Corte do Viajantes pago no site: a API manda `bloqueado: 1` e só o resumo do atrativo. */
export interface ResumoPaywall {
  regiao: { idregiao: number; nome: string } | null;
  atrativos: number;
  cachoeiras: number;
  beneficios: number;
}
type T = (s: string, v?: Record<string, string | number>) => string;

export const estaBloqueado = (e: { bloqueado?: number | null }): boolean => Number(e.bloqueado) === 1;

export function descricaoParaMeta(
  e: { bloqueado?: number | null; resumo?: string | null; descricao?: string | null },
  texto: string,
  reserva: string,
): string {
  const base = estaBloqueado(e) ? e.resumo : e.descricao || texto;
  return (base || reserva).replace(/\s+/g, ' ').trim();
}

export function linhasDoResumo(r: ResumoPaywall, t: T): string[] {
  const linha = (n: number, um: string, varios: string) => (n === 1 ? t(um) : n > 1 ? t(varios, { n }) : '');
  return [
    linha(r.atrativos, '1 atrativo completo', '{{n}} atrativos completos'),
    linha(r.cachoeiras, '1 cachoeira com fotos, mapa e como chegar', '{{n}} cachoeiras com fotos, mapa e como chegar'),
    linha(r.beneficios, '1 lugar com benefício para assinantes', '{{n}} lugares com benefício para assinantes'),
  ].filter(Boolean);
}
