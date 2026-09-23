import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useMeta } from '@/lib/meta';
import FormContato from '@/features/conta/FormContato';

export default function Contato() {
  const t = useT();
  const idioma = useIdioma();
  useMeta({
    titulo: t('Fale Conosco'),
    descricao: t('Fale com a equipe do Viajantes APP.'),
    caminho: href('/contato', idioma),
  });

  return (
    <div className="folha py-10">
      <h1 className="text-titulo font-bold text-brand sm:text-heroi">{t('Fale Conosco')}</h1>
      <p className="mt-2 max-w-2xl text-corpo font-light text-texto-2">{t('Fale com a equipe do Viajantes APP.')}</p>
      <div className="mt-8 max-w-md">
        <FormContato />
      </div>
    </div>
  );
}
