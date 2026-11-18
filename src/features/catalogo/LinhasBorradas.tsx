const LARGURAS = ['96%', '88%', '92%', '70%', '84%', '60%'];

/** Texto fingido sob um título bloqueado: o texto real nem chega ao navegador. */
export default function LinhasBorradas({ n }: { n: number }) {
  return (
    <div className="mt-2 space-y-2" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="h-3 rounded bg-neutral-200 blur-[3px]" style={{ width: LARGURAS[i % LARGURAS.length] }} />
      ))}
    </div>
  );
}
