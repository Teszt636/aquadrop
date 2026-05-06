import Link from 'next/link';

export function EnergySavingsSection() {
  return (
    <section className="py-16 md:py-20" id="mosasi-koltseg-kalkulator">
      <div className="ds-container">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-100/80 via-white to-sky-100/80 px-6 py-8 shadow-[0_28px_90px_rgba(6,182,212,0.18)] md:px-10 md:py-10 lg:px-14">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="text-center md:text-left">
                <h2 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 md:mx-0 md:text-5xl">
                  Mennyit spórolhatsz a mosáson?
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700 md:mx-0 md:text-lg">
                  Számold ki, mennyibe kerül egy mosás különböző hőfokokon, és nézd meg, mennyit
                  jelenthet évente az alacsonyabb hőfok.
                </p>

                <p className="mt-6 rounded-2xl border border-cyan-300 bg-white/85 px-5 py-4 text-base font-bold leading-7 text-cyan-950 shadow-sm">
                  20 °C-os mosással akár jelentős energiát takaríthatsz meg - ha a programhossz,
                  a ruhamennyiség és a mosószer is megfelelő.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/mosasi-koltseg-kalkulator"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-700 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-800 hover:shadow-[0_18px_38px_rgba(8,145,178,0.34)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 sm:w-auto"
                  >
                    Megnézem a kalkulátort
                  </Link>

                  <Link
                    href="/hogyan-mossunk-20-fokon"
                    className="inline-flex items-center justify-center text-sm font-bold text-cyan-900 underline decoration-cyan-400 underline-offset-4 transition hover:text-cyan-700 sm:justify-start"
                  >
                    Hogyan működik a 20 fokos mosás?
                  </Link>
                </div>
              </div>

              <aside className="rounded-[1.75rem] border border-cyan-200 bg-white/90 p-5 shadow-[0_24px_60px_rgba(15,118,110,0.14)] backdrop-blur md:p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-800">
                  Gyors előnézet
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-cyan-50/80 px-4 py-3 text-base font-bold text-slate-950">
                    <span>20°C</span>
                    <span>~85 Ft / mosás</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-cyan-50/80 px-4 py-3 text-base font-bold text-slate-950">
                    <span>60°C</span>
                    <span>~195 Ft / mosás</span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50 to-white px-4 py-4 shadow-inner">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-800">
                      Éves különbség
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-950">+22 000 Ft</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
