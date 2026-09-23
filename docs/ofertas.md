# Viajantes Recomenda (`/ofertas`)

A página de ofertas do site. O conteúdo **não é nosso**: vem da *Central de
Ofertas Viajantes*, um projeto separado (Next + Supabase, em
`ofertas-indol.vercel.app`) onde o time cadastra, cura e publica as ofertas.

Veio da branch `feature/integracao-central-ofertas` do `viajantes-site` (o site
antigo em PHP), refeita aqui em React. O documento original do parceiro, com o
contrato completo da API e o lado da Central, está naquela branch em
`INTEGRACAO_CENTRAL_OFERTAS.md`.

## O princípio

**Fonte única.** Nenhuma oferta é cadastrada, editada ou guardada neste
repositório, e nada passa pela `viajantes-node-api`. Cadastra-se uma vez na
Central e aparece no site (e no aplicativo, quando ele for ligado). Não crie um
segundo cadastro nem um segundo painel.

## Como o site consome

Tudo no navegador, que é como o resto deste site já funciona. A Central
responde `Access-Control-Allow-Origin: *` nos endpoints públicos, então não há
proxy no meio.

| Arquivo | Papel |
|---|---|
| `src/features/ofertas/dados.ts` | Cliente da Central, tipos e as regras puras (link de clique, rótulo do botão, preço) |
| `src/features/ofertas/CardOferta.tsx` | Um card |
| `src/features/ofertas/FaixaOfertas.tsx` | As 4 primeiras ofertas na home |
| `src/paginas/Ofertas.tsx` | A página: busca, categorias, paginação, estados |
| `tests/unit/ofertas.test.ts` | As regras puras |
| `tests/e2e/ofertas.spec.ts` | A tela de ponta a ponta |

Três endpoints, todos públicos e sem credencial:

- `GET /api/offers` — `category`, `q`, `limit`, `page`. O site usa 12 por página.
- `GET /api/categories` — a lista de categorias. O site mostra só quatro delas
  (`CATEGORIAS_VISIVEIS`), mas o **rótulo** continua vindo daqui: renomear na
  Central muda o chip sem build.
- `GET /go/{id}` — o clique.

## As duas regras que não podem ser quebradas

**1. Todo clique passa por `/go/{id}`.** O JSON traz `affiliate_url` só por
transparência. Linkar ele direto leva a pessoa ao mesmo lugar, mas o clique não
é registrado em lugar nenhum — e é a contagem de cliques que sustenta a
parceria. Há teste de ponta a ponta conferindo isso em todos os cards da tela.

**2. `rel="noopener nofollow sponsored"`.** São links de afiliado. Sem
`sponsored`, o site empresta autoridade de SEO para as lojas.

## Detalhes que já foram decididos

- **Canal.** Cada clique vai com `canal=viajantes-site`. Continua esse nome
  mesmo com o site refeito em React: é a mesma superfície, e trocar partiria em
  duas a série de cliques que a Central já mede. Quando o **aplicativo** for
  ligado na mesma API, ele deve usar canal próprio (`app-ios` / `app-android`)
  para dar para segmentar no `/admin/metricas` da Central.
- **Categoria "Em breve".** `own_data: false` quer dizer que a categoria existe
  na Central mas ainda não tem oferta própria — hoje *Atrativos Turísticos* e
  *Descontos Patrocinadores*, que vivem na `viajantes-node-api` (`GET /descontos`
  e `GET /ads/active`). O botão aparece desligado, em vez de sumir. Juntar as
  três fontes é trabalho ainda não feito, nem aqui nem no site em PHP.
- **Preço.** Sempre em real, porque as lojas são brasileiras. O idioma muda só a
  escrita do número. Usa `currencyDisplay: 'narrowSymbol'` para sair "R$" nos
  cinco idiomas — sem isso o espanhol é o único que escreve "35,89 BRL".
- **Preço zero.** As ofertas "fixas" (`type: 'fixa'`: cupom de patrocinador,
  entrada de atrativo, passeio) vêm com `price: 0` — é ausência de preço, não
  "R$ 0,00". O card só mostra preço quando `price > 0` (`temPreco`).
- **Só quatro categorias.** Decisão do cliente em 22/09/2026: *Todos*,
  *Hospedagens*, *Camping e Outdoor* e *Pet* — a Central tem 17. A lista está em
  `CATEGORIAS_VISIVEIS` (`features/ofertas/dados.ts`) e tem uma gêmea no app
  (`src/services/OfertasService.js`): mexer em uma sem a outra deixa as duas
  telas diferentes. Esconder o chip **não** esconde a oferta — `Todos` continua
  listando tudo que a Central publica, inclusive de categoria escondida.
- **Categorias.** Quebram linha (`flex-wrap`) em vez de rolar na horizontal:
  no computador não há como rolar um trilho sem barra, e as últimas ficavam
  inalcançáveis.
- **Foto quebrada.** As imagens vêm de terceiros (Amazon, Mercado Livre...). Se
  uma sair do ar, o card apaga a imagem e fica o fundo da marca.
- **Cache.** A Central responde com `max-age=60`. Uma oferta publicada lá
  aparece aqui em cerca de um minuto, sem build nem deploy deste site.

## Se a Central cair

`/ofertas` mostra "não conseguimos carregar" com um botão de tentar de novo, e a
faixa da home some sozinha. Nenhuma outra tela do site depende dela.

## Testar sem subir nada

```bash
curl https://ofertas-indol.vercel.app/api/categories
curl "https://ofertas-indol.vercel.app/api/offers?limit=3"
curl "https://ofertas-indol.vercel.app/api/offers?q=barraca"
```
