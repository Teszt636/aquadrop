import { SectionHeading } from '@/components/ui';

const benefits = [
  { title: 'Magas koncentráció', icon: '💧' },
  { title: 'Gyors oldódás', icon: '⚡' },
  { title: 'Folttisztító hatás', icon: '✨' },
  { title: 'Friss illat és színvédelem', icon: '🛡️' }
];

export function BenefitsSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Mit ad egy prémium mosókapszula a mindennapi mosáshoz?</SectionHeading>
          <p className="mt-4 text-base md:text-lg">
            Az Aquadrop Expert Pro célja, hogy egyszerűbbé tegye a mosást: előre adagolt kapszula,
            koncentrált formula, friss illat és kényelmes használat egyetlen dobozban.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article className="ds-card flex h-full flex-col items-center justify-center gap-4 text-center" key={benefit.title}>
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl"
              >
                {benefit.icon}
              </span>
              <h3 className="text-xl leading-snug">{benefit.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
