import type { EmpresaResumo } from '@/lib/tipos';
import type { Categoria, Idioma } from '@/i18n/categorias';
import CardEmpresa from './CardEmpresa';

/**
 * Faixa horizontal de atrativos — o ritmo das seções da home do aplicativo:
 * cards em retrato que rolam com o dedo, em vez de uma grade que empurra o
 * resto da página para baixo.
 */
export default function FaixaEmpresas({
  empresas,
  categoria,
  idioma,
  prioridadeNosPrimeiros = 0,
}: {
  empresas: EmpresaResumo[];
  categoria: Categoria;
  idioma: Idioma;
  prioridadeNosPrimeiros?: number;
}) {
  if (empresas.length === 0) return null;

  return (
    <div className="trilho pb-1">
      {empresas.map((empresa, indice) => (
        <CardEmpresa
          key={empresa.idempresa}
          empresa={empresa}
          categoria={categoria}
          idioma={idioma}
          formato="retrato"
          prioridade={indice < prioridadeNosPrimeiros}
        />
      ))}
    </div>
  );
}
