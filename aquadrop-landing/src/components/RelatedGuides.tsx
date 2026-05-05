import Link from 'next/link';

type RelatedGuideItem = {
  label: string;
  title: string;
  description: string;
  href: string;
};

type RelatedGuidesProps = {
  title: string;
  intro: string;
  items: RelatedGuideItem[];
};

export function RelatedGuides({ title, intro, items }: RelatedGuidesProps) {
  return (
    <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50/80 via-white to-white p-4 shadow-[0_18px_55px_rgba(6,182,212,0.14)] md:p-5">
      <div className="mb-4 max-w-3xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-800">
          Kapcsolódó útmutatók
        </p>

        <h2 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-2xl">
          {title}
        </h2>

        {intro ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            {intro}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-cyan-50/70 to-white px-4 py-3.5 shadow-[0_10px_28px_rgba(6,182,212,0.10)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-[0_18px_40px_rgba(6,182,212,0.20)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/35 blur-2xl transition group-hover:bg-cyan-300/45" />

            <div className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-200 text-cyan-900 shadow-sm transition group-hover:bg-cyan-700 group-hover:text-white">
              →
            </div>

            <div className="relative z-10 pr-10">
              <p className="text-[10px] font-extrabold uppercase leading-none tracking-[0.2em] text-cyan-800">
                {item.label}
              </p>

              <h3 className="mt-2 text-base font-extrabold leading-snug text-slate-950 md:text-lg">
                {item.title}
              </h3>

              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-700">
                {item.description}
              </p>

              <span className="mt-2.5 inline-flex text-sm font-extrabold text-cyan-800 transition group-hover:text-cyan-950">
                Tovább olvasom
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
