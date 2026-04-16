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
    <section className="ds-section bg-white">
      <div className="ds-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl">Miért bízhatsz az Aquadrop Expert Pro minőségében?</h2>
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

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-success-green/25 bg-slate-50/90 p-5 shadow-card md:p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-success-green/25 bg-white text-2xl text-success-green shadow-sm"
            >
              ✅
            </span>
            <div>
              <p className="text-xl font-extrabold text-slate-900 md:text-2xl">Kockázat nélkül kipróbálhatod</p>
              <p className="mt-2 text-base leading-6 text-slate-700">
                Ha nem vagy elégedett az Aquadrop Expert Pro teljesítményével, visszafizetjük az árát.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
