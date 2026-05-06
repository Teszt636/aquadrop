import { SectionHeading } from '@/components/ui';

const problemPoints = [
  { text: 'Nem tisztít elég hatékonyan', icon: '🧼' },
  { text: 'Nem oldódik fel rendesen', icon: '🫧' },
  { text: 'Gyorsan elfogy, mégis drága', icon: '💸' },
  { text: 'Erős illat, gyenge mosási eredmény', icon: '😕' }
];

export function ProblemSection() {
  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Miért nem működik jól minden mosókapszula alacsony hőfokon?</SectionHeading>
          <p className="mt-4 text-base md:text-lg">
            A mindennapi mosásnál a leggyakoribb gond a gyenge tisztítóhatás, a rossz oldódás, a túl erős
            illat vagy a bizonytalan adagolás. Ezek különösen alacsony hőfokú mosásnál válnak látványossá.
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
