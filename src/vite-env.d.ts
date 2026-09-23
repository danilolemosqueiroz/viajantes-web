/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base da API Node, ex.: https://nahoraapp.com.br/viajantes/api */
  readonly VITE_API_URL: string;
  /** Mesma `SITE_KEY` do .env da API (vai no pacote, como no aplicativo). */
  readonly VITE_API_SITE_KEY: string;
  /** Web Client ID do Google (projeto 313706555234). */
  readonly VITE_GOOGLE_WEB_CLIENT_ID: string;
  /**
   * Services ID do Sign in with Apple para a web (br.com.mediaplus.nahoraapp.web),
   * agrupado com o App ID do aplicativo. Vazio = botão da Apple escondido.
   */
  readonly VITE_APPLE_SERVICES_ID?: string;
  /** Endereço de retorno cadastrado no Services ID. Vazio = a raiz do site. */
  readonly VITE_APPLE_REDIRECT_URI?: string;
  /** Chave PÚBLICA do pagar.me: tokeniza o cartão no navegador. Vazia = sem venda de roteiro. */
  readonly VITE_PAGARME_PUBLIC_KEY?: string;
  /** Base da Central de Ofertas (projeto separado). Tem valor padrão no código. */
  readonly VITE_OFERTAS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
