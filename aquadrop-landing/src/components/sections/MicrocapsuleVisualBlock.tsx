export function MicrocapsuleVisualBlock() {
  const particles = [
    { id: 1, position: 'left-[22%] top-[24%]', delay: '0ms' },
    { id: 2, position: 'right-[24%] top-[28%]', delay: '140ms' },
    { id: 3, position: 'left-[20%] bottom-[30%]', delay: '260ms' },
    { id: 4, position: 'right-[22%] bottom-[24%]', delay: '80ms' }
  ];

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="group relative overflow-hidden rounded-[1.8rem] border border-sky-100/90 bg-gradient-to-br from-white via-sky-50/80 to-cyan-50/80 p-6 shadow-[0_20px_50px_-30px_rgba(14,116,144,0.45)] md:p-7">
        <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-4 h-44 w-44 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative flex min-h-[300px] items-center justify-center rounded-3xl border border-white/70 bg-white/65 px-5 py-7 backdrop-blur-sm transition duration-500 ease-out group-hover:bg-white/75 group-focus-within:bg-white/75">
          <div className="pointer-events-none absolute inset-0">
            <div className="microcapsule-ring microcapsule-ring-sm" />
            <div className="microcapsule-ring microcapsule-ring-md" />
            <div className="microcapsule-ring microcapsule-ring-lg" />

            {particles.map((particle) => (
              <span
                key={particle.id}
                style={{ animationDelay: particle.delay }}
                className={`microcapsule-particle ${particle.position}`}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            <button
              type="button"
              className="microcapsule-core inline-flex h-28 w-28 items-center justify-center rounded-full border border-cyan-100/80 bg-[radial-gradient(circle_at_30%_25%,#ecfeff_0%,#dbeafe_45%,#bfdbfe_100%)] text-5xl text-cyan-700 shadow-[0_12px_36px_-18px_rgba(14,116,144,0.8)] transition duration-500 ease-out group-hover:scale-110 group-focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label="Súrlódásra aktiválódó illat vizualizáció"
            >
              ◉
            </button>

            <p className="rounded-full border border-cyan-100/80 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-cyan-800 opacity-90 transition duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
              Súrlódásra aktiválódó illat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
