# Página do atrativo

`/cachoeiras/cachoeira-do-cristal-1234` (e o mesmo para as outras categorias).
Código em `src/features/catalogo/PaginaAtrativo.tsx` e nos arquivos ao lado.

## O que aparece, e em que ordem

A ordem é a do site antigo em PHP (`viajantes-site/empresa.php`), que o
cliente pediu para manter — com uma mudança dele em 21/09: as fotos sobem
para antes das avaliações (no celular também, é a mesma página):

1. **Capa, título e a linha de resumo**: cidade/estado (ou o endereço), o
   horário de hoje com "Aberto agora"/"Fechado agora", e a nota média com a
   quantidade de avaliações (link para a seção). Sem avaliações, "Seja o
   primeiro a avaliar", que abre o formulário.
2. **Botões**: Como chegar (Apple Maps no iPhone/iPad, Google Maps no resto),
   WhatsApp e, quando a empresa tem `linkafiliado`, Reservar.
3. **Contato** (coluna da direita; no celular vem antes do conteúdo, como no
   site antigo): logotipo, endereço, os mesmos botões, telefones, e-mail, site,
   Instagram e Facebook.
4. **Atrativos deste complexo** (`filhos`, quando `complexo = 1`).
5. **Sobre**: cada texto de `infos` com o título como subtítulo.
6. **Fotos**: a galeria sem a capa, de 12 em 12, com visor de tela inteira.
7. **Avaliações**: nota média, botão "Avaliar este local" e até 12 avaliações
   com foto, nome, estrelas e comentário.
8. **Atrativos próximos**: abas por categoria (Cachoeiras, Restaurantes,
   Hospedagens) com a distância em km — até 30 km, como no app.
9. **Vídeos** (YouTube, `infos[].video`).
10. **Destaques**: as imagens de `infos[].arquivo` (a gerência chama de
    "imagens das informações"/ofertas).
11. **Horário de funcionamento**, dia a dia, com o de hoje marcado.

Seção sem dado não aparece.

## Convite para baixar o aplicativo

Ao abrir um atrativo aparece o `ConviteApp` (App Store / Google Play, a loja
do aparelho primeiro). É um convite, não um bloqueio: "Continuar no site", o X
ou Esc fecham e a página está inteira. Aparece **uma vez por sessão do
navegador** (`sessionStorage`, chave `vj_convite_app`, gravada ao mostrar —
quem sai sem responder também não vê de novo); fechar a aba zera.

Não existe mais o modal de login que travava o detalhe (ele continua em
`features/conta/ModalLogin.tsx`, usado só pelo Plano Viajantes).

## Avaliar este local

`AvaliarLocal.tsx` manda para `POST /site/avaliacaoAdd`, a mesma rota que o
site antigo usava: nota (1 a 5), nome, e-mail e comentário. Não exige conta —
a API acha ou cria o usuário pelo e-mail — e a avaliação entra com `status = 0`
(só aparece depois de aprovada na gerência). Quem está logado só vê nome e
e-mail já preenchidos. Uma avaliação por pessoa e lugar: a segunda substitui.

## O que a API do detalhe NÃO diz (e como a página resolve)

`GET /site/empresa/:id` (`viajantes-node-api`, `EmpresasController.getEmpresaById`):

- `nota` e `exibeavaliacao` vêm **0 fixo**. A nota da página é a média de
  `GET /site/avaliacoes/:id`, que é buscada sempre.
- `aberto`/`horario` são o status do cadastro, não "aberto agora". O estado de
  hoje sai de `horarios[]` (`{ nome, valor: "09:00 - 17:00" | "Fechado", atual }`)
  em `horarioDeHoje()`, que trata faixa que vira a madrugada.
- `infos[]` é uma lista só: texto (`descricao`), imagem (`arquivo`) ou vídeo
  (`video`). Só entram os textos com `posicao < 100`; os de posição 100/200 da
  listagem não vêm no detalhe. `separarConteudo()` faz a divisão.
- `fotos[0]` é a capa (`idempresafoto: 0`); a galeria tira ela.
- Vídeo: a API troca `watch?v=` por `/embed/` e deixa uma barra dobrada;
  `urlEmbedVideo()` normaliza (e aceita youtu.be ou só o ID).
- `telefones[]` já vem formatado; `idtelefone` 1–3 são telefones, 4 é o
  WhatsApp (que tem botão próprio, com o número tirado do link).
- Atrativos próximos (`/site/empresa/:id/atrativos`) trazem `eavmoda` e
  `distancia_km` (não `distancia`).

Testes: `tests/unit/atrativo.test.ts` (regras) e `tests/e2e/atrativo.spec.ts`
(convite, avaliações, abas, envio de avaliação).
