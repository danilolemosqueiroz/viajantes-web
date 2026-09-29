/** Endereço de uma página no teste. O site é um SPA servido na raiz; a função existe
 * para os testes não mudarem se um dia o site voltar a morar numa subpasta. */
export function rota(caminho: string): string {
  return caminho.startsWith('/') ? caminho : `/${caminho}`;
}
