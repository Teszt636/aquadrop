import { SectionHeading } from '@/components/ui';

const steps = [
  {
    title: 'A textilhez tapad',
    description: 'Az illatanyagokat mikroszkopikus kapszulák védik a textil felületén.'
  },
  {
    title: 'Mozgásra aktiválódik',
    description: 'A ruha mozgása és a súrlódás finoman megnyitja a kapszulákat.'
  },
  {
    title: 'Újra érezhető az illat',
    description: 'Az illat fokozatosan újra felszabadul, amikor a ruha mozgásba kerül.'
  }
];

const benefits = [
  'Hosszan tartó frissesség',
  'Prémium illatélmény',
  'Mozgásra aktiválódó technológia'
];

export function MicrocapsuleMagicSection() {
  return (
    <section className="ds-section bg-gradient-to-r from-sky-50/90 via-cyan-50/70 to-indigo-50/80">
      <div className="ds-container">
        <div className="space-y-7">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <SectionHeading>
              <h1 className="text-center mt-4 break-words text-4xl leading-tight md:text-5xl">
              Mikrokapszula varázslat
              </h1>
              <h2 className="text-center mt-4 break-words text-3xl leading-tight md:text-4xl">
              az illat, ami újra és újra aktiválódik
              </h2>
            </SectionHeading>
            <p className="text-lg font-semibold leading-relaxed text-brand-secondary md:text-xl">
              Nem csak illatosít: a mikrokapszulás technológia mozgás közben újra és újra
              felszabadítja a friss illatot.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="group rounded-2xl border border-slate-200 bg-white/90 p-5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md md:p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sm font-bold text-brand-primary">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700 md:text-base">{step.description}</p>
              </article>
            ))}
          </div>

          <p className="text-center text-lg font-semibold leading-relaxed text-brand-secondary md:text-xl">
            A “Friction Brings Fragrance” elven működő technológiával az illatanyagokat mikroszkopikus kapszulák zárják magukba, amelyek a textilszálakhoz tapadnak. Amikor az anyag súrlódik, ezek a kapszulák felnyílnak és friss illatot szabadítanak fel.
          </p>

          <ul className="grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
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
      </div>
    </section>
  );
}
