# viajantes-web

Site em **React + Vite (SPA)**. Não é mais Next.js: não existe `next/*`,
`app/`, server components, rotas `/api` nem `middleware`/`proxy`. O navegador
busca tudo na `viajantes-node-api` pelas rotas `/site/*`.

Antes de mexer, leia `README.md` (organização e decisões) e `docs/DEPLOY.md`
(publicação e configuração de Google/Apple). O código em Next antigo está em
`_antigo-next/` apenas para consulta.

Verificação: `npm run check` e `npm run test:e2e`.
