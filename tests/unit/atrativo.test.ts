import { describe, expect, it } from 'vitest';
import {
  abasProximos,
  formatarTelefone,
  fotosDaGaleria,
  horarioDeHoje,
  linkComoChegar,
  linkPerfil,
  linkWhatsapp,
  mediaAvaliacoes,
  numeroWhatsapp,
  separarConteudo,
  tipoSchema,
  tituloInfo,
  urlEmbedVideo,
} from '@/features/catalogo/dados';

/** Regras da página do atrativo — as mesmas do site antigo, agora com teste. */

describe('separarConteudo', () => {
  it('separa texto, imagem e vídeo pelo campo preenchido, como o site antigo', () => {
    const { textos, imagens, videos } = separarConteudo([
      { idinfo: 1, titulo: 'Informações: ', descricao: 'Texto', arquivo: '', video: '' },
      { idinfo: 2, titulo: 'Oferta', descricao: '', arquivo: 'https://x/oferta.jpg', video: '' },
      { idinfo: 3, titulo: 'Vídeo', descricao: '', arquivo: '', video: 'https://www.youtube.com//embed/abc123def' },
      { idinfo: 4, titulo: 'Vazio', descricao: '   ', arquivo: '', video: '' },
    ]);
    expect(textos.map((i) => i.idinfo)).toEqual([1]);
    expect(imagens.map((i) => i.idinfo)).toEqual([2]);
    expect(videos.map((i) => i.idinfo)).toEqual([3]);
  });

  it('aceita lista vazia ou nula', () => {
    expect(separarConteudo(null)).toEqual({ textos: [], imagens: [], videos: [] });
  });
});

describe('tituloInfo', () => {
  it('tira o dois-pontos e os espaços do fim', () => {
    expect(tituloInfo('Informações: ')).toBe('Informações');
    expect(tituloInfo('  Sobre nós ')).toBe('Sobre nós');
    expect(tituloInfo(null)).toBe('');
  });
});

describe('urlEmbedVideo', () => {
  it('normaliza a barra dobrada que a API deixa e aceita youtu.be, watch e ID solto', () => {
    expect(urlEmbedVideo('https://www.youtube.com//embed/abc123def')).toBe('https://www.youtube-nocookie.com/embed/abc123def');
    expect(urlEmbedVideo('https://youtu.be/abc123def')).toBe('https://www.youtube-nocookie.com/embed/abc123def');
    expect(urlEmbedVideo('https://www.youtube.com/watch?v=abc123def&t=10')).toBe('https://www.youtube-nocookie.com/embed/abc123def');
    expect(urlEmbedVideo('abc123def')).toBe('https://www.youtube-nocookie.com/embed/abc123def');
  });

  it('deixa passar um embed de outro serviço', () => {
    expect(urlEmbedVideo('https://player.vimeo.com/video/1')).toBe('https://player.vimeo.com/video/1');
  });
});

describe('mediaAvaliacoes', () => {
  it('média com uma casa decimal; zero sem avaliações', () => {
    expect(mediaAvaliacoes([])).toBe(0);
    expect(mediaAvaliacoes([{ nota: 5 }, { nota: 4 }])).toBe(4.5);
    expect(mediaAvaliacoes([{ nota: '3' }, { nota: 4 }, { nota: 4 }])).toBe(3.7);
  });
});

describe('fotosDaGaleria', () => {
  it('tira a capa (id 0) que a API põe como primeiro item', () => {
    expect(
      fotosDaGaleria([
        { idempresafoto: 0, arquivo: 'capa.jpg' },
        { idempresafoto: 7, arquivo: 'a.jpg' },
        { idempresafoto: 8, arquivo: '' },
      ]),
    ).toEqual([{ id: 7, url: 'a.jpg' }]);
  });
});

describe('abasProximos', () => {
  it('agrupa por categoria na ordem do app e some com aba vazia', () => {
    const abas = abasProximos([
      { idempresa: 1, nome: 'P', capa: null, cidade: null, eavmoda: 2, distancia_km: 1 },
      { idempresa: 2, nome: 'R', capa: null, cidade: null, eavmoda: 4, distancia_km: 2 },
      { idempresa: 3, nome: 'R2', capa: null, cidade: null, eavmoda: 4, distancia_km: 3 },
    ]);
    expect(abas.map((a) => [a.rotulo, a.itens.length])).toEqual([
      ['Restaurantes', 2],
      ['Hospedagens', 1],
    ]);
  });
});

describe('horarioDeHoje', () => {
  const tabela = [
    { idhorfunc: 1, nome: 'Segunda-feira', valor: 'Fechado', atual: 0 },
    { idhorfunc: 2, nome: 'Terça-feira', valor: '09:00 - 17:00', atual: 1 },
  ];

  it('acha o dia de hoje e diz se está aberto agora', () => {
    expect(horarioDeHoje(tabela, new Date(2026, 8, 22, 10, 0))).toEqual({ horario: tabela[1], aberto: true });
    expect(horarioDeHoje(tabela, new Date(2026, 8, 22, 18, 0))).toEqual({ horario: tabela[1], aberto: false });
  });

  it('faixa que vira a madrugada (bar)', () => {
    const bar = [{ idhorfunc: 1, nome: 'Sexta-feira', valor: '18:00 - 02:00', atual: 1 }];
    expect(horarioDeHoje(bar, new Date(2026, 8, 25, 23, 30))?.aberto).toBe(true);
    expect(horarioDeHoje(bar, new Date(2026, 8, 25, 1, 0))?.aberto).toBe(true);
    expect(horarioDeHoje(bar, new Date(2026, 8, 25, 12, 0))?.aberto).toBe(false);
  });

  it('"Fechado" não tem "agora"; sem dia marcado, nada', () => {
    const fechado = [{ idhorfunc: 1, nome: 'Domingo', valor: 'Fechado', atual: 1 }];
    expect(horarioDeHoje(fechado)).toEqual({ horario: fechado[0], aberto: null });
    expect(horarioDeHoje([{ idhorfunc: 1, nome: 'Domingo', valor: '09:00 - 17:00', atual: 0 }])).toBeNull();
    expect(horarioDeHoje(null)).toBeNull();
  });
});

describe('linkComoChegar', () => {
  it('coordenada: Apple Maps no iPhone, Google Maps no resto', () => {
    const empresa = { lat: '-20.6', long: '-46.1', endereco: 'Rod MG 050' };
    expect(linkComoChegar(empresa, true)).toBe('https://maps.apple.com/?daddr=-20.6,-46.1');
    expect(linkComoChegar(empresa, false)).toContain('google.com/maps/dir/?api=1&destination=-20.6,-46.1');
  });

  it('sem coordenada usa o endereço; sem nada, nulo', () => {
    expect(linkComoChegar({ endereco: 'Capitólio, MG' }, false)).toBe('https://www.google.com/maps/search/?api=1&query=Capit%C3%B3lio%2C%20MG');
    expect(linkComoChegar({}, false)).toBeNull();
  });
});

describe('telefones e WhatsApp', () => {
  it('formata celular e fixo', () => {
    expect(formatarTelefone('37999090767')).toBe('(37) 99909-0767');
    expect(formatarTelefone('3733711234')).toBe('(37) 3371-1234');
    expect(formatarTelefone('')).toBe('');
  });

  it('link pronto passa; número solto vira link; número curto não', () => {
    expect(linkWhatsapp('https://api.whatsapp.com/send?phone=5537999090767')).toContain('phone=5537999090767');
    expect(linkWhatsapp('(37) 99909-0767')).toBe('https://api.whatsapp.com/send?phone=5537999090767');
    expect(linkWhatsapp('1234')).toBeNull();
  });

  it('número por extenso a partir do link, sem o 55', () => {
    expect(numeroWhatsapp('https://api.whatsapp.com/send?phone=5537999090767&text=Ol%C3%A1')).toBe('(37) 99909-0767');
    expect(numeroWhatsapp(null)).toBe('');
  });
});

describe('linkPerfil e tipoSchema', () => {
  it('aceita URL completa, domínio ou @usuario', () => {
    expect(linkPerfil('https://www.instagram.com/moradadocarcara', 'https://www.instagram.com')).toBe('https://www.instagram.com/moradadocarcara');
    expect(linkPerfil('@morada', 'https://www.instagram.com')).toBe('https://www.instagram.com/morada');
    expect(linkPerfil('facebook.com/morada', 'https://www.facebook.com')).toBe('https://facebook.com/morada');
    expect(linkPerfil('', 'https://www.instagram.com')).toBeNull();
  });

  it('tipo schema.org por categoria, como no site antigo', () => {
    expect(tipoSchema(2)).toBe('LodgingBusiness');
    expect(tipoSchema(4)).toBe('Restaurant');
    expect(tipoSchema(13)).toBe('Campground');
    expect(tipoSchema(99)).toBe('LocalBusiness');
  });
});
