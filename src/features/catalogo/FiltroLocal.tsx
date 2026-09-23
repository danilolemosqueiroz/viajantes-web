import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import type { Categoria, Idioma } from '@/i18n/categorias';
import { hrefCategoria, hrefDestino } from '@/i18n/caminhos';
import { useGeografia } from '@/lib/consultas';
import type { Destino } from '@/lib/geo/indice';

/**
 * Estado › Região › Cidade, logo abaixo do título da categoria.
 *
 * Região e cidade já têm página própria (`/pousadas/capitolio`), então escolher
 * uma delas NAVEGA para lá; só o estado, que não tem página, filtra o hub pela
 * query `?estado=`. Cidade com o mesmo nome da região cai na região — é o que
 * o índice de geografia decide, e a região contém a cidade.
 */
interface Props {
  categoria: Categoria;
  idioma: Idioma;
  /** Destino da página atual; ausente no hub da categoria. */
  destino?: Destino | null;
  /** Estado escolhido no hub (vem da URL). */
  estadoId?: number | null;
}

export default function FiltroLocal({ categoria, idioma, destino, estadoId }: Props) {
  const t = useT();
  const navegar = useNavigate();
  const { data: geografia } = useGeografia();
  const id = useId();

  const estados = (geografia?.estados ?? []).filter((e) => e.regioes.some((r) => r.quantidade > 0));

  const regiaoAtual =
    destino?.tipo === 'regiao'
      ? destino
      : destino?.tipo === 'cidade'
        ? (geografia?.regioes.find((r) => r.id === destino.regiao?.id) ?? null)
        : null;
  const estadoAtual = destino?.estado?.id ?? estadoId ?? null;
  const cidadeAtual = destino?.tipo === 'cidade' ? destino.id : null;

  const estado = estados.find((e) => e.id === estadoAtual) ?? null;
  const regioes = (estado?.regioes ?? []).filter((r) => r.quantidade > 0);
  const cidades = (regiaoAtual?.cidades ?? []).filter((c) => c.quantidade > 0);

  const hub = hrefCategoria(categoria, idioma);
  const irPara = (slug: string) => navegar(hrefDestino(categoria, slug, idioma));

  const escolherEstado = (valor: string) => {
    navegar(valor ? `${hub}?estado=${valor}` : hub);
  };
  const escolherRegiao = (valor: string) => {
    const regiao = regioes.find((r) => String(r.id) === valor);
    if (regiao) irPara(regiao.slug);
    else escolherEstado(estadoAtual ? String(estadoAtual) : '');
  };
  const escolherCidade = (valor: string) => {
    const cidade = cidades.find((c) => String(c.id) === valor);
    if (cidade) irPara(cidade.slug);
    else if (regiaoAtual) irPara(regiaoAtual.slug);
  };

  const filtrando = Boolean(destino || estadoAtual);
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';

  return (
    <div role="group" aria-label={t('Filtrar por lugar')} className="recuo mt-5 p-4 sm:p-5">
      <p className="flex items-center gap-2 text-mini font-bold uppercase tracking-[0.13em] text-acento-escuro">
        <MapPin size={14} aria-hidden="true" />
        {t('Onde você vai?')}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-estado`} className={rotulo}>{t('Estado')}</label>
          <select id={`${id}-estado`} className="seletor" value={estadoAtual ?? ''} onChange={(e) => escolherEstado(e.target.value)}>
            <option value="">{t('Todos os estados')}</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-regiao`} className={rotulo}>{t('Região')}</label>
          <select
            id={`${id}-regiao`}
            className="seletor"
            value={regiaoAtual?.id ?? ''}
            disabled={!estado}
            onChange={(e) => escolherRegiao(e.target.value)}
          >
            <option value="">{estado ? t('Todas as regiões') : t('Escolha o estado')}</option>
            {regioes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-cidade`} className={rotulo}>{t('Cidade')}</label>
          <select
            id={`${id}-cidade`}
            className="seletor"
            value={cidadeAtual ?? ''}
            disabled={!regiaoAtual || cidades.length === 0}
            onChange={(e) => escolherCidade(e.target.value)}
          >
            <option value="">{regiaoAtual ? t('Todas as cidades') : t('Escolha a região')}</option>
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrando && (
        <button
          type="button"
          onClick={() => navegar(hub)}
          className="mt-3 text-nota font-semibold text-acento-escuro hover:underline"
        >
          {t('Limpar filtro')}
        </button>
      )}
    </div>
  );
}
