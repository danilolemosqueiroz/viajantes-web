import { Gift, Lock, Smartphone } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import type { Empresa } from '@/lib/tipos';
import LinhasBorradas from './LinhasBorradas';

/** Âncora do `<Assinar />` que a página põe embaixo quando o benefício está escondido. */
export const ANCORA_ASSINAR = 'assinar-plano';

/** Benefício do estabelecimento parceiro: o texto só vem da API para quem assina (regra 12). */
export default function CartaoBeneficio({ empresa }: { empresa: Empresa }) {
  const t = useT();
  if (!empresa.tem_beneficio) return null;
  const beneficio = empresa.beneficio;

  if (beneficio) {
    return (
      <div className="rounded-cartao border border-acento/40 bg-acento-suave p-4">
        <p className="flex items-start gap-2 text-nota font-bold text-acento-escuro">
          <Gift size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t('Seu benefício: {{texto}}', { texto: beneficio.texto })}
        </p>
        {beneficio.condicoes && <p className="mt-1 text-mini text-texto-2">{beneficio.condicoes}</p>}
        <p className="mt-2 flex items-start gap-1.5 text-mini text-texto-2">
          <Smartphone size={13} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          {t('Faça o check-in no app Viajantes, na porta do lugar, para liberar.')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-cartao border border-borda bg-papel-2 p-4">
      <p className="flex items-center gap-2 text-nota font-bold text-brand">
        <Lock size={15} className="shrink-0" aria-hidden="true" />
        {t('Benefício exclusivo para assinantes')}
      </p>
      <LinhasBorradas n={1} />
      <button
        type="button"
        className="botao-acao mt-3 w-full"
        onClick={() => document.getElementById(ANCORA_ASSINAR)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      >
        <Gift size={16} aria-hidden="true" />
        {t('Assinar o Plano Viajantes')}
      </button>
    </div>
  );
}
