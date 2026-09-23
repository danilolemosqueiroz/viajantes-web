import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n/Traducao';
import { categoriaPorEavmoda, type Idioma } from '@/i18n/categorias';
import { hrefEmpresa } from '@/i18n/caminhos';
import type { RoteiroItem } from '@/lib/tipos';
import { agruparPorDia } from './dados';

/** O dia a dia do roteiro — só aparece para quem tem acesso. */
export default function RoteiroCompleto({ itens, idioma }: { itens: RoteiroItem[]; idioma: Idioma }) {
  const t = useT();
  const dias = agruparPorDia(itens);

  if (dias.length === 0) {
    return <p className="recuo mt-8 p-8 text-center text-texto-2">{t('Este roteiro ainda não tem paradas cadastradas.')}</p>;
  }

  return (
    <div className="mt-10 space-y-10">
      {dias.map(({ dia, itens: doDia }) => (
        <section key={dia}>
          <h2 className="rotulo-secao mb-4">{t('Dia {{n}}', { n: dia })}</h2>
          <ol className="space-y-4">
            {doDia.map((item) => {
              const categoria = categoriaPorEavmoda(item.empresa_eavmoda);
              const link =
                item.link_interno_empresa_id && categoria
                  ? hrefEmpresa({ idempresa: item.link_interno_empresa_id, nome: item.empresa_nome || item.titulo }, categoria, idioma)
                  : null;
              const horario = item.horario ? String(item.horario).slice(0, 5) : null;

              return (
                <li key={item.idroteiro_personalizado_item} className="flex gap-4 rounded-cartao border border-borda p-3 sm:p-4">
                  {item.foto && (
                    <img
                      src={item.foto}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-24 shrink-0 rounded-cartao object-cover sm:size-28"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {horario && <p className="text-mini font-semibold text-acento-escuro">{horario}</p>}
                    <h3 className="font-semibold leading-snug text-texto">{item.titulo}</h3>
                    {item.descricao && (
                      <p className="mt-1 whitespace-pre-line text-nota text-texto-2">{item.descricao}</p>
                    )}
                    {(link || item.link_externo) && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-nota font-semibold text-acento-escuro">
                        {link && (
                          <Link to={link} className="inline-flex items-center gap-1 hover:underline">
                            {t('Ver no Viajantes')}
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        )}
                        {item.link_externo && (
                          <a
                            href={item.link_externo}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {t('Abrir link')}
                            <ExternalLink size={13} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
