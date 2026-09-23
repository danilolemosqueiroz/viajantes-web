import type { Idioma } from '@/i18n/categorias';

/**
 * Preço sempre em real: o idioma muda só a escrita do número (1.234,50 /
 * 1,234.50). `narrowSymbol` para sair "R$" nos cinco idiomas — sem ele o
 * espanhol escreve "35,89 BRL".
 */
const LOCALIDADE: Record<Idioma, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

const formatadores = new Map<string, Intl.NumberFormat>();

function formatador(local: string): Intl.NumberFormat {
  const pronto = formatadores.get(local);
  if (pronto) return pronto;
  // Navegador antigo recusa `narrowSymbol` com RangeError: vale mais o formato padrão.
  let novo: Intl.NumberFormat;
  try {
    novo = new Intl.NumberFormat(local, { style: 'currency', currency: 'BRL', currencyDisplay: 'narrowSymbol' });
  } catch {
    novo = new Intl.NumberFormat(local, { style: 'currency', currency: 'BRL' });
  }
  formatadores.set(local, novo);
  return novo;
}

export function formatarPreco(valor: number, idioma: Idioma): string {
  return formatador(LOCALIDADE[idioma] ?? 'pt-BR').format(valor);
}

/** Data do banco ("2026-09-19 10:00:00" ou ISO) no formato do idioma. */
export function formatarData(valor: string | null | undefined, idioma: Idioma): string {
  if (!valor) return '';
  const data = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleDateString(LOCALIDADE[idioma] ?? 'pt-BR');
}
