import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footprints, Lock, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import type { Categoria, Idioma } from '@/i18n/categorias';
import { hrefCategoria, raiz } from '@/i18n/caminhos';
import { useUsuario } from '@/lib/conta';
import type { Empresa } from '@/lib/tipos';
import ModalLogin from '@/features/conta/ModalLogin';
import Assinar from '@/features/roteiros/Assinar';
import { capaEmpresa, tituloInfo } from './dados';
import GradeEmpresas from './GradeEmpresas';
import LinhasBorradas from './LinhasBorradas';

/** Atrativo para quem não assina: nome, capa, local, resumo e os títulos dos blocos (D3/D4).
 * Avaliações, mapa, contatos e horários ficam de fora; o texto dos blocos nem veio da API. */
export default function AtrativoBloqueado({ empresa, categoria, idioma }: { empresa: Empresa; categoria: Categoria; idioma: Idioma }) {
  const t = useT();
  const { data: usuario, isPending: carregandoUsuario } = useUsuario();
  const [entrando, setEntrando] = useState(false);

  const capa = capaEmpresa(empresa);
  const lugar = [empresa.cidade_nome, empresa.estado_nome].filter(Boolean).join(', ');
  const titulos = (empresa.infos ?? []).map((info) => tituloInfo(info.titulo)).filter(Boolean);
  // Mostra que existe como chegar e WhatsApp; o toque leva ao convite do Plano (sem números: 17/11).
  const trancados = [
    empresa.tem_como_chegar && { chave: 'rota', Icone: Navigation, texto: t('Como chegar') },
    empresa.tem_whatsapp && { chave: 'whats', Icone: MessageCircle, texto: t('WhatsApp') },
  ].filter(Boolean) as { chave: string; Icone: typeof Navigation; texto: string }[];
  const irParaConvite = () => document.getElementById('atrativo-completo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <div className="folha pt-6">
        <nav aria-label={t('Você está em')} className="flex flex-wrap items-center gap-2 text-mini text-texto-3">
          <Link to={raiz(idioma) || '/'} className="transition hover:text-brand">
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <Link to={hrefCategoria(categoria, idioma)} className="transition hover:text-brand">
            {t(categoria.titulo)}
          </Link>
        </nav>

        {capa && (
          <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-heroi bg-brand-suave sm:aspect-auto sm:h-96">
            <img src={capa} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
        )}

        <h1 className="mt-5 max-w-3xl text-titulo font-bold leading-tight tracking-tight text-balance text-brand sm:text-heroi">
          {empresa.nome}
        </h1>

        {lugar && (
          <p className="mt-2 flex items-center gap-1.5 text-nota text-texto-2">
            <MapPin size={14} className="text-acento" aria-hidden="true" />
            {lugar}
          </p>
        )}

        {(trancados.length > 0 || empresa.tem_wikiloc) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {trancados.map(({ chave, Icone, texto }) => (
              <button key={chave} type="button" onClick={irParaConvite} className="botao-fio" title={t('Exclusivo para assinantes do Plano Viajantes.')}>
                <Lock size={15} aria-hidden="true" />
                <Icone size={15} aria-hidden="true" />
                {texto}
              </button>
            ))}
            {empresa.tem_wikiloc && (
              <button type="button" disabled className="botao-fio cursor-not-allowed opacity-70" title={t('Exclusivo para assinantes do Plano Viajantes.')}>
                <Lock size={15} aria-hidden="true" />
                <Footprints size={15} aria-hidden="true" />
                {t('Ver trilha no Wikiloc')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="folha space-y-10 py-8">
        {(empresa.filhos ?? []).length > 0 && (
          <section>
            <h2 className="rotulo-secao mb-4">{t('Atrativos deste complexo')}</h2>
            <GradeEmpresas empresas={empresa.filhos ?? []} categoria={categoria} idioma={idioma} colunas={3} />
          </section>
        )}

        {(empresa.resumo || titulos.length > 0) && (
          <section className="max-w-3xl">
            <h2 className="rotulo-secao mb-4">{t('Sobre')}</h2>
            {empresa.resumo && <p className="text-nota leading-relaxed text-texto-2">{empresa.resumo}</p>}
            <div className="mt-5 space-y-5">
              {titulos.map((titulo, indice) => (
                <article key={indice}>
                  <h3 className="flex items-center gap-1.5 text-base font-semibold text-texto">
                    <Lock size={14} className="shrink-0 text-texto-3" aria-hidden="true" />
                    {titulo}
                  </h3>
                  <LinhasBorradas n={3} />
                </article>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="atrativo-completo">
          <div className="max-w-3xl">
            <h2 id="atrativo-completo" className="text-secao font-bold leading-tight text-brand">
              {t('Veja este atrativo completo')}
            </h2>
            <p className="mt-1 text-nota text-texto-2">
              {t('Assine o Plano Viajantes para ver fotos, mapa, como chegar, contatos e o texto completo de cada atrativo.')}
            </p>
            {!carregandoUsuario && !usuario && (
              <p className="mt-4 text-nota text-texto-2">
                {t('Já é assinante?')}{' '}
                <button type="button" onClick={() => setEntrando(true)} className="font-semibold text-acento-escuro hover:underline">
                  {t('Entrar')}
                </button>
              </p>
            )}
          </div>

          <Assinar />
        </section>
      </div>

      <ModalLogin
        aberto={entrando}
        aoFechar={() => setEntrando(false)}
        nome={empresa.nome}
        capa={capa}
        titulo={t('Entre ou crie sua conta')}
        texto={t('A assinatura fica na sua conta, a mesma do aplicativo.')}
      />
    </>
  );
}
