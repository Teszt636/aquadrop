import Link from 'next/link';

export function HomeResellerCta() {
  return (
    <section className="pb-8 md:pb-12" aria-labelledby="home-reseller-cta-title">
      <div className="ds-container">
        <div className="mx-auto grid max-w-5xl gap-6 rounded-[28px] border border-white/55 bg-white/65 px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-md md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 md:px-9 md:py-7">
          <div className="space-y-2.5">
            <h2 id="home-reseller-cta-title" className="text-2xl leading-tight text-slate-900 md:text-[1.75rem]">
              Viszonteladóknak
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-700 md:text-base">
              Ha prémium, könnyen kommunikálható és alacsony hőfokú mosásnál is erős terméket keresel kínálatodba,
              ismerd meg az Aquadrop partnerprogramját.
            </p>
            <p className="text-xs font-medium text-slate-600/90 md:text-sm">
              Marketingtámogatással és szakmai onboardinggal.
            </p>
          </div>

          <Link
            href="/partner"
            className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-200/80 bg-white/90 px-5 py-3 text-sm font-semibold text-brand-primary transition-colors hover:border-cyan-300 hover:bg-white md:w-auto md:min-w-[230px]"
          >
            Megnézem a partnerprogramot
          </Link>
        </div>
      </div>
    </section>
  );
}
