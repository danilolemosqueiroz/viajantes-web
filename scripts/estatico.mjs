/**
 * Build ESTÁTICO: gera `dist/` com um HTML por página, para hospedagem sem
 * Node (Apache/PHP, via FTP).
 *
 * O Next não deixa escolher rota por rota o que entra na exportação, e algumas
 * partes do site SÓ existem com servidor. Então este script tira essas partes
 * do caminho, roda o build e devolve tudo ao lugar — sempre, mesmo se o build
 * falhar (`finally`).
 *
 * O que sai do build estático e por quê:
 *   src/app/api        rotas que guardam a Site-Key e o cookie de sessão
 *   src/app/e,c,r      pontes que consultam a API para descobrir o destino
 *   src/app/download   escolhe a loja pelo aparelho
 *   src/proxy.ts       proxy de idioma (o Next ignora proxy na exportação)
 *   src/app/[locale]/conta   área logada (depende do cookie de sessão)
 *
 * Sem o proxy, o Next exporta cada idioma na sua pasta (`dist/pt/...`,
 * `dist/en/...`). O `.htaccess` gerado por `scripts/htaccess.mjs` recoloca o
 * português na raiz, refaz os 301 do site antigo e cobre as pontes.
 */
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
