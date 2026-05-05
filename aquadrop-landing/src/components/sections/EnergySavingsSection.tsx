import Link from 'next/link';

export function EnergySavingsSection() {
  return (
    <section className="py-16 md:py-20" id="mosasi-koltseg-kalkulator">
      <div className="ds-container">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-white/30 bg-transparent p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-6 md:p-8">
            <div className="grid items-start gap-6 md:grid-cols-[1.25fr_0.75fr] md:gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                  Mennyit spórolhatsz a mosáson?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-700 md:mx-0 md:text-lg">
                  Számold ki, mennyibe kerül egy mosás különböző hőfokokon – és nézd meg, mennyit
                  jelent évente a különbség.
                </p>

                <p className="mt-5 rounded-2xl border border-cyan-100/60 bg-white/35 px-4 py-3 text-sm font-semibold leading-6 text-cyan-950 md:text-base">
                  20 °C-os mosással akár jelentős energiát takaríthatsz meg – ha a mosási folyamat
                  is megfelelő.
                </p>

                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link
                    href="/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-900 sm:w-auto"
                  >
                    Megnézem a kalkulátort
                  </Link>

                  <Link
                    href="/hogyan-mossunk-20-fokon"
                    className="text-sm font-semibold text-cyan-900 underline decoration-cyan-300 underline-offset-4 transition hover:text-cyan-700"
                  >
                    Hogyan működik a 20 fokos mosás?
                  </Link>
                </div>
              </div>

              <aside className="rounded-2xl border border-white/40 bg-white/30 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-900/80">
                  Gyors előnézet
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-800 md:text-base">
                  <div className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2">
                    <span className="font-medium">20°C</span>
                    <span className="font-semibold">~85 Ft / mosás</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2">
                    <span className="font-medium">60°C</span>
                    <span className="font-semibold">~195 Ft / mosás</span>
                  </div>
                  <div className="rounded-xl border border-cyan-200/60 bg-cyan-50/70 px-3 py-3 text-cyan-950">
                    <p className="text-xs uppercase tracking-wide text-cyan-800">Éves különbség</p>
                    <p className="mt-1 text-lg font-bold">+22 000 Ft</p>
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
