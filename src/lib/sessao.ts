/**
 * Sessão do visitante — o MESMO `hash` que o aplicativo guarda no aparelho e
 * manda no cabeçalho `Passport`.
 *
 * Num site sem servidor próprio não há cookie httpOnly: quem guarda é o
 * navegador. Fica em `localStorage` para sobreviver ao fechar a aba, como no
 * aplicativo, e é apagado no logout ou quando a API recusa a sessão.
 */
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
