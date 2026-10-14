import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BotMessageSquare,
  CalendarCheck,
  CircleCheck,
  Lock,
  MapPinned,
  RefreshCw,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useAssinaturaSite, useRoteiros } from '@/lib/consultas';
import { useUsuario } from '@/lib/conta';
import { lerSessao } from '@/lib/sessao';
import { formatarPreco } from '@/lib/moeda';
import { publico } from '@/lib/publico';
import type { Idioma } from '@/i18n/categorias';
import type { PlanoSite } from '@/lib/tipos';
import ModalLogin from '@/features/conta/ModalLogin';
import Checkout from './Checkout';
import { economiaAnual, numeroVitrine, rotuloPeriodo } from './dados';

const FOTO_800 = publico('images/plano-viajantes-800.webp');
const FOTO_1400 = publico('images/plano-viajantes-1400.webp');

/** Os mesmos itens da tela de assinatura do app, menos o progresso, que só existe lá. */
const BENEFICIOS = [
  { Icone: Route, titulo: 'Roteiros Exclusivos', texto: 'Itinerários completos, vividos e testados pela equipe do Viajantes App' },
  { Icone: BotMessageSquare, titulo: 'Chat com Inteligência Artificial', texto: 'Tire dúvidas e monte roteiros sob medida com o Guia Viajantes', novo: true },
  { Icone: CalendarCheck, titulo: 'Planejamento Dia a Dia', texto: 'Programação detalhada com horários e atividades' },
  { Icone: MapPinned, titulo: 'Links Integrados', texto: 'Acesso direto a estabelecimentos e mapas' },
  { Icone: RefreshCw, titulo: 'Sempre Atualizado', texto: 'Novos roteiros adicionados regularmente' },
  { Icone: Users, titulo: 'Comunidade Exclusiva', texto: 'Acesso à comunidade exclusiva Viajantes no WhatsApp com dicas e experiências' },
];

/** A oferta do Plano Viajantes: escolher o plano, entrar e pagar. Some quando a conta já assina.
 * `compacto` é a faixa fechada da lista de roteiros, que abre a oferta inteira ao toque. */
export default function Assinar({ contexto, compacto = false }: { contexto?: string; compacto?: boolean }) {
  const t = useT();
  const idioma = useIdioma();
  const cliente = useQueryClient();
  const { data, isPending, isError, refetch } = useAssinaturaSite();
  const { data: usuario } = useUsuario();
  const { data: roteiros } = useRoteiros();
  const numero = numeroVitrine(roteiros?.length ?? 0);

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
      <div className="mt-6 flex flex-col gap-4 rounded-heroi border border-borda p-3 sm:flex-row sm:items-center sm:p-4 sm:pr-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <img
            src={FOTO_800}
            alt=""
            width={800}
            height={1067}
            loading="lazy"
            decoding="async"
            className="size-16 shrink-0 rounded-cartao object-cover sm:size-20"
          />
          <div className="min-w-0">
            <p className="text-nota font-bold uppercase leading-snug tracking-wide text-brand">
              {numero > 0 && `+${numero} `}
              {t('Roteiros Prontos')} <span className="text-acento-escuro">{t('+ Inteligência Artificial!')}</span>
            </p>
            <p className="mt-0.5 text-nota text-texto-2">
              {t('Veja o dia a dia completo de todos os roteiros, a partir de {{valor}} {{periodo}}.', {
                valor: formatarPreco(menor.valor, idioma),
                periodo: t(rotuloPeriodo(menor.periodicidade)),
              })}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setAberto(true)} className="botao-acao shrink-0">
          {t('Assinar')}
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="@container mt-6" aria-labelledby="assinar-titulo">
        <div className="overflow-hidden rounded-heroi border border-borda bg-cartao @3xl:grid @3xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <FotoPlano numero={numero} />

          <div className="p-5 @md:p-7 @3xl:p-9">
            {contexto && (
              <p className="mb-2 text-corpo font-semibold leading-snug text-balance text-brand">
                {t('Veja {{roteiro}} e todos os outros roteiros completos.', { roteiro: contexto })}
              </p>
            )}
            <p className="text-nota text-texto-2 @xl:text-base">
              {t('Roteiros feitos por quem realmente viveu cada destino e um chat com IA para tirar dúvidas e planejar a viagem.')}
            </p>

            <div role="radiogroup" aria-label={t('Escolha o plano')} className="mt-6 grid gap-3 pt-1 @xs:grid-cols-2">
              {planos.map((p) => (
                <CartaoPlano
                  key={p.idassinatura}
                  plano={p}
                  ativo={p.idassinatura === plano.idassinatura}
                  economia={p.periodicidade === 'anual' ? economia : 0}
                  idioma={idioma}
                  aoEscolher={() => setEscolhido(p.idassinatura)}
                />
              ))}
            </div>

            {/* Decidida a compra, o formulário vem logo abaixo dos planos, sem a vitrine no meio. */}
            {!comprando && (
              <>
                <div className="mt-5">
                  <button type="button" onClick={iniciar} className="botao-acao min-h-12 w-full text-base @xl:w-auto @xl:px-8">
                    <Lock size={16} aria-hidden="true" />
                    {t('Assinar por {{valor}}', { valor: formatarPreco(plano.valor, idioma) })}
                  </button>
                  <ul className="mt-3 space-y-1 text-mini text-texto-3">
                    <li className="flex items-start gap-1.5">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
                      {t('Renova sozinho no cartão de crédito. Cancele quando quiser, pelo site.')}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Smartphone size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                      {t('Vale no site e no aplicativo, com a mesma conta.')}
                    </li>
                  </ul>
                </div>

                <h3 className="rotulo-secao mb-5 mt-9">{t('O que está incluído')}</h3>
                <ul className="grid gap-x-6 gap-y-4 @xl:grid-cols-2">
                  {BENEFICIOS.map(({ Icone, titulo, texto, novo }) => (
                    <li key={titulo} className="flex gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-pilula bg-brand-suave text-brand"
                        aria-hidden="true"
                      >
                        <Icone size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-1.5 text-nota font-semibold leading-snug text-brand">
                          {t(titulo)}
                          {novo && (
                            <span className="rounded-pilula bg-acento-suave px-1.5 text-[0.6875rem] font-bold text-acento-escuro">
                              {t('Novo')}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-mini leading-snug text-texto-3">{t(texto)}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <figure className="mt-6 rounded-cartao bg-papel-2 px-4 py-3.5">
                  <div className="flex gap-0.5 text-acento" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-1.5 text-nota italic leading-snug text-texto-2">
                    {t('"Os roteiros personalizados ajudaram muito na viagem. Os melhores atrativos organizados por logística, e sem gastar tempo planejando."')}
                  </blockquote>
                  <figcaption className="mt-1.5 text-mini font-semibold text-texto-3">Rosemeire Matos</figcaption>
                </figure>
              </>
            )}
          </div>
        </div>
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

/** Estreita, vira faixa acima do texto; larga, coluna inteira ao lado. O título fica no alto, sobre o céu,
 * e o balão do Guia embaixo, sobre a grama, deixando a cachoeira e o casal à mostra. */
function FotoPlano({ numero }: { numero: number }) {
  const t = useT();
  return (
    <div className="relative isolate aspect-[16/10] min-h-56 overflow-hidden bg-brand @3xl:aspect-auto">
      <img
        src={FOTO_800}
        srcSet={`${FOTO_800} 800w, ${FOTO_1400} 1400w`}
        sizes="(min-width: 1024px) 30rem, 100vw"
        alt=""
        width={800}
        height={1067}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-top @3xl:object-center"
      />
      {/* Na faixa, o título cai no céu e o degradê pode ser leve; na coluna, ele passa pela cachoeira. */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-escuro/85 via-brand-escuro/55 via-50% to-brand-escuro/0 @3xl:from-brand-escuro/90 @3xl:via-brand-escuro/70 @3xl:via-45% @3xl:to-70%" />
      <div className="absolute inset-0 hidden bg-gradient-to-t from-brand/55 via-transparent via-30% to-transparent @3xl:block" />

      <h2
        id="assinar-titulo"
        className="relative p-5 text-[1.625rem] font-bold uppercase leading-[1.08] tracking-tight text-white [text-shadow:0_2px_14px_rgb(7_30_29/0.55)] @md:p-7 @md:text-[2rem] @3xl:p-9 @3xl:text-[2.25rem]"
      >
        {numero > 0 && <span className="mb-2 block text-[3rem] leading-none @3xl:text-[4rem]">+{numero}</span>}
        <span className="block">{t('Roteiros Prontos')}</span>
        <span className="block text-acento-claro">{t('+ Inteligência Artificial!')}</span>
      </h2>

      <div className="absolute inset-x-5 bottom-5 hidden @3xl:block" aria-hidden="true">
        <div className="max-w-[17rem] rounded-cartao bg-cartao/95 p-3 shadow-flutua backdrop-blur-sm">
          <p className="flex items-center gap-1.5 text-mini font-bold text-brand">
            <Sparkles size={14} className="text-acento" />
            {t('Guia Viajantes')}
          </p>
          <p className="ml-auto mt-2 w-fit rounded-cartao rounded-br-sm bg-brand px-3 py-2 text-nota leading-snug text-white">
            {t('Monte um roteiro de 3 dias com cachoeiras e bons restaurantes.')}
          </p>
        </div>
      </div>
    </div>
  );
}

function CartaoPlano({
  plano,
  ativo,
  economia,
  idioma,
  aoEscolher,
}: {
  plano: PlanoSite;
  ativo: boolean;
  economia: number;
  idioma: Idioma;
  aoEscolher: () => void;
}) {
  const t = useT();
  const parcelado = plano.parcelas_max > 1;
  const detalhe = parcelado
    ? t('ou {{n}}x de {{valor}}', { n: plano.parcelas_max, valor: formatarPreco(plano.valor / plano.parcelas_max, idioma) })
    : plano.periodicidade === 'anual'
      ? t('equivale a {{valor}} por mês', { valor: formatarPreco(plano.valor / 12, idioma) })
      : null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={ativo}
      onClick={aoEscolher}
      className={`relative flex flex-col rounded-cartao border px-4 pb-4 pt-5 text-left transition ${
        ativo ? 'border-brand bg-brand-suave/60 ring-1 ring-brand' : 'border-fio-forte bg-cartao hover:border-brand'
      }`}
    >
      {economia > 0 && (
        <span className="absolute -top-2.5 left-4 rounded-pilula bg-acento px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white">
          {t('Economize {{n}}%', { n: economia })}
        </span>
      )}
      <span className="flex items-start justify-between gap-2">
        <span className="text-nota font-semibold text-texto-2">{plano.nome}</span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-pilula border-2 ${
            ativo ? 'border-brand bg-brand' : 'border-fio-forte bg-cartao'
          }`}
          aria-hidden="true"
        >
          {ativo && <span className="size-2 rounded-pilula bg-white" />}
        </span>
      </span>
      <span className="mt-2 text-[1.375rem] font-bold leading-none tracking-tight text-brand @sm:text-[1.625rem]">
        {formatarPreco(plano.valor, idioma)}
      </span>
      <span className="mt-1 text-nota text-texto-3">{t(rotuloPeriodo(plano.periodicidade))}</span>
      {detalhe && <span className="mt-2 text-mini font-semibold text-acento-escuro">{detalhe}</span>}
    </button>
  );
}
