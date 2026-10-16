import { useQuery } from '@tanstack/react-query';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href, type RotaFixa } from '@/i18n/caminhos';
import { apiGet } from '@/lib/api';
import { useMeta } from '@/lib/meta';
import Carregando from '@/components/layout/Carregando';

/** Páginas de texto editadas na gerência (Textos Gerais → tabela `geral`, a mesma do app).
 * Termos e privacidade NÃO passam por aqui: são páginas fixas em features/legal. */
const PAGINAS = {
  sobre: { rota: '/sobre' as RotaFixa, chave: 'sobre', titulo: 'Sobre Nós' },
} as const;

export default function Texto({ pagina }: { pagina: keyof typeof PAGINAS }) {
  const t = useT();
  const idioma = useIdioma();
  const { rota, chave, titulo } = PAGINAS[pagina];

  const { data: conteudo, isPending } = useQuery<string>({
    queryKey: ['texto', chave],
    queryFn: async () => {
      const r = await apiGet<Record<string, unknown>>('/site/geral');
      return r.ok && typeof r.data?.[chave] === 'string' ? (r.data[chave] as string) : '';
    },
  });
  // O texto da gerência é um textarea sem HTML: quebra dupla vira parágrafo.
  const paragrafos = (conteudo ?? '').split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);

  useMeta({ titulo: t(titulo), caminho: href(rota, idioma) });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold leading-tight text-brand sm:text-heroi">{t(titulo)}</h1>
      {isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : paragrafos.length ? (
        <div className="mt-6 max-w-3xl space-y-4 text-corpo leading-relaxed text-texto-2">
          {paragrafos.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-texto-2">{t('Conteúdo indisponível no momento.')}</p>
      )}
    </div>
  );
}
