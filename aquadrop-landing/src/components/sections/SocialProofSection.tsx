import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';

const testimonials = [
  {
    author: 'Erika, Budapest',
    quote: '„Kellemes illat, jól oldódik, és a ruhák frissek maradnak.”'
  },
  {
    author: 'Nikolett, Szeged',
    quote: '„Mióta ezt használom, kevesebb kapszula is elég egy mosáshoz.”'
  },
  {
    author: 'Edit, Kecskemét',
    quote: '„Az ajándékos akció miatt próbáltam ki, azóta is ezt veszem.”'
  }
];

export function SocialProofSection() {
  return (
    <section className="ds-section" aria-labelledby="social-proof-heading">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading id="social-proof-heading">Miért szeretik sokan az Aquadrop Expert Pro-t?</SectionHeading>
          <SectionDescription className="mx-auto mt-4 text-base leading-7 sm:text-lg">
            Valódi előnyök, amelyek a mindennapi használatban számítanak.
          </SectionDescription>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.author}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-[0.18em] text-amber-500" aria-label="5 csillagos értékelés">
                  ★★★★★
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500"
                >
                  {testimonial.author}
                </span>
              </div>

              <p className="mt-5 text-base leading-7 text-slate-700">{testimonial.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
