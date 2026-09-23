import { useState } from 'react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import type { Idioma } from '@/i18n/categorias';
import { cadastrar, useConcluirLogin, type AposEntrar } from '@/lib/conta';

/** Criar conta — os mesmos campos da tela de cadastro do aplicativo. */

/** Para onde cada marcação do texto de aceite aponta: <1> termos, <2> privacidade. */
const LINKS_ACEITE = { '1': '/termos', '2': '/privacidade' } as const;

/**
 * Transforma "Li e aceito os <1>Termos</1> e a <2>Política</2>" em texto com
 * links. A frase inteira é uma chave só (como no app) para a ordem das
 * palavras poder mudar de um idioma para outro.
 */
function textoComLinks(texto: string, idioma: Idioma) {
  return texto.split(/(<[12]>.*?<\/[12]>)/).map((parte, indice) => {
    const marcado = /^<([12])>(.*?)<\/\1>$/.exec(parte);
    if (!marcado) return parte;
    return (
      <a
        key={indice}
        href={href(LINKS_ACEITE[marcado[1] as keyof typeof LINKS_ACEITE], idioma)}
        target="_blank"
        rel="noopener"
        className="font-semibold text-acento-escuro hover:underline"
      >
        {marcado[2]}
      </a>
    );
  });
}

export default function FormCadastro({ aoEntrar, voltarPara, prefixoId = '' }: AposEntrar & { prefixoId?: string }) {
  const t = useT();
  const idioma = useIdioma();
  const concluir = useConcluirLogin({ aoEntrar, voltarPara });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);

    const form = new FormData(evento.currentTarget);
    const senha = String(form.get('senha') ?? '');
    if (senha !== String(form.get('senha2') ?? '')) {
      setErro(t('A confirmação não confere com a nova senha.'));
      return;
    }

    setEnviando(true);
    try {
      const resultado = await cadastrar({
        nome: form.get('nome'),
        email: form.get('email'),
        senha,
        telefone: form.get('telefone'),
        // O checkbox é obrigatório no formulário; a API só registra a data do
        // aceite quando recebe `true`.
        aceitarTermos: form.get('aceitarTermos') === 'on',
      });
      if ('erro' in resultado) {
        setErro(resultado.erro || t('Não foi possível concluir. Tente novamente.'));
        return;
      }
      await concluir(resultado.usuario);
    } catch {
      setErro(t('Não foi possível concluir. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    'campo text-nota';
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor={`${prefixoId}nome`} className={rotulo}>
          {t('Qual o seu nome?')}
        </label>
        <input id={`${prefixoId}nome`} name="nome" required autoComplete="name" className={campo} />
      </div>
      <div>
        <label htmlFor={`${prefixoId}email`} className={rotulo}>
          {t('E-mail')}
        </label>
        <input id={`${prefixoId}email`} name="email" type="email" required autoComplete="email" className={campo} />
      </div>
      <div>
        <label htmlFor={`${prefixoId}telefone`} className={rotulo}>
          {t('Celular com DDD?')}
        </label>
        <input
          id={`${prefixoId}telefone`}
          name="telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={campo}
          placeholder="(35) 99999-9999"
        />
      </div>
      <div>
        <label htmlFor={`${prefixoId}senha`} className={rotulo}>
          {t('Senha')}
        </label>
        <input
          id={`${prefixoId}senha`}
          name="senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={campo}
        />
      </div>
      <div>
        <label htmlFor={`${prefixoId}senha2`} className={rotulo}>
          {t('Repita a senha')}
        </label>
        <input id={`${prefixoId}senha2`} name="senha2" type="password" required autoComplete="new-password" className={campo} />
      </div>

      <label htmlFor={`${prefixoId}aceitarTermos`} className="flex items-start gap-2.5 text-nota text-texto-2">
        <input
          id={`${prefixoId}aceitarTermos`}
          name="aceitarTermos"
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-brand"
        />
        <span>{textoComLinks(t('Li e aceito os <1>Termos de Uso</1> e a <2>Política de Privacidade</2>'), idioma)}</span>
      </label>

      {erro && (
        <p role="alert" className="rounded-cartao bg-erro/10 p-3 text-mini text-erro">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="botao w-full disabled:opacity-60"
      >
        {t('Criar conta')}
      </button>
    </form>
  );
}
