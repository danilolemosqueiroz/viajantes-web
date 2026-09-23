/**
 * Gera o `.htaccess` do site exportado como arquivos (`dist/`).
 *
 * Sem Node, quem faz o trabalho do proxy e dos redirecionamentos é o Apache:
 *
 *  1. **Português na raiz.** A exportação escreve cada idioma na sua pasta
 *     (`pt/cachoeiras.html`, `en/waterfalls.html`), mas o endereço público do
 *     português não tem prefixo. O Apache serve `/cachoeiras` a partir de
 *     `pt/cachoeiras.html` por dentro, sem mudar a URL na barra.
 *  2. **URLs do site PHP antigo**, da mesma lista que o site com servidor usa.
 *  3. **Pontes** (`/e/123`, `/r/45`): dependiam de consultar a API. Sem
 *     servidor, vão para a home em vez de dar 404.
 *  4. Cache longo para os arquivos com hash no nome e 404 próprio.
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REDIRECIONAMENTOS } from '../redirecionamentos.mjs';

const raiz = process.cwd();
const dist = path.join(raiz, 'dist');

if (!existsSync(dist)) {
  console.error('✗ Não encontrei dist/. Rode `npm run build:estatico`.');
  process.exit(1);
}

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/** `/res-:categoria/cidade/:id/:slug*` → regra de Apache. */
function paraApache(padrao) {
  let regex = padrao
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:[a-zA-Z]+\*/g, '(.*)')
    .replace(/:[a-zA-Z]+/g, '([^/]+)');
  return `^${regex.replace(/^\//, '')}/?$`;
}

/** `/c/:categoria/:id` → `/c/$1/$2` (a ordem dos parâmetros é a de aparição). */
function destinoApache(destino) {
  let n = 0;
  return destino.replace(/:[a-zA-Z]+\*?/g, () => `$${++n}`);
}

const linhas = [];
const p = (texto) => linhas.push(texto);

p('# Gerado por scripts/htaccess.mjs — não edite à mão, o build sobrescreve.');
p('# Site exportado como arquivos: o Apache faz o papel que o Node fazia.');
p('');
p('Options -MultiViews');
p('# Sem isto, um pedido a /en (que existe como PASTA por causa das páginas em');
p('# inglês) ganharia um 301 para /en/ antes das regras abaixo rodarem.');
p('DirectorySlash Off');
p('');
p('<IfModule mod_rewrite.c>');
p('RewriteEngine On');
p(`RewriteBase ${basePath || '/'}/`.replace(/\/+$/, '/'));
p('');
p('# ── 1. URLs do site PHP antigo (301) ─────────────────────────────────────');
for (const { de, para, codigo } of REDIRECIONAMENTOS) {
  p(`RewriteRule ${paraApache(de)} ${basePath}${destinoApache(para)} [R=${codigo},L]`);
}
p('');
p('# ── 2. Pontes que dependiam da API (sem servidor, voltam para a home) ────');
for (const ponte of ['^e/[0-9]+/?$', '^r/[0-9]+/?$', '^c/[^/]+/[0-9]+/?$', '^download/?$']) {
  p(`RewriteRule ${ponte} ${basePath}/ [R=302,L]`);
}
p('');
p('# ── 3. A home (antes da regra de arquivo existente: a raiz É uma pasta) ──');
p('RewriteRule ^$ pt.html [L]');
p('');
p('# ── 4. Arquivo que já existe (imagens, _next, sitemap): serve como está ──');
p('RewriteCond %{REQUEST_FILENAME} -f');
p('RewriteRule ^ - [L]');
p('');
p('# ── 5. Demais idiomas: /en/waterfalls → en/waterfalls.html ───────────────');
p('RewriteCond %{REQUEST_FILENAME}.html -f');
p('RewriteRule ^(.+?)/?$ $1.html [L]');
p('');
p('# ── 6. Português, que mora na pasta pt/ ──────────────────────────────────');
p('# (`$1` da RewriteRule vale dentro da RewriteCond — é assim no Apache.)');
p('RewriteCond %{DOCUMENT_ROOT}' + (basePath || '') + '/pt/$1.html -f');
p('RewriteRule ^(.+?)/?$ pt/$1.html [L]');
p('');
p('# Nada bateu: NÃO reescreve. Deixa o Apache dar 404 de verdade e o');
p('# ErrorDocument abaixo mostra a página. (Reescrever aqui devolveria 200.)');
p('</IfModule>');
p('');
p('ErrorDocument 404 ' + (basePath || '') + '/404.html');
p('');
p('# ── 4. Cache ─────────────────────────────────────────────────────────────');
p('<IfModule mod_headers.c>');
p('  # Arquivos com hash no nome nunca mudam.');
p('  <FilesMatch "\\.(js|css|woff2)$">');
p('    Header set Cache-Control "public, max-age=31536000, immutable"');
p('  </FilesMatch>');
p('  # HTML sempre revalida: é o que muda a cada publicação.');
p('  <FilesMatch "\\.html$">');
p('    Header set Cache-Control "public, max-age=0, must-revalidate"');
p('  </FilesMatch>');
p('</IfModule>');
p('');
p('<IfModule mod_deflate.c>');
p('  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml');
p('</IfModule>');
p('');

writeFileSync(path.join(dist, '.htaccess'), linhas.join('\n'), 'utf8');
console.log(`✓ .htaccess gerado em dist/ (${REDIRECIONAMENTOS.length} redirecionamentos do site antigo)`);
