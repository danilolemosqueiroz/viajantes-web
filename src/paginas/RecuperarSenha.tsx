import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useMeta } from '@/lib/meta';
import FormRecuperarSenha from '@/features/conta/FormRecuperarSenha';

export default function RecuperarSenha() {
  const t = useT();
  const idioma = useIdioma();
  useMeta({ titulo: t('Esqueci minha senha'), caminho: href('/recuperar-senha', idioma), naoIndexar: true });

  return (
    <div className="folha flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-titulo font-bold text-brand">{t('Esqueci minha senha')}</h1>
        <p className="mt-1 text-nota text-texto-2">
          {t('Informe seu e-mail e enviaremos um link para criar uma nova senha.')}
        </p>
        <div className="mt-6">
          <FormRecuperarSenha />
        </div>
      </div>
    </div>
  );
}
