# viajantes-web

Site do Viajantes APP em **React + Vite**. O navegador monta as telas e busca
tudo na **viajantes-node-api** — o mesmo banco e os mesmos controles do
aplicativo. Substitui o site em PHP (`viajantes-site`).

```bash
npm install
npm run dev                  # http://localhost:3000
```

Toda a configuração fica no **`.env`** (e só nele), com um comentário por chave.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera `dist/` para subir na hospedagem |
| `npm run preview` | serve o `dist/` como em produção |
| `npm run check` | tipos + lint + testes de unidade |
| `npm run test:e2e` | testes de ponta a ponta (Playwright) |

Publicação e o ajuste de rota no servidor: `docs/DEPLOY.md`.

## Como está organizado

```
src/
  App.tsx            rotas (as mesmas URLs do site antigo, nos 5 idiomas)
  paginas/           uma tela por rota
  features/          catálogo (com o filtro de lugar), roteiros (com o checkout), destinos, conta, home e ofertas
  components/layout/ cabeçalho, trilho de categorias, rodapé, abas
  i18n/              idiomas, caminhos traduzidos e dicionário
  lib/               API, consultas, sessão, região, SEO
```

## Decisões que valem conhecer

**URLs.** Português na raiz (`/cachoeiras/capitolio`), os outros idiomas com
prefixo e caminho traduzido (`/en/waterfalls/capitolio`). As URLs do site PHP
antigo continuam funcionando: viram redirecionamento no próprio site.

**Um endereço, dois tipos de página.** `/cachoeiras/capitolio` é um destino e
`/cachoeiras/cachoeira-do-cristal-1234` é um atrativo. Quem distingue é o `-id`
no fim — nenhum nome de região ou cidade termina em "-número" (há teste).

**Traduções.** A chave é o próprio texto em português, como no aplicativo, e os
arquivos de `src/messages/` são os mesmos dele. Isso vale para os textos FIXOS
do site. O conteúdo do banco (nome e descrição de atrativos) virá traduzido da
própria API, quando estiver gravado lá.

**Detalhe do atrativo é aberto.** Ao entrar aparece UM convite, e fechar não
trava nada: entrar ou criar conta para quem não está logado
(`features/catalogo/ConviteConta.tsx`, em toda abertura) ou baixar o
aplicativo (`ConviteApp.tsx`, no 2º atrativo da visita e no máximo uma vez por
semana). A regra, com os números, está em `features/catalogo/convites.ts`. As
seções seguem a ordem do site antigo (sobre, avaliações com
nota média e formulário, atrativos próximos em abas, vídeos, horários, fotos) e
o contato fica ao lado. As pegadinhas da API do detalhe (nota sempre 0, horário
que não é "aberto agora", vídeo com barra dobrada) estão em `docs/atrativo.md`.

**Conta.** A mesma do aplicativo. O login devolve um `hash` de sessão, guardado
no navegador e enviado no cabeçalho `Passport` — igual ao app.

**Região.** É um filtro opcional, não um portão: o site abre mostrando tudo, e
quem chega do Google numa cachoeira nunca é parado para escolher estado. Nas
páginas de categoria há o filtro **Estado › Região › Cidade** logo abaixo do
título (`features/catalogo/FiltroLocal.tsx`): região e cidade NAVEGAM para a
página delas; só o estado, que não tem página, filtra o hub por `?estado=`.

**Roteiros prontos.** A lista mostra só a capa; o dia a dia é do Plano
Viajantes (mensal/anual), os mesmos planos que o app vende nas lojas, aqui
pagos no cartão ou Pix pela Pagar.me. Uma assinatura só, no site e no app.
Tudo em `docs/roteiros.md`.

**Home.** Primeiro ENTREGA (as faixas de conteúdo real, vindas da API), depois
EXPLICA (quem somos, a comunidade, o aplicativo, os parceiros). Os textos
institucionais e os números da plataforma ficam em `features/home/config.ts` —
não espalhe número por componente.

**Ofertas.** `/ofertas` ("Viajantes Recomenda") é a única tela que depende de um
serviço de fora: a Central de Ofertas, um projeto separado. Se ela cair, só essa
tela sente. As duas regras que não podem ser quebradas (clique sempre via
`/go/{id}` e `rel="sponsored"`) estão em `docs/ofertas.md`. Oferta com
`price: 0` (cupom de patrocinador) não mostra preço.

**Chip ativo.** As classes de `estilos.css` ficam fora de `@layer`, então
vencem os utilitários do Tailwind: `text-white` num `.chip` perde. Estado
escolhido usa `.chip--ativo`, nunca utilitário de cor por cima.

## Sistema visual — "o papel do app"

A tela Explorar do aplicativo é uma folha branca: filete fino de 1px no lugar de
caixas, círculos de categoria contornados, título de seção em caixa alta entre
duas linhas e a foto como protagonista. **Verde é tinta** (título), **laranja é
ação** (etiqueta, aba ativa, botão). Nunca o contrário. Os tokens estão em
`src/estilos.css`.
