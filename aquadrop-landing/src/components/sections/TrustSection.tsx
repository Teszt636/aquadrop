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

        <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-green-50 p-5 md:p-6 flex gap-4 items-start">

  {/* ICON */}
  <div className="flex-shrink-0 bg-white rounded-full p-3 shadow-sm">
    <ShieldCheck className="w-6 h-6 text-green-600" />
  </div>

  {/* TEXT */}
  <div>
    <p className="font-semibold text-gray-900 text-base md:text-lg">
      Kockázatmentes kipróbálás – 100% pénzvisszafizetési garancia
    </p>

    <p className="text-gray-600 mt-1 text-sm md:text-base">
      Ha nem vagy elégedett, egyszerűen visszaadjuk a pénzed. Kérdés nélkül.
    </p>
  </div>

</div>
      </div>
    </section>
  );
}
