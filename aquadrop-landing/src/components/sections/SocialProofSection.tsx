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
  },
  {
    author: 'Réka, Debrecen',
    quote: '„20 fokon is tiszták a ruhák, és még az illata is tartós marad.”'
  },
  {
    author: 'Bence, Győr',
    quote: '„Sportcuccokra is bevált, nem marad bennük kellemetlen szag.”'
  },
  {
    author: 'Andrea, Pécs',
    quote: '„Érzékeny bőrű a kisfiam, ezzel nem tapasztaltunk irritációt.”'
  },
  {
    author: 'Judit, Miskolc',
    quote: '„Nagyon szeretem, hogy gyors mosásnál is szépen oldódik.”'
  },
  {
    author: 'László, Szombathely',
    quote: '„A sötét ruhák színe tovább élénk marad, ez nálam nagy plusz.”'
  },
  {
    author: 'Kata, Veszprém',
    quote: '„Kevesebb mosószerrel is ugyanazt a tisztaságot kapom.”'
  },
  {
    author: 'Noémi, Eger',
    quote: '„Kényelmes, hogy csak bedobom és kész, nem kell méricskélni.”'
  }
];

export function SocialProofSection() {
  const carouselTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="ds-section" aria-labelledby="social-proof-heading">
      <div className="ds-container">
        <div className="ds-floating-panel px-5 py-7 sm:px-7 md:px-10 md:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading id="social-proof-heading">Miért szeretik sokan az Aquadrop Expert Pro-t?</SectionHeading>
            <SectionDescription className="mx-auto mt-4 text-base leading-7 sm:text-lg">
              Valódi előnyök, amelyek a mindennapi használatban számítanak.
            </SectionDescription>
          </div>

          <div className="testimonials-carousel mx-auto mt-10 max-w-6xl overflow-x-auto rounded-2xl [-webkit-overflow-scrolling:touch] [scrollbar-width:none] touch-pan-x">
            <div className="testimonials-track flex w-max gap-4 pb-2">
              {carouselTestimonials.map((testimonial, index) => (
                <article
                  key={`${testimonial.author}-${index}`}
                  className="flex h-full w-[280px] flex-shrink-0 flex-col rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm sm:w-[320px] md:w-[360px]"
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
        </div>
      </div>
    </section>
  );
}
