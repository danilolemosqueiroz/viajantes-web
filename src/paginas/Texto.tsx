import { useQuery } from '@tanstack/react-query';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href, type RotaFixa } from '@/i18n/caminhos';
import { apiGet } from '@/lib/api';
import { useMeta } from '@/lib/meta';
import Carregando from '@/components/layout/Carregando';

/**
 * Páginas de texto (sobre, termos, privacidade). O conteúdo vem da API — a
 * mesma tabela `geral` que o aplicativo usa —, então a equipe edita num lugar
 * só e o site acompanha.
 */
const PAGINAS = {
  sobre: { rota: '/sobre' as RotaFixa, chave: 'sobre', titulo: 'Sobre Nós' },
  termos: { rota: '/termos' as RotaFixa, chave: 'termos', titulo: 'Termos e condições' },
  privacidade: { rota: '/privacidade' as RotaFixa, chave: 'privacidade', titulo: 'Política de Privacidade' },
} as const;

export default function Texto({ pagina }: { pagina: keyof typeof PAGINAS }) {
  const t = useT();
  const idioma = useIdioma();
  const { rota, chave, titulo } = PAGINAS[pagina];

  const { data: conteudo, isPending } = useQuery<string>({
    queryKey: ['texto', chave],
    queryFn: async () => {
      const r = await apiGet<{ texto?: string; conteudo?: string }>(`/site/geral/${chave}`);
      return r.ok ? (r.data?.texto ?? r.data?.conteudo ?? '') : '';
    },
  });

  useMeta({ titulo: t(titulo), caminho: href(rota, idioma) });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold leading-tight text-brand sm:text-heroi">{t(titulo)}</h1>
      {isPending ? (
        <Carregando altura="min-h-[30vh]" />
      ) : conteudo ? (
        <div
          className="mt-6 max-w-3xl space-y-4 text-corpo leading-relaxed text-texto-2"
          // Conteúdo escrito pela própria equipe na gerência, não por visitantes.
          dangerouslySetInnerHTML={{ __html: conteudo }}
        />
      ) : (
        <p className="mt-6 text-texto-2">{t('Conteúdo indisponível no momento.')}</p>
      )}
    </div>
  );
}
