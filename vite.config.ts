import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/** Site em React puro (SPA): o navegador monta as telas e busca tudo na API Node.
 * `VITE_BASE` vale só no build e no preview; `API_URL_DEV`, só no `dev`. */
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

/** Escreve o `.htaccess` do fallback junto com o build, a partir do mesmo `base` dos assets,
 * para o caminho do `index.html` casar com a pasta onde o site foi publicado. */
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
  # As duas pastas do parceiro foram renomeadas. Sem estes 301 o fallback abaixo
  # devolveria a home no lugar do 404 (app publicado e e-mails já enviados).
  RewriteRule ^seja-parceiro(/.*)?$ ${raiz}seja-cliente$1 [R=301,L]
  RewriteRule ^parceiros(/.*)?$ ${raiz}painel-cliente$1 [R=301,L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${raiz}index.html [L]
</IfModule>
`,
      });
    },
  };
}
