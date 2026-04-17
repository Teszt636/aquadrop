'use client';

import Image from 'next/image';

const miniTrustItems = ['4 az 1-ben hatás', 'Magas koncentráció', 'Prémium illat'];

export function HeroSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card md:grid-cols-2 md:gap-12 md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light px-3 py-1 text-sm font-semibold text-brand-primary">
              Aquadrop Expert Pro kapszula
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">Prémium mosókapszula, ami nemcsak illatosít, hanem tényleg tisztít</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop Expert Pro magas koncentrációjú formula, amely hatékony tisztítást, friss illatot és megbízható mindennapi teljesítményt ad.
            </p>

            <p className="mt-8 max-w-2xl text-sm leading-6 text-slate-600">
              Az oldalon közvetlen vásárlás nem lehetéseg, a termék viszonteladó partnereinknél vásárolható meg.
            </p>
          </div>

          <div className="relative mt-2 md:mt-0">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-inner">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/hero-aquadrop.png"
                  alt="Aquadrop Expert Pro mosókapszula modern mosógép mellett"
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-4 py-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-100 sm:grid-cols-3 sm:gap-4 sm:px-6">
          {miniTrustItems.map((item) => (
            <p
              key={item}
              className="text-center text-base font-bold text-slate-900 sm:border-r sm:border-slate-200 sm:last:border-r-0"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
