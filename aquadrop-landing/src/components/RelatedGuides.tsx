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
    <section className="rounded-3xl border border-cyan-100 bg-white/80 p-4 shadow-sm md:p-5 lg:p-6">
      <div className="mb-4 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Kapcsolódó útmutatók</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950 md:text-[1.65rem]">{title}</h2>
        {intro ? <p className="mt-2 text-sm leading-6 text-slate-600">{intro}</p> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">{item.label}</p>
            <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-cyan-700 group-hover:text-cyan-800">
              Tovább olvasom →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
