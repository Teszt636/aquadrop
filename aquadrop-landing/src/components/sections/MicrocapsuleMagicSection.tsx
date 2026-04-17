import { SectionHeading } from '@/components/ui';
import { MicrocapsuleVisualBlock } from './MicrocapsuleVisualBlock';

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
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,390px)] lg:gap-12">
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
              <p>
                A legtöbb mosószer egyszerűen illatosít, de az illat gyorsan eltűnik. Az Aquadrop
                Expert Pro egy fejlettebb megoldást használ: mikrokapszulás illattechnológiát.
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
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary">Tech sor</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 md:text-base">
                A ‘Friction Brings Fragrance’ elven működő technológia az illatot csak akkor
                szabadítja fel, amikor a ruha mozgásba kerül.
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

          <MicrocapsuleVisualBlock />
        </div>
      </div>
    </section>
  );
}
