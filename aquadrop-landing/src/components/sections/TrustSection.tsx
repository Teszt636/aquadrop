import { ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/ui';

const trustItems = [
  'EU REACH megfelelőség',
  'Foszfátmentes formula',
  'Bőrbarát pH',
  'Környezetbarát oldódó fólia',
  'Nemzetközi gyártás',
  'Stabil minőség'
];

export function TrustSection() {
  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="ds-section-heading-wrap">
          <SectionHeading>Miért bízhatsz az Aquadrop Expert Pro minőségében?</SectionHeading>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {trustItems.map((item) => (
            <article
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm"
              key={item}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-green/10 text-lg text-success-green"
              >
                ✓
              </span>
              <p className="text-base font-semibold leading-6 text-slate-800">{item}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm sm:p-6">
  <div className="flex flex-col items-center text-center gap-4 md:flex-row md:items-start md:text-left">

    {/* ICON */}
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
      <ShieldCheck className="h-7 w-7 text-green-600" />
    </div>

    {/* TEXT */}
    <div className="min-w-0">
      <p className="text-lg font-bold leading-tight text-slate-900">
        100% pénzvisszafizetési garancia
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
        Próbáld ki kockázat nélkül. Ha nem vagy elégedett, visszaadjuk a pénzed.
      </p>
    </div>

  </div>
</div>
      </div>
    </section>
  );
}
