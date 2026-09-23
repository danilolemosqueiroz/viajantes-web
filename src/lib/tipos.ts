/**
 * Formato dos dados que a API devolve.
 *
 * Copiado dos payloads reais (`/site/empresas`, `/site/empresa/:id`,
 * `/site/roteiros`, `/site/geografia`, `/site/usuario/me`). Onde a API é
 * inconsistente entre listagem e detalhe, o campo aparece como opcional em vez
 * de virar duas verdades — quem consome trata a ausência.
 */

/**
 * Bloco de conteúdo da empresa. No detalhe vem numa lista só, e o que diz o
 * tipo é o campo preenchido: `descricao` (texto), `arquivo` (imagem) ou
 * `video` (YouTube). Na listagem (`informacoes`) só há texto, com `posicao`.
 */
export interface Info {
  idinfo?: number;
  titulo: string;
  descricao: string;
  posicao?: number;
  arquivo?: string | null;
  video?: string | null;
}

/** Um dia da tabela de horários. `valor` é "09:00 - 17:00" ou "Fechado". */
export interface Horario {
  idhorfunc: number;
  nome: string;
  valor: string;
  /** 1 no dia de hoje (calculado pela API). */
  atual: number;
}

/** Foto da galeria. A capa vem como primeiro item, com `idempresafoto: 0`. */
export interface FotoEmpresa {
  idempresafoto: number;
  arquivo: string;
  miniatura?: string;
  posicao?: number;
}

export interface Telefone {
  idtelefone: number;
  numero: string;
  descricao: string;
}

/** Empresa como vem na LISTAGEM (`/site/empresas/{pagina}`). */
export interface EmpresaResumo {
  idempresa: number;
  nome: string;
  /** Tipo do atrativo. Só vem em algumas listagens (busca, favoritos). */
  eavmoda?: number | null;
  endereco: string | null;
  cidade: string | null;
  capa: string | null;
  logotipo: string | null;
  telefone1: string | null;
  whatsapp: string | null;
  nota: number | null;
  aberto: number | null;
  horario: string | null;
  informacoes: Info[] | null;
  destaquesite: number | null;
  complexo: number | null;
  total_atrativos: number | null;
  fotosFilhos: string[] | null;
  lat: string | null;
  long: string | null;
  possui_desconto?: number | null;
  desconto_percentual?: number | null;
}

/** Empresa como vem no DETALHE (`/site/empresa/:id`). */
export interface Empresa {
  idempresa: number;
  nome: string;
  eavmoda: number | null;
  descricao: string | null;
  endereco: string | null;
  cidade_nome: string | null;
  regiao_nome: string | null;
  estado_nome: string | null;
  regiao_idregiao: number | null;
  cidade_idcidade: number | null;
  capa: string | null;
  logotipo: string | null;
  fotos: FotoEmpresa[] | null;
  telefone1: string | null;
  telefone2?: string | null;
  telefone3?: string | null;
  /** Já formatados pela API; `idtelefone` 1..3 = telefones, 4 = o WhatsApp. */
  telefones: Telefone[] | null;
  /** Link pronto do WhatsApp (com a mensagem de apresentação). */
  whatsapp: string | null;
  email: string | null;
  site: string | null;
  urlfacebook: string | null;
  urlinstagram: string | null;
  /** Reserva por afiliado (Booking etc.): vira o botão "Reservar". */
  linkafiliado?: string | null;
  lat: string | null;
  long: string | null;
  coordenada: string | null;
  /** É o status de cadastro, não "aberto agora" — para isso, `horarios`. */
  aberto: number | null;
  horario: string | null;
  horarios: Horario[] | null;
  infos: Info[] | null;
  /** A API do detalhe manda 0 fixo: a nota real sai da lista de avaliações. */
  nota: number | null;
  exibeavaliacao: number | null;
  tags?: string | null;
  acesso: string | null;
  dificuldade: string | null;
  complexo: number | null;
  total_atrativos: number | null;
  filhos: EmpresaResumo[] | null;
  anunciante: number | null;
}

export interface Avaliacao {
  idavaliacao: number;
  nome: string;
  foto: string | null;
  nota: number;
  mensagem: string | null;
  data?: string | null;
}

/** Atrativo próximo (`/site/empresa/:id/atrativos`), até 30 km, com distância. */
export interface AtrativoProximo {
  idempresa: number;
  nome: string;
  capa: string | null;
  logotipo?: string | null;
  cidade: string | null;
  endereco?: string | null;
  /** Categoria (2 hospedagem, 3 cachoeira, 4 restaurante) — monta as abas. */
  eavmoda: number | null;
  distancia_km: number | null;
  categorias?: string[];
}

// ── Geografia (`/site/geografia`) ───────────────────────────────────────────

export interface CidadeGeo {
  idcidade: number;
  nome: string;
  quantidade: number;
}

export interface RegiaoGeo {
  idregiao: number;
  nome: string;
  tituloturistico: string | null;
  foto: string | null;
  quantidade: number;
  cidades: CidadeGeo[];
}

export interface EstadoGeo {
  idestado: number;
  nome: string;
  foto: string | null;
  regioes: RegiaoGeo[];
}

export interface Geografia {
  estados: EstadoGeo[];
}

// ── Roteiros prontos (`/site/roteiros`) ─────────────────────────────────────

export interface CidadeRoteiro {
  idcidade: number;
  nome: string;
  idregiao: number;
  nome_regiao?: string | null;
}

export interface RegiaoRoteiro {
  idregiao: number;
  nome: string;
  idestado?: number | null;
  nome_estado?: string | null;
}

export interface Roteiro {
  idroteiro_personalizado: number;
  titulo: string;
  descricao: string | null;
  foto_capa: string | null;
  total_dias: number | null;
  ativo: number;
  destaque: number;
  visualizacoes: number;
  regiao_idregiao: number | null;
  cidade_idcidade: number | null;
  nome_regiao?: string | null;
  nome_cidade?: string | null;
  cidades?: CidadeRoteiro[];
  regioes?: RegiaoRoteiro[];
}

export interface RoteiroItem {
  idroteiro_personalizado_item: number;
  roteiro_personalizado_idroteiro: number;
  dia: number;
  horario: string | null;
  titulo: string;
  descricao: string | null;
  link_externo: string | null;
  link_interno_empresa_id: number | null;
  foto: string | null;
  icone: string | null;
  cor_badge: string | null;
  ordem: number;
  /** Do atrativo ligado ao item (para linkar a página dele). */
  empresa_eavmoda?: number | null;
  empresa_nome?: string | null;
}

// ── Plano Viajantes (`/site/assinatura`) ────────────────────────────────────

export type Periodicidade = 'mensal' | 'anual';

/** Um plano da tabela `assinatura` — os mesmos que o app vende nas lojas. */
export interface PlanoSite {
  idassinatura: number;
  nome: string;
  descricao: string | null;
  valor: number;
  periodicidade: Periodicidade;
  parcelas_max: number;
}

/** A assinatura ativa da conta, venha da loja (app) ou do site. */
export interface AssinaturaAtiva {
  plano: string;
  periodicidade: Periodicidade;
  data_inicio: string | null;
  data_expiracao: string | null;
  origem: 'ios' | 'android' | 'site';
  auto_renovacao: boolean;
}

export interface AssinaturaSite {
  logado: boolean;
  assinado: boolean;
  assinatura: AssinaturaAtiva | null;
  planos: PlanoSite[];
}

export interface PixCompra {
  qr_code: string;
  qr_code_url: string;
  copia_cola: string;
  expira_em: string | null;
}

export type StatusCompraPlano = 'pendente' | 'pago' | 'cancelado' | 'expirado';

/** Resposta de `POST /site/assinatura/compra`. */
export interface CompraPlano {
  ok: boolean;
  idcompra: number;
  status: StatusCompraPlano;
  statuspm?: string | null;
  pix?: PixCompra | null;
}

/** `/site/assinatura/compras/:idcompra` — o polling do Pix. */
export interface StatusCompra {
  idcompra: number;
  plano_id: number;
  status: StatusCompraPlano;
  statuspm: string | null;
  metodo: 'credit_card' | 'pix';
  parcelas: number;
  valor_total: number;
  data_pagamento: string | null;
  pix: PixCompra | null;
  assinatura?: AssinaturaAtiva | null;
}

/** `/site/assinatura/compras` — compra paga no site. */
export interface CompraFeita {
  idcompra: number;
  status: StatusCompraPlano;
  valor_total: number;
  metodo: 'credit_card' | 'pix';
  parcelas: number;
  data_compra: string;
  data_pagamento: string | null;
  plano: string;
  periodicidade: Periodicidade;
  data_inicio: string | null;
  data_expiracao: string | null;
}

// ── Usuário ─────────────────────────────────────────────────────────────────

/** Payload de sessão — o mesmo que o app guarda, sem o hash. */
export interface UsuarioSessao {
  idusuario: number;
  nome: string;
  sobrenome: string | null;
  email: string;
  foto: string;
  telefone: string | null;
  cpf: string | null;
  dtnascimento: string | null;
  nivel: string | null;
  pontos: number | null;
  cupom: string | null;
  emailVerificado?: boolean;
  cadastroCompleto: boolean;
  faltando: string[];
  usuarioNovo?: number;
}

/** Item do ranking de mapeadores (`/site/rankingUsuarios`). */
export interface Mapeador {
  idusuario: number;
  nome: string;
  foto: string | null;
  nivel: string | null;
  pontos_total: number;
  total_atrativos_aprovados: number;
  especialista_regiao: string | null;
}

/** Banner do rodapé (`/site/destaques`). */
export interface Destaque {
  iddestaque: number;
  titulo: string | null;
  fotodestaque: string;
  link: string | null;
  idempresa: number | null;
}
