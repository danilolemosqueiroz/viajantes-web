/**
 * Redirecionamentos das URLs do site PHP antigo.
 *
 * Uma lista só, usada pelos DOIS destinos: o `next.config.ts` (site com
 * servidor) e o `scripts/htaccess.mjs` (site exportado como arquivos). Se
 * ficassem duplicadas, uma delas envelheceria em silêncio.
 *
 * `:algo` é um parâmetro; `:algo*` é o resto do caminho.
 */
export const REDIRECIONAMENTOS = [
  { de: '/home', para: '/', codigo: 301 },
  { de: '/guia-cachoeiras', para: '/cachoeiras', codigo: 301 },
  { de: '/res-cachoeiras', para: '/cachoeiras', codigo: 301 },
  { de: '/guia-pousadas', para: '/pousadas', codigo: 301 },
  { de: '/res-pousadas', para: '/pousadas', codigo: 301 },
  { de: '/guia-passeios', para: '/passeios', codigo: 301 },
  { de: '/res-passeios-turisticos', para: '/passeios', codigo: 301 },
  { de: '/guia-restaurantes', para: '/restaurantes', codigo: 301 },
  { de: '/res-restaurantes', para: '/restaurantes', codigo: 301 },
  { de: '/guia-camping', para: '/campings', codigo: 301 },
  { de: '/res-camping', para: '/campings', codigo: 301 },
  { de: '/guia-queijarias', para: '/queijarias', codigo: 301 },
  { de: '/res-queijarias', para: '/queijarias', codigo: 301 },
  { de: '/guia-artesanatos', para: '/artesanato', codigo: 301 },
  { de: '/res-artesanato', para: '/artesanato', codigo: 301 },
  { de: '/guia-museus-igrejas', para: '/museus-e-igrejas', codigo: 301 },
  { de: '/res-museus-igrejas', para: '/museus-e-igrejas', codigo: 301 },
  { de: '/guia-ranchos', para: '/ranchos', codigo: 301 },
  { de: '/res-ranchos', para: '/ranchos', codigo: 301 },
  { de: '/guia-roteiros', para: '/roteiros', codigo: 301 },
  { de: '/ranking-mapeadores', para: '/mapeadores', codigo: 301 },
  { de: '/termos-e-condicoes', para: '/termos', codigo: 301 },
  { de: '/politica-de-privacidade', para: '/privacidade', codigo: 301 },
  { de: '/busca-comercial', para: '/busca', codigo: 301 },
  { de: '/res-:categoria/cidade/:id/:slug*', para: '/c/:categoria/:id', codigo: 301 },
  { de: '/res-:categoria/categoria/:id/:slug*', para: '/:categoria', codigo: 301 },
  { de: '/res-:categoria/subcategoria/:id/:slug*', para: '/:categoria', codigo: 301 },
  { de: '/empresa/:id', para: '/e/:id', codigo: 301 },
  { de: '/empresa/:id/:slug*', para: '/e/:id', codigo: 301 },
  { de: '/roteiro/:id', para: '/r/:id', codigo: 301 },
  { de: '/roteiro/:id/:slug*', para: '/r/:id', codigo: 301 },
  { de: '/roteiros/cidade/:id/:slug*', para: '/roteiros', codigo: 301 },
  { de: '/agenda', para: '/', codigo: 301 },
  { de: '/agendas', para: '/', codigo: 301 },
  { de: '/guia-pacotes', para: '/', codigo: 301 },
  { de: '/pacote/:path*', para: '/', codigo: 301 },
  { de: '/reserva/:path*', para: '/', codigo: 301 },
];
