/**
 * Carrega um script de terceiro UMA vez por visita (Google Identity Services,
 * Sign in with Apple JS).
 *
 * Os botões de login aparecem em mais de um lugar ao mesmo tempo — na página
 * /entrar e no modal de um atrativo —, e cada um pediria o mesmo arquivo. Aqui
 * todos esperam a mesma promessa. Se o carregamento falha (rede, bloqueador),
 * a promessa sai do cache para a próxima tentativa poder funcionar.
 */
const carregando = new Map<string, Promise<void>>();

export function carregarScript(src: string): Promise<void> {
  const emCurso = carregando.get(src);
  if (emCurso) return emCurso;

  const promessa = new Promise<void>((resolver, rejeitar) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existente ?? document.createElement('script');

    if (existente?.dataset.carregado === '1') {
      resolver();
      return;
    }

    script.addEventListener('load', () => {
      script.dataset.carregado = '1';
      resolver();
    });
    script.addEventListener('error', () => {
      carregando.delete(src);
      script.remove();
      rejeitar(new Error(`não carregou: ${src}`));
    });

    if (!existente) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  carregando.set(src, promessa);
  return promessa;
}
