'use client';

import Image from 'next/image';

const miniTrustItems = ['4 az 1-ben hatás', 'Magas koncentráció', 'Prémium illat'];

export function HeroSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container w-full">
        <div className="grid w-full items-center gap-6 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-6 md:grid-cols-2 md:gap-12 md:p-12">
          <div className="min-w-0">
            <h1 className="text-balance max-w-[14ch] break-words text-[2rem] font-bold leading-[1.1] md:max-w-none md:text-5xl md:leading-tight">
              Professzionális tisztaság otthonra
            </h1>

            <p className="mt-3 text-xl font-semibold leading-snug text-slate-800 md:text-2xl">
              Aquadrop Expert Pro mosókapszula
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:mt-5 md:text-lg md:leading-8">
              Magas koncentrációjú formula, amely nem csak illatosít – valóban tisztít, minden
              mosásnál.
            </p>

            <div className="mt-5 grid w-full gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-4 py-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-100 sm:grid-cols-3 sm:gap-4 sm:px-6">
              {miniTrustItems.map((item) => (
                <p
                  key={item}
                  className="text-center text-sm font-bold text-slate-900 sm:text-base sm:border-r sm:border-slate-200 sm:last:border-r-0"
                >
                  {item}
                </p>
              ))}
            </div>

            <a href="#three-paths-heading" className="ds-button-primary mt-6 inline-flex w-full justify-center sm:w-auto">
              Megnézem a lehetőségeket
            </a>

            {/* Desktopon itt jelenjen meg */}
            <p className="mt-8 hidden max-w-2xl text-sm leading-6 text-slate-600 md:block">
              Az oldalon közvetlen vásárlás nem lehetséges, a termék viszonteladó partnereinknél
              vásárolható meg.
            </p>
          </div>

          <div className="relative mt-1 min-w-0 w-full md:mt-0">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="relative w-full rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-inner sm:p-3 md:p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
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

        {/* Mobilon csak itt jelenjen meg */}
        <p className="mt-8 max-w-2xl text-center text-sm leading-6 text-slate-600 md:hidden">
          Az oldalon közvetlen vásárlás nem lehetséges, a termék viszonteladó partnereinknél
          vásárolható meg.
        </p>
      </div>
    </section>
  );
}
