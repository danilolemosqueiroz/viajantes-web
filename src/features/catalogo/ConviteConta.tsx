import { Award, Heart, Route } from 'lucide-react';
import ModalLogin from '@/features/conta/ModalLogin';
import { useT } from '@/i18n/Traducao';

/**
 * Convite para entrar ou criar a conta, ao abrir um atrativo.
 *
 * É o mesmo modal de login do Plano Viajantes, com o texto do que a conta dá.
 * É só um convite: "Continuar no site" (ou Esc, ou o X) fecha e a página fica
 * inteira. Quem decide quando mostrar é a página (`convites.ts`).
 */
export default function ConviteConta({
  aberto,
  aoFechar,
  nome,
  capa,
}: {
  aberto: boolean;
  aoFechar: () => void;
  nome: string;
  capa: string | null;
}) {
  const t = useT();
  return (
    <ModalLogin
      aberto={aberto}
      aoFechar={aoFechar}
      nome={nome}
      capa={capa}
      titulo={t('Entre ou crie sua conta')}
      beneficios={[
        { Icone: Heart, texto: t('Salve seus lugares favoritos') },
        { Icone: Route, texto: t('Roteiros prontos e descontos exclusivos') },
        { Icone: Award, texto: t('Pontos no ranking de Viajantes') },
      ]}
      continuarNoSite
    />
  );
}
