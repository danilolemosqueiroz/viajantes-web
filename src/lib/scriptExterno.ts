/** Carrega um script de terceiro uma vez por visita (login do Google e da Apple).
 * Se o carregamento falha, a promessa sai do cache para a próxima tentativa poder funcionar. */
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
