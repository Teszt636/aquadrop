import Image from 'next/image';

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

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1.15fr)] lg:gap-10">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-card sm:p-5 lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50">
              <Image
                src="/images/product-box-photo.svg"
                alt="Aquadrop Expert Pro mosókapszula dobozos kiszerelésben"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 40vw"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
      </div>
    </section>
  );
}
