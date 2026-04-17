import Image from 'next/image';

import { SectionHeading } from '@/components/ui';

const technologyItems = [
  { title: 'Mikrokapszula varázslat', icon: '🫧' },
  { title: 'Enzim alapú tisztítás', icon: '🧪' },
  { title: 'Szagsemlegesítés', icon: '🌬️' },
  { title: 'Tartós illat', icon: '🌸' }
];

export function TechnologySection() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Nem egy átlagos mosókapszula</SectionHeading>
        </div>

        <div className="mt-10 grid items-center gap-6 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-10">
          <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50">
              <Image
                src="/aquadrop-product.jpg"
                alt="Aquadrop Expert Pro mosókapszula dobozos kiszerelésben"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 420px"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {technologyItems.map((item) => (
              <article
                className="flex min-h-[132px] h-full items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-sm"
                key={item.title}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-2xl"
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="max-w-[19ch] text-lg font-semibold leading-snug md:text-xl">{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
