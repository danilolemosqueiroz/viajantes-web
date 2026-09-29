/** Sessão do visitante: o mesmo `hash` que o aplicativo manda no cabeçalho `Passport`.
 * Fica em `localStorage` e é apagado no logout ou quando a API recusa a sessão. */
const CHAVE = 'vj_sessao';

export function lerSessao(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function gravarSessao(hash: string): void {
  try {
    localStorage.setItem(CHAVE, hash);
  } catch {
    /* navegação privada com armazenamento bloqueado: a sessão dura a aba */
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a fazer */
  }
}
