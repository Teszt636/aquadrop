import Image from 'next/image';

import { SectionHeading } from '@/components/ui';

const technologyItems = [
  { title: 'Mikrokapszula varázslat', icon: '🫧' },
  { title: 'Enzim alapú tisztítás', icon: '🧪' },
  { title: 'Szagsemlegesítés', icon: '🌬️' },
  { title: 'Tartós, prémium illat', icon: '🌸' }
];

const ecoItems = [
  {
    icon: '🌊',
    title: 'Oldódó PVA film',
    description: 'Nem hagy maradványt, teljesen feloldódik – nincs kapszulanyom a ruhákon.'
  },
  {
    icon: '🌱',
    title: 'Biológiailag lebomló összetevők',
    description: 'Környezetkímélő formula, amely csökkenti az ökológiai terhelést.'
  },
  {
    icon: '🌿',
    title: 'Természetes illatanyagok',
    description: 'Friss, tiszta illat agresszív vegyszerek nélkül.'
  },
  {
    icon: '🔒',
    title: 'Újrahasznosítható, biztonságos csomagolás',
    description: 'Strapabíró, gyermekzáras doboz, amely könnyen újrahasznosítható.'
  }
];

export function TechnologySection() {
  return (
    <>
      <section className="ds-section">
        <div className="ds-container">
          <div className="ds-section-heading-wrap">
            <SectionHeading>Mosókapszula különleges tulajdonságokkal</SectionHeading>
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

      <section className="py-16 bg-green-50/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-3xl font-bold mb-4">Környezetbarát választás a mindennapokra</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Az Aquadrop Expert Pro nemcsak hatékony, hanem környezettudatos megoldás is, amely a modern
            háztartások igényeihez igazodik.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecoItems.map((item) => (
              <article
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
