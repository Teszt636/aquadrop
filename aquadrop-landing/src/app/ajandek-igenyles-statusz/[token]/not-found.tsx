import Link from 'next/link';

export default function GiftClaimStatusNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-50 via-sky-50 to-white px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(14,116,144,0.10)]">
        <p className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-700">
          Aquadrop ajándék státusz
        </p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Nem található ilyen igénylés</h1>
        <p className="mt-3 text-sm text-slate-600">Ellenőrizd a linket, vagy nyisd meg újra az emailben kapott státusz oldalt.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Vissza a főoldalra
        </Link>
      </section>
    </main>
  );
}
