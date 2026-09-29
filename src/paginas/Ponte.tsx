import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { categoriaPorEavmoda, CATEGORIAS } from '@/i18n/categorias';
import { hrefEmpresa, hrefDestino, hrefRoteiro } from '@/i18n/caminhos';
import { useEmpresa, useRoteiro, useGeografia } from '@/lib/consultas';
import { caminhoRoteiro } from '@/features/roteiros/dados';
import { LOJA_ANDROID, LOJA_IOS } from '@/lib/lojas';
import Carregando from '@/components/layout/Carregando';

/** Pontes: endereços curtos que só levam ao lugar certo (/e/1234 atrativo, /r/45 roteiro,
 * /c/cat/12 cidade do site antigo, /download loja). Não têm idioma. */
export default function Ponte({ tipo }: { tipo: 'empresa' | 'roteiro' | 'cidade' | 'download' }) {
  const { id, categoria: slugCategoria } = useParams();
  const numero = Number(id);

  const empresa = useEmpresa(tipo === 'empresa' ? numero : undefined);
  const roteiro = useRoteiro(tipo === 'roteiro' ? numero : undefined);
  const geografia = useGeografia();

  useEffect(() => {
    if (tipo !== 'download') return;
    const agente = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(agente)) window.location.replace(LOJA_IOS);
    else if (/android/i.test(agente)) window.location.replace(LOJA_ANDROID);
  }, [tipo]);

  if (tipo === 'download') {
    // No computador não há loja para abrir: volta para a home.
    return /iphone|ipad|ipod|android/i.test(navigator.userAgent) ? <Carregando /> : <Navigate to="/" replace />;
  }

  if (!Number.isSafeInteger(numero) || numero <= 0) return <Navigate to="/" replace />;

  if (tipo === 'empresa') {
    if (empresa.isPending) return <Carregando />;
    if (!empresa.data) return <Navigate to="/" replace />;
    const categoria = categoriaPorEavmoda(empresa.data.eavmoda) ?? CATEGORIAS[0];
    return <Navigate to={hrefEmpresa(empresa.data, categoria, 'pt')} replace />;
  }

  if (tipo === 'roteiro') {
    if (roteiro.isPending) return <Carregando />;
    if (!roteiro.data) return <Navigate to="/roteiros" replace />;
    return <Navigate to={hrefRoteiro(caminhoRoteiro(roteiro.data), 'pt')} replace />;
  }

  // cidade: /c/{categoria}/{idcidade} do site antigo
  if (geografia.isPending) return <Carregando />;
  const cidade = geografia.data?.cidades.find((c) => c.id === numero);
  const categoria = CATEGORIAS.find((c) => c.id === slugCategoria) ?? CATEGORIAS[0];
  if (!cidade) return <Navigate to="/" replace />;
  return <Navigate to={hrefDestino(categoria, cidade.slug, 'pt')} replace />;
}
