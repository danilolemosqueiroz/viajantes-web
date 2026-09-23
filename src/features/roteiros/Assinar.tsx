import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, CircleCheck, Lock } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useAssinaturaSite } from '@/lib/consultas';
import { useUsuario } from '@/lib/conta';
import { lerSessao } from '@/lib/sessao';
import { formatarPreco } from '@/lib/moeda';
import type { PlanoSite } from '@/lib/tipos';
import ModalLogin from '@/features/conta/ModalLogin';
import Checkout from './Checkout';
import { economiaAnual, rotuloPeriodo } from './dados';

/**
 * A oferta do Plano Viajantes: escolher o plano, entrar (mesma conta do app) e
 * pagar. Some sozinho quando a conta já assina. `compacto` é a faixa fechada
 * da lista de roteiros, que abre a oferta inteira ao toque.
 */
export default function Assinar({ contexto, compacto = false }: { contexto?: string; compacto?: boolean }) {
  const t = useT();
  const idioma = useIdioma();
  const cliente = useQueryClient();
  const { data, isPending, isError, refetch } = useAssinaturaSite();
  const { data: usuario } = useUsuario();

  const [aberto, setAberto] = useState(!compacto);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [comprando, setComprando] = useState(false);
  const [pedindoLogin, setPedindoLogin] = useState(false);
  const [pago, setPago] = useState(false);

  if (pago) {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-cartao bg-ok/10 p-4 text-nota text-ok" role="status">
        <CircleCheck size={18} aria-hidden="true" />
        {t('Pagamento confirmado! O Plano Viajantes está ativo e todos os roteiros estão liberados.')}
      </p>
    );
  }
  if (isPending) return null;
  if (isError || !data) {
    return (
      <div className="recuo mt-6 flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-nota text-texto-2">{t('Não conseguimos carregar os planos agora. Tente novamente em instantes.')}</p>
        <button type="button" className="botao-fio" onClick={() => refetch()}>
          {t('Tentar de novo')}
        </button>
      </div>
    );
  }
  if (data.assinado) return null;

  const planos = data.planos;
  if (planos.length === 0) {
    return <p className="recuo mt-6 p-6 text-center text-nota text-texto-2">{t('Nenhum plano à venda no momento.')}</p>;
  }
  const anual = planos.find((p) => p.periodicidade === 'anual');
  const plano: PlanoSite = planos.find((p) => p.idassinatura === escolhido) ?? anual ?? planos[0];
  const economia = economiaAnual(planos);
  const menor = planos.reduce((a, b) => (a.valor < b.valor ? a : b));

  const iniciar = () => {
    if (usuario) setComprando(true);
    else setPedindoLogin(true);
  };

  const aoPagar = () => {
    setPago(true);
    setComprando(false);
    cliente.invalidateQueries({ queryKey: ['assinatura-site'] });
    cliente.invalidateQueries({ queryKey: ['roteiro-itens'] });
    cliente.invalidateQueries({ queryKey: ['compras-plano'] });
  };

  if (!aberto) {
    return (
      <div className="recuo mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-mini font-bold uppercase tracking-[0.13em] text-acento-escuro">{t('Plano Viajantes')}</p>
          <p className="mt-1 text-nota text-texto-2">
            {t('Veja o dia a dia completo de todos os roteiros, a partir de {{valor}} {{periodo}}.', {
              valor: formatarPreco(menor.valor, idioma),
              periodo: t(rotuloPeriodo(menor.periodicidade)),
            })}
          </p>
        </div>
        <button type="button" onClick={() => setAberto(true)} className="botao-acao shrink-0">
          {t('Assinar')}
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="recuo mt-6 p-6 sm:p-8" aria-labelledby="assinar-titulo">
        <p className="text-mini font-bold uppercase tracking-[0.13em] text-acento-escuro">{t('Plano Viajantes')}</p>
        <h2 id="assinar-titulo" className="mt-1 text-secao font-bold leading-tight text-brand">
          {contexto ? t('Veja {{roteiro}} e todos os outros roteiros completos.', { roteiro: contexto }) : t('Todos os roteiros completos, dia a dia.')}
        </h2>

        <ul className="mt-4 space-y-1.5 text-nota text-texto-2">
          {[
            t('Todas as paradas de cada dia, com horário, foto e descrição.'),
            t('Cada parada com link para a página do atrativo, com rota e contato.'),
            t('Vale no site e no aplicativo, com a mesma conta.'),
            t('Pagamento por cartão ou Pix. Sem renovação automática.'),
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-acento" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div role="radiogroup" aria-label={t('Escolha o plano')} className="mt-6 grid gap-3 sm:grid-cols-2">
          {planos.map((p) => {
            const ativo = p.idassinatura === plano.idassinatura;
            return (
              <button
                key={p.idassinatura}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setEscolhido(p.idassinatura)}
                className={`flex items-start gap-3 rounded-cartao border p-4 text-left transition ${
                  ativo ? 'border-brand bg-cartao' : 'border-borda bg-cartao/60 hover:border-fio-forte'
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pilula border ${
                    ativo ? 'border-brand bg-brand text-white' : 'border-fio-forte'
                  }`}
                  aria-hidden="true"
                >
                  {ativo && <Check size={12} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-brand">{p.nome}</span>
                    {p.periodicidade === 'anual' && economia > 0 && (
                      <span className="rounded-md bg-acento px-1.5 py-0.5 text-mini font-bold text-white">
                        {t('Economize {{n}}%', { n: economia })}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-corpo font-bold text-brand">
                    {formatarPreco(p.valor, idioma)}{' '}
                    <span className="text-nota font-normal text-texto-3">{t(rotuloPeriodo(p.periodicidade))}</span>
                  </span>
                  {p.parcelas_max > 1 && (
                    <span className="block text-mini text-texto-3">
                      {t('ou {{n}}x de {{valor}}', { n: p.parcelas_max, valor: formatarPreco(p.valor / p.parcelas_max, idioma) })}
                    </span>
                  )}
                  {p.descricao && <span className="mt-1 block text-mini text-texto-2">{p.descricao}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {!comprando && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={iniciar} className="botao-acao">
              <Lock size={14} aria-hidden="true" />
              {t('Assinar por {{valor}}', { valor: formatarPreco(plano.valor, idioma) })}
            </button>
            <span className="text-mini text-texto-3">{t('É a mesma conta do aplicativo.')}</span>
          </div>
        )}
      </section>

      {comprando && usuario && <Checkout plano={plano} usuario={usuario} aoPagar={aoPagar} />}

      <ModalLogin
        aberto={pedindoLogin}
        aoFechar={() => {
          setPedindoLogin(false);
          if (lerSessao()) setComprando(true);
        }}
        nome={contexto ?? t('Plano Viajantes')}
        capa={null}
        titulo={t('Entre para assinar')}
        texto={t('A assinatura fica na sua conta, a mesma do aplicativo.')}
      />
    </>
  );
}
