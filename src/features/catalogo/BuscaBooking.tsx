import { useEffect, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { useT } from '@/i18n/Traducao';
import { buscar } from '@/lib/api';
import type { Destino } from '@/lib/geo/indice';
import { filtroDoDestino } from '@/lib/geo/indice';

/** Busca de hospedagem no Booking.com (afiliado CJ) onde o destino não tem pousada cliente.
 * Contrato da API: viajantes-node-api/docs/hospedagem-booking.md */

interface RespostaBooking {
  mostrar: boolean;
  destino: string;
  url: string;
}

/** `null` enquanto a API decide; `false` quando há pousada cliente (a página mostra o vazio comum). */
export function useBuscaBooking(destino: Destino, ligada: boolean) {
  return useQuery<RespostaBooking>({
    queryKey: ['hospedagem-booking', destino.tipo, destino.id],
    queryFn: () => buscar<RespostaBooking>('/site/hospedagem-booking', filtroDoDestino(destino)),
    enabled: ligada,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface Props {
  destino: Destino;
  /** Retorno de `useBuscaBooking`; com erro, o bloco vira só o botão. */
  dados?: RespostaBooking;
  comErro?: boolean;
}

export default function BuscaBooking({ destino, dados, comErro }: Props) {
  const t = useT();
  const id = useId();
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [adultos, setAdultos] = useState(2);
  const [criancas, setCriancas] = useState(0);
  const [idades, setIdades] = useState<number[]>([]);
  // O link é refeito a cada mudança: assim o botão é um <a> comum, que o bloqueador de pop-up deixa abrir.
  const [url, setUrl] = useState<string | null>(dados?.url ?? null);

  const mudarCriancas = (n: number) => {
    setCriancas(n);
    setIdades((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? 8));
  };

  useEffect(() => {
    if (comErro) return;
    let vivo = true;
    const query: Record<string, string | number> = {
      ...filtroDoDestino(destino),
      adultos,
      criancas,
      idades: idades.join(','),
    };
    if (checkin && checkout) Object.assign(query, { checkin, checkout });
    buscar<RespostaBooking>('/site/hospedagem-booking', query)
      .then((r) => vivo && r.url && setUrl(r.url))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [destino, checkin, checkout, adultos, criancas, idades, comErro]);

  // Sem API: ainda leva ao Booking, mesmo sem o rastreio.
  const href = url ?? montarUrlBookingDireta(destino);
  const rotulo = 'mb-1 block text-mini font-semibold text-texto-2';
  const botao = (
    <a href={href} target="_blank" rel="noopener sponsored" className="botao-acao w-full sm:w-auto">
      <Search size={16} aria-hidden="true" />
      {t('Buscar hospedagens')}
    </a>
  );

  if (comErro) {
    return (
      <div className="recuo p-6 text-center sm:p-10">
        <h2 className="text-secao font-bold text-brand">{t('Encontre hospedagens para sua viagem')}</h2>
        <p className="mt-2 text-texto-2">{t('Ainda não temos pousadas parceiras em {{destino}}.', { destino: destino.nome })}</p>
        <div className="mt-5">{botao}</div>
        <p className="mt-3 text-mini text-texto-3">{t('Você será levado ao Booking.com')}</p>
      </div>
    );
  }

  return (
    <div className="recuo p-5 sm:p-8">
      <h2 className="text-secao font-bold text-brand">
        {t('Encontre uma hospedagem em {{destino}}', { destino: destino.nome })}
      </h2>
      <p className="mt-2 text-texto-2">
        {t('Ainda não temos pousadas parceiras aqui. Busque no Booking.com com as datas da sua viagem.')}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <span className={rotulo}>{t('Destino')}</span>
          <p className="campo flex items-center gap-2 bg-cartao text-texto">
            <MapPin size={16} className="shrink-0 text-acento" aria-hidden="true" />
            <span className="truncate">{dados?.destino ?? destino.nome}</span>
          </p>
        </div>
        <div>
          <label htmlFor={`${id}-in`} className={rotulo}>{t('Check-in')}</label>
          <input id={`${id}-in`} type="date" className="campo" min={hoje()} value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${id}-out`} className={rotulo}>{t('Check-out')}</label>
          <input id={`${id}-out`} type="date" className="campo" min={checkin || hoje()} value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        <div>
          <span className={rotulo}>{t('Hóspedes')}</span>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="sr-only">{t('Adultos')}</span>
              <select className="seletor" value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {t(n === 1 ? 'adulto' : 'adultos')}</option>
                ))}
              </select>
            </label>
            <label className="flex-1">
              <span className="sr-only">{t('Crianças')}</span>
              <select className="seletor" value={criancas} onChange={(e) => mudarCriancas(Number(e.target.value))}>
                {Array.from({ length: 7 }, (_, i) => i).map((n) => (
                  <option key={n} value={n}>{n} {t(n === 1 ? 'criança' : 'crianças')}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {idades.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {idades.map((idade, i) => (
            <label key={i} className="flex items-center gap-2 text-mini text-texto-2">
              {t('Idade da criança {{n}}', { n: i + 1 })}
              <select
                className="seletor w-auto"
                value={idade}
                onChange={(e) => setIdades((prev) => prev.map((x, j) => (j === i ? Number(e.target.value) : x)))}
              >
                {Array.from({ length: 18 }, (_, a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Users size={16} className="hidden text-texto-3 sm:block" aria-hidden="true" />
        <CalendarDays size={16} className="hidden text-texto-3 sm:block" aria-hidden="true" />
        {botao}
        <p className="text-mini text-texto-3">{t('Você será levado ao Booking.com')}</p>
      </div>
    </div>
  );
}

function montarUrlBookingDireta(destino: Destino): string {
  const ss = [destino.nome, destino.estado?.nome, 'Brasil'].filter(Boolean).join(', ');
  return `https://www.booking.com/searchresults.pt-br.html?${new URLSearchParams({ ss, lang: 'pt-br' })}`;
}
