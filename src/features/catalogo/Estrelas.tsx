import { Star } from 'lucide-react';

/** Cinco estrelas com meia estrela (nota 4,5 = quatro cheias e meia). Decorativo. */
export default function Estrelas({ nota, tamanho = 14, className = '' }: { nota: number; tamanho?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-px ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const cheia = nota >= i + 1;
        const meia = !cheia && nota >= i + 0.5;
        return (
          <span key={i} className="relative inline-flex">
            <Star size={tamanho} className={cheia ? 'fill-acento text-acento' : 'text-borda'} />
            {meia && (
              <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <Star size={tamanho} className="fill-acento text-acento" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
