import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, History, Plus, Sparkles, X } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useUsuario } from '@/lib/conta';
import { useAssinaturaSite } from '@/lib/consultas';
import ModalLogin from '@/features/conta/ModalLogin';
import Assinar from '@/features/roteiros/Assinar';
import Compositor from './Compositor';
import Conversa from './Conversa';
import ListaConversas from './ListaConversas';
import { useAbrirLugar } from './lugares';
import { useRegiaoDoGuia } from './contexto';
import { chaves, criarConversa, FalhaGuia, useConversa, useFeedback, useSaldo, useSugestoes } from './consultas';
import { explicarErro, type ErroExibido } from './erros';
import { useTurno } from './useTurno';
import type { ConversaComMensagens } from './tipos';

const CHAVE_CONVERSA = 'vj_guia_conversa';

function lerConversaSalva(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_CONVERSA);
  } catch {
    return null;
  }
}

function salvarConversa(id: string | null) {
  try {
    if (id) sessionStorage.setItem(CHAVE_CONVERSA, id);
    else sessionStorage.removeItem(CHAVE_CONVERSA);
  } catch {
    /* armazenamento bloqueado: a conversa atual dura até recarregar */
  }
}

const noCelular = () => window.matchMedia('(max-width: 767px)').matches;

function BotaoTopo({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
      className="flex size-9 shrink-0 items-center justify-center rounded-pilula text-texto-2 hover:bg-brand-suave hover:text-brand"
    >
      {children}
    </button>
  );
}

/** A casca do painel: cabeçalho com título e ações, e o conteúdo embaixo. */
function Casca({
  fechar,
  voltar,
  acoes,
  children,
}: {
  fechar: () => void;
  voltar?: () => void;
  acoes?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <>
      <header className="flex items-center gap-1 border-b border-borda px-3 py-2">
        {voltar ? (
          <BotaoTopo rotulo={t('Voltar')} onClick={voltar}>
            <ArrowLeft size={18} aria-hidden="true" />
          </BotaoTopo>
        ) : (
          <span className="flex size-9 items-center justify-center text-acento" aria-hidden="true">
            <Sparkles size={18} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold leading-tight text-brand">{t('Guia Viajantes')}</h2>
          <p className="truncate text-mini text-texto-3">{t('Seu assistente de viagem com IA')}</p>
        </div>
        {acoes}
        <BotaoTopo rotulo={t('Fechar')} onClick={fechar}>
          <X size={18} aria-hidden="true" />
        </BotaoTopo>
      </header>
      {children}
    </>
  );
}

function Carregando() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="size-6 animate-spin rounded-pilula border-2 border-borda border-t-brand" />
    </div>
  );
}

function Apresentacao({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-12 items-center justify-center rounded-pilula bg-acento-suave text-acento">
        <Sparkles size={22} aria-hidden="true" />
      </span>
      <p className="mt-3 text-base font-semibold text-brand">{t('Planeje a viagem conversando')}</p>
      <ul className="mt-2 space-y-1 text-nota text-texto-2">
        <li>{t('Atrativos, hospedagem e onde comer, com dados do Viajantes')}</li>
        <li>{t('Roteiros dia a dia, salvos na sua conta')}</li>
        <li>{t('Passaportes e descontos da região')}</li>
      </ul>
      {children}
    </div>
  );
}

/** Quem não entrou vê o que o guia faz e o convite para entrar. */
function TelaEntrar() {
  const t = useT();
  const [pedindo, setPedindo] = useState(false);
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <Apresentacao>
        <button type="button" onClick={() => setPedindo(true)} className="botao-acao mt-5">
          {t('Entrar para conversar')}
        </button>
        <p className="mt-2 text-mini text-texto-3">{t('Exclusivo para assinantes do Plano Viajantes.')}</p>
      </Apresentacao>
      <ModalLogin
        aberto={pedindo}
        aoFechar={() => setPedindo(false)}
        titulo={t('Entre para usar o Guia Viajantes')}
        texto={t('Use a mesma conta do aplicativo.')}
      />
    </div>
  );
}

/** Quem entrou mas não assina vê a oferta do Plano Viajantes, que já inclui o guia. */
function TelaAssinar() {
  const t = useT();
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <Apresentacao>
        <p className="mt-4 text-nota font-semibold text-brand">{t('O Guia Viajantes faz parte do Plano Viajantes.')}</p>
      </Apresentacao>
      <Assinar />
    </div>
  );
}

function Chat({ fechar, aoNavegar }: { fechar: () => void; aoNavegar: () => void }) {
  const t = useT();
  const idioma = useIdioma();
  const cliente = useQueryClient();
  const regiao = useRegiaoDoGuia();
  const [vista, setVista] = useState<'conversa' | 'lista'>('conversa');
  const [conversaId, setConversaIdBruto] = useState<string | null>(lerConversaSalva);
  /** Pergunta esperando a conversa nova ser criada. */
  const [criando, setCriando] = useState<string | null>(null);
  const [falhaLocal, setFalhaLocal] = useState<FalhaGuia | null>(null);

  const setConversaId = (id: string | null) => {
    salvarConversa(id);
    setConversaIdBruto(id);
  };

  const conversa = useConversa(conversaId);
  // Conversa apagada em outro aparelho: a tela volta ao começo e a próxima pergunta abre outra.
  const sumiu = conversa.error instanceof FalhaGuia && conversa.error.status === 404;
  const idAtual = sumiu ? null : conversaId;
  const mensagens = (idAtual && conversa.data?.mensagens) || [];
  const noComeco = !idAtual || (conversa.isSuccess && mensagens.length === 0);
  const sugestoes = useSugestoes(regiao?.id ?? null, noComeco);
  const saldo = useSaldo(true);
  const { turno, falha, enviar, parar, limparFalha } = useTurno();
  const feedback = useFeedback(idAtual ?? '');
  const abrirLugar = useAbrirLugar(aoNavegar);

  const erro: ErroExibido | null = useMemo(() => {
    const origem =
      (falha && { status: falha.status, codigo: falha.erro || undefined, dados: falha.dados }) ??
      (falhaLocal && { status: falhaLocal.status, codigo: falhaLocal.codigo, dados: falhaLocal.dados }) ??
      [conversa.error, saldo.error].find((e): e is FalhaGuia => e instanceof FalhaGuia && e.status !== 404) ??
      null;
    return origem ? explicarErro(origem, t, idioma) : null;
  }, [falha, falhaLocal, conversa.error, saldo.error, t, idioma]);

  // A assinatura pode ter vencido desde que a página abriu: o site confere de novo e, se for o
  // caso, o painel troca para a oferta.
  useEffect(() => {
    if (erro?.semAssinatura) cliente.invalidateQueries({ queryKey: ['assinatura-site'] });
  }, [erro?.semAssinatura, cliente]);

  const devolver = useMemo(() => (falha ? { texto: falha.pergunta } : null), [falha]);

  const perguntar = async (texto: string) => {
    if (turno || criando !== null) return;
    limparFalha();
    setFalhaLocal(null);
    let alvo = idAtual ? conversa.data?.conversa : undefined;
    if (idAtual && !alvo) return; // ainda carregando a conversa atual
    if (!alvo) {
      setCriando(texto);
      try {
        alvo = await criarConversa(regiao?.id ?? null);
      } catch (e) {
        setFalhaLocal(e instanceof FalhaGuia ? e : new FalhaGuia(0, 'rede', String(e)));
        return;
      } finally {
        setCriando(null);
      }
      cliente.setQueryData<ConversaComMensagens>(chaves.conversa(alvo.id), { conversa: alvo, mensagens: [] });
      setConversaId(alvo.id);
    }
    await enviar(alvo, texto);
  };

  const nova = () => {
    parar();
    limparFalha();
    setFalhaLocal(null);
    setConversaId(null);
    setVista('conversa');
  };

  const saldoBaixo =
    saldo.data && (saldo.data.limite_diario - saldo.data.mensagens_hoje <= 3 || saldo.data.estimativa_mensagens_restantes <= 5);

  if (vista === 'lista') {
    return (
      <Casca fechar={fechar} voltar={() => setVista('conversa')}>
        <ListaConversas
          atual={idAtual}
          aoNova={nova}
          aoEscolher={(id) => {
            if (id !== conversaId) {
              parar();
              limparFalha();
              setFalhaLocal(null);
              setConversaId(id);
            }
            setVista('conversa');
          }}
        />
      </Casca>
    );
  }

  return (
    <Casca
      fechar={fechar}
      acoes={
        <>
          <BotaoTopo rotulo={t('Nova conversa')} onClick={nova}>
            <Plus size={18} aria-hidden="true" />
          </BotaoTopo>
          <BotaoTopo rotulo={t('Conversas anteriores')} onClick={() => setVista('lista')}>
            <History size={18} aria-hidden="true" />
          </BotaoTopo>
        </>
      }
    >
      <Conversa
        mensagens={mensagens}
        carregando={Boolean(idAtual) && conversa.isPending}
        turno={turno ?? (criando !== null ? { conversaId: '', pergunta: criando, mensagemId: null, texto: '', rotulo: null } : null)}
        erro={erro}
        regiao={idAtual ? null : regiao}
        sugestoes={noComeco ? (sugestoes.data ?? []) : []}
        aoSugerir={perguntar}
        abrirLugar={abrirLugar}
        aoAvaliar={(mensagemId, nota) => feedback.mutate({ mensagemId, nota })}
      />
      {saldoBaixo && saldo.data && (
        <p className="border-t border-borda bg-acento-suave px-4 py-1.5 text-mini text-acento-escuro">
          {t('Restam cerca de {{n}} mensagens no seu saldo.', {
            n: Math.max(0, Math.min(saldo.data.limite_diario - saldo.data.mensagens_hoje, saldo.data.estimativa_mensagens_restantes)),
          })}
        </p>
      )}
      <Compositor
        respondendo={Boolean(turno) || criando !== null}
        aoEnviar={perguntar}
        aoParar={parar}
        textoInicial={devolver}
        focar={!noCelular()}
      />
    </Casca>
  );
}

/** Decide o que o painel mostra: convite para entrar, oferta do plano ou a conversa. */
function Conteudo({ fechar, aoNavegar }: { fechar: () => void; aoNavegar: () => void }) {
  const usuario = useUsuario();
  const assinatura = useAssinaturaSite();

  if (usuario.isPending) {
    return (
      <Casca fechar={fechar}>
        <Carregando />
      </Casca>
    );
  }
  if (!usuario.data) {
    return (
      <Casca fechar={fechar}>
        <TelaEntrar />
      </Casca>
    );
  }
  if (assinatura.isPending) {
    return (
      <Casca fechar={fechar}>
        <Carregando />
      </Casca>
    );
  }
  // Se o site não conseguiu conferir a assinatura, quem decide é o próprio guia (402 vira aviso).
  if (assinatura.data && !assinatura.data.assinado) {
    return (
      <Casca fechar={fechar}>
        <TelaAssinar />
      </Casca>
    );
  }
  return <Chat fechar={fechar} aoNavegar={aoNavegar} />;
}

/** Painel do guia: cartão flutuante no canto do computador (a página continua usável atrás) e
 * tela cheia no celular. */
export default function PainelGuia({ fechar }: { fechar: () => void }) {
  const t = useT();
  const painel = useRef<HTMLElement>(null);

  useEffect(() => {
    painel.current?.focus();
  }, []);

  return (
    <section
      ref={painel}
      tabIndex={-1}
      role="dialog"
      aria-label={t('Guia Viajantes')}
      className="painel-guia fixed inset-0 z-50 flex flex-col overflow-hidden bg-cartao pt-[env(safe-area-inset-top)] outline-none md:inset-auto md:bottom-6 md:right-6 md:h-[min(42rem,calc(100dvh-3rem))] md:w-[26rem] md:rounded-heroi md:border md:border-borda md:pt-0"
      onKeyDown={(e) => {
        // Esc dentro de um modal (login, roteiro) fecha só o modal.
        if (e.key === 'Escape' && !document.querySelector('dialog[open]')) fechar();
      }}
    >
      <Conteudo fechar={fechar} aoNavegar={() => noCelular() && fechar()} />
    </section>
  );
}
