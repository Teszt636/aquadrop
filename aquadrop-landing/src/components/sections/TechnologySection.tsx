const technologyItems = [
  { title: 'Mikrokapszula illat technológia', icon: '🫧' },
  { title: 'Enzim alapú tisztítás', icon: '🧪' },
  { title: 'Szagsemlegesítés', icon: '🌬️' },
  { title: 'Hosszan tartó illat', icon: '🌸' }
];

export function TechnologySection() {
  return (
    <section className="ds-section bg-slate-50">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl">Nem egy átlagos mosókapszula</h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {technologyItems.map((item) => (
            <article className="ds-card flex items-center gap-4" key={item.title}>
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-2xl"
              >
                {item.icon}
              </span>
              <div>
                <h3 className="text-xl leading-snug">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
