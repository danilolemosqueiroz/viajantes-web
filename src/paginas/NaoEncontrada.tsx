import { Link } from 'react-router-dom';
import { href } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useMeta } from '@/lib/meta';

export default function NaoEncontrada() {
  const t = useT();
  const idioma = useIdioma();
  useMeta({ titulo: t('Página não encontrada'), naoIndexar: true });

  return (
    <div className="folha flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-heroi font-bold text-brand">404</p>
      <h1 className="mt-2 text-secao font-semibold text-texto">{t('Página não encontrada')}</h1>
      <p className="mt-2 max-w-md text-nota text-texto-2">
        {t('O endereço não existe ou o conteúdo saiu do ar.')}
      </p>
      <Link to={href('/', idioma)} className="botao mt-6">
        {t('Início')}
      </Link>
    </div>
  );
}
