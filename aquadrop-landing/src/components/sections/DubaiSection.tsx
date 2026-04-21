import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const dubaiBenefits = [
  {
    title: 'Dubai gyártói háttér',
    description: 'Nemzetközi fejlesztés, modern szemlélet.'
  },
  {
    title: 'Prémium minőségérzet',
    description: 'Olyan formula, amely a tisztaságot és frissességet helyezi előtérbe.'
  },
  {
    title: 'Koncentrált hatás',
    description: 'Kis kapszula, nagy teljesítmény.'
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
        <div className="ds-section-heading-wrap">
          <SectionHeading>Nem egy átlagos mosókapszula</SectionHeading>
          <p className="mt-4 text-xl font-semibold text-slate-900">Dubai háttérrel, prémium minőségre hangolva</p>
          <SectionDescription className="mx-auto max-w-4xl text-left text-base leading-7 text-slate-700 md:text-lg">
            Az Aquadrop Expert Pro nem egy szokványos tömegtermék. A márka egy Dubai központú gyártó fejlesztése,
            amely a modern mosási igényekhez igazított, koncentrált formulát kínál.
          </SectionDescription>
          <SectionDescription className="mx-auto max-w-4xl text-left text-base leading-7 text-slate-700 md:text-lg">
            A csomagoláson is szereplő „from Dubai” jelölés nem csupán eredetet jelent, hanem egy olyan minőségi
            szemléletet is, amely a hatékonyságot, a megbízhatóságot és a korszerű megoldásokat helyezi előtérbe.
          </SectionDescription>
          <SectionDescription className="mx-auto max-w-4xl text-left text-base leading-7 text-slate-700 md:text-lg">
            Az Aquadrop célja, hogy egyszerűbbé és hatékonyabbá tegye a mindennapi mosást – kompromisszumok nélkül.
          </SectionDescription>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {dubaiBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="h-full rounded-[1.75rem] border border-slate-200 bg-white px-6 py-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{benefit.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
