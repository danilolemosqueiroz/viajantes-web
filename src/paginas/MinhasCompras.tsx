import { Link, Navigate } from 'react-router-dom';
import { CircleCheck, Receipt } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useUsuario } from '@/lib/conta';
import { useAssinaturaSite, useComprasPlano, useRoteiros } from '@/lib/consultas';
import { useMeta } from '@/lib/meta';
import { formatarData, formatarPreco } from '@/lib/moeda';
import Assinar from '@/features/roteiros/Assinar';
import CardRoteiro from '@/features/roteiros/CardRoteiro';
import { rotuloPeriodo } from '@/features/roteiros/dados';
import Carregando from '@/components/layout/Carregando';

const ORIGEM: Record<string, string> = { ios: 'App Store', android: 'Google Play', site: 'site' };

/** "Meus roteiros": o plano da conta, os roteiros liberados e as compras feitas no site. */
export default function MinhasCompras() {
  const t = useT();
  const idioma = useIdioma();
  const { data: usuario, isPending: carregandoUsuario } = useUsuario();
  const { data: assinatura, isPending } = useAssinaturaSite();
  const { data: compras = [] } = useComprasPlano(Boolean(usuario));
  const { data: roteiros = [] } = useRoteiros();

  useMeta({ titulo: t('Meus roteiros'), caminho: href('/conta/roteiros', idioma), naoIndexar: true });

  if (carregandoUsuario) return <Carregando />;
  if (!usuario) return <Navigate to={href('/entrar', idioma)} replace />;

  const ativa = assinatura?.assinatura;

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold text-brand">{t('Meus roteiros')}</h1>

      {isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : ativa ? (
        <>
          <p className="mt-4 flex flex-wrap items-center gap-2 rounded-cartao bg-ok/10 p-4 text-nota text-ok">
            <CircleCheck size={18} aria-hidden="true" />
            <span>
              <strong>{ativa.plano}</strong>
              {ativa.data_expiracao && ` · ${t('válido até {{data}}', { data: formatarData(ativa.data_expiracao, idioma) })}`}
              {` · ${t('assinado pelo {{origem}}', { origem: ORIGEM[ativa.origem] ?? ativa.origem })}`}
            </span>
          </p>
          <p className="mt-2 text-nota text-texto-2">{t('Todos os roteiros abaixo estão liberados, no site e no aplicativo.')}</p>

          {roteiros.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
              {roteiros.map((roteiro) => (
                <CardRoteiro key={roteiro.idroteiro_personalizado} roteiro={roteiro} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-nota text-texto-2">{t('Você ainda não tem o Plano Viajantes. Assine para ver todos os roteiros completos.')}</p>
          <Assinar />
          <p className="mt-6">
            <Link to={href('/roteiros', idioma)} className="text-nota font-semibold text-acento-escuro hover:underline">
              {t('Ver roteiros prontos')}
            </Link>
          </p>
        </>
      )}

      {compras.length > 0 && (
        <section className="mt-12">
          <h2 className="rotulo-secao mb-5">{t('Compras no site')}</h2>
          <ul className="max-w-2xl divide-y divide-borda border-y border-borda">
            {compras.map((compra) => (
              <li key={compra.idcompra} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-nota">
                <Receipt size={16} className="shrink-0 text-acento" aria-hidden="true" />
                <span className="font-semibold text-texto">{compra.plano}</span>
                <span className="text-texto-2">
                  {formatarPreco(compra.valor_total, idioma)} {t(rotuloPeriodo(compra.periodicidade))}
                  {compra.parcelas > 1 && ` · ${compra.parcelas}x`}
                  {` · ${compra.metodo === 'pix' ? 'Pix' : t('Cartão de crédito')}`}
                </span>
                <span className="ml-auto text-mini text-texto-3">
                  {formatarData(compra.data_pagamento ?? compra.data_compra, idioma)}
                  {compra.data_expiracao && ` → ${formatarData(compra.data_expiracao, idioma)}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
