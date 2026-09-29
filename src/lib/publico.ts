/** Endereço de um arquivo da pasta `public/`. Usa `BASE_URL` porque `/images/logo.png` escrito
 * na mão aponta para fora do site quando ele é publicado numa subpasta. */
export function publico(arquivo: string): string {
  return `${import.meta.env.BASE_URL}${arquivo.replace(/^\//, '')}`;
}
