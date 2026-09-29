import ModalLogin from '@/features/conta/ModalLogin';
import { useT } from '@/i18n/Traducao';

/** Convite para entrar ou criar a conta, ao abrir um atrativo. É o modal de login sem faixa
 * nem capa, para caber na tela do celular. Quem decide quando mostrar é `convites.ts`. */
export default function ConviteConta({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const t = useT();
  return <ModalLogin aberto={aberto} aoFechar={aoFechar} titulo={t('Entre ou crie sua conta')} continuarNoSite />;
}
