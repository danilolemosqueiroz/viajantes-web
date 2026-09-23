import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useIdioma, useT } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';

/** A barra de busca do aplicativo, com o mesmo desenho. */
export default function PilulaBusca({ id }: { id: string }) {
  const t = useT();
  const idioma = useIdioma();
  const navegar = useNavigate();
  const [termo, setTermo] = useState('');

  return (
    <form
      className="pilula-busca"
      role="search"
      onSubmit={(evento) => {
        evento.preventDefault();
        const limpo = termo.trim();
        if (limpo) navegar(`${href('/busca', idioma)}?q=${encodeURIComponent(limpo)}`);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {t('Buscar')}
      </label>
      <input
        id={id}
        type="search"
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        placeholder={t('Buscar cachoeira, pousada, cidade...')}
      />
      <button type="submit" aria-label={t('Buscar')}>
        <Search size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
