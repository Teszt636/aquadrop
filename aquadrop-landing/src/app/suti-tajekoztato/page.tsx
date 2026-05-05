import type { Metadata } from 'next';
import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Süti tájékoztató | Aquadrop',
  description:
    'Az Aquadrop weboldal süti tájékoztatója a használt sütikről, azok céljáról, időtartamáról és a hozzájárulás kezeléséről.',
  alternates: {
    canonical: 'https://www.aquadrop.hu/suti-tajekoztato',
  },
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    siteName: 'Aquadrop',
    title: 'Süti tájékoztató | Aquadrop',
    description:
      'Az Aquadrop weboldal süti tájékoztatója a használt sütikről, azok céljáról, időtartamáról és a hozzájárulás kezeléséről.',
    url: 'https://www.aquadrop.hu/suti-tajekoztato',
    images: [
      {
        url: 'https://www.aquadrop.hu/aquadrop-mosokapszula-og-kep.webp',
        width: 1200,
        height: 630,
        alt: 'Aquadrop Expert Pro mosókapszula',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Süti tájékoztató | Aquadrop',
    description:
      'Az Aquadrop weboldal süti tájékoztatója a használt sütikről, azok céljáról, időtartamáról és a hozzájárulás kezeléséről.',
    images: ['https://www.aquadrop.hu/aquadrop-mosokapszula-og-kep.webp'],
  },
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 text-slate-900 md:py-16">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <header className="space-y-4 border-b border-slate-200 pb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">Aquadrop Hungary Kft.</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Süti tájékoztató</h1>
            <p className="text-base leading-relaxed text-slate-700 md:text-lg">
              Jelen tájékoztató összefoglalja, hogy az Aquadrop weboldal milyen sütiket és kapcsolódó technológiákat
              alkalmaz, ezek milyen célt szolgálnak, meddig maradhatnak aktívak, valamint hogyan kezelhető a
              hozzájárulás.
            </p>
          </header>

          <div className="mt-10 space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">1. Mi az a süti?</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A süti (cookie) a böngészőben tárolt kis adatfájl, amely segíti a weboldal működését, biztonságát és
                teljesítményét, illetve egyes esetekben lehetővé teszi a használat statisztikai mérését.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">2. A sütik használatának célja</h2>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>A weboldal megfelelő működésének biztosítása.</li>
                <li>A felhasználói beállítások megjegyzése.</li>
                <li>A weboldal használatának statisztikai elemzése.</li>
                <li>A szolgáltatás fejlesztése.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">3. A weboldalon használt sütik típusai</h2>
              <div className="space-y-5 text-base text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">A) Szükséges sütik</h3>
                  <p className="mt-2 leading-relaxed">
                    Ezek a sütik a weboldal alapvető működéséhez szükségesek. Használatuk nélkül az oldal egyes
                    funkciói nem működnének megfelelően, ezért ezekhez általában nincs szükség külön hozzájárulásra.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">B) Statisztikai sütik</h3>
                  <p className="mt-2 leading-relaxed">
                    Ezek a sütik a weboldal használatának mérésére és elemzésére szolgálnak. A statisztikai sütik csak
                    az érintett felhasználó előzetes hozzájárulása után aktiválódnak.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">4. A jelenleg használt sütik és kapcsolódó technológiák</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Az alábbi felsorolás a projektben jelenleg azonosítható technológiákat mutatja be. A szolgáltató által
                alkalmazott technológiák és azok megőrzési ideje időről időre változhat.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm md:text-base">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-900">Süti / technológia neve</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Szolgáltató</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Cél</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Típus</th>
                      <th className="px-4 py-3 font-semibold text-slate-900">Időtartam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                    <tr className="align-top">
                      <td className="px-4 py-4 font-medium text-slate-900">aquadrop_cookie_consent</td>
                      <td className="px-4 py-4">Aquadrop</td>
                      <td className="px-4 py-4">A felhasználó sütikezelési döntésének tárolása.</td>
                      <td className="px-4 py-4">Szükséges</td>
                      <td className="px-4 py-4">
                        A megvalósított logika alapján a beállítás a böngésző helyi tárolójában rögzül, és a
                        felhasználó általi törlésig elérhető maradhat.
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="px-4 py-4 font-medium text-slate-900">Google Analytics / Google tag</td>
                      <td className="px-4 py-4">Google Ireland Limited</td>
                      <td className="px-4 py-4">Statisztikai mérés és a weboldal használatának elemzése.</td>
                      <td className="px-4 py-4">Statisztikai</td>
                      <td className="px-4 py-4">
                        A szolgáltató által alkalmazott technológiák és azok megőrzési ideje időről időre változhat,
                        amelyet a szolgáltató aktuális dokumentációja határoz meg.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">5. Hozzájárulás kezelése</h2>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>A statisztikai sütik kizárólag az érintett előzetes hozzájárulása után aktiválódnak.</li>
                <li>A felhasználó elfogadhatja vagy elutasíthatja a nem szükséges sütik alkalmazását.</li>
                <li>A megadott hozzájárulás később is visszavonható.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">6. Sütibeállítások módosítása</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A sütik kezelésére, törlésére vagy letiltására a böngésző beállításaiban is lehetőség van. Felhívjuk a
                figyelmet arra, hogy egyes sütik letiltása a weboldal bizonyos funkcióinak működését befolyásolhatja.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">7. Harmadik fél szolgáltatók</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A weboldal bizonyos funkciói külső szolgáltatótól származó technológiákat is igénybe vehetnek, amelyek
                a saját adatvédelmi és süti gyakorlatuk szerint működnek.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>Google Ireland Limited</li>
              </ul>
              <p className="text-base text-slate-700">
                További információ:
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-cyan-700 underline decoration-cyan-300 underline-offset-2"
                >
                  Google adatvédelmi tájékoztató
                </a>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">8. Kapcsolat</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A sütik használatával kapcsolatos kérdések esetén az érintett az adatvédelmi tájékoztatóban megadott
                elérhetőségeken veheti fel a kapcsolatot az adatkezelővel.
              </p>
              <p>
                <Link
                  href="/adatvedelmi-tajekoztato"
                  className="text-cyan-700 underline decoration-cyan-300 underline-offset-2"
                >
                  Adatvédelmi tájékoztató megtekintése
                </Link>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">9. A tájékoztató módosítása</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Az üzemeltető fenntartja a jogot jelen süti tájékoztató módosítására. A módosított verzió a weboldalon
                történő közzététellel lép hatályba.
              </p>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-semibold text-slate-950">10. Hatálybalépés</h2>
              <p className="text-base font-medium text-slate-800">Hatályos: 2026.03.01-től</p>
            </section>

            <div className="pt-2 text-center">
              <ButtonLink href="/" className="px-8 py-3 text-sm md:text-base">
                Vissza a főoldalra
              </ButtonLink>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
