/** Endereços do aplicativo nas lojas, em um lugar só. Usado pelo rodapé e
 * pela rota /download (que escolhe a loja pelo aparelho). */
export const LOJA_IOS = 'https://apps.apple.com/br/app/viajantes-app/id1148316944';
export const LOJA_ANDROID = 'https://play.google.com/store/apps/details?id=app.nahora&hl=pt_BR';

/** Loja com a origem da campanha (Play: referrer; App Store: ct). */
export function lojaComOrigem(apple: boolean, campanha: string): string {
  return apple
    ? `${LOJA_IOS}?ct=${encodeURIComponent(campanha)}&mt=8`
    : `${LOJA_ANDROID}&referrer=${encodeURIComponent(`utm_source=${campanha}&utm_medium=qr`)}`;
}
