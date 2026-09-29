import type { Traduzir } from '@/i18n/Traducao';

export interface ErroExibido {
  codigo: string;
  texto: string;
  /** A assinatura venceu no meio do caminho: a tela troca para a oferta. */
  semAssinatura?: boolean;
  /** Sessão morta: é preciso entrar de novo. */
  semSessao?: boolean;
}

function data(iso: unknown, idioma: string): string | null {
  if (typeof iso !== 'string') return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(idioma, { day: 'numeric', month: 'long' });
}

/** Traduz os códigos estáveis do serviço (ver `viajantes-ia/src/lib/errors.ts`). A `message` do
 * serviço vem sempre em português, então só serve de último recurso. */
export function explicarErro(
  { status, codigo, dados }: { status: number; codigo?: string; dados?: Record<string, unknown> },
  t: Traduzir,
  idioma: string,
): ErroExibido {
  const c = codigo ?? (status === 0 ? 'rede' : `http_${status}`);
  switch (c) {
    case 'nao_autenticado':
    case 'sessao_invalida':
      return { codigo: c, texto: t('Sua sessão expirou. Entre de novo para continuar.'), semSessao: true };
    case 'assinatura_necessaria':
      return { codigo: c, texto: t('O Guia Viajantes é exclusivo do Plano Viajantes.'), semAssinatura: true };
    case 'usuario_bloqueado':
      return { codigo: c, texto: t('Sua conta está bloqueada. Fale com contato@viajantesapp.com.br.') };
    case 'resposta_em_andamento':
      return { codigo: c, texto: t('Ainda estou respondendo sua mensagem anterior. Aguarde um instante.') };
    case 'limite_diario':
      return { codigo: c, texto: t('Você atingiu o limite de mensagens de hoje. Volte amanhã!') };
    case 'saldo_esgotado': {
      const quando = data(dados?.renova_em, idioma);
      return {
        codigo: c,
        texto: quando
          ? t('Você usou todo o saldo do guia deste mês. Ele renova em {{data}}.', { data: quando })
          : t('Você usou todo o saldo do guia deste mês.'),
      };
    }
    case 'muitas_requisicoes':
      return { codigo: c, texto: t('Muitas mensagens em pouco tempo. Aguarde um instante.') };
    case 'mensagem_invalida':
      return { codigo: c, texto: t('Não consegui ler essa mensagem. Escreva de novo, em até 2.000 caracteres.') };
    case 'conversa_nao_encontrada':
      return { codigo: c, texto: t('Esta conversa não existe mais.') };
    case 'rede':
      return { codigo: c, texto: t('Sem conexão com o guia. Confira sua internet e tente de novo.') };
    default:
      return { codigo: c, texto: t('O guia está indisponível agora. Tente novamente em alguns minutos.') };
  }
}
