import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const testimonials = [
  '„Kellemes illat, jó oldódás, és a ruhák tényleg frissek maradnak.”',
  '„Az Aquadrop Expert Pro használata után kevesebb kapszula is elégnek érződik.”',
  '„Az ajándék kampány miatt próbáltam ki, végül maradtam is a terméknél.”'
];

export function SocialProofSection() {
  return (
    <section className="ds-section ds-section-quiet" aria-labelledby="social-proof-heading">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading id="social-proof-heading">Miért szeretik sokan az Aquadrop Expert Pro-t?</SectionHeading>
          <SectionDescription className="mx-auto mt-4 text-base leading-7 sm:text-lg">
            Valódi előnyök, amelyek a mindennapi használatban számítanak.
          </SectionDescription>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-[0.18em] text-amber-500" aria-label="5 csillagos értékelés">
                  ★★★★★
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500"
                >
                  V{index + 1}
                </span>
              </div>

              <p className="mt-5 text-base leading-7 text-slate-700">{testimonial}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
