import { useQuery } from '@tanstack/react-query';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { apiGet } from '@/lib/api';
import { useMeta } from '@/lib/meta';
import Carregando from '@/components/layout/Carregando';

interface Mapeador {
  idusuario: number;
  nome: string;
  foto?: string | null;
  total?: number;
}

/** Ranking de quem mais mapeou atrativos — o mesmo do aplicativo. */
export default function Mapeadores() {
  const t = useT();
  const idioma = useIdioma();

  const { data: lista = [], isPending } = useQuery<Mapeador[]>({
    queryKey: ['mapeadores'],
    queryFn: async () => {
      const r = await apiGet<Mapeador[]>('/site/ranking-mapeadores');
      return r.ok && Array.isArray(r.data) ? r.data : [];
    },
  });

  useMeta({
    titulo: t('Ranking de Mapeadores'),
    descricao: t('Quem mais contribuiu com atrativos mapeados no Viajantes APP.'),
    caminho: href('/mapeadores', idioma),
  });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold leading-tight text-brand sm:text-heroi">
        {t('Ranking de Mapeadores')}
      </h1>
      <p className="mt-2 max-w-2xl text-corpo font-light text-texto-2">
        {t('Quem mais contribuiu com atrativos mapeados no Viajantes APP.')}
      </p>

      {isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : lista.length === 0 ? (
        <div className="recuo mt-8 p-10 text-center text-texto-2">{t('Nenhum resultado encontrado')}</div>
      ) : (
        <ol className="mt-8 divide-y divide-borda">
          {lista.map((pessoa, indice) => (
            <li key={pessoa.idusuario} className="flex items-center gap-3 py-3">
              <span className="w-7 shrink-0 text-nota font-bold text-texto-3">{indice + 1}</span>
              <span className="size-10 shrink-0 overflow-hidden rounded-pilula bg-brand-suave">
                {pessoa.foto && <img src={pessoa.foto} alt="" loading="lazy" className="size-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-texto">{pessoa.nome}</span>
              {typeof pessoa.total === 'number' && (
                <span className="shrink-0 text-nota text-texto-3">
                  {pessoa.total} {t('atrativos')}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
