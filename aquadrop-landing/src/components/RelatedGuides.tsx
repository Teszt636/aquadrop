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
    <section className="rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-700">{intro}</p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-cyan-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{item.label}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
