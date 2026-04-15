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
          <h2 className="text-3xl md:text-4xl">Miért bízhatsz az Aquadropban?</h2>
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

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-brand-primary/20 bg-brand-light/50 p-6 text-center shadow-card md:p-8">
          <p className="text-lg font-bold text-brand-primary md:text-xl">
            Nem vagy elégedett? Visszafizetjük az árát.
          </p>
        </div>
      </div>
    </section>
  );
}
