import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, Globe, Mail, MapPin, Navigation, Phone, Star, Ticket, User } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import type { Categoria, Idioma } from '@/i18n/categorias';
import { hrefCategoria, hrefEmpresa, raiz } from '@/i18n/caminhos';
import type { Avaliacao, AtrativoProximo, Empresa, Telefone } from '@/lib/tipos';
import { apiGet } from '@/lib/api';
import { urlSite, JsonLd, migalhas } from '@/lib/seo/jsonld';
import { useMeta } from '@/lib/meta';
import { useUsuario } from '@/lib/conta';
import { IconeFacebook, IconeInstagram, IconeWhatsapp } from '@/components/layout/IconesMarca';
import {
  capaEmpresa,
  ehAparelhoApple,
  formatarTelefone,
  fotosDaGaleria,
  horarioDeHoje,
  linkComoChegar,
  linkExterno,
  linkPerfil,
  linkWhatsapp,
  mediaAvaliacoes,
  numeroWhatsapp,
  separarConteudo,
  tipoSchema,
  tituloInfo,
  urlEmbedVideo,
} from './dados';
import { decidirConviteAoAbrir, marcarConviteContaDispensado, type Convite } from './convites';
import AtrativosProximos from './AtrativosProximos';
import AvaliarLocal from './AvaliarLocal';
import ConviteApp from './ConviteApp';
import ConviteConta from './ConviteConta';
import Estrelas from './Estrelas';
import Galeria from './Galeria';
import GradeEmpresas from './GradeEmpresas';

/**
 * Página de um atrativo: /cachoeiras/cachoeira-do-cristal-1234.
 *
 * Tudo fica aberto. Ao entrar aparece UM convite — entrar ou criar conta para
 * quem não está logado; baixar o aplicativo de vez em quando (a regra está em
 * `convites.ts`) — e fechar não trava nada. As seções seguem a ordem do
 * site antigo, com as fotos subidas a pedido do cliente: atrativos do
 * complexo, sobre, fotos, avaliações, atrativos próximos, vídeos, destaques e
 * horário de funcionamento; o contato fica ao lado (no celular, antes do
 * conteúdo).
 */

interface Props {
  empresa: Empresa;
  categoria: Categoria;
  idioma: Idioma;
  slug: string;
}

/** Telefones fixos/celulares já formatados pela API (o WhatsApp é o 4, e tem botão próprio). */
function telefonesDaEmpresa(empresa: Empresa): Telefone[] {
  const daApi = (empresa.telefones ?? []).filter((tel) => tel.idtelefone !== 4 && tel.numero);
  if (daApi.length > 0) return daApi;
  return [empresa.telefone1, empresa.telefone2, empresa.telefone3]
    .filter((numero): numero is string => Boolean(numero))
    .map((numero, indice) => ({ idtelefone: indice + 1, numero: formatarTelefone(numero), descricao: '' }));
}

const AVALIACOES_NA_PAGINA = 12;

export default function PaginaAtrativo({ empresa, categoria, idioma, slug }: Props) {
  const t = useT();
  const { data: usuario, isPending: carregandoUsuario } = useUsuario();

  // A página é remontada a cada atrativo (key no CategoriaSlug), então o
  // estado do convite e do formulário de avaliação começa do zero em cada um.
  const [convite, setConvite] = useState<Convite>(null);
  const [avaliando, setAvaliando] = useState(false);

  // Qual convite mostrar se decide UMA vez por atrativo, e só depois de saber
  // se há alguém logado (convidar a entrar quem já entrou seria um susto). A
  // ref segura a decisão contra o efeito duplo do StrictMode e contra o
  // usuário mudar depois (o login feito no próprio convite).
  const decidido = useRef(false);
  useEffect(() => {
    if (carregandoUsuario || decidido.current) return;
    decidido.current = true;
    setConvite(decidirConviteAoAbrir(Boolean(usuario)));
  }, [carregandoUsuario, usuario]);

  // Avaliações e atrativos próximos são complementos: se a API falhar, a
  // página continua de pé sem eles.
  const { data: avaliacoes = [] } = useQuery<Avaliacao[]>({
    queryKey: ['avaliacoes', empresa.idempresa],
    queryFn: async () => {
      const r = await apiGet<Avaliacao[]>(`/site/avaliacoes/${empresa.idempresa}`);
      return r.ok && Array.isArray(r.data) ? r.data.filter((a) => a && typeof a === 'object') : [];
    },
  });

  const { data: proximos = [] } = useQuery<AtrativoProximo[]>({
    queryKey: ['proximos', empresa.idempresa],
    queryFn: async () => {
      const r = await apiGet<AtrativoProximo[]>(`/site/empresa/${empresa.idempresa}/atrativos`);
      return r.ok && Array.isArray(r.data) ? r.data : [];
    },
  });

  const capa = capaEmpresa(empresa);
  const logotipo = empresa.logotipo && empresa.logotipo !== capa ? empresa.logotipo : null;
  const { textos, imagens, videos } = separarConteudo(empresa.infos);
  const galeria = fotosDaGaleria(empresa.fotos);
  const horarios = empresa.horarios ?? [];
  const hoje = horarioDeHoje(horarios);
  const nota = mediaAvaliacoes(avaliacoes);
  const filhos = empresa.filhos ?? [];

  const apple = ehAparelhoApple(navigator.userAgent, 'ontouchend' in document);
  const comoChegar = linkComoChegar(empresa, apple);
  const whatsapp = linkWhatsapp(empresa.whatsapp);
  const whatsappNumero = numeroWhatsapp(whatsapp);
  const telefones = telefonesDaEmpresa(empresa);
  const reserva = linkExterno(empresa.linkafiliado);
  const site = linkExterno(empresa.site);
  const instagram = linkPerfil(empresa.urlinstagram, 'https://www.instagram.com');
  const facebook = linkPerfil(empresa.urlfacebook, 'https://www.facebook.com');
  const email = String(empresa.email ?? '').trim();

  const inicio = raiz(idioma) || '/';
  const caminhoCategoria = hrefCategoria(categoria, idioma);
  const caminhoAtual = `${caminhoCategoria}/${slug}`;

  const lugar = [empresa.cidade_nome, empresa.estado_nome].filter(Boolean).join(', ');
  const descricao = (empresa.descricao || textos[0]?.descricao || `${t(categoria.titulo)}${lugar ? ` em ${lugar}` : ''}.`)
    .replace(/\s+/g, ' ')
    .trim();
  useMeta({
    titulo: lugar ? `${empresa.nome} — ${lugar}` : empresa.nome,
    descricao: descricao.slice(0, 300),
    caminho: caminhoAtual,
    imagem: capa,
  });

  const quantasAvaliacoes = avaliacoes.length === 1 ? t('1 avaliação') : t('{{n}} avaliações', { n: avaliacoes.length });

  const contato = (
    <div className="recuo space-y-3 p-5">
      <div className="flex items-center gap-3">
        {logotipo && (
          <img src={logotipo} alt="" width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-cartao bg-cartao object-cover" />
        )}
        <h2 className="text-secao font-bold text-brand">{t('Contato')}</h2>
      </div>

      {empresa.endereco && (
        <p className="flex items-start gap-2 text-nota text-texto-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          {empresa.endereco}
        </p>
      )}

      {comoChegar && (
        <a href={comoChegar} target="_blank" rel="noopener" className="flex botao w-full">
          <Navigation size={16} aria-hidden="true" />
          {t('Como chegar')}
        </a>
      )}

      {reserva && (
        <a href={reserva} target="_blank" rel="noopener sponsored" className="flex botao-acao w-full">
          <Ticket size={16} aria-hidden="true" />
          {t('Reservar')}
        </a>
      )}

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-pilula bg-acento text-nota font-semibold text-white transition hover:bg-acento-escuro"
        >
          <IconeWhatsapp size={16} />
          {whatsappNumero ? `WhatsApp ${whatsappNumero}` : 'WhatsApp'}
        </a>
      )}

      {telefones.map((tel) => (
        <a
          key={tel.idtelefone}
          href={`tel:${tel.numero.replace(/\D/g, '')}`}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-pilula border border-fio-forte text-nota font-semibold text-brand transition hover:bg-brand-suave"
        >
          <Phone size={16} aria-hidden="true" />
          {tel.numero}
        </a>
      ))}

      {(email || site || instagram || facebook) && (
        <ul className="space-y-2 pt-1 text-nota">
          {email && (
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-2 break-all text-texto-2 hover:text-brand">
                <Mail size={15} className="shrink-0 text-brand" aria-hidden="true" />
                {email}
              </a>
            </li>
          )}
          {site && (
            <li>
              <a href={site} target="_blank" rel="noopener" className="flex items-center gap-2 break-all text-texto-2 hover:text-brand">
                <Globe size={15} className="shrink-0 text-brand" aria-hidden="true" />
                {t('Site oficial')}
              </a>
            </li>
          )}
          {instagram && (
            <li>
              <a href={instagram} target="_blank" rel="noopener" className="flex items-center gap-2 text-texto-2 hover:text-brand">
                <IconeInstagram size={15} className="shrink-0 text-brand" />
                Instagram
              </a>
            </li>
          )}
          {facebook && (
            <li>
              <a href={facebook} target="_blank" rel="noopener" className="flex items-center gap-2 text-texto-2 hover:text-brand">
                <IconeFacebook size={15} className="shrink-0 text-brand" />
                Facebook
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <JsonLd
        blocos={[
          migalhas([
            { nome: 'Home', caminho: inicio },
            { nome: t(categoria.titulo), caminho: caminhoCategoria },
            { nome: empresa.nome, caminho: caminhoAtual },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': tipoSchema(empresa.eavmoda),
            name: empresa.nome,
            url: urlSite(caminhoAtual),
            ...(capa ? { image: capa } : {}),
            description: descricao,
            ...(empresa.endereco
              ? {
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: empresa.endereco,
                    addressLocality: empresa.cidade_nome ?? undefined,
                    addressRegion: empresa.estado_nome ?? undefined,
                    addressCountry: 'BR',
                  },
                }
              : {}),
            ...(empresa.lat && empresa.long
              ? { geo: { '@type': 'GeoCoordinates', latitude: Number(empresa.lat), longitude: Number(empresa.long) } }
              : {}),
            ...(telefones[0] ? { telephone: `+55${telefones[0].numero.replace(/\D/g, '')}` } : {}),
            ...([instagram, facebook, site].some(Boolean) ? { sameAs: [instagram, facebook, site].filter(Boolean) } : {}),
            ...(filhos.length > 0
              ? {
                  containsPlace: filhos.map((filho) => ({
                    '@type': 'TouristAttraction',
                    name: filho.nome,
                    url: urlSite(hrefEmpresa(filho, categoria, idioma)),
                  })),
                }
              : {}),
            ...(avaliacoes.length > 0
              ? {
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: nota, reviewCount: avaliacoes.length, bestRating: 5 },
                  review: avaliacoes.slice(0, 10).map((a) => ({
                    '@type': 'Review',
                    author: { '@type': 'Person', name: a.nome || 'Viajante' },
                    reviewRating: { '@type': 'Rating', ratingValue: Number(a.nota) || 0, bestRating: 5 },
                    reviewBody: a.mensagem ?? '',
                  })),
                }
              : {}),
          },
        ]}
      />

      {/* Capa: um painel de foto sobre a folha, e o título embaixo em tinta
          verde — a mesma ordem da tela de detalhe do aplicativo. */}
      <div className="folha pt-6">
        <nav aria-label={t('Você está em')} className="flex flex-wrap items-center gap-2 text-mini text-texto-3">
          <Link to="/" className="transition hover:text-brand">
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <Link to={caminhoCategoria} className="transition hover:text-brand">
            {t(categoria.titulo)}
          </Link>
        </nav>

        {capa && (
          <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-heroi bg-brand-suave sm:aspect-auto sm:h-96">
            <img src={capa} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
        )}

        <h1 className="mt-5 max-w-3xl text-titulo font-bold leading-tight tracking-tight text-balance text-brand sm:text-heroi">
          {empresa.nome}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-nota text-texto-2">
          {(lugar || empresa.endereco) && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-acento" aria-hidden="true" />
              {lugar || empresa.endereco}
            </span>
          )}
          {hoje && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-texto-3" aria-hidden="true" />
              <span>
                {t('Hoje')}: {hoje.horario.valor}
              </span>
              {hoje.aberto !== null && (
                <span className={hoje.aberto ? 'font-semibold text-aberto' : 'font-semibold text-fechado'}>
                  · {hoje.aberto ? t('Aberto agora') : t('Fechado agora')}
                </span>
              )}
            </span>
          )}
          {avaliacoes.length > 0 ? (
            <a href="#avaliacoes" className="flex items-center gap-1.5 font-semibold text-texto hover:text-brand">
              <Estrelas nota={nota} />
              {nota.toFixed(1).replace('.', ',')}
              <span className="font-normal text-texto-3">({quantasAvaliacoes})</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setAvaliando(true)}
              className="flex items-center gap-1.5 font-semibold text-acento-escuro hover:underline"
            >
              <Star size={14} aria-hidden="true" />
              {t('Seja o primeiro a avaliar')}
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {comoChegar && (
            <a href={comoChegar} target="_blank" rel="noopener" className="botao">
              <Navigation size={16} aria-hidden="true" />
              {t('Como chegar')}
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pilula bg-acento px-6 text-nota font-semibold text-white transition hover:bg-acento-escuro"
            >
              <IconeWhatsapp size={16} />
              WhatsApp
            </a>
          )}
          {reserva && (
            <a href={reserva} target="_blank" rel="noopener sponsored" className="botao-acao">
              <Ticket size={16} aria-hidden="true" />
              {t('Reservar')}
            </a>
          )}
        </div>
      </div>

      <ConviteConta
        aberto={convite === 'conta'}
        aoFechar={() => {
          marcarConviteContaDispensado();
          setConvite(null);
        }}
      />

      <ConviteApp aberto={convite === 'app'} aoFechar={() => setConvite(null)} nome={empresa.nome} capa={capa} />

      <AvaliarLocal
        aberto={avaliando}
        aoFechar={() => setAvaliando(false)}
        idempresa={empresa.idempresa}
        nome={empresa.nome}
        usuario={usuario ? { nome: [usuario.nome, usuario.sobrenome].filter(Boolean).join(' '), email: usuario.email } : null}
      />

      <div className="folha grid gap-8 py-8 lg:grid-cols-[1fr_20rem]">
        {/* No celular o contato vem antes do conteúdo, como no site antigo;
            no computador fica na coluna da direita, acompanhando a rolagem. */}
        <aside className="lg:order-2 lg:sticky lg:top-24 lg:self-start">{contato}</aside>

        <div className="min-w-0 space-y-10 lg:order-1">
          {filhos.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">{t('Atrativos deste complexo')}</h2>
              <GradeEmpresas empresas={filhos} categoria={categoria} idioma={idioma} colunas={3} />
            </section>
          )}

          {textos.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">{t('Sobre')}</h2>
              <div className="space-y-5">
                {textos.map((info, indice) => {
                  const titulo = tituloInfo(info.titulo);
                  return (
                    <article key={info.idinfo ?? indice}>
                      {titulo && <h3 className="text-base font-semibold text-texto">{titulo}</h3>}
                      <p className="mt-1 whitespace-pre-line text-nota leading-relaxed text-texto-2">{info.descricao.trim()}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {galeria.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">
                {t('Fotos')} <span className="font-normal opacity-70">({galeria.length})</span>
              </h2>
              <Galeria nome={empresa.nome} fotos={galeria} />
            </section>
          )}

          <section id="avaliacoes" className="scroll-mt-24">
            <h2 className="rotulo-secao mb-4">{t('Avaliações')}</h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {avaliacoes.length > 0 ? (
                <p className="flex items-center gap-2 text-nota">
                  <Estrelas nota={nota} tamanho={16} />
                  <strong className="text-corpo text-texto">{nota.toFixed(1).replace('.', ',')}</strong>
                  <span className="text-texto-3">({quantasAvaliacoes})</span>
                </p>
              ) : (
                <p className="text-nota text-texto-2">{t('Este local ainda não tem avaliações. Conte como foi sua visita!')}</p>
              )}
              <button type="button" onClick={() => setAvaliando(true)} className="botao-fio">
                <Star size={15} aria-hidden="true" />
                {t('Avaliar este local')}
              </button>
            </div>

            {avaliacoes.length > 0 && (
              <ul className="mt-4 space-y-3">
                {avaliacoes.slice(0, AVALIACOES_NA_PAGINA).map((avaliacao) => (
                  <li key={avaliacao.idavaliacao} className="rounded-cartao border border-borda p-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-pilula bg-brand-suave text-brand">
                        <User size={20} aria-hidden="true" />
                        {avaliacao.foto && (
                          <img
                            src={avaliacao.foto}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover"
                            // Foto quebrada some e deixa o ícone aparecer.
                            onError={(evento) => evento.currentTarget.remove()}
                          />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold leading-tight text-texto">{avaliacao.nome || 'Viajante'}</p>
                        <span className="sr-only">{t('Nota {{nota}} de 5', { nota: avaliacao.nota })}</span>
                        <Estrelas nota={Number(avaliacao.nota) || 0} tamanho={13} />
                      </div>
                    </div>
                    {avaliacao.mensagem && <p className="mt-2 whitespace-pre-line text-nota text-texto-2">{avaliacao.mensagem}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AtrativosProximos proximos={proximos} idioma={idioma} />

          {videos.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">{t('Vídeos')}</h2>
              <div className="space-y-5">
                {videos.map((info, indice) => {
                  const titulo = tituloInfo(info.titulo);
                  return (
                    <figure key={info.idinfo ?? indice}>
                      <iframe
                        src={urlEmbedVideo(info.video!)}
                        title={titulo || empresa.nome}
                        loading="lazy"
                        allow="accelerometer; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="aspect-video w-full rounded-cartao bg-brand-suave"
                      />
                      {titulo && <figcaption className="mt-2 text-nota font-semibold text-texto">{titulo}</figcaption>}
                    </figure>
                  );
                })}
              </div>
            </section>
          )}

          {imagens.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">{t('Destaques')}</h2>
              <Galeria
                nome={empresa.nome}
                porPagina={imagens.length}
                fotos={imagens.map((info, indice) => ({ id: `info-${info.idinfo ?? indice}`, url: info.arquivo!, legenda: tituloInfo(info.titulo) }))}
              />
            </section>
          )}

          {horarios.length > 0 && (
            <section>
              <h2 className="rotulo-secao mb-4">{t('Horário de funcionamento')}</h2>
              <ul className="divide-y divide-borda rounded-cartao border border-borda text-nota">
                {horarios.map((dia) => {
                  const ehHoje = Number(dia.atual) === 1;
                  return (
                    <li
                      key={dia.idhorfunc}
                      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 ${ehHoje ? 'font-semibold text-texto' : 'text-texto-2'}`}
                    >
                      <span>
                        {dia.nome}
                        {ehHoje && hoje?.aberto !== null && hoje?.aberto !== undefined && (
                          <span className={`ml-2 text-mini ${hoje.aberto ? 'text-aberto' : 'text-fechado'}`}>
                            {hoje.aberto ? t('Aberto agora') : t('Fechado agora')}
                          </span>
                        )}
                      </span>
                      <span>{dia.valor}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
