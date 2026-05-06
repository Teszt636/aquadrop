import Link from 'next/link';

const linkClassName = 'font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-950';

export function SeoSection() {
  return (
    <section className="ds-section pt-10 not-prose">
      <div className="ds-container">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-white p-5 shadow-[0_24px_70px_rgba(15,118,110,0.10)] md:p-8">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">
              Mosókapszula útmutató
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Mosókapszula választás: mit érdemes tudni vásárlás előtt?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              A mosókapszula akkor jó választás, ha egyszerű, előre adagolt és kiszámítható mosási megoldást keresel.
              A jó eredményhez azonban nem csak a kapszula minősége számít: fontos a hőfok, a programhossz, a
              ruhamennyiség, az elhelyezés és az is, hogy milyen típusú ruhákat mosol.
            </p>
            <p className="mt-3 text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              Az Aquadrop Expert Pro célja, hogy a mindennapi mosás kényelmesebb, frissebb és tudatosabb legyen,
              miközben a főoldalon valódi, könnyen átlátható útmutatót kapsz a legfontosabb döntési pontokról.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 md:text-xl">Röviden: mitől lesz gördülékenyebb a kapszulás mosás?</h3>
            <p className="mt-2 text-base leading-7 text-slate-700">
              A legtöbb mosási kérdés három pont körül dől el: hova kerül a kapszula, mennyire van megtöltve a dob,
              és mennyire illik a választott program az adott ruhákhoz. Ha ezeket tudatosabban kezeled, a
              mosókapszula kényelmesebb és kiszámíthatóbb része lehet a heti rutinnak.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Miért választanak sokan mosókapszulát?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosókapszula egyik legnagyobb előnye az egyszerű adagolás. Nem kell külön mérni a folyékony
                mosószert, és kisebb az esélye annak, hogy túl sok vagy túl kevés mosószer kerül a gépbe.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Egy kapszula előre kimért mennyiséget tartalmaz, ezért a hétköznapi mosás gyorsabbá és kényelmesebbé
                válhat, különösen akkor, ha rendszeresen mosol vegyes családi ruhákat vagy törölközőket.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-hasznalata">
                Mosókapszula használata
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Hova kell tenni a mosókapszulát?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosókapszulát nem az adagolófiókba érdemes tenni, hanem közvetlenül a mosógép dobjába. A legjobb
                sorrend általában az, hogy először a kapszula kerül be, és csak utána a ruhák.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Így hamarabb éri víz, és kisebb az esélye annak, hogy a kapszula a ruhák tetején maradjon vagy
                egyenetlenül oldódjon fel a program elején.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-dobba-vagy-adagoloba">
                Mosókapszula dobba vagy adagolóba
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Hány mosókapszula kell egy mosáshoz?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Átlagos ruhamennyiséghez általában egy kapszula elegendő. A pontos adagolás azonban függ a dob
                méretétől, a ruhák szennyezettségétől, a vízkeménységtől és attól is, milyen programot indítasz.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Erősen szennyezett ruháknál vagy nagyobb töltetnél több mosóerőre lehet szükség, de a tudatos
                mennyiségválasztás segít elkerülni a pazarlást.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-adagolas">
                Mosókapszula adagolás
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Használható a mosókapszula alacsony hőfokon?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A modern mosási rutinban egyre többen mosnak 20-30°C körüli hőfokon, mert ezzel energiát lehet
                megtakarítani, és sok ruhadarab kíméletesebben kezelhető.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A kapszula alacsony hőfokon is jó választás lehet, ha a program elég hosszú, a dob nincs túltöltve,
                és a kapszula a megfelelő helyre kerül.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-20-fokon">
                Mosókapszula 20 fokon
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Miért nem oldódik fel néha a mosókapszula?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ha a mosókapszula nem oldódik fel teljesen, annak több oka is lehet. Gyakori hiba a túl rövid
                program, a túlzsúfolt mosógép vagy a rossz elhelyezés.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A kapszula akkor működik a legjobban, ha kap elég vízmozgást a program elején, ezért sokszor már egy
                kisebb rutinmódosítás is látványosan segít.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-nem-oldodik-fel">
                Miért nem oldódik fel a mosókapszula
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Mosókapszula vagy folyékony mosószer?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosókapszula kényelmes, előre adagolt és gyorsan használható. A folyékony mosószer rugalmasabb
                adagolást adhat, például nagyon kis töltetnél vagy speciális előkezelésnél.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A választás akkor lesz igazán jó, ha a saját mosási szokásaidhoz igazítod: mennyit mosol, milyen
                változó a ruhamennyiség, és mennyire fontos a gyors, tiszta rutin.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/mosokapszula-vagy-folyekony-mososzer">
                Mosókapszula vagy folyékony mosószer
              </Link>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Hogyan kapcsolódik a hőfok a mosási költséghez?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Az alacsonyabb hőfok csökkentheti az energiafelhasználást, de nem minden helyzetben a legalacsonyabb
                program a legjobb döntés. Enyhén szennyezett ruháknál a 20-30°C is elég lehet, más textíliáknál
                viszont indokolt lehet magasabb hőfok.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Érdemes a hőfokot nem megszokásból választani, hanem ahhoz igazítani, hogy milyen ruhákat mosol és
                milyen tisztasági eredményt vársz.
              </p>
              <div className="mt-4">
                <Link className={linkClassName} href="/mosas-30-fokon-vagy-40-fokon">
                  30 fokos vagy 40 fokos mosás
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Kinek jó választás az Aquadrop Expert Pro?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Az Aquadrop Expert Pro azoknak készült, akik kényelmes, előre adagolt és prémium érzetű mosási
                megoldást keresnek a mindennapokra. Jó választás lehet családi háztartásokban, rendszeresen mosó
                felhasználóknak, valamint azoknak, akik egyszerűbbé tennék a mosószer adagolását.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A termék jelenleg viszonteladóknál érhető el, így a főoldal elsődlegesen tájékozódásra, tudatos
                választásra és a promóciós lehetőségek áttekintésére szolgál.
              </p>
              <Link className={`${linkClassName} mt-4 inline-flex`} href="/energiatakarekos-mosas">
                Energiatakarékos mosás
              </Link>
            </article>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 md:flex md:items-center md:justify-between md:gap-6">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-slate-900">Nem tudod, melyik mosási rutin illik hozzád?</h3>
              <p className="mt-2 text-base leading-7 text-slate-700">
                Nézd meg a mosási költség kalkulátort, vagy válaszd ki a tudástárból azt az útmutatót, amelyik a
                saját kérdésedre ad választ.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:mt-0 md:w-auto md:flex-row">
              <Link
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-cyan-800 md:w-auto"
                href="/mosasi-koltseg-kalkulator"
              >
                Mosási költség kalkulátor
              </Link>
              <Link
                className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-bold text-cyan-900 transition hover:bg-cyan-50 md:w-auto"
                href="#knowledge-hub-title"
              >
                Mosókapszula tudástár
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
