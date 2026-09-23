import { Link } from 'react-router-dom';
import { href } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useGeografia } from '@/lib/consultas';

/**
 * Fechamento da página. Usa a capa de OUTRA região que não a da abertura —
 * repetir a mesma foto no topo e no fim faz a home parecer curta.
 */
export default function CtaFinal() {
  const t = useT();
  const idioma = useIdioma();
  const { data: geografia } = useGeografia();

  const foto = geografia?.regioes.find((r, indice) => indice > 0 && r.foto)?.foto ?? null;

  return (
    <section className="relative isolate overflow-hidden rounded-heroi bg-brand px-6 py-16 text-center sm:px-10 sm:py-20">
      {foto && <img src={foto} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />}
      <div className="absolute inset-0 bg-brand/75" />

      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-titulo font-bold leading-tight tracking-tight text-balance text-white sm:text-[2rem]">
          {t('O Brasil é muito maior do que os lugares que você já conhece.')}
        </h2>
        <p className="mt-3 text-corpo font-light leading-relaxed text-white/90">
          {t(
            'Descubra novos destinos, encontre informações reais e planeje sua próxima experiência com o Viajantes.',
          )}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link to={href('/destinos', idioma)} className="botao-acao">
            {t('Explorar destinos')}
          </Link>
          <a
            href="#baixar-o-app"
            className="botao border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          >
            {t('Baixar o aplicativo')}
          </a>
        </div>
      </div>
    </section>
  );
}
