import type { EmpresaResumo } from '@/lib/tipos';
import type { Categoria, Idioma } from '@/i18n/categorias';
import CardEmpresa from './CardEmpresa';

/** Grade de atrativos. Some quando não há nada — quem chama decide o vazio. */
export default function GradeEmpresas({
  empresas,
  categoria,
  idioma,
  colunas = 4,
  prioridadeNosPrimeiros = 0,
}: {
  empresas: EmpresaResumo[];
  categoria: Categoria;
  idioma: Idioma;
  colunas?: 3 | 4;
  prioridadeNosPrimeiros?: number;
}) {
  if (empresas.length === 0) return null;

  const grade =
    colunas === 3
      ? 'grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3'
      : 'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={grade}>
      {empresas.map((empresa, indice) => (
        <CardEmpresa
          key={empresa.idempresa}
          empresa={empresa}
          categoria={categoria}
          idioma={idioma}
          prioridade={indice < prioridadeNosPrimeiros}
        />
      ))}
    </div>
  );
}
