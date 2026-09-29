import { Link } from 'react-router-dom';
import { CATEGORIAS, type Categoria } from '@/i18n/categorias';
import { href, hrefCategoria } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useEmpresas, useRoteiros } from '@/lib/consultas';
import { useRegiao } from '@/lib/regiao';
import { capaEmpresa } from '@/features/catalogo/dados';

/** "Tudo para viver cada destino": uma entrada com foto para cada categoria, mais os roteiros.
 * As fotos vêm da API: cada quadro usa a capa do primeiro atrativo da categoria. */
export default function Mosaico() {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();
  const { data: roteiros = [] } = useRoteiros(regiao?.id);

  const capaRoteiro = roteiros.find((r) => r.foto_capa)?.foto_capa ?? null;

  return (
    <section aria-labelledby="mosaico-titulo">
      <h2 id="mosaico-titulo" className="text-secao font-bold text-brand text-balance sm:text-titulo">
        {t('Tudo para viver cada destino')}
      </h2>
      <p className="mt-2 max-w-2xl text-nota font-light text-texto-2">
        {t('Descubra o que fazer, onde ficar, onde comer e as experiências de cada região.')}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIAS.map((categoria) => (
          <QuadroCategoria key={categoria.id} categoria={categoria} />
        ))}
        <Quadro
          para={href('/roteiros', idioma)}
          nome={t('Roteiros prontos')}
          foto={capaRoteiro}
        />
      </ul>
    </section>
  );
}

/** Um quadro de categoria. Pede a mesma lista das faixas da home, então as duas seções
 * compartilham uma única consulta em cache. */
function QuadroCategoria({ categoria }: { categoria: Categoria }) {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();
  const { data: empresas = [] } = useEmpresas({ categoria, regiao: regiao?.id, limite: 10 });

  const foto = empresas.map(capaEmpresa).find(Boolean) ?? null;

  return <Quadro para={hrefCategoria(categoria, idioma)} nome={t(categoria.tituloCurto)} foto={foto} />;
}

function Quadro({ para, nome, foto }: { para: string; nome: string; foto: string | null }) {
  return (
    <li>
      <Link to={para} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-cartao bg-brand">
          {foto && (
            <img
              src={foto}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          )}
          {/* Sem a cortina, um nome claro sobre uma foto clara some. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <h3 className="absolute inset-x-3 bottom-2.5 text-nota font-bold leading-snug text-white">{nome}</h3>
        </div>
      </Link>
    </li>
  );
}
