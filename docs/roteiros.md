# Roteiros prontos e o Plano Viajantes no site

Os roteiros prontos são os mesmos da aba "Roteiros" do aplicativo
(`roteiro_personalizado`). O dia a dia é conteúdo do **Plano Viajantes**: os
planos da tabela `assinatura` (hoje Mensal R$ 19,90 e Anual R$ 149,90), que o
app vende nas lojas e o site vende no cartão ou Pix pela Pagar.me. A assinatura
é uma só: quem paga no site fica liberado no app, e vice-versa. O lado da API
está em `viajantes-node-api/docs/assinatura-site.md`.

## O que cada pessoa vê

| Situação | `/roteiros` | `/roteiros/{slug}-{id}` |
|---|---|---|
| sem plano | capas + faixa "Plano Viajantes" fechada | capa, descrição e a oferta do plano (mensal/anual + Assinar) |
| assinante (loja ou site) | só as capas | o dia a dia completo, com "plano ativo até dd/mm" |

A lista mostra **só a capa** de propósito: nome de atrativo e horário são o
conteúdo que se vende. Nunca manda para o app: quem chega pelo site compra no
site.

## Fluxo

```
Assinar → escolhe mensal/anual → sem sessão: ModalLogin (mesma conta do app) → Checkout
Checkout (features/roteiros/Checkout.tsx)
  Pix    → POST /site/assinatura/compra { plano_id, metodo:'pix', nome, cpf, email, telefone }
           → QR Code + copia e cola → polling GET /site/assinatura/compras/:id a cada 5 s
  Cartão → tokeniza no navegador (lib/pagarme.ts, chave PÚBLICA) → só o card_token vai
           → POST ... { metodo:'credit_card', card_token, parcelas, billing_address }
           → ativo na hora | 402 cartao_recusado (motivo do emissor) | em análise (polling)
pago → invalida ['assinatura-site'] e ['roteiro-itens'] → o dia a dia aparece; e-mail sai da API
```

- `GET /site/assinatura` traz `assinado`, a assinatura ativa (de qualquer
  origem) e os `planos` com `parcelas_max`. Fora do ar, a oferta mostra
  "tentar de novo" e nunca libera nada.
- `GET /site/roteiros/:id/itens` só responde para assinante (401/402); o site
  nem chama antes de `assinado`.
- A sessão entra na chave das consultas (`useAssinaturaSite`, `useItensRoteiro`,
  `useComprasPlano`): entrar ou assinar muda a resposta e o cache acompanha.
- "Conta › Meus roteiros" (`/conta/roteiros`) mostra o plano, a validade, a
  origem (App Store / Google Play / site), todos os roteiros e as compras
  feitas no site.

## Regras que valem conhecer

- Sem renovação automática no site: perto do vencimento a pessoa compra de
  novo, e o novo período começa quando o atual acaba.
- Cartão exige telefone com DDD e endereço de cobrança (o pagar.me recusa sem
  eles). Pix só pede nome, CPF e e-mail.
- Parcelas: a API manda `parcelas_max` (mensal 1x, anual até 3x).
- O Pix vence em 1 h; a tela avisa e oferece gerar outro. Pedir Pix de novo
  para o mesmo plano devolve o **mesmo** QR enquanto ele vale.
- Número e CVV do cartão nunca chegam à nossa API (`lib/pagarme.ts`).

## Configuração

`.env`: `VITE_PAGARME_PUBLIC_KEY` = a `PAGARME_PUBLIC_KEY` do `.env` da API.
Vazia, o checkout mostra "pagamento indisponível".

## Testes

- `tests/unit/roteiros.test.ts` — Luhn, validade, máscaras, parcelas, dias, economia do anual.
- `tests/e2e/roteiros.spec.ts` — lista só com capa e a faixa do plano; detalhe
  sem paradas para quem não assina; "Meus roteiros" exige login.
- Sandbox: chaves de teste da Pagar.me nos dois `.env`; cartão aprovado
  `4000 0000 0000 0010`, recusado `4000 0000 0000 0028`.
