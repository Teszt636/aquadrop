import { ButtonLink } from '@/components/ui/Button';
import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const positioningCards = [
  'Dubai gyártói háttér',
  'Prémium minőségérzet',
  'Koncentrált formula',
  'Modern, nemzetközi márka'
];

export function DubaiPositioningSection() {
  return (
    <section className="ds-section pt-2 md:pt-4">
      <div className="ds-container">
        <div className="rounded-3xl border border-slate-200/90 bg-white px-6 py-8 shadow-card sm:px-8 md:px-12 md:py-12">
          <SectionHeading>Nem egy átlagos mosókapszula</SectionHeading>
          <p className="mt-3 text-xl font-semibold text-slate-800 md:text-2xl">
            Dubai háttérrel, prémium minőségre hangolva
          </p>
          <SectionDescription className="max-w-4xl text-base leading-7 md:text-lg md:leading-8">
            Az Aquadrop Expert Pro nem egy szokványos tömegtermék. A márka Dubai gyártói háttérrel
            érkezik, és olyan modern, koncentrált mosókapszula-megoldást képvisel, amely a hatékony
            tisztítást, a frissességet és a kényelmes használatot egyesíti.
          </SectionDescription>
          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-700 md:text-lg md:leading-8">
            A csomagoláson is szereplő &quot;from Dubai&quot; üzenet nem csak eredetet jelez, hanem egy olyan
            minőségi pozicionálást is, amely ma a vásárlók számára egyre vonzóbb.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {positioningCards.map((card) => (
              <div
                key={card}
                className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white px-4 py-5 text-center text-sm font-semibold text-slate-800 shadow-sm"
              >
                {card}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <ButtonLink href="#gift-campaign">Megnézem, mit tud az Aquadrop</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
