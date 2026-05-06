import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const dubaiBenefits = [
  {
    title: 'Dubai gyártói háttér',
    description: 'Nemzetközi fejlesztés, modern szemlélet.'
  },
  {
    title: 'Prémium minőségérzet',
    description: 'A tisztaságot, a frissességet és a kényelmes használatot helyezi előtérbe.'
  },
  {
    title: 'Koncentrált hatás',
    description: 'Előre adagolt kapszula koncentrált formulával a mindennapi ruhákhoz.'
  },
  {
    title: 'Modern megoldás',
    description: 'Kényelmes, gyors és egyszerű használat minden mosásnál.'
  }
];

export function DubaiSection() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="ds-floating-panel px-5 py-7 sm:px-7 md:px-10 md:py-10">
          <div className="ds-section-heading-wrap">
            <SectionHeading>Prémium mosókapszula modern gyártói háttérrel</SectionHeading>
            <p className="mt-4 text-xl font-semibold text-slate-900">
              Dubai gyártói háttérrel, mindennapi mosáshoz fejlesztve
            </p>
            <SectionDescription className="mx-auto max-w-4xl text-left text-base leading-7 text-slate-700 md:text-lg">
              Az Aquadrop Expert Pro olyan prémium mosókapszula, amely a kényelmes adagolást, a koncentrált
              tisztítóhatást és a modern mosási rutint helyezi előtérbe. A cél az, hogy a hétköznapi ruhák mosása
              egyszerűbb, kiszámíthatóbb és frissebb élmény legyen.
            </SectionDescription>
            <SectionDescription className="mx-auto max-w-4xl text-left text-base leading-7 text-slate-700 md:text-lg">
              A „from Dubai” jelölés a márka nemzetközi gyártói hátterére utal. A kommunikációban ezt minőségi
              pozícióként használjuk, túlzó állítások nélkül.
            </SectionDescription>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {dubaiBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="h-full rounded-[1.75rem] border border-slate-200 bg-white/80 px-6 py-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{benefit.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
