import type { Metadata } from 'next';
import Link from 'next/link';

import { WashingCostCalculator } from '@/components/tools/WashingCostCalculator';

export const metadata: Metadata = {
  title: 'Mosási költség kalkulátor: mennyit spórolsz 20 fokon?',
  description: 'Számold ki, mennyit spórolhatsz alacsony hőfokú mosással. Ingyenes mosási költség kalkulátor az Aquadroptól.',
  alternates: { canonical: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator' },
  openGraph: {
    title: 'Számold ki: ennyit spórolsz 20 fokos mosással',
    description: 'Interaktív kalkulátor, amellyel kiszámolhatod, mennyi energiát és pénzt takaríthatsz meg alacsonyabb hőfokú mosással.',
    url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator',
    siteName: 'Aquadrop Expert Pro',
    type: 'website',
    images: [
      {
        url: 'https://www.aquadrop.hu/20-fokos-mosas-megtakaritas-aquadrop-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Mosási költség kalkulátor 20 fokos mosás megtakarítás'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosási költség kalkulátor: mennyit spórolsz 20 fokon?',
    description: 'Számold ki, mennyit spórolhatsz alacsony hőfokú mosással.',
    images: ['https://www.aquadrop.hu/20-fokos-mosas-megtakaritas-aquadrop-og.jpg']
  }
};

export default async function WashingCostCalculatorPage({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const params = await searchParams;
  const isEmbed = params.embed === 'true';
  const webAppSchema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Mosási költség kalkulátor', applicationCategory: 'UtilityApplication', operatingSystem: 'Web', description: 'Ingyenes kalkulátor, amellyel kiszámolható a 20 fokos mosás lehetséges energiamegtakarítása.', url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator', publisher: { '@type': 'Organization', name: 'Aquadrop' } };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-white px-4 py-10 md:px-6 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-10">
        {!isEmbed && (
          <header className="rounded-3xl border border-cyan-100/70 bg-white/85 p-7 text-center shadow-[0_18px_55px_rgba(14,116,144,0.12)] backdrop-blur-sm md:p-10">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <p className="inline-flex rounded-full border border-cyan-200/80 bg-cyan-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                INGYENES MOSÁSI KALKULÁTOR
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">Mosási költség kalkulátor</h1>
              <p className="text-lg font-medium text-slate-800 md:text-xl">Számold ki, mennyit spórolhatsz 20 fokos mosással</p>
              <p className="text-slate-700">
                Add meg a mosási szokásaidat, és nézd meg, mekkora különbséget jelenthet az alacsonyabb hőfok a villanyszámlában.
              </p>
            </div>

            <div className="mx-auto mt-6 grid w-full max-w-3xl gap-3 text-center text-sm font-semibold text-cyan-900 md:grid-cols-3">
              {['Ingyenes kalkulátor', 'Megosztható eredmény', 'Beágyazható iframe'].map((item) => (
                <div key={item} className="rounded-2xl border border-cyan-100 bg-gradient-to-b from-white to-cyan-50/70 px-4 py-3 shadow-[0_8px_24px_rgba(8,145,178,0.10)]">
                  {item}
                </div>
              ))}
            </div>
          </header>
        )}

        <WashingCostCalculator placement="calculator_page" showShare={!isEmbed} showEmbed={!isEmbed} showIntroBadge={true} isEmbed={isEmbed} />

        {!isEmbed && (
          <>
            <section className="rounded-3xl border border-cyan-100/70 bg-white/80 p-7 shadow-[0_18px_55px_rgba(14,116,144,0.09)] backdrop-blur-sm md:p-8">
              <h2 className="text-center text-2xl font-semibold text-slate-900">Miért érdemes kiszámolni?</h2>
              <p className="mx-auto mt-3 max-w-3xl text-center text-slate-700">
                A mosási hőfok és a program hossza látványosan befolyásolhatja az energiafelhasználást. A kalkulátor segít megérteni,
                hogy ugyanazzal a heti mosásszámmal mekkora különbséget okozhat egy energiatudatosabb beállítás.
              </p>
              <ul className="mt-5 grid gap-3 text-sm font-medium text-cyan-900 md:grid-cols-3 md:text-base">
                {['Gyors becslés saját mosási szokások alapján', 'Megosztható eredménylink', 'Beágyazható kalkulátor más weboldalakhoz'].map((item) => (
                  <li key={item} className="flex min-h-28 items-center justify-center rounded-2xl border border-cyan-100 bg-white/85 px-4 py-3 text-center">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: '20 fokos mosás cikk', href: '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol' },
                { title: 'Energiatakarékos mosás útmutató', href: '/energiatakarekos-mosas' },
                { title: 'Aquadrop főoldal', href: '/' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-cyan-100/80 bg-white/80 p-5 text-center text-slate-900 shadow-[0_14px_35px_rgba(14,116,144,0.08)] transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md hover:text-cyan-700"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">Kapcsolódó</p>
                  <p className="mt-2 text-lg font-semibold">{item.title}</p>
                </Link>
              ))}
            </section>

            <section className="rounded-3xl border border-cyan-100/70 bg-white/80 p-7 text-center shadow-[0_18px_55px_rgba(14,116,144,0.10)] backdrop-blur-sm md:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Alacsony hőfokon is hatékony mosási megoldást keresel?</h2>
              <p className="mt-3 text-slate-700">
                Ha szeretnél energiatudatosabban mosni, érdemes olyan mosókapszulát választani, amely alacsonyabb hőfokon is megbízható
                teljesítményt ad.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(8,145,178,0.35)] transition hover:from-cyan-500 hover:to-blue-500"
              >
                Megnézem az Aquadrop Expert Pro-t
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
