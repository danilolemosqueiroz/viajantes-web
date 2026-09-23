import ModalLogin from '@/features/conta/ModalLogin';
import { useT } from '@/i18n/Traducao';

/**
 * Convite para entrar ou criar a conta, ao abrir um atrativo.
 *
 * É o mesmo modal de login do Plano Viajantes, sem faixa nem capa: só o
 * título e os campos, para o login caber inteiro na tela do celular. É só um
 * convite: "Continuar no site" (ou Esc, ou o X) fecha e a página fica inteira.
 * Quem decide quando mostrar é a página (`convites.ts`).
 */
export default function ConviteConta({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const t = useT();
  return <ModalLogin aberto={aberto} aoFechar={aoFechar} titulo={t('Entre ou crie sua conta')} continuarNoSite />;
}
