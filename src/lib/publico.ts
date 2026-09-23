/**
 * Endereço de um arquivo da pasta `public/`.
 *
 * Escrever `/images/logo.png` na mão só funciona quando o site mora na raiz do
 * domínio. Publicado numa subpasta (`viajantesapp.com.br/new/`), esse caminho
 * aponta para fora do site e a imagem some — sem erro visível, só um espaço
 * vazio. `BASE_URL` é a pasta em que o build foi gerado, então o mesmo código
 * serve aos dois casos.
 */
export function publico(arquivo: string): string {
  return `${import.meta.env.BASE_URL}${arquivo.replace(/^\//, '')}`;
}
