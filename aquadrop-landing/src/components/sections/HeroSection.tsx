import { Button } from '@/components/ui/Button';

const heroBullets = [
  '4 az 1-ben hatás',
  'Magas koncentráció (70–80% aktív hatóanyag)',
  'Hosszan tartó prémium illat',
  'Szövetbarát és bőrbarát formula'
];

export function HeroSection() {
  return (
    <section className="ds-section bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="ds-container">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light px-3 py-1 text-sm font-semibold text-brand-primary">
              Aquadrop Expert Pro Capsules
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
              Prémium mosókapszula – valódi teljesítménnyel
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop Expert Pro Capsules egy magas koncentrációjú, modern mosókapszula, amely nemcsak tisztít,
              hanem új szintre emeli a mindennapi mosást.
            </p>

            <ul className="mt-7 space-y-3">
              {heroBullets.map((item) => (
                <li className="flex items-start gap-3" key={item}>
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-green/15 text-success-green">
                    ✓
                  </span>
                  <span className="font-medium text-slate-800">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button>Ajándék dobozt igényelek</Button>
              <Button variant="secondary">Feliratkozom a bejelentésre</Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-light p-8 shadow-inner">
              <div className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 p-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Product Image</p>
                <p className="mt-3 text-xl font-bold text-slate-700">Aquadrop Expert Pro</p>
                <p className="mt-2 text-sm text-slate-500">Helyőrző kép a termékfotó számára</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
