import type { Metadata } from 'next';
import Link from 'next/link';

import { WashingCostCalculator } from '@/components/tools/WashingCostCalculator';

export const metadata: Metadata = {
  title: 'Mosási költség kalkulátor – 20 fokos mosás megtakarítás',
  description: 'Számold ki, mennyit spórolhatsz alacsony hőfokú mosással. Ingyenes mosási költség kalkulátor az Aquadroptól.',
  alternates: { canonical: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator' },
  openGraph: {
    title: 'Mosási költség kalkulátor – mennyit spórolhatsz 20 fokon?',
    description: 'Interaktív kalkulátor, amellyel kiszámolhatod, mennyi energiát és pénzt takaríthatsz meg alacsonyabb hőfokú mosással.',
    images: ['https://www.aquadrop.hu/images/blog/20-fokos-mosas-megtakaritas-aquadrop.webp'],
    url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator'
  }
};

export default async function Page({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const params = await searchParams;
  const isEmbed = params.embed === 'true';
  const webAppSchema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Mosási költség kalkulátor', applicationCategory: 'UtilityApplication', operatingSystem: 'Web', description: 'Ingyenes kalkulátor, amellyel kiszámolható a 20 fokos mosás lehetséges energiamegtakarítása.', url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator', publisher: { '@type': 'Organization', name: 'Aquadrop' } };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-white px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <div className="mx-auto max-w-5xl space-y-8">
        {!isEmbed && (
          <header className="space-y-3 rounded-3xl border border-cyan-100 bg-white/80 p-6">
            <h1 className="text-3xl font-semibold md:text-4xl">Mosási költség kalkulátor: mennyit spórolhatsz 20 fokos mosással?</h1>
            <p>Számold ki néhány másodperc alatt, mennyi energiát és pénzt takaríthatsz meg, ha magasabb hőfok helyett alacsonyabb hőfokon mosol.</p>
          </header>
        )}

        <WashingCostCalculator placement="calculator_page" showShare={!isEmbed} showEmbed={!isEmbed} isEmbed={isEmbed} />

        {!isEmbed && (
          <>
            <section className="rounded-3xl border border-cyan-100 bg-white/80 p-6">
              <h2 className="text-2xl font-semibold">Miért hasznos ez a kalkulátor?</h2>
              <p className="mt-2">A kalkulátor gyors becslést ad a mosási hőfok és programhossz költséghatásáról, így könnyebb dönteni energiatudatos beállításokról.</p>
              <div className="mt-4 flex flex-wrap gap-4 text-cyan-800 underline">
                <Link href="/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol">20 fokos mosás cikk</Link>
                <Link href="/energiatakarekos-mosas">Energiatakarékos mosás útmutató</Link>
                <Link href="/">Aquadrop főoldal</Link>
              </div>
            </section>
            <section className="rounded-3xl border border-cyan-100 bg-white/80 p-6">
              <h2 className="text-2xl font-semibold">Alacsony hőfokon is hatékony mosási megoldást keresel?</h2>
              <p className="mt-2">Ha fontos számodra az energiatakarékos mosás, érdemes olyan mosókapszulát választani, amely alacsonyabb hőfokon is megbízható teljesítményt ad.</p>
              <Link href="/" className="mt-4 inline-block rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white">Megnézem az Aquadrop Expert Pro-t</Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
