import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, CreditCard, Lock } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import type { RecorrenciaSite } from '@/lib/tipos';
import { formatarData, formatarPreco } from '@/lib/moeda';
import { tokenizarCartao } from '@/lib/pagarme';
import { cancelarAssinatura, rotuloPeriodo, trocarCartaoAssinatura } from './dados';
import {
  cepValido,
  cvvValido,
  lerValidade,
  mascaraCartao,
  mascaraCep,
  mascaraValidade,
  numeroCartaoValido,
  somenteDigitos,
} from './cartao';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

/** Controle da assinatura recorrente: quando renova, trocar o cartão e cancelar.
 * Só aparece para quem assinou no site — na loja quem manda é a App Store/Play. */
export default function GerenciarAssinatura({ recorrencia }: { recorrencia: RecorrenciaSite }) {
  const t = useT();
  const idioma = useIdioma();
  const cliente = useQueryClient();

  const [tela, setTela] = useState<'resumo' | 'cartao' | 'cancelar'>('resumo');
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const recarregar = () => cliente.invalidateQueries({ queryKey: ['assinatura-site'] });
  const campo = 'campo text-nota';
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';

  async function confirmarCancelamento() {
    setErro(null);
    setEnviando(true);
    try {
      const r = await cancelarAssinatura();
      if (!r.ok) {
        setErro(r.erro || t('Não foi possível concluir. Tente novamente.'));
        return;
      }
      setAviso(
        r.data.acesso_ate
          ? t('Renovação cancelada. Você continua com acesso até {{data}}.', { data: formatarData(r.data.acesso_ate, idioma) })
          : t('Renovação cancelada.'),
      );
      setTela('resumo');
      recarregar();
    } finally {
      setEnviando(false);
    }
  }

  async function enviarCartao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    if (!numeroCartaoValido(cartao.numero)) return setErro(t('Número do cartão inválido.'));
    if (!cartao.nome.trim()) return setErro(t('Informe o nome como está no cartão.'));
    const validade = lerValidade(cartao.validade);
    if (!validade) return setErro(t('Validade inválida ou vencida.'));
    if (!cvvValido(cartao.cvv)) return setErro(t('Código de segurança inválido.'));
    if (!cepValido(endereco.cep)) return setErro(t('CEP inválido.'));
    if (!endereco.rua.trim() || !endereco.numero.trim() || !endereco.cidade.trim() || !endereco.uf) {
      return setErro(t('Complete o endereço de cobrança do cartão.'));
    }

    setEnviando(true);
    try {
      const token = await tokenizarCartao({
        numero: cartao.numero,
        nome: cartao.nome,
        mes: validade.mes,
        ano: validade.ano,
        cvv: cartao.cvv,
      });
      if (!token.ok) {
        setErro(t('O cartão não foi aceito. Confira o número, a validade e o código de segurança.'));
        return;
      }
      const r = await trocarCartaoAssinatura(token.token, {
        line_1: [endereco.numero.trim(), endereco.rua.trim(), endereco.bairro.trim()].filter(Boolean).join(', '),
        zip_code: somenteDigitos(endereco.cep),
        city: endereco.cidade.trim(),
        state: endereco.uf,
      });
      if (!r.ok) {
        setErro(r.erro || t('Não foi possível concluir. Tente novamente.'));
        return;
      }
      setAviso(t('Cartão trocado. A próxima cobrança já vai no novo.'));
      setCartao({ numero: '', nome: '', validade: '', cvv: '' });
      setTela('resumo');
      recarregar();
    } catch {
      setErro(t('Não foi possível concluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="assinatura-titulo" className="recuo mt-6 p-6 sm:p-8">
      <h2 id="assinatura-titulo" className="rotulo-secao mb-4 w-full">{t('Sua assinatura')}</h2>

      {recorrencia.inadimplente && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-cartao bg-erro/10 p-3 text-mini text-erro">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {t('A última cobrança não passou. Tentamos de novo automaticamente; troque o cartão para não perder o acesso.')}
            {recorrencia.ultimo_erro && ` (${recorrencia.ultimo_erro})`}
          </span>
        </p>
      )}

      {aviso && (
        <p role="status" className="mb-4 rounded-cartao bg-ok/10 p-3 text-mini text-ok">{aviso}</p>
      )}

      <dl className="grid gap-3 text-nota sm:grid-cols-2">
        <div>
          <dt className="text-mini text-texto-3">{t('Plano')}</dt>
          <dd className="font-semibold text-brand">
            {recorrencia.plano} · {formatarPreco(recorrencia.valor, idioma)} {t(rotuloPeriodo(recorrencia.periodicidade))}
          </dd>
        </div>
        <div>
          <dt className="text-mini text-texto-3">{t('Renovação')}</dt>
          <dd className="flex items-center gap-1.5 text-texto-2">
            <CalendarClock size={14} className="shrink-0 text-acento" aria-hidden="true" />
            {recorrencia.auto_renovar && recorrencia.proxima_cobranca
              ? t('Automática em {{data}}', { data: formatarData(recorrencia.proxima_cobranca, idioma) })
              : t('Cancelada — não renova mais')}
          </dd>
        </div>
      </dl>

      {tela === 'resumo' && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => { setErro(null); setAviso(null); setTela('cartao'); }} className="botao">
            <CreditCard size={15} aria-hidden="true" />
            {t('Trocar o cartão')}
          </button>
          {recorrencia.pode_cancelar && (
            <button type="button" onClick={() => { setErro(null); setAviso(null); setTela('cancelar'); }} className="text-nota font-semibold text-texto-2 hover:text-erro hover:underline">
              {t('Cancelar a renovação')}
            </button>
          )}
        </div>
      )}

      {tela === 'cancelar' && (
        <div className="mt-5 rounded-cartao border border-borda p-4">
          <p className="text-nota text-texto-2">
            {t('A cobrança para e você continua com acesso até o fim do período já pago. Depois disso os roteiros completos deixam de abrir.')}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={confirmarCancelamento} disabled={enviando} className="botao-acao disabled:opacity-60">
              {enviando ? t('Processando...') : t('Confirmar cancelamento')}
            </button>
            <button type="button" onClick={() => setTela('resumo')} className="text-nota font-semibold text-texto-2 hover:text-brand hover:underline">
              {t('Voltar')}
            </button>
          </div>
        </div>
      )}

      {tela === 'cartao' && (
        <form onSubmit={enviarCartao} className="mt-5 space-y-4 rounded-cartao border border-borda p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="tc-numero" className={rotulo}>{t('Número do cartão')}</label>
              <input id="tc-numero" required inputMode="numeric" autoComplete="cc-number" value={cartao.numero} onChange={(e) => setCartao({ ...cartao, numero: mascaraCartao(e.target.value) })} placeholder="0000 0000 0000 0000" className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tc-nome" className={rotulo}>{t('Nome impresso no cartão')}</label>
              <input id="tc-nome" required autoComplete="cc-name" value={cartao.nome} onChange={(e) => setCartao({ ...cartao, nome: e.target.value.toUpperCase() })} className={campo} />
            </div>
            <div>
              <label htmlFor="tc-validade" className={rotulo}>{t('Validade')}</label>
              <input id="tc-validade" required inputMode="numeric" autoComplete="cc-exp" value={cartao.validade} onChange={(e) => setCartao({ ...cartao, validade: mascaraValidade(e.target.value) })} placeholder="MM/AA" className={campo} />
            </div>
            <div>
              <label htmlFor="tc-cvv" className={rotulo}>CVV</label>
              <input id="tc-cvv" required inputMode="numeric" autoComplete="cc-csc" value={cartao.cvv} onChange={(e) => setCartao({ ...cartao, cvv: somenteDigitos(e.target.value).slice(0, 4) })} placeholder="123" className={campo} />
            </div>
          </div>

          <p className="text-mini font-semibold uppercase tracking-[0.13em] text-texto-3">{t('Endereço de cobrança do cartão')}</p>
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="tc-cep" className={rotulo}>CEP</label>
              <input id="tc-cep" required inputMode="numeric" autoComplete="postal-code" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: mascaraCep(e.target.value) })} placeholder="00000-000" className={campo} />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="tc-rua" className={rotulo}>{t('Rua')}</label>
              <input id="tc-rua" required autoComplete="address-line1" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tc-num" className={rotulo}>{t('Número')}</label>
              <input id="tc-num" required value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tc-bairro" className={rotulo}>{t('Bairro')}</label>
              <input id="tc-bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} className={campo} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tc-uf" className={rotulo}>{t('Estado')}</label>
              <select id="tc-uf" required value={endereco.uf} onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })} className="seletor">
                <option value="">UF</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="tc-cidade" className={rotulo}>{t('Cidade')}</label>
              <input id="tc-cidade" required autoComplete="address-level2" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} className={campo} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={enviando} className="botao-acao disabled:opacity-60">
              <Lock size={14} aria-hidden="true" />
              {enviando ? t('Processando...') : t('Salvar o cartão')}
            </button>
            <button type="button" onClick={() => setTela('resumo')} className="text-nota font-semibold text-texto-2 hover:text-brand hover:underline">
              {t('Voltar')}
            </button>
          </div>
          <p className="text-mini text-texto-3">{t('Pagamento processado pela Pagar.me. Os dados do cartão não passam pelo Viajantes.')}</p>
        </form>
      )}

      {erro && (
        <p role="alert" className="mt-4 rounded-cartao bg-erro/10 p-3 text-mini text-erro">{erro}</p>
      )}
    </section>
  );
}
