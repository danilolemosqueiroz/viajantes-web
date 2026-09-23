/**
 * Validação e máscaras do formulário de pagamento — puras, para teste
 * (tests/unit/roteiros.test.ts). O que o pagar.me recusa aqui já é barrado
 * antes de sair do navegador.
 */

export function somenteDigitos(valor: string | null | undefined): string {
  return String(valor ?? '').replace(/\D/g, '');
}

/** Luhn, com 13 a 19 dígitos. */
export function numeroCartaoValido(numero: string): boolean {
  const d = somenteDigitos(numero);
  if (d.length < 13 || d.length > 19) return false;
  let soma = 0;
  let dobra = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dobra) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobra = !dobra;
  }
  return soma % 10 === 0;
}

/** "MM/AA" ou "MM/AAAA" → mês e ano, ou `null` se inválida ou vencida. */
export function lerValidade(validade: string, hoje = new Date()): { mes: number; ano: number } | null {
  const d = somenteDigitos(validade);
  if (d.length !== 4 && d.length !== 6) return null;
  const mes = Number(d.slice(0, 2));
  let ano = Number(d.slice(2));
  if (d.length === 4) ano += 2000;
  if (mes < 1 || mes > 12) return null;
  const ultimoDia = new Date(ano, mes, 0, 23, 59, 59);
  if (ultimoDia < hoje) return null;
  return { mes, ano };
}

export function cvvValido(cvv: string): boolean {
  const d = somenteDigitos(cvv);
  return d.length === 3 || d.length === 4;
}

export function cpfValido(cpf: string): boolean {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (fatia: string, peso: number) => {
    let soma = 0;
    for (const c of fatia) soma += Number(c) * peso--;
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(d.slice(0, 9), 10) === Number(d[9]) && dv(d.slice(0, 10), 11) === Number(d[10]);
}

export function telefoneValido(telefone: string): boolean {
  const n = somenteDigitos(telefone).length;
  return n === 10 || n === 11;
}

export function cepValido(cep: string): boolean {
  return somenteDigitos(cep).length === 8;
}

// ── Máscaras (aplicadas enquanto a pessoa digita) ─────────────────────────

export function mascaraCartao(valor: string): string {
  return somenteDigitos(valor).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function mascaraValidade(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function mascaraCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascaraCep(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** As opções de parcela que a API aceita: 1..max, cada uma com o valor da parcela. */
export function parcelasOpcoes(preco: number, max: number): { n: number; valor: number }[] {
  const centavos = Math.round(preco * 100);
  const limite = Math.max(1, Math.min(3, Math.trunc(max)));
  const opcoes: { n: number; valor: number }[] = [];
  for (let n = 1; n <= limite; n++) opcoes.push({ n, valor: Math.round(centavos / n) / 100 });
  return opcoes;
}
