import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '@/lib/api';
import { href } from '@/i18n/caminhos';
import { useIdioma } from '@/i18n/Traducao';
import { gravarSessao, lerSessao, limparSessao } from '@/lib/sessao';
import type { UsuarioSessao } from '@/lib/tipos';

/**
 * Conta do visitante — a MESMA do aplicativo.
 *
 * O site fala com as rotas `/site/*` da API, que reaproveitam os controles do
 * app (login, cadastro, recuperação de senha, verificação de e-mail). O que o
 * login devolve é um `hash` de sessão; ele fica no navegador e vai no
 * cabeçalho `Passport` a cada chamada, como no aplicativo.
 */
type ComHash = UsuarioSessao & { hash: string };

/** Quem está logado agora. `null` quando não há sessão ou ela expirou. */
export function useUsuario() {
  return useQuery<UsuarioSessao | null>({
    queryKey: ['usuario'],
    queryFn: async () => {
      if (!lerSessao()) return null;
      const resposta = await apiGet<UsuarioSessao>('/site/usuario/me');
      if (!resposta.ok || !resposta.data?.idusuario) {
        // Sessão recusada (401) é sessão morta: some com ela.
        if (resposta.status === 401) limparSessao();
        return null;
      }
      return resposta.data;
    },
    staleTime: 60 * 1000,
  });
}

/** Recarrega o usuário depois de entrar, sair ou mudar os dados. */
export function useAtualizarUsuario() {
  const cliente = useQueryClient();
  return () => cliente.invalidateQueries({ queryKey: ['usuario'] });
}

async function autenticar(caminho: string, corpo: unknown): Promise<{ usuario: UsuarioSessao } | { erro: string }> {
  const resposta = await apiPost<ComHash>(caminho, corpo, { comSessao: false });
  if (!resposta.ok) return { erro: resposta.erro };
  const { hash, ...usuario } = resposta.data;
  if (hash) gravarSessao(hash);
  return { usuario };
}

export const entrar = (email: string, senha: string) => autenticar('/site/auth/login', { email, senha });

export const cadastrar = (dados: Record<string, unknown>) => autenticar('/site/auth/cadastro', dados);

/**
 * O botão do Google devolve um `credential` (o id_token); a API — a mesma rota
 * do aplicativo — lê esse token no campo `idtoken`.
 */
export const entrarComGoogle = (credential: string) => autenticar('/site/auth/google', { idtoken: credential });

/**
 * Apple: o `identityToken` que o Sign in with Apple JS devolve no navegador.
 * O nome só chega na PRIMEIRA autorização (a Apple não o põe no token), e a
 * API só o usa para criar a conta — nunca para sobrescrever um nome gravado.
 */
export const entrarComApple = (identityToken: string, nome: string) =>
  autenticar('/site/auth/apple', { identityToken, nome });

/** Páginas da conta para onde um login feito numa tela de conta pode levar. */
export type DestinoConta = '/conta' | '/conta/meus-dados' | '/conta/favoritos' | '/conta/roteiros';

/** O que fazer depois que alguém entra. */
export interface AposEntrar {
  /**
   * Chamado em vez de navegar: o login feito dentro do modal de um atrativo
   * fecha o modal e deixa a pessoa exatamente onde ela estava.
   */
  aoEntrar?: (usuario: UsuarioSessao) => void;
  /** Sem `aoEntrar`: a página da conta para onde ir. */
  voltarPara?: DestinoConta;
}

/**
 * Fim comum a TODOS os jeitos de entrar (e-mail, cadastro, Google, Apple):
 * recarrega o usuário e decide para onde a pessoa vai. Numa tela de conta, o
 * cadastro incompleto manda para "Meus dados", como no aplicativo.
 */
export function useConcluirLogin({ aoEntrar, voltarPara }: AposEntrar = {}) {
  const cliente = useQueryClient();
  const navegar = useNavigate();
  const idioma = useIdioma();

  return async (usuario: UsuarioSessao) => {
    await cliente.invalidateQueries({ queryKey: ['usuario'] });
    if (aoEntrar) {
      aoEntrar(usuario);
      return;
    }
    const destino = usuario.cadastroCompleto === false ? '/conta/meus-dados' : (voltarPara ?? '/conta');
    navegar(href(destino, idioma), { replace: true });
  };
}

export async function sair(): Promise<void> {
  await apiPost('/site/auth/sair', {}).catch(() => undefined);
  limparSessao();
}

export async function recuperarSenha(email: string): Promise<{ ok: boolean; erro?: string }> {
  const resposta = await apiPost('/site/auth/recuperar-senha', { email }, { comSessao: false });
  // Resposta neutra de propósito: não revela se o e-mail existe.
  return resposta.ok ? { ok: true } : { ok: false, erro: resposta.erro };
}
