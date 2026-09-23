import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/**
 * Site em React puro (SPA): o navegador monta as telas e busca TUDO na API
 * Node a cada visita. Sem servidor próprio, sem página pré-gerada.
 *
 * O build gera `dist/` com `index.html` + assets. No servidor, qualquer rota
 * que não seja arquivo deve cair no `index.html` (o "fallback" de SPA) para o
 * recarregar de página funcionar em `/cachoeiras/capitolio`.
 *
 * A configuração inteira mora num arquivo só, o `.env`. Duas chaves dele
 * valem para um lado apenas:
 *
 * - `VITE_BASE` (pasta publicada, ex.: `/new/`) só no build e no preview. Sem
 *   ela, o `index.html` publicado numa subpasta pede `/assets/...` a partir da
 *   RAIZ do domínio, os arquivos dão 404 e a página fica branca. No `dev` o
 *   site roda sempre na raiz, para a pasta de publicação não atrapalhar.
 * - `API_URL_DEV` (API da máquina local) só no `dev`. O build nunca a lê, então
 *   o site publicado não tem como sair apontando para localhost.
 */
export default defineConfig(({ command, mode, isPreview }) => {
  // `''` no terceiro argumento: lê o .env inteiro, não só as chaves VITE_.
  const env = loadEnv(mode, process.cwd(), '');
  const publicado = command === 'build' || Boolean(isPreview);
  const base = publicado ? env.VITE_BASE || '/' : '/';
  const apiDev = publicado ? '' : env.API_URL_DEV;

  return {
    base,
    define: apiDev ? { 'import.meta.env.VITE_API_URL': JSON.stringify(apiDev) } : {},
    plugins: [react(), tailwindcss(), htaccessSpa(base)],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, 'src') },
    },
    server: { port: 3000 },
    preview: { port: 3000 },
    build: {
      outDir: 'dist',
      // Um pedaço por rota carrega só o que a tela usa; o resto vem depois.
      chunkSizeWarningLimit: 900,
    },
  };
});

/**
 * Escreve o `.htaccess` do fallback junto com o build.
 *
 * O caminho do `index.html` precisa casar com a pasta onde o site foi
 * publicado — escrito à mão, é o tipo de detalhe que se esquece ao mudar de
 * pasta e só aparece como 404 ao recarregar uma página interna. Aqui ele sai
 * do mesmo `base` que gerou os assets.
 */
function htaccessSpa(base: string): Plugin {
  return {
    name: 'htaccess-spa',
    apply: 'build',
    generateBundle() {
      const raiz = base.endsWith('/') ? base : `${base}/`;
      this.emitFile({
        type: 'asset',
        fileName: '.htaccess',
        source: `# Gerado pelo build (vite.config.ts) — não editar à mão.
# Rotas do site são resolvidas no navegador, então todo pedido que não é
# arquivo nem pasta precisa devolver o index.html desta pasta.
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${raiz}
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${raiz}index.html [L]
</IfModule>
`,
      });
    },
  };
}
