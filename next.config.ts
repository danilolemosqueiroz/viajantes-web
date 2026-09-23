import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { REDIRECIONAMENTOS } from './redirecionamentos.mjs';

const comIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Pasta em que o site é publicado: `/new` durante a aprovação, vazio na raiz.
 * O Next usa isto para prefixar rotas, `_next/*`, `<Link>`, `<Image>` e os
 * `redirects()` abaixo. Ver `src/lib/basePath.ts`.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/**
 * Saída ESTÁTICA (`SAIDA_ESTATICA=1`): gera um HTML por página em `dist/`,
 * para hospedagem sem Node (Apache/PHP, FTP). Em troca, o Next desliga tudo
 * que precisa de servidor — proxy de idioma, rotas de API, cookies,
 * redirecionamentos e otimização de imagem.
 */
const estatico = process.env.SAIDA_ESTATICA === '1';

const nextConfig: NextConfig = {
  // A VPS roda o build empacotado (server.js + .next/static + public);
  // com SAIDA_ESTATICA=1 sai um site de arquivos, sem servidor.
  output: estatico ? 'export' : 'standalone',
  ...(estatico ? { distDir: 'dist' } : {}),

  // Vazio = raiz. O Next recusa `basePath: ''`, por isso o `undefined`.
  basePath: basePath || undefined,

  images: {
    // Sem servidor não há otimizador de imagem: as fotos vêm direto da origem.
    ...(estatico ? { unoptimized: true } : {}),
    remotePatterns: [
      { protocol: 'https', hostname: 'nahoraapp.com.br' },
      { protocol: 'https', hostname: 'api.nahoraapp.com.br' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Redirecionamentos não existem na saída estática (viram regras de .htaccess).
  async redirects() {
    if (estatico) return [];
    // URLs do site PHP que somem sem deixar rastro. Com `basePath`, o Next
    // prefixa origem e destino sozinho (`/new/home` → `/new/`), que é o certo:
    // na fase de prévia o `/home` da raiz ainda é do site PHP. Usamos 301 explícito (e não
    // o 308 padrão do `permanent: true`) porque ferramentas de auditoria antigas
    // ainda tratam 308 como redirecionamento temporário. As que dependem de um id
    // (empresa, cidade, roteiro) são resolvidas em /e/[id], /c/[...] e /r/[id],
    // porque precisam consultar a API para descobrir o destino novo.
    return REDIRECIONAMENTOS.map(({ de, para, codigo }) => ({
      source: de,
      destination: para,
      statusCode: codigo,
    }));
  },
};

export default comIntl(nextConfig);
