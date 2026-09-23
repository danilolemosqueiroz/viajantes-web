import { Heart } from 'lucide-react';
import { IconeWhatsapp } from '@/components/layout/IconesMarca';
import { useT } from '@/i18n/Traducao';
import { CONEXOES } from './config';
import { Sobrancelha, TituloSecao } from './Partes';
import { publico } from '@/lib/publico';

/**
 * Os outros lugares onde o Viajantes acontece: os dois grupos de WhatsApp
 * (a comunidade e o Viajantes Recomenda, que é o de descontos) e o blog.
 *
 * São grupos DIFERENTES de propósito — quem quer conversa e quem quer desconto
 * não são necessariamente a mesma pessoa.
 */
export default function Conectado() {
  const t = useT();

  const cartoes = [
    {
      id: 'comunidade',
      titulo: t('Viaje junto com quem ama descobrir o Brasil'),
      texto: t(
        'Entre no nosso grupo do WhatsApp e faça parte de uma comunidade com viajantes de todo o Brasil.',
      ),
      rotulo: t('Entrar na comunidade'),
      href: CONEXOES.comunidadeWhatsapp,
      whatsapp: true,
    },
    {
      id: 'descontos',
      titulo: t('Descontos para quem viaja'),
      texto: t(
        'Participe também do Viajantes Recomenda e acompanhe oportunidades, benefícios e ofertas para as próximas viagens.',
      ),
      rotulo: t('Entrar no Viajantes Recomenda'),
      href: CONEXOES.descontosWhatsapp,
      whatsapp: true,
    },
    {
      id: 'blog',
      titulo: t('Inspire sua próxima viagem'),
      texto: t(
        'Conheça o Viajantes App Blog: destinos, roteiros, cachoeiras, ecoturismo e experiências pelo Brasil.',
      ),
      rotulo: t('Conhecer o blog'),
      href: CONEXOES.blog,
      whatsapp: false,
    },
  ];

  return (
    <section aria-labelledby="conectado-titulo">
      <div className="max-w-2xl">
        <Sobrancelha Icone={Heart}>{t('Ecossistema')}</Sobrancelha>
        <TituloSecao id="conectado-titulo">{t('Continue conectado ao Viajantes')}</TituloSecao>
      </div>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {cartoes.map((cartao) => (
          <li key={cartao.id} className="flex flex-col border-t border-borda pt-5">
            {cartao.id === 'blog' ? (
              <img
                src={publico('images/logo-blog.png')}
                alt="Viajantes App Blog"
                width={680}
                height={290}
                loading="lazy"
                className="h-8 w-auto self-start"
              />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-pilula border border-fio-forte text-brand">
                <IconeWhatsapp size={18} />
              </span>
            )}

            <h3 className="mt-4 text-corpo font-semibold leading-snug text-brand">{cartao.titulo}</h3>
            <p className="mt-2 text-nota font-light leading-relaxed text-texto-2">{cartao.texto}</p>

            <a
              href={cartao.href}
              target="_blank"
              rel="noopener"
              className="botao-fio mt-5 self-start"
            >
              {cartao.whatsapp && <IconeWhatsapp size={15} />}
              {cartao.rotulo}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
