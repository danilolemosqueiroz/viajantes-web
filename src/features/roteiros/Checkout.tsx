import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanoSite, UsuarioSessao } from '@/lib/tipos';
import { formatarPreco } from '@/lib/moeda';
import { pagamentoConfigurado, tokenizarCartao } from '@/lib/pagarme';
import { comprarPlano, rotuloPeriodo, statusCompra, type PedidoCompra } from './dados';
import {
  cepValido,
  cpfValido,
  cvvValido,
  lerValidade,
  mascaraCartao,
  mascaraCep,
  mascaraCpf,
  mascaraTelefone,
  mascaraValidade,
  numeroCartaoValido,
  parcelasOpcoes,
  somenteDigitos,
  telefoneValido,
} from './cartao';

/** Pagamento do Plano Viajantes, só no cartão de crédito. O cartão é tokenizado no
 * navegador com a chave pública do pagar.me; a API só recebe o token (docs/roteiros.md). */

interface Props {
  plano: PlanoSite;
  usuario: UsuarioSessao;
  /** Chamado quando o pagamento é confirmado: quem chama recarrega o acesso. */
  aoPagar: () => void;
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function Checkout({ plano, usuario, aoPagar }: Props) {
  const t = useT();
  const idioma = useIdioma();
  const cliente = useQueryClient();

  const [dados, setDados] = useState({
    nome: [usuario.nome, usuario.sobrenome].filter(Boolean).join(' '),
    cpf: mascaraCpf(usuario.cpf ?? ''),
    email: usuario.email ?? '',
    telefone: mascaraTelefone(usuario.telefone ?? ''),
  });
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 });
  const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', bairro: '', complemento: '', cidade: '', uf: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pendente, setPendente] = useState<{ idcompra: number } | null>(null);

  const preco = plano.valor;
  const opcoes = parcelasOpcoes(preco, plano.parcelas_max);

  // Cartão "em análise": pergunta à API a cada 5 s até a operadora decidir.
  useEffect(() => {
    if (!pendente) return;
    const relogio = setInterval(async () => {
      const situacao = await statusCompra(pendente.idcompra);
      if (!situacao) return;
      if (situacao.status === 'pago') {
        clearInterval(relogio);
        cliente.invalidateQueries({ queryKey: ['compras-plano'] });
        aoPagar();
        return;
      }
      if (situacao.status === 'cancelado' || situacao.status === 'expirado') {
        clearInterval(relogio);
        setPendente(null);
        setErro(t('O pagamento não foi concluído. Tente de novo.'));
        return;
      }
    }, 5000);
    return () => clearInterval(relogio);
  }, [pendente, aoPagar, cliente, t]);

  function validar(): string | null {
    if (!dados.nome.trim()) return t('Informe o seu nome.');
    if (!cpfValido(dados.cpf)) return t('CPF inválido. Verifique os números digitados.');
    if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) return t('Informe um e-mail válido.');
    if (!telefoneValido(dados.telefone)) return t('Informe o celular com DDD.');
    if (!numeroCartaoValido(cartao.numero)) return t('Número do cartão inválido.');
    if (!cartao.nome.trim()) return t('Informe o nome como está no cartão.');
    if (!lerValidade(cartao.validade)) return t('Validade inválida ou vencida.');
    if (!cvvValido(cartao.cvv)) return t('Código de segurança inválido.');
    if (!cepValido(endereco.cep)) return t('CEP inválido.');
    if (!endereco.rua.trim() || !endereco.numero.trim() || !endereco.cidade.trim() || !endereco.uf) {
      return t('Complete o endereço de cobrança do cartão.');
    }
    return null;
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }

    setEnviando(true);
    try {
      const pedido: PedidoCompra = {
        plano_id: plano.idassinatura,
        metodo: 'credit_card',
        nome: dados.nome.trim(),
        cpf: somenteDigitos(dados.cpf),
        email: dados.email.trim(),
        telefone: somenteDigitos(dados.telefone),
      };

      const validade = lerValidade(cartao.validade)!;
      const token = await tokenizarCartao({
        numero: cartao.numero,
        nome: cartao.nome,
        mes: validade.mes,
        ano: validade.ano,
        cvv: cartao.cvv,
      });
      if (!token.ok) {
        setErro(
          token.erro === 'falha_conexao'
            ? t('Não foi possível concluir. Tente novamente.')
            : t('O cartão não foi aceito. Confira o número, a validade e o código de segurança.'),
        );
        return;
      }
      pedido.card_token = token.token;
      pedido.parcelas = cartao.parcelas;
      pedido.billing_address = {
        line_1: [endereco.numero.trim(), endereco.rua.trim(), endereco.bairro.trim()].filter(Boolean).join(', '),
        ...(endereco.complemento.trim() && { line_2: endereco.complemento.trim() }),
        zip_code: somenteDigitos(endereco.cep),
        city: endereco.cidade.trim(),
        state: endereco.uf,
      };

      const resposta = await comprarPlano(pedido);
      if (!resposta.ok) {
        if (resposta.codigo === 'cartao_recusado') {
          const motivo = resposta.dados?.acquirer_message;
          setErro(motivo ? t('Cartão recusado: {{motivo}}', { motivo: String(motivo) }) : t('Cartão recusado. Confira os dados ou tente outro cartão.'));
          return;
        }
        setErro(resposta.erro || t('Não foi possível concluir. Tente novamente.'));
        return;
      }

      if (resposta.data.status === 'pago') {
        cliente.invalidateQueries({ queryKey: ['compras-plano'] });
        aoPagar();
        return;
      }
      setPendente({ idcompra: resposta.data.idcompra });
    } catch {
      setErro(t('Não foi possível concluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }


  const campo = 'campo text-nota';
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';
  const total = formatarPreco(preco, idioma);

  if (!pagamentoConfigurado()) {
    return (
      <p role="alert" className="recuo mt-6 p-6 text-center text-nota text-texto-2">
        {t('O pagamento está indisponível no momento. Tente de novo em instantes.')}
      </p>
    );
  }

  // Cartão em análise pela operadora
  if (pendente) {
    return (
      <section aria-live="polite" className="recuo mt-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="size-8 animate-spin rounded-pilula border-2 border-borda border-t-brand" />
          <p className="font-semibold text-brand">{t('Pagamento em análise')}</p>
          <p className="max-w-md text-nota text-texto-2">
            {t('A operadora está confirmando o seu cartão. Isso costuma levar menos de um minuto; você também receberá um e-mail quando o plano for ativado.')}
          </p>
        </div>
        {erro && (
          <p role="alert" className="mt-4 rounded-cartao bg-erro/10 p-3 text-mini text-erro">
            {erro}
          </p>
        )}
      </section>
    );
  }

  // Formulário
  return (
    <form onSubmit={enviar} className="recuo mt-6 space-y-8 p-6 sm:p-8" aria-labelledby="checkout-titulo">
      <div>
        <h3 id="checkout-titulo" className="text-secao font-bold leading-tight text-brand">{t('Finalizar assinatura')}</h3>
        <p className="mt-1 text-nota text-texto-2">
          {plano.nome} · {formatarPreco(plano.valor, idioma)} {t(rotuloPeriodo(plano.periodicidade))}
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="rotulo-secao mb-4 w-full">{t('Seus dados')}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ck-nome" className={rotulo}>{t('Nome completo')}</label>
            <input id="ck-nome" required autoComplete="name" value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} className={campo} />
          </div>
          <div>
            <label htmlFor="ck-cpf" className={rotulo}>CPF</label>
            <input id="ck-cpf" required inputMode="numeric" value={dados.cpf} onChange={(e) => setDados({ ...dados, cpf: mascaraCpf(e.target.value) })} placeholder="000.000.000-00" className={campo} />
          </div>
          <div>
            <label htmlFor="ck-telefone" className={rotulo}>{t('Celular com DDD?')}</label>
            <input id="ck-telefone" type="tel" inputMode="tel" autoComplete="tel" required value={dados.telefone} onChange={(e) => setDados({ ...dados, telefone: mascaraTelefone(e.target.value) })} placeholder="(35) 99999-9999" className={campo} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ck-email" className={rotulo}>{t('E-mail')}</label>
            <input id="ck-email" type="email" required autoComplete="email" value={dados.email} onChange={(e) => setDados({ ...dados, email: e.target.value })} className={campo} />
            <p className="mt-1 text-mini text-texto-3">{t('A confirmação da compra vai para este e-mail.')}</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="rotulo-secao mb-4 w-full">{t('Pagamento')}</legend>
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ck-numero" className={rotulo}>{t('Número do cartão')}</label>
                <input id="ck-numero" required inputMode="numeric" autoComplete="cc-number" value={cartao.numero} onChange={(e) => setCartao({ ...cartao, numero: mascaraCartao(e.target.value) })} placeholder="0000 0000 0000 0000" className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ck-nome-cartao" className={rotulo}>{t('Nome impresso no cartão')}</label>
                <input id="ck-nome-cartao" required autoComplete="cc-name" value={cartao.nome} onChange={(e) => setCartao({ ...cartao, nome: e.target.value.toUpperCase() })} className={campo} />
              </div>
              <div>
                <label htmlFor="ck-validade" className={rotulo}>{t('Validade')}</label>
                <input id="ck-validade" required inputMode="numeric" autoComplete="cc-exp" value={cartao.validade} onChange={(e) => setCartao({ ...cartao, validade: mascaraValidade(e.target.value) })} placeholder="MM/AA" className={campo} />
              </div>
              <div>
                <label htmlFor="ck-cvv" className={rotulo}>CVV</label>
                <input id="ck-cvv" required inputMode="numeric" autoComplete="cc-csc" value={cartao.cvv} onChange={(e) => setCartao({ ...cartao, cvv: somenteDigitos(e.target.value).slice(0, 4) })} placeholder="123" className={campo} />
              </div>
              {opcoes.length > 1 && (
                <div className="sm:col-span-2">
                  <label htmlFor="ck-parcelas" className={rotulo}>{t('Parcelas')}</label>
                  <select id="ck-parcelas" value={cartao.parcelas} onChange={(e) => setCartao({ ...cartao, parcelas: Number(e.target.value) })} className="seletor">
                    {opcoes.map((o) => (
                      <option key={o.n} value={o.n}>
                        {o.n}x {t('de')} {formatarPreco(o.valor, idioma)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-mini font-semibold uppercase tracking-[0.13em] text-texto-3">{t('Endereço de cobrança do cartão')}</p>
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="ck-cep" className={rotulo}>CEP</label>
                <input id="ck-cep" required inputMode="numeric" autoComplete="postal-code" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: mascaraCep(e.target.value) })} placeholder="00000-000" className={campo} />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="ck-rua" className={rotulo}>{t('Rua')}</label>
                <input id="ck-rua" required autoComplete="address-line1" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ck-num" className={rotulo}>{t('Número')}</label>
                <input id="ck-num" required value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ck-bairro" className={rotulo}>{t('Bairro')}</label>
                <input id="ck-bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ck-compl" className={rotulo}>{t('Complemento')}</label>
                <input id="ck-compl" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} className={campo} />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="ck-cidade" className={rotulo}>{t('Cidade')}</label>
                <input id="ck-cidade" required autoComplete="address-level2" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ck-uf" className={rotulo}>{t('Estado')}</label>
                <select id="ck-uf" required value={endereco.uf} onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })} className="seletor">
                  <option value="">UF</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </div>
      </fieldset>

      {erro && (
        <p role="alert" className="rounded-cartao bg-erro/10 p-3 text-mini text-erro">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-borda pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-corpo">
          <span className="text-texto-2">{t('Total')}: </span>
          <strong className="font-bold text-brand">{total}</strong>
        </p>
        <button type="submit" disabled={enviando} className="botao-acao disabled:opacity-60">
          <Lock size={14} aria-hidden="true" />
          {enviando ? t('Processando...') : t('Pagar {{valor}}', { valor: total })}
        </button>
      </div>
      <p className="text-mini text-texto-3">
        {t('Pagamento processado pela Pagar.me. Os dados do cartão não passam pelo Viajantes.')}
      </p>
    </form>
  );
}
