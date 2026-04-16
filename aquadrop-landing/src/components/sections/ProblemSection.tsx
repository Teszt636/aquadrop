import { SectionHeading } from '@/components/ui';

const problemPoints = [
  { text: 'Nem tisztít elég hatékonyan', icon: '🧼' },
  { text: 'Nem oldódik megfelelően', icon: '🫧' },
  { text: 'Gyorsan elfogy, mégis drága', icon: '💸' },
  { text: 'Az illat erős, de a hatás gyenge', icon: '😕' }
];

export function ProblemSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Miért okoz csalódást sok mosókapszula?</SectionHeading>
          <p className="mt-4 text-base md:text-lg">
            Sokan azért váltanak, mert a látványos csomagolás mögött nincs valódi teljesítmény.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {problemPoints.map((problem) => (
            <article className="ds-card flex h-full flex-col items-center gap-4 text-center" key={problem.text}>
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl"
              >
                {problem.icon}
              </span>
              <h3 className="text-lg leading-snug md:text-xl">{problem.text}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
