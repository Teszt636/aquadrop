import Image from 'next/image';

import { SectionHeading } from '@/components/ui';

const steps = [
  {
    title: 'A textilhez tapad',
    description:
      'Az illatanyagokat mikroszkopikus kapszulák védhetik, amelyek a textilszálak felületén maradhatnak.'
  },
  {
    title: 'Mozgásra aktiválódik',
    description:
      'A ruha viselése, mozgása és finom súrlódása hozzájárulhat az illatrészecskék fokozatos felszabadulásához.'
  },
  {
    title: 'Újra érezhető az illat',
    description:
      'A friss illat nem egyszerre illan el, hanem a nap folyamán több hullámban szabadulhat fel.'
  }
];

const premiumBenefits = [
  {
    title: 'Érintésre ébredő illat',
    description: 'A mozgás, az érintés vagy a ruha felvétele érezhetőbbé teheti a friss illatot.'
  },
  {
    title: 'Hosszan tartó frissesség',
    description:
      'A kapszulák segítenek megóvni az illatanyagot, így a ruhák a tárolás után is frissebb érzetet adhatnak.'
  },
  {
    title: 'Prémium illatélmény',
    description:
      'A fejlett illattechnológia a tisztaság mellé kifinomult, luxusérzetű frissességet ad.'
  }
];

export function MicrocapsuleMagicSection() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="ds-floating-panel space-y-7 px-5 py-7 sm:px-7 md:space-y-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <SectionHeading>
              <span className="mt-4 block break-words text-center text-4xl leading-tight md:text-5xl">
                Hosszan tartó friss illat mikrokapszulás technológiával
              </span>
              <span className="mt-4 block break-words text-center text-3xl leading-tight md:text-4xl">
                Ahol a tudomány és a luxus találkozik
              </span>
            </SectionHeading>
            <p className="text-base leading-relaxed text-brand-secondary md:text-lg">
              A mikrokapszulás illattechnológia célja, hogy a friss illat ne csak a mosás után legyen
              érezhető. A ruhaszálak között megtapadó illatrészecskék mozgásra és érintésre fokozatosan
              szabadulhatnak fel.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-cyan-100 bg-white/80 p-2 shadow-sm md:p-3">
            <Image
              src="/mikrokapszulas-mosokapszula-technologia.webp"
              alt="Mikrokapszulás mosókapszula illattechnológia működése textilszálakon"
              width={1536}
              height={864}
              className="h-auto w-full rounded-2xl object-contain"
              sizes="(max-width: 768px) 100vw, 960px"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="group rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md md:p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sm font-bold text-brand-primary">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700 md:text-base">{step.description}</p>
              </article>
            ))}
          </div>

          <article className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 text-center shadow-sm md:p-6">
            <h3 className="text-xl font-bold text-slate-900">Miért különleges ez a technológia?</h3>
            <p className="mx-auto mt-3 max-w-4xl text-sm leading-6 text-slate-700 md:text-base">
              A mikrokapszulás megoldás célja, hogy az illat ne egyszerre illanjon el. Az illatmolekulákat
              apró kapszulák védhetik, amelyek a textilszálakhoz tapadhatnak, majd mozgás vagy súrlódás
              hatására fokozatosan nyílhatnak meg. Így a frissesség érzete hosszabb ideig megmaradhat.
            </p>
          </article>

          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {premiumBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm md:p-5"
              >
                <div className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                  Prémium előny
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 md:text-lg">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{benefit.description}</p>
              </article>
            ))}
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-center shadow-sm md:p-7">
            <h3 className="text-2xl font-bold text-slate-900 md:text-3xl">Dubai elegancia, svájci precizitás</h3>
            <p className="mx-auto mt-3 max-w-4xl text-sm leading-6 text-slate-700 md:text-base">
              Az Aquadrop Expert Pro nemcsak tisztításra készült. A koncentrált formula, a 4 kamrás
              technológia és a szabályozott illatkibocsátás együtt olyan mosási élményt ad, ahol a
              hatékonyság és a kényeztető frissesség egyszerre van jelen.
            </p>
            <p className="mt-4 text-base font-semibold text-brand-secondary md:text-lg">
              Több mint tisztítás: élmény minden rostban.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
