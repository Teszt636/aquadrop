import Link from 'next/link';

type ThankYouPageProps = {
  title: string;
  message: string;
};

export function ThankYouPage({ title, message }: ThankYouPageProps) {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-slate-50 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.1),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-brand-light/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />

      <section className="ds-container relative">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card md:p-12">
          <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary">
            Aquadrop
          </p>
          <h1 className="mt-6 text-3xl leading-tight md:text-5xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">{message}</p>

          <div className="mt-8">
            <Link className="ds-button-primary px-8 py-3 text-sm md:text-base" href="/">
              Vissza a főoldalra
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
