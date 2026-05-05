import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container w-full">
        <div className="grid w-full items-center gap-8 rounded-3xl border border-white/40 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:p-6 md:grid-cols-2 md:gap-12 md:p-12">
          <div className="min-w-0">

            <h1 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
              Aquadrop Expert Pro mosókapszula
            </h1>
            <h2 className="mt-3 break-words text-4xl leading-tight md:text-5xl">
              Professzionális tisztaság otthonra
            </h2>
            <p className="mt-4 break-words text-3xl leading-tight md:text-4xl">
              Aquadrop Expert Pro mosókapszula
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop Expert Pro magas koncentrációjú formula, amely hatékony tisztítást,
              friss illatot és megbízható mindennapi teljesítményt ad.
            </p>

            {/* Desktopon itt jelenjen meg */}
            <p className="mt-10 hidden max-w-2xl text-sm leading-6 text-slate-600 md:block">
              Az oldalon közvetlen vásárlás nem lehetséges, a termék viszonteladó partnereinknél
              vásárolható meg.
            </p>
          </div>

          <div className="relative mt-0 min-w-0 w-full md:mt-0">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="relative w-full rounded-[2rem] border border-white/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/aquadrop-mosokapszula-hero.webp"
                  alt="Aquadrop Expert Pro prémium mosókapszula"
                  width={900}
                  height={700}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>



        {/* Mobilon csak itt jelenjen meg */}
        <p className="mt-10 max-w-2xl text-center text-sm leading-6 text-slate-600 md:hidden">
          Az oldalon közvetlen vásárlás nem lehetséges, a termék viszonteladó partnereinknél
          vásárolható meg.
        </p>
      </div>
    </section>
  );
}
