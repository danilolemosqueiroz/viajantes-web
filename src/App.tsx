import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { IDIOMAS, type Idioma } from '@/i18n/categorias';
import { CAMINHOS_FIXOS, idiomaDoCaminho, raiz } from '@/i18n/caminhos';
import { ProvedorTraducao } from '@/i18n/Traducao';
import Moldura from '@/components/layout/Moldura';
import Carregando from '@/components/layout/Carregando';

/**
 * Rotas do site.
 *
 * Cada idioma tem os seus endereços: português na raiz (`/cachoeiras`) e os
 * demais com prefixo e caminho traduzido (`/en/waterfalls`). Como os caminhos
 * fixos mudam de nome por idioma, as rotas são MONTADAS a partir da mesma
 * tabela que os links usam — assim não existe uma segunda lista para
 * desatualizar.
 *
 * Cada tela é carregada sob demanda (`lazy`): quem entra numa cachoeira não
 * baixa o código da área de conta.
 */
const Home = lazy(() => import('@/paginas/Home'));
const Categoria = lazy(() => import('@/paginas/Categoria'));
const CategoriaSlug = lazy(() => import('@/paginas/CategoriaSlug'));
const Destinos = lazy(() => import('@/paginas/Destinos'));
const Destino = lazy(() => import('@/paginas/Destino'));
const Roteiros = lazy(() => import('@/paginas/Roteiros'));
const Roteiro = lazy(() => import('@/paginas/Roteiro'));
const Busca = lazy(() => import('@/paginas/Busca'));
const Ofertas = lazy(() => import('@/paginas/Ofertas'));
const Mapeadores = lazy(() => import('@/paginas/Mapeadores'));
const Texto = lazy(() => import('@/paginas/Texto'));
const Contato = lazy(() => import('@/paginas/Contato'));
const Entrar = lazy(() => import('@/paginas/Entrar'));
const CriarConta = lazy(() => import('@/paginas/CriarConta'));
const RecuperarSenha = lazy(() => import('@/paginas/RecuperarSenha'));
const Conta = lazy(() => import('@/paginas/Conta'));
const Favoritos = lazy(() => import('@/paginas/Favoritos'));
const MeusDados = lazy(() => import('@/paginas/MeusDados'));
const MinhasCompras = lazy(() => import('@/paginas/MinhasCompras'));
const NaoEncontrada = lazy(() => import('@/paginas/NaoEncontrada'));
const Ponte = lazy(() => import('@/paginas/Ponte'));

/** As telas de um idioma, penduradas no prefixo dele. */
function rotasDoIdioma(idioma: Idioma) {
  const semBarra = (caminho: string) => caminho.replace(/^\//, '');
  const c = (rota: keyof typeof CAMINHOS_FIXOS) => semBarra(CAMINHOS_FIXOS[rota][idioma]);

  return (
    <>
      <Route index element={<Home />} />
      <Route path={c('/destinos')} element={<Destinos />} />
      <Route path={`${c('/destinos')}/:destino`} element={<Destino />} />
      <Route path={c('/roteiros')} element={<Roteiros />} />
      <Route path={`${c('/roteiros')}/:slug`} element={<Roteiro />} />
      <Route path={c('/busca')} element={<Busca />} />
      <Route path={c('/ofertas')} element={<Ofertas />} />
      <Route path={c('/mapeadores')} element={<Mapeadores />} />
      <Route path={c('/sobre')} element={<Texto pagina="sobre" />} />
      <Route path={c('/contato')} element={<Contato />} />
      <Route path={c('/termos')} element={<Texto pagina="termos" />} />
      <Route path={c('/privacidade')} element={<Texto pagina="privacidade" />} />
      <Route path={c('/entrar')} element={<Entrar />} />
      <Route path={c('/criar-conta')} element={<CriarConta />} />
      <Route path={c('/recuperar-senha')} element={<RecuperarSenha />} />
      <Route path={c('/conta')} element={<Conta />} />
      <Route path={c('/conta/favoritos')} element={<Favoritos />} />
      <Route path={c('/conta/meus-dados')} element={<MeusDados />} />
      <Route path={c('/conta/roteiros')} element={<MinhasCompras />} />

      {/* Categoria e o que vem dentro dela. Fica por ÚLTIMO: `:categoria` casa
          com qualquer coisa, e engoliria os caminhos fixos acima. */}
      <Route path=":categoria" element={<Categoria />} />
      <Route path=":categoria/:slug" element={<CategoriaSlug />} />

      <Route path="*" element={<NaoEncontrada />} />
    </>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const idioma = idiomaDoCaminho(pathname);

  return (
    <ProvedorTraducao idioma={idioma}>
      <Suspense fallback={<Carregando />}>
        <Routes>
          {/* Pontes sem idioma, para links antigos e material impresso. */}
          <Route path="/e/:id" element={<Ponte tipo="empresa" />} />
          <Route path="/r/:id" element={<Ponte tipo="roteiro" />} />
          <Route path="/c/:categoria/:id" element={<Ponte tipo="cidade" />} />
          <Route path="/download" element={<Ponte tipo="download" />} />

          {/* URLs do site PHP antigo que não dependem de consultar a API. */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/guia-cachoeiras" element={<Navigate to="/cachoeiras" replace />} />
          <Route path="/res-cachoeiras" element={<Navigate to="/cachoeiras" replace />} />
          <Route path="/guia-pousadas" element={<Navigate to="/pousadas" replace />} />
          <Route path="/res-pousadas" element={<Navigate to="/pousadas" replace />} />
          <Route path="/guia-passeios" element={<Navigate to="/passeios" replace />} />
          <Route path="/res-passeios-turisticos" element={<Navigate to="/passeios" replace />} />
          <Route path="/guia-restaurantes" element={<Navigate to="/restaurantes" replace />} />
          <Route path="/res-restaurantes" element={<Navigate to="/restaurantes" replace />} />
          <Route path="/guia-camping" element={<Navigate to="/campings" replace />} />
          <Route path="/res-camping" element={<Navigate to="/campings" replace />} />
          <Route path="/guia-queijarias" element={<Navigate to="/queijarias" replace />} />
          <Route path="/res-queijarias" element={<Navigate to="/queijarias" replace />} />
          <Route path="/guia-artesanatos" element={<Navigate to="/artesanato" replace />} />
          <Route path="/res-artesanato" element={<Navigate to="/artesanato" replace />} />
          <Route path="/guia-museus-igrejas" element={<Navigate to="/museus-e-igrejas" replace />} />
          <Route path="/res-museus-igrejas" element={<Navigate to="/museus-e-igrejas" replace />} />
          <Route path="/guia-ranchos" element={<Navigate to="/ranchos" replace />} />
          <Route path="/res-ranchos" element={<Navigate to="/ranchos" replace />} />
          <Route path="/guia-roteiros" element={<Navigate to="/roteiros" replace />} />
          <Route path="/ranking-mapeadores" element={<Navigate to="/mapeadores" replace />} />
          <Route path="/termos-e-condicoes" element={<Navigate to="/termos" replace />} />
          <Route path="/politica-de-privacidade" element={<Navigate to="/privacidade" replace />} />
          <Route path="/busca-comercial" element={<Navigate to="/busca" replace />} />
          <Route path="/empresa/:id/*" element={<Ponte tipo="empresa" />} />
          <Route path="/roteiro/:id/*" element={<Ponte tipo="roteiro" />} />

          {/* Português na raiz */}
          <Route path="/" element={<Moldura />}>
            {rotasDoIdioma('pt')}
          </Route>

          {/* Demais idiomas, cada um sob o seu prefixo */}
          {IDIOMAS.filter((i) => i !== 'pt').map((outro) => (
            <Route key={outro} path={`${raiz(outro)}/`} element={<Moldura />}>
              {rotasDoIdioma(outro)}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </ProvedorTraducao>
  );
}
