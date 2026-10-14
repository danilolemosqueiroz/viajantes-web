# Publicar o site na Cloudflare (Workers + arquivos estáticos)

O `dist/` é servido pela Cloudflare. A KingHost fica só como **origem** das páginas
PHP que moram no mesmo domínio: `/seja-cliente`, `/painel-cliente`, `/download`,
`/descontos` e qualquer `*.php`. Quem decide isso é `worker/index.ts`; a lista de
caminhos está em `wrangler.jsonc` (`run_worker_first`).

## Uma vez só

1. **Zona ativa**: o viajantesapp.com.br precisa estar com os nameservers da Cloudflare.
2. **Origem na KingHost**: cadastrar `origem.viajantesapp.com.br` como domínio
   adicional/mapeamento do MESMO site, com SSL, e criar na Cloudflare o CNAME
   `origem → web-ded-356745b.kinghost.net` (DNS only). Testar:
   `curl -I https://origem.viajantesapp.com.br/painel-cliente/`.
3. **Pipeline no GitHub** (`.github/workflows/deploy-cloudflare.yml`): push na `master`
   publica em produção; pull request gera uma versão de prévia. No repositório →
   Settings → Secrets and variables → Actions:
   - Secrets: `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → template
     "Edit Cloudflare Workers") e `CLOUDFLARE_ACCOUNT_ID`.
   - Variables: as `VITE_*` do `.env` (o `.env` não vai pro Git).
4. Testar tudo na URL `*.workers.dev` antes de trocar o domínio.

## Virar o domínio (sem queda)

5. No Worker → Settings → Domains & Routes → adicionar `viajantesapp.com.br` e
   `www.viajantesapp.com.br`. A Cloudflare troca o registro A/CNAME sozinha.
6. Conferir: home, uma rota interna (`/cachoeiras`), `/painel-cliente/` (login e
   logout), `/seja-cliente/`, `/download` no celular, login Google/Apple.
7. **Rollback**: remover os dois domínios do Worker e recriar `A viajantesapp.com.br
   187.1.139.68` e `CNAME www web-ded-356745b.kinghost.net`. Leva segundos.

## Dia a dia

Push na `master` publica sozinho (aba Actions mostra o log); cada PR ganha uma versão de prévia.
Voltar uma versão: Worker → Deployments → Rollback.
