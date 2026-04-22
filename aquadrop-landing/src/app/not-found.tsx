import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Az oldal nem található',
  description:
    'A keresett oldal nem érhető el. Navigálj vissza az Aquadrop főoldalára, vagy nézd meg partner programunkat.',
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-cyan-50 via-sky-50 to-teal-50 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-cyan-300/30 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <section className="ds-floating-panel-strong w-full max-w-3xl p-8 text-center shadow-[0_25px_70px_rgba(15,23,42,0.14)] sm:p-12">
        <p className="mb-4 inline-flex rounded-full border border-cyan-100 bg-white/90 px-4 py-1 text-sm font-semibold text-cyan-700">
          404 · Aquadrop
        </p>
        <h1 className="text-balance text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
          A keresett oldal nem található
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Lehet, hogy a link már nem él, elgépelés történt a címben, vagy az oldal időközben áthelyezésre került.
          Segítünk, hogy gyorsan visszatalálj a fontos tartalmakhoz.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" className="w-full sm:w-auto">
            Vissza a főoldalra
          </ButtonLink>
          <ButtonLink href="/partner" variant="secondary" className="w-full sm:w-auto">
            Partner lehetőségek
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
