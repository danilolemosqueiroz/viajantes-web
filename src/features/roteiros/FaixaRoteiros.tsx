import type { Roteiro } from '@/lib/tipos';
import CardRoteiro from './CardRoteiro';

/**
 * Faixa de roteiros da home: rola na horizontal, como no aplicativo. A grade
 * de quatro colunas fica para a página /roteiros, que é uma lista de verdade.
 */
export default function FaixaRoteiros({ roteiros }: { roteiros: Roteiro[] }) {
  if (roteiros.length === 0) return null;

  return (
    <div className="trilho pb-1">
      {roteiros.map((roteiro) => (
        <CardRoteiro key={roteiro.idroteiro_personalizado} roteiro={roteiro} formato="retrato" />
      ))}
    </div>
  );
}
