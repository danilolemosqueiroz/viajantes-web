import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { IDIOMAS, IDIOMAS_INFO, type Idioma } from '@/i18n/categorias';
import { useIdioma } from '@/i18n/Traducao';
import { caminhoEmOutroIdioma } from '@/i18n/caminhos';

/** Troca de idioma mantendo a pessoa na mesma página (empresa, categoria, destino...), com o caminho traduzido. */
export default function SeletorIdioma() {
  const atual = useIdioma();
  const navegar = useNavigate();
  const { pathname, search } = useLocation();
  const [aberto, setAberto] = useState(false);

  function trocar(novo: Idioma) {
    setAberto(false);
    if (novo === atual) return;
    navegar(`${caminhoEmOutroIdioma(pathname, atual, novo)}${search}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="flex min-h-10 items-center gap-1 rounded-pilula px-2.5 text-mini font-semibold text-texto-2 transition hover:bg-brand-suave hover:text-brand"
      >
        <Globe size={16} aria-hidden="true" />
        {atual.toUpperCase()}
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-44 overflow-hidden rounded-cartao border border-borda bg-cartao py-1 shadow-flutua"
        >
          {IDIOMAS.map((idioma) => (
            <li key={idioma}>
              <button
                type="button"
                role="option"
                aria-selected={idioma === atual}
                onClick={() => trocar(idioma)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-nota transition hover:bg-brand-suave ${
                  idioma === atual ? 'font-semibold text-brand' : 'text-texto-2'
                }`}
              >
                <span aria-hidden="true">{IDIOMAS_INFO[idioma].bandeira}</span>
                {IDIOMAS_INFO[idioma].nomeNativo}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
