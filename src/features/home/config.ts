/**
 * Números, links e contatos institucionais da home — um lugar só.
 *
 * Nada de valor institucional fica escrito dentro de um componente: quando o
 * número de downloads muda ou entra uma rede nova, muda aqui e a página toda
 * acompanha. Os rótulos são chaves de tradução (o texto em português é a
 * chave, como no resto do site); os links, não.
 *
 * Herdado de `lib/home/home-config.php` do site em PHP, que o parceiro montou
 * com valores conferidos pelo cliente — não são inventados.
 */

/** Prova social do topo da seção Comunidade. */
export const NUMEROS = [
  { valor: '+900 mil', rotulo: 'viajantes usando a plataforma' },
  { valor: '+1.500', rotulo: 'cachoeiras mapeadas' },
  { valor: 'Brasil', rotulo: 'destinos de norte a sul' },
  { valor: '+1 milhão', rotulo: 'pessoas nas redes sociais' },
] as const;

/**
 * Perfis oficiais @viajantesapp. Ordem de exibição — a mesma lista alimenta a
 * seção de redes da home e a fileira de ícones do rodapé.
 */
export const REDES_SOCIAIS = [
  { id: 'instagram', rotulo: 'Instagram', href: 'https://www.instagram.com/viajantesapp/' },
  { id: 'facebook', rotulo: 'Facebook', href: 'https://www.facebook.com/viajantesapp' },
  { id: 'tiktok', rotulo: 'TikTok', href: 'https://www.tiktok.com/@viajantesapp' },
  { id: 'youtube', rotulo: 'YouTube', href: 'https://www.youtube.com/@viajantesapp' },
] as const;

/**
 * "Continue conectado": dois grupos de WhatsApp DIFERENTES (a comunidade e o
 * Viajantes Recomenda, que é o de descontos) e o blog.
 */
export const CONEXOES = {
  comunidadeWhatsapp: 'https://chat.whatsapp.com/Giev4g8CZyx62YLYZLZpkv',
  descontosWhatsapp: 'https://chat.whatsapp.com/E4Ir2scLb9J1LKqq0LdrMY',
  blog: 'https://blog.viajantesapp.com.br/',
} as const;

export const CONTATO = {
  whatsapp: '(35) 98851-5877',
  whatsappHref: 'https://wa.me/5535988515877',
  email: 'contato@viajantesapp.com.br',
} as const;

/** Onde um negócio de turismo entra na plataforma. Os dois são externos. */
export const B2B = {
  cadastro: 'https://viajantesapp.com.br/seja-parceiro/assinar.php',
  mapeador: 'https://viajantes-mapeadores.vercel.app/',
} as const;

/** "Conheça nossa história" — matéria do Estado de Minas indicada pelo cliente. */
export const HISTORIA_HREF =
  'https://www.em.com.br/networking-e-negocios/2026/09/7493013-viajantes-app-atinge-1-milhao-de-downloads-mapeando-o-ecoturismo-no-brasil.html';
