import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { href } from '@/i18n/caminhos';
import { useIdioma, useT } from '@/i18n/Traducao';
import { useGeografia } from '@/lib/consultas';
import { useRegiao } from '@/lib/regiao';

/**
 * Abertura da home: uma foto grande, o posicionamento da plataforma e,
 * atravessando a borda da foto, a pergunta que o aplicativo faz primeiro —
 * para onde você vai.
 *
 * A foto NÃO é um arquivo do site: é a capa da região escolhida (ou a da
 * primeira região do catálogo). Assim a abertura muda junto com o conteúdo, e
 * não há um JPEG de 2 MB para manter.
 */
export default function Hero() {
  const t = useT();
  const idioma = useIdioma();
  const { regiao } = useRegiao();
  const { data: geografia } = useGeografia();

  const capa = regiao?.capa ?? geografia?.regioes[0]?.foto ?? null;

  return (
    <section>
      <div className="relative isolate h-80 overflow-hidden bg-brand sm:h-[26rem]">
        {capa && (
          <img
            src={capa}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/40 to-brand/10" />

        <div className="folha relative flex h-full flex-col justify-end pb-14 sm:pb-16">
          <h1 className="max-w-3xl text-heroi font-bold leading-[1.1] tracking-tight text-balance text-white">
            {t('Descubra o Brasil além do óbvio.')}
          </h1>
          <p className="mt-3 max-w-2xl text-corpo font-light leading-relaxed text-white/90">
            {t(
              'Cachoeiras, trilhas, hospedagens, restaurantes e passeios com informação real para você planejar a próxima viagem.',
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
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
      </div>

      <div className="folha relative -mt-6 flex justify-center">
        <Link
          to={href('/destinos', idioma)}
          className="inline-flex min-h-12 items-center gap-2 rounded-pilula bg-cartao px-5 text-nota font-semibold text-brand shadow-flutua transition hover:text-acento-escuro"
        >
          <MapPin size={16} className="text-acento" aria-hidden="true" />
          {regiao ? regiao.nome : t('Onde você vai explorar?')}
          <span className="text-mini font-normal text-texto-3">{t('trocar')}</span>
        </Link>
      </div>
    </section>
  );
}
