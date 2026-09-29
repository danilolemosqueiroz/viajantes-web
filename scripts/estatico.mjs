/** Build estático: gera `dist/` com um HTML por página, para hospedagem sem Node (Apache/PHP).
 * Tira do caminho o que só existe com servidor, roda o build e devolve tudo, mesmo se falhar. */
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const raiz = process.cwd();
const guarda = path.join(raiz, '.estatico-guardado');

/** Caminhos que precisam sair do `src/` durante a exportação. */
const RETIRAR = [
  'src/app/api',
  'src/app/e',
  'src/app/c',
  'src/app/r',
  'src/app/download',
  'src/proxy.ts',
  // Páginas que só existem com alguém logado: sem servidor não há sessão no
  // build. `/entrar` e `/criar-conta` continuam (são públicas).
  'src/app/[locale]/conta',
  // Busca: lê `?q=` no servidor. Volta quando o navegador puder consultar a
  // API direto (ver docs/ESTATICO.md).
  'src/app/[locale]/busca',
];

const guardar = () => {
  rmSync(guarda, { recursive: true, force: true });
  mkdirSync(guarda, { recursive: true });
  for (const relativo of RETIRAR) {
    const origem = path.join(raiz, relativo);
    if (!existsSync(origem)) continue;
    const destino = path.join(guarda, relativo);
    mkdirSync(path.dirname(destino), { recursive: true });
    renameSync(origem, destino);
  }
};

const devolver = () => {
  for (const relativo of RETIRAR) {
    const guardado = path.join(guarda, relativo);
    if (!existsSync(guardado)) continue;
    const destino = path.join(raiz, relativo);
    mkdirSync(path.dirname(destino), { recursive: true });
    rmSync(destino, { recursive: true, force: true });
    renameSync(guardado, destino);
  }
  rmSync(guarda, { recursive: true, force: true });
};

console.log('Preparando o build estático (guardando o que precisa de servidor)...');
guardar();

let codigo = 1;
try {
  const build = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, SAIDA_ESTATICA: '1', NEXT_PUBLIC_SEM_AREA_LOGADA: '1' },
  });
  codigo = build.status ?? 1;
} finally {
  devolver();
  console.log('Arquivos de servidor devolvidos ao lugar.');
}

if (codigo !== 0) process.exit(codigo);

// O `public/` já é copiado pelo Next para `dist/`; falta só o .htaccess.
const htaccess = spawnSync('node', ['scripts/htaccess.mjs'], { stdio: 'inherit', env: process.env });
if (htaccess.status !== 0) process.exit(htaccess.status ?? 1);
