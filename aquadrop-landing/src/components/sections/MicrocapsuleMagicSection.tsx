import { SectionHeading } from '@/components/ui';

const benefits = [
  'Friss illat egész nap',
  'Nem tűnik el gyorsan',
  'Minden mozdulatnál aktiválódik',
  'Prémium illatélmény'
];

export function MicrocapsuleMagicSection() {
  return (
    <section className="ds-section bg-gradient-to-r from-sky-50/90 via-cyan-50/70 to-indigo-50/80">
      <div className="ds-container">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12">
          <div className="space-y-5">
            <div className="space-y-3">
              <SectionHeading>
                Mikrokapszula varázslat – az illat, ami újra és újra aktiválódik
              </SectionHeading>
              <p className="text-lg font-semibold leading-relaxed text-brand-secondary md:text-xl">
                Nem csak illatosít – életre kel az illat minden mozdulatnál
              </p>
            </div>

            <div className="space-y-4">
              <p>A legtöbb mosószer egyszerűen illatosít – de az illat gyorsan eltűnik.</p>
              <p>
                Az Aquadrop Expert Pro egy fejlettebb megoldást használ: mikrokapszulás
                illattechnológiát.
              </p>
              <p>
                Ez a technológia azon az elven működik, hogy az illatanyagokat mikroszkopikus
                kapszulákba zárják, amelyek a mosás során a textilhez tapadnak.
              </p>
              <p>
                Amikor viseled a ruhát, mozogsz vagy hozzáérsz az anyaghoz, a kapszulák finoman
                felnyílnak a súrlódás hatására, és friss illatot szabadítanak fel.
              </p>
              <p>
                Ez azt jelenti, hogy nem csak mosás után illatos a ruha, hanem napokkal később is
                újra aktiválódik az illat.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-200/80 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary">Tech blokk</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-base">
                Ez az úgynevezett ‘Friction Brings Fragrance’ elven működő technológia, amelyet a
                Givaudan fejlesztett.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                  >
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-200/45 blur-2xl" />
              <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-sky-200/45 blur-2xl" />

              <div className="relative space-y-5">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-cyan-100 bg-gradient-to-br from-cyan-100 via-sky-100 to-indigo-100 text-5xl shadow-inner">
                  🫧
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-2xl">🧴</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">Illat zárása</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-2xl">👕</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">Tapadás textilen</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-2xl">✨</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">Aktív frissesség</p>
                  </div>
                </div>

                <p className="text-center text-sm font-medium leading-6 text-slate-700">
                  Mozgás + súrlódás = frissen aktiválódó, prémium illatélmény.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
