import { SectionHeading } from '@/components/ui/SectionHeading';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  items: FaqItem[];
};

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section className="ds-section pt-10 pb-16">
      <div className="ds-container">
        <div className="ds-floating-panel px-6 py-8 md:px-10 md:py-12">
          <SectionHeading>Gyakran ismételt kérdések</SectionHeading>

          <div className="mt-8 grid gap-4 md:gap-5">
            {items.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-cyan-100/80 bg-white/75 p-5 shadow-[0_10px_30px_rgba(14,116,144,0.08)] backdrop-blur-sm md:p-6"
              >
                <h3 className="text-lg font-semibold leading-7 text-slate-900">{item.question}</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
