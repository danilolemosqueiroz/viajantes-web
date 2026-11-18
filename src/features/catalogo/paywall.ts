/** Corte do Viajantes pago no site: a API manda `bloqueado: 1` e só o resumo do atrativo. */
export const estaBloqueado = (e: { bloqueado?: number | null }): boolean => Number(e.bloqueado) === 1;

export function descricaoParaMeta(
  e: { bloqueado?: number | null; resumo?: string | null; descricao?: string | null },
  texto: string,
  reserva: string,
): string {
  const base = estaBloqueado(e) ? e.resumo : e.descricao || texto;
  return (base || reserva).replace(/\s+/g, ' ').trim();
}
