# Publicar o site

O site é **React puro (Vite)**: o navegador monta as telas e busca tudo na API
Node. Não existe servidor do site — o que vai para a hospedagem é um punhado de
arquivos estáticos.

## 1. Antes do primeiro deploy

**Na API (`viajantes-node-api`)**: as rotas que o site usa precisam estar
publicadas — `/site/geografia`, `/site/empresas*`, `/site/empresa/*`,
`/site/roteiros*`, `/site/auth/*`, `/site/usuario/*`, `/site/contato`.
São as mesmas rotas e os mesmos controles do aplicativo.

**Login com Google — a mesma conta do app.** O app e o site usam client ids do
MESMO projeto (313706555234), e o Google identifica a pessoa pelo mesmo `sub` em
todos. A API já aceita o client id web. Falta só, no Google Cloud → APIs e
serviços → Credenciais → o client **Web**, cadastrar em *Origens JavaScript
autorizadas*:

```
https://viajantesapp.com.br
https://www.viajantesapp.com.br
http://localhost:3000        (para testar na máquina)
http://localhost
```

Sem isso o botão do Google não aparece (o console mostra "The given origin is
not allowed for the given client ID").

**Login com Apple — a mesma conta do app.** No iPhone o app entra com o bundle
id `br.com.mediaplus.nahoraapp`; na web a Apple exige um **Services ID**. Com ele
AGRUPADO ao App ID do aplicativo, a Apple devolve à pessoa o mesmo identificador
(`sub`) que ela tem no app, e a API a encontra na mesma conta (campo `idapple`).
Passo a passo, uma vez, em developer.apple.com → Certificates, Identifiers &
Profiles → Identifiers:

1. **+ → Services IDs**. Identifier: `br.com.mediaplus.nahoraapp.web`
   (exatamente este: é o que a API aceita em `APPLE_CLIENT_IDS`).
2. Abra o Services ID, marque **Sign in with Apple → Configure**:
   - *Primary App ID*: `br.com.mediaplus.nahoraapp` — é este agrupamento que
     garante a mesma conta do app;
   - *Domains and Subdomains*: `viajantesapp.com.br`, `www.viajantesapp.com.br`;
   - *Return URLs*: `https://viajantesapp.com.br/` e `https://www.viajantesapp.com.br/`.
3. Salve e registre. Se o painel pedir um arquivo de verificação de domínio,
   ele vai em `public/.well-known/` do site.
4. No `.env` do site: `VITE_APPLE_SERVICES_ID=br.com.mediaplus.nahoraapp.web`.
   Se o site for publicado com `www`, use `VITE_APPLE_REDIRECT_URI` com o endereço
   exato cadastrado.
5. Na API: `APPLE_CLIENT_IDS=br.com.mediaplus.nahoraapp,br.com.mediaplus.nahoraapp.web`
   e a rota `/site/auth/apple` publicada.

A Apple não aceita `localhost` nem `http`: o botão só funciona no domínio
cadastrado. Sem `VITE_APPLE_SERVICES_ID` o botão da Apple simplesmente não
aparece.

**CORS na API**: a `viajantes-node-api` responde `Access-Control-Allow-Origin: *`
(o `cors()` sem opções). Nada a configurar em `.env`.

**Plano Viajantes (Pagar.me).** No `.env` do site, `VITE_PAGARME_PUBLIC_KEY`
com a mesma `PAGARME_PUBLIC_KEY` do `.env` da API (chave pública: só tokeniza o
cartão no navegador). Na API, a migração `2026_09_19_assinatura_site.sql` já
foi aplicada; `SITE_URL` só monta o link do e-mail. Detalhes em `docs/roteiros.md`.

**Configuração: só o `.env`.** Não existe `.env.local`, `.env.production` nem
`.env.example`: cada chave aparece uma vez, com o comentário do que faz.

```
VITE_API_URL=https://nahoraapp.com.br/viajantes/api   # a que vai no build
API_URL_DEV=http://localhost:21004/api   # só no npm run dev; vazio = a de cima
VITE_API_SITE_KEY=...     # a mesma SITE_KEY do .env da API
VITE_GOOGLE_WEB_CLIENT_ID=...
VITE_APPLE_SERVICES_ID=br.com.mediaplus.nahoraapp.web
VITE_APPLE_REDIRECT_URI=          # vazio = raiz do site
VITE_ROTEIROS_COMPLETOS=false
VITE_OFERTAS_API_URL=https://ofertas-indol.vercel.app/api   # opcional
VITE_BASE=                # pasta publicada: /new/ ou vazio = raiz
```

> `API_URL_DEV` e `VITE_BASE` valem cada uma para um lado só (ver
> `vite.config.ts`): a API local nunca entra no build, e a pasta de publicação
> nunca muda o endereço do `npm run dev`. Por isso as duas podem ficar
> preenchidas no mesmo arquivo sem risco.

> `VITE_OFERTAS_API_URL` é a **Central de Ofertas**, que alimenta a página
> `/ofertas`. Pode ficar de fora: o endereço de produção é o padrão no código.
> É um projeto separado (Vercel/Supabase), com API pública e sem chave — se
> estiver fora do ar, `/ofertas` mostra o aviso de indisponível e a faixa da
> home some sozinha; nenhuma outra tela depende dela. Ver `docs/ofertas.md`.

> `VITE_*` vai para dentro do JavaScript, e portanto é visível para quem abrir o
> navegador. É a mesma condição do aplicativo, que também carrega a chave do
> site. Essa chave só abre as rotas `/site/*` (catálogo e autenticação); as
> rotas administrativas continuam fora do alcance dela.

## 2. Build

```bash
npm ci
npm run build
```

Sai a pasta **`dist/`** — cerca de 1 MB, algumas dezenas de arquivos. É só
copiar o CONTEÚDO dela para a pasta pública da hospedagem.

## 2b. Publicar numa subpasta (teste em `/new/`, por exemplo)

Por padrão o build assume que o site fica na **raiz** do domínio. Publicado em
`viajantesapp.com.br/new/` sem avisar, o `index.html` pede `/assets/...` a
partir da raiz, os arquivos dão 404 e **a página fica em branco** — sem
mensagem de erro, porque o JavaScript nunca chega a rodar.

No `.env`, antes do `npm run build`:

```
VITE_BASE=/new/
```

Isso ajusta de uma vez os três lugares que dependem da pasta: os caminhos dos
assets no `index.html`, o `basename` do roteador (senão `/new/cachoeiras` não
casa com rota nenhuma) e o `RewriteBase` do `.htaccess` gerado.

Para voltar à raiz, deixe `VITE_BASE=` vazio e rode o build de novo.

## 3. O único ajuste no servidor

Como o roteamento é feito no navegador, um pedido direto a
`viajantesapp.com.br/cachoeiras/capitolio` precisa devolver o `index.html` —
senão o recarregar de página dá 404. É a "sobrescrita" que você já usa.

> Desde 14/09/2026 o build **já gera esse `.htaccess`** dentro do `dist/`, com
> o caminho certo para a pasta escolhida. O que segue é o que ele contém, para
> quem precisar conferir ou adaptar ao Nginx.

No Apache:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

No Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 4. Depois de publicar conteúdo novo

Nada a fazer. O site não guarda cópia de nada: cada visita busca na API, que lê
o banco. O que existe é uma memória de 5 minutos dentro da aba aberta, para a
navegação não repetir a mesma consulta.

## 5. O que o visitante recebe

O HTML inicial é a casca do site; o conteúdo chega logo depois, do banco. Para o
Google isso significa depender da execução do JavaScript — foi uma decisão
consciente, em troca de uma publicação simples e conteúdo sempre atual.
Título, descrição, canonical e hreflang são escritos a cada tela
(`src/lib/meta.ts`), e os dados estruturados vão em cada página
(`src/lib/seo/jsonld.tsx`).
