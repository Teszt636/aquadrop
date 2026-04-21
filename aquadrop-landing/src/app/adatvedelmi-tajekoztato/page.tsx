import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adatvédelmi tájékoztató | Aquadrop',
  description:
    'Az Aquadrop weboldal adatvédelmi tájékoztatója a személyes adatok kezeléséről, sütikről, kapcsolatfelvételről és statisztikai mérésről.'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 text-slate-900 md:py-16">
      <div className="mx-auto w-full max-w-4xl px-6">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <header className="space-y-4 border-b border-slate-200 pb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">Aquadrop Hungary Kft.</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Adatvédelmi tájékoztató</h1>
            <p className="text-base leading-relaxed text-slate-700 md:text-lg">
              Jelen tájékoztató az Aquadrop weboldalán megvalósuló adatkezelések főbb szabályait, céljait és jogalapját
              ismerteti közérthető, ugyanakkor formális összefoglalásban.
            </p>
          </header>

          <div className="mt-10 space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">1. Adatkezelő adatai</h2>
              <ul className="space-y-2 text-base text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">Cégnév:</span> Aquadrop Hungary Kft
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Székhely:</span> 6781 DOmaszék, Béke utca 16/B
                </li>
                <li>
                  <span className="font-semibold text-slate-900">E-mail:</span>{' '}
                  <a href="mailto:hello@aquadrop.hu" className="text-cyan-700 underline decoration-cyan-300 underline-offset-2">
                    hello@aquadrop.hu
                  </a>
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Telefonszám:</span>{' '}
                  <a href="tel:+36212010808" className="text-cyan-700 underline decoration-cyan-300 underline-offset-2">
                    +36 21 201 0808
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">2. A tájékoztató célja</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A tájékoztató célja annak bemutatása, hogy a weboldal működtetése során milyen személyes adatokat,
                milyen célból, milyen jogalapon és milyen időtartamig kezelhetünk.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">3. A kezelt adatok köre</h2>
              <div className="space-y-4 text-base text-slate-700">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Kapcsolatfelvétel során megadott adatok</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>név,</li>
                    <li>e-mail cím,</li>
                    <li>telefonszám,</li>
                    <li>az üzenet tartalma.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Technikai és használati adatok</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-6">
                    <li>IP-cím,</li>
                    <li>böngésző típusa,</li>
                    <li>eszköz típusa,</li>
                    <li>látogatás időpontja,</li>
                    <li>megtekintett oldalak.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">4. Az adatkezelés célja</h2>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>kapcsolatfelvétel biztosítása,</li>
                <li>érdeklődők megkereséseinek kezelése,</li>
                <li>a weboldal működésének biztosítása,</li>
                <li>statisztikai elemzés készítése,</li>
                <li>a szolgáltatás fejlesztése.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">5. Az adatkezelés jogalapja</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Az adatkezelés jogalapja az adott adatkezelési helyzettől függően lehet az érintett hozzájárulása,
                szerződéskötést megelőző lépések megtétele vagy kapcsolatfelvétel, továbbá bizonyos technikai
                adatkezelések esetén az adatkezelő jogos érdeke a weboldal biztonságos és stabil működtetésére.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">6. Sütik használata</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A weboldal sütiket használ a megfelelő működés, a felhasználói élmény és a forgalmi adatok elemzésének
                támogatására.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">Szükséges sütik:</span> a weboldal alapvető
                  működéséhez szükségesek, ezért ezek használata külön hozzájárulás nélkül is történhet.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Statisztikai sütik:</span> kizárólag az érintett
                  előzetes hozzájárulása után aktiválódnak.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">7. Google Analytics</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A weboldal statisztikai elemzés céljából a Google Analytics szolgáltatást használhatja, amelynek
                szolgáltatója a Google Ireland Limited. A mérés csak akkor indul el, ha az érintett ehhez előzetesen
                hozzájárul.
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                A szolgáltatás működése során az adatok kezelése a Google saját adatvédelmi dokumentációja szerint
                történik, amely külön is elérhető az alábbi hivatkozáson:
              </p>
              <p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 underline decoration-cyan-300 underline-offset-2"
                >
                  Google adatvédelmi tájékoztató
                </a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">8. Az adatok megőrzési ideje</h2>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>
                  kapcsolatfelvételi adatok: legfeljebb 1 évig, illetve jogi igény esetén az igény érvényesítéséhez
                  szükséges ideig,
                </li>
                <li>statisztikai adatok: a szolgáltató és a beállított adatmegőrzési idő szerint,</li>
                <li>sütik: a böngésző beállításai és az adott sütik élettartama szerint.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">9. Adatfeldolgozók és címzettek</h2>
              <p className="text-base leading-relaxed text-slate-700">
                A weboldal működtetése során igénybe vett szolgáltatók adatfeldolgozóként vagy egyes esetekben önálló
                címzettként közreműködhetnek az adatkezelésben, az adott szolgáltatás jellegétől és a vonatkozó
                szerződéses feltételektől függően.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>Vercel – tárhely- és infrastruktúra szolgáltató.</li>
                <li>Google Analytics / Google Ireland Limited – statisztikai szolgáltató.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">10. Adattovábbítás harmadik országba</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Egyes szolgáltatók esetén – a szolgáltatás technikai kialakításától, dokumentációjától és aktuális
                adatkezelési gyakorlatától függően – előfordulhat az Európai Gazdasági Térségen kívüli adattovábbítás.
                Ennek részletes feltételei az adott szolgáltató aktuális adatvédelmi tájékoztatójában és kapcsolódó
                szerződéses dokumentumaiban érhetők el.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">11. Az érintettek jogai</h2>
              <ul className="list-disc space-y-2 pl-6 text-base text-slate-700">
                <li>hozzáféréshez való jog,</li>
                <li>helyesbítéshez való jog,</li>
                <li>törléshez való jog,</li>
                <li>az adatkezelés korlátozásához való jog,</li>
                <li>tiltakozáshoz való jog,</li>
                <li>adathordozhatósághoz való jog,</li>
                <li>hozzájárulás visszavonásához való jog.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">12. Jogorvoslat</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Amennyiben az érintett úgy ítéli meg, hogy személyes adatainak kezelése jogsértő, panaszt nyújthat be a
                felügyeleti hatósághoz, illetve bírósághoz is fordulhat.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-base text-slate-700">
                <p className="font-semibold text-slate-900">Nemzeti Adatvédelmi és Információszabadság Hatóság</p>
                <p>1055 Budapest, Falk Miksa utca 9-11.</p>
                <p>
                  <a
                    href="https://www.naih.hu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 underline decoration-cyan-300 underline-offset-2"
                  >
                    https://www.naih.hu
                  </a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">13. Adatbiztonság</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Az adatkezelő az adatkezelés során észszerű technikai és szervezési intézkedésekkel törekszik a
                személyes adatok biztonságának, bizalmasságának és sértetlenségének megőrzésére.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">14. A tájékoztató módosítása</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Az adatkezelő fenntartja a jogot jelen tájékoztató egyoldalú frissítésére. A módosított verzió a
                weboldalon történő közzététel napján lép hatályba.
              </p>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-semibold text-slate-950">15. Hatálybalépés</h2>
              <p className="text-base font-medium text-slate-800">Hatályos: 2026.03.01-től</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
