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
    <section className="rounded-3xl border border-cyan-100 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,118,110,0.08)] md:p-5">
      <div className="mb-4 max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">
          Kapcsolódó útmutatók
        </p>

        <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-slate-950 md:text-2xl">
          {title}
        </h2>

        {intro ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {intro}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-white to-cyan-50/60 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_16px_36px_rgba(8,145,178,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          >
            <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-800 transition group-hover:bg-cyan-700 group-hover:text-white">
              →
            </div>

            <p className="pr-10 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">
              {item.label}
            </p>

            <h3 className="mt-3 pr-8 text-base font-bold leading-snug text-slate-950 md:text-lg">
              {item.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>

            <span className="mt-3 inline-flex text-sm font-bold text-cyan-700 transition group-hover:text-cyan-900">
              Tovább olvasom
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
