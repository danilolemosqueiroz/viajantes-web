/** Mesma regra da API: Brasil com DDD, ou de fora começando com "+" e o código do país. */
export function whatsappValido(telefone: unknown): boolean {
  const texto = String(telefone ?? '').trim();
  const digitos = texto.replace(/\D/g, '').length;
  return texto.startsWith('+') ? digitos >= 8 && digitos <= 15 : digitos >= 10;
}
