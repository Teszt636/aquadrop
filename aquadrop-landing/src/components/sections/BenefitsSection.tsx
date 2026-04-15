const benefits = [
  { title: 'Magas koncentráció', icon: '💧' },
  { title: 'Gyors oldódás', icon: '⚡' },
  { title: 'Folteltávolítás', icon: '✨' },
  { title: 'Frissesség és színvédelem', icon: '🛡️' }
];

export function BenefitsSection() {
  return (
    <section className="ds-section bg-white">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl">Amit minden mosásnál tapasztalni fogsz</h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article className="ds-card flex h-full flex-col items-start gap-4" key={benefit.title}>
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl"
              >
                {benefit.icon}
              </span>
              <h3 className="text-xl leading-snug">{benefit.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
