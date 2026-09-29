/** Monta a pasta `pacote/`, que é a que vai para a VPS.
 * Junta `.next/standalone`, `.next/static` e `public/`: faltando um, o site abre sem CSS. */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const destino = path.join(raiz, 'pacote');

const exigir = (caminho, dica) => {
  if (!existsSync(caminho)) {
    console.error(`\n✗ Não encontrei ${path.relative(raiz, caminho)}.\n  ${dica}\n`);
    process.exit(1);
  }
};

exigir(path.join(raiz, '.next/standalone'), 'O `next build` não chegou ao fim — confira o erro acima e `output: standalone` no next.config.ts.');
exigir(path.join(raiz, '.next/static'), 'Rode `npm run build` antes.');

rmSync(destino, { recursive: true, force: true });
cpSync(path.join(raiz, '.next/standalone'), destino, { recursive: true });
cpSync(path.join(raiz, '.next/static'), path.join(destino, '.next/static'), { recursive: true });
if (existsSync(path.join(raiz, 'public'))) {
  cpSync(path.join(raiz, 'public'), path.join(destino, 'public'), { recursive: true });
}

// A pasta de publicação sai do próprio build, e não do ambiente atual, porque
// é o build que de fato vai rodar na VPS.
let pasta = '';
try {
  const manifesto = JSON.parse(
    readFileSync(path.join(raiz, '.next/server/functions-config-manifest.json'), 'utf8'),
  );
  const regexp = manifesto.functions?.['/_middleware']?.matchers?.[0]?.regexp ?? '';
  pasta = (regexp.match(/^\^((?:\\\/[\w-]+)+)/)?.[1] ?? '').replace(/\\/g, '');
} catch {
  /* sem proxy no build: segue como raiz */
}

// O `next build` copia o `.env` do projeto para dentro do pacote. Se ele estiver
// com valores de desenvolvimento, o site sobe apontando para localhost.
const envPacote = path.join(destino, '.env');
const avisos = [];
if (existsSync(envPacote)) {
  const env = readFileSync(envPacote, 'utf8');
  const siteUrl = env.match(/^SITE_URL=(.*)$/m)?.[1]?.trim() ?? '';
  if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
    avisos.push(`SITE_URL do pacote está em "${siteUrl}" — troque pelo domínio real no .env da VPS.`);
  }
  if (!/^API_SITE_KEY=.+$/m.test(env)) {
    avisos.push('API_SITE_KEY vazia no .env do pacote — a API responde 401 e as páginas ficam vazias.');
  }
}

const tamanho = (() => {
  let total = 0;
  const andar = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, item.name);
      if (item.isDirectory()) andar(p);
      else total += statSync(p).size;
    }
  };
  try {
    andar(destino);
  } catch {
    /* tamanho é informativo */
  }
  return (total / 1024 / 1024).toFixed(0);
})();

console.log(`
✓ Pacote pronto: ./pacote  (${tamanho} MB)

  Publicado em: ${pasta ? `https://SEU-DOMINIO${pasta}/` : 'raiz do domínio (https://SEU-DOMINIO/)'}
  ${pasta ? '' : 'Para publicar numa subpasta, use `npm run build:new`.'}
  Na VPS:  node server.js        (respeita PORT e HOSTNAME)
  Com PM2: pm2 start server.js --name viajantes-web --update-env
`);

if (avisos.length) {
  console.log('  Confira antes de subir:');
  for (const aviso of avisos) console.log(`   • ${aviso}`);
  console.log('');
}
