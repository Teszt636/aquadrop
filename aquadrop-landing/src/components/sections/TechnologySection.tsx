import { SectionHeading } from '@/components/ui';

const technologyItems = [
  { title: 'Mikrokapszula illat technológia', icon: '🫧' },
  { title: 'Enzim alapú tisztítás', icon: '🧪' },
  { title: 'Szagsemlegesítés', icon: '🌬️' },
  { title: 'Hosszan tartó illat', icon: '🌸' }
];

export function TechnologySection() {
  return (
    <section className="ds-section ds-section-quiet">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Nem egy átlagos mosókapszula</SectionHeading>
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
