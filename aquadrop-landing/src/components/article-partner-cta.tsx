import Link from 'next/link';

export function ArticlePartnerCta() {
  return (
    <section className="rounded-[28px] border border-white/65 bg-white/60 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800/85">B2B</p>
          <h2 className="text-2xl leading-tight md:text-3xl">Viszonteladóknak</h2>
          <p className="text-slate-700">
            Ha prémium, könnyen kommunikálható és alacsony hőfokú mosásnál is erős terméket keresel kínálatodba,
            ismerd meg az Aquadrop partnerprogramját.
          </p>
        </div>

        <Link
          href="/partner"
          className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-200 bg-white/85 px-5 py-3 text-sm font-semibold text-brand-primary transition hover:border-cyan-300 hover:bg-white md:w-auto"
        >
          Megnézem a partnerprogramot
        </Link>
      </div>
    </section>
  );
}
