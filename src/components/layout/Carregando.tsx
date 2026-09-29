/** Espera entre telas, com a altura de uma dobra para o rodapé não pular a cada navegação. */
export default function Carregando({ altura = 'min-h-[60vh]' }: { altura?: string }) {
  return (
    <div className={`folha flex ${altura} items-center justify-center py-20`} role="status" aria-live="polite">
      <span className="size-8 animate-spin rounded-pilula border-2 border-borda border-t-brand" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
