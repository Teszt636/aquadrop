import { Button } from '@/components/ui/Button';

export function GiftSection() {
  return (
    <section className="ds-section bg-white">
      <div className="ds-container">
        <div className="relative overflow-hidden rounded-3xl border-2 border-brand-primary/30 bg-gradient-to-br from-brand-light via-white to-success-green/10 p-8 shadow-card md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-success-green/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-brand-primary/30 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-brand-primary">
              Kiemelt ajánlat
            </p>
            <h2 className="mt-4 text-3xl leading-tight md:text-5xl">Vásárolj 2 dobozt – mi adunk egy harmadikat</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Vásárolj 2 doboz Aquadrop kapszulát, töltsd fel a blokkot, és mi elküldjük a 3. dobozt ajándékba.
            </p>

            <div className="mt-8">
              <Button className="px-8 py-4 text-base">Ajándék dobozt igényelek</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
