import { Button } from '@/components/ui/Button';

const features = [
  {
    title: 'Brand-forward colors',
    description:
      'Primary and supporting tones are ready for promotions, calls to action, and trust-building accents.'
  },
  {
    title: 'Retail-ready typography',
    description:
      'Strong headings, readable body text, and balanced spacing make product messaging effortless to scan.'
  },
  {
    title: 'Reusable building blocks',
    description:
      'Use utility classes for section rhythm, layout width, cards, and call-to-action buttons.'
  }
];

export default function Home() {
  return (
    <main>
      <section className="ds-section">
        <div className="ds-container">
          <div className="ds-card bg-brand-light">
            <p className="mb-3 inline-flex rounded-full bg-success-green/10 px-3 py-1 text-sm font-semibold text-success-green">
              Design System Preview
            </p>
            <h1 className="text-4xl md:text-5xl">Aquadrop Retail UI Foundations</h1>
            <p className="mt-4 max-w-2xl text-lg">
              A clean, modern Tailwind design system with reusable classes and button variants for faster page building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>Shop Filters</Button>
              <Button variant="secondary">Browse Catalog</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-section border-t border-slate-200 bg-white">
        <div className="ds-container grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article className="ds-card" key={feature.title}>
              <h2 className="text-2xl">{feature.title}</h2>
              <p className="mt-3">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ds-section border-t border-slate-200 bg-slate-50">
        <div className="ds-container">
          <div className="ds-card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-3xl">Consistent spacing utilities</h3>
              <p className="mt-2 max-w-2xl text-slate-600">
                Use <code className="rounded bg-slate-100 px-1 py-0.5">.ds-section</code> and
                <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">.ds-container</code> across pages for visual rhythm.
              </p>
            </div>
            <Button>Apply to Homepage</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
