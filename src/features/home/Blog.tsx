import { ArrowRight } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { CONEXOES } from './config';
import { publico } from '@/lib/publico';

/** Chamada para o Blog Viajantes — a mesma marca, um lugar de destaque na home. */
export default function Blog() {
  const t = useT();

  return (
    <section
      aria-labelledby="blog-titulo"
      className="recuo grid items-center gap-6 p-7 sm:p-9 md:grid-cols-[auto_1fr_auto]"
    >
      <img
        src={publico('images/logo-blog.png')}
        alt="Viajantes App Blog"
        width={680}
        height={290}
        loading="lazy"
        decoding="async"
        className="h-10 w-auto"
      />
      <div>
        <h2 id="blog-titulo" className="text-secao font-bold leading-tight tracking-tight text-brand text-balance">
          {t('Inspire sua próxima viagem no Blog Viajantes')}
        </h2>
        <p className="mt-1 text-nota font-light leading-relaxed text-texto-2">
          {t('Destinos, roteiros, cachoeiras e dicas de quem vive a estrada, de graça e toda semana.')}
        </p>
      </div>
      <a href={CONEXOES.blog} target="_blank" rel="noopener" className="botao-acao self-start md:self-center">
        {t('Ler o blog')}
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </section>
  );
}
