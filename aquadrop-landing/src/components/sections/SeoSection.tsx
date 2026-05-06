import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const linkClassName = 'font-medium text-cyan-800 underline underline-offset-4';

export function SeoSection() {
  return (
    <section className="ds-section pt-10">
      <div className="ds-container">
        <div className="ds-floating-panel px-6 py-8 md:px-10 md:py-12">
          <SectionHeading>Mosókapszula választás: mit érdemes tudni vásárlás előtt?</SectionHeading>

          <p className="mt-6 max-w-4xl text-base leading-7 text-slate-700">
            A mosókapszula akkor jó választás, ha egyszerű, előre adagolt és kiszámítható mosási megoldást keresel. A
            jó eredményhez azonban nem csak a kapszula minősége számít: fontos a hőfok, a programhossz, a
            ruhamennyiség, az elhelyezés és az is, hogy milyen típusú ruhákat mosol. Az Aquadrop Expert Pro célja,
            hogy a mindennapi mosás kényelmesebb, frissebb és tudatosabb legyen.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="text-2xl font-semibold text-slate-900">Miért választanak sokan mosókapszulát?</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosókapszula egyik legnagyobb előnye az egyszerű adagolás. Nem kell külön mérni a folyékony
                mosószert, nem kell kupakkal bajlódni, és kisebb az esélye annak, hogy túl sok vagy túl kevés
                mosószer kerül a gépbe. Egy kapszula előre kimért mennyiséget tartalmaz, ezért a hétköznapi mosás
                gyorsabbá és kényelmesebbé válhat.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A kapszulás megoldás különösen azoknak praktikus, akik rendszeresen mosnak vegyes ruhákat, sportosabb
                hétköznapi darabokat, törölközőket vagy családi ruhákat. A részletes{' '}
                <Link className={linkClassName} href="/mosokapszula-hasznalata">
                  mosókapszula használata
                </Link>{' '}
                útmutató segít abban, hogy a kapszula a dob aljára kerüljön még a ruhák betöltése előtt.
              </p>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">Hova kell tenni a mosókapszulát?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosókapszulát nem az adagolófiókba érdemes tenni, hanem közvetlenül a mosógép dobjába. A legjobb
                sorrend: először a kapszula, utána a ruhák. Így a kapszula hamarabb érintkezik vízzel, és könnyebben
                tud feloldódni a mosási program elején.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ez különösen alacsony hőfoknál fontos. Ha bizonytalan vagy benne, hogy a{' '}
                <Link className={linkClassName} href="/mosokapszula-dobba-vagy-adagoloba">
                  mosókapszula dobba vagy adagolóba
                </Link>{' '}
                kerüljön, érdemes ezt a lépést tisztázni, mert a jó elhelyezés sok kellemetlen mosási hibát előz meg.
              </p>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">Hány mosókapszula kell egy mosáshoz?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Átlagos ruhamennyiséghez általában egy kapszula elegendő. A pontos adagolás azonban függ a dob
                méretétől, a ruhák szennyezettségétől, a vízkeménységtől és attól is, hogy milyen programot
                választasz. Erősen szennyezett ruháknál vagy nagyobb töltetnél több mosóerőre lehet szükség, de a
                túladagolás nem mindig ad jobb eredményt.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A tudatos{' '}
                <Link className={linkClassName} href="/mosokapszula-adagolas">
                  mosókapszula adagolás
                </Link>{' '}
                azért is fontos, mert segít elkerülni a pazarlást, miközben a kapszulás mosás kényelmes és
                kiszámítható része marad a rutinodnak.
              </p>
            </article>

            <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="text-2xl font-semibold text-slate-900">Használható a mosókapszula alacsony hőfokon?</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A modern mosási rutinban egyre többen mosnak 20-30°C körüli hőfokon, mert ezzel energiát lehet
                megtakarítani, és sok ruhadarab kíméletesebben kezelhető. A mosókapszula alacsony hőfokon is jó
                választás lehet, ha a program elég hosszú, a dob nincs túltöltve, és a kapszula megfelelő helyre
                kerül.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A{' '}
                <Link className={linkClassName} href="/mosokapszula-20-fokon">
                  mosókapszula 20 fokon
                </Link>{' '}
                is jól működhet bizonyos helyzetekben, és az{' '}
                <Link className={linkClassName} href="/energiatakarekos-mosas">
                  energiatakarékos mosás
                </Link>{' '}
                szempontjait is könnyebb beépíteni a hétköznapokba, ha a hőfokot mindig a ruha típusához és a
                szennyezettséghez igazítod.
              </p>

              <div className="mt-6 rounded-2xl bg-cyan-50 p-4">
                <h3 className="text-lg font-semibold text-slate-900">Röviden: mire figyelj alacsony hőfoknál?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Válassz elég hosszú programot, ne tömd tele a dobot, és tedd a kapszulát a dob aljára még a ruhák
                  előtt. Ezek az apró lépések sokat számítanak 20-30°C-os mosásnál.
                </p>
              </div>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">Miért nem oldódik fel néha a mosókapszula?</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ha a mosókapszula nem oldódik fel teljesen, annak több oka is lehet. Gyakori hiba a túlzsúfolt
                mosógép, a túl rövid program, a rossz elhelyezés vagy az, hogy a kapszula nem kap elég vízmozgást a
                program elején. Alacsony hőfokon ezek a hibák könnyebben észrevehetők.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A{' '}
                <Link className={linkClassName} href="/mosokapszula-nem-oldodik-fel">
                  miért nem oldódik fel a mosókapszula
                </Link>{' '}
                kérdésre sokszor egyszerű a válasz: a kapszulát a dob aljára kell tenni, nem szabad túlpakolni a
                gépet, és érdemes olyan programot választani, amely elég időt ad az oldódáshoz.
              </p>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">
                Mosókapszula vagy folyékony mosószer: melyik jobb?
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Nincs minden helyzetre egyetlen jó válasz. A mosókapszula kényelmes, előre adagolt és gyorsan
                használható. A folyékony mosószer rugalmasabb adagolást adhat, például nagyon kis töltetnél vagy
                speciális előkezelésnél.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ha szeretnéd átlátni, mikor előnyös a{' '}
                <Link className={linkClassName} href="/mosokapszula-vagy-folyekony-mososzer">
                  mosókapszula vagy folyékony mosószer
                </Link>{' '}
                használata, érdemes a saját mosási rutinodra nézni: mennyit mosol, mennyire változó a ruhamennyiség,
                és mennyire fontos a gyors, tiszta adagolás.
              </p>
            </article>

            <article className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="text-2xl font-semibold text-slate-900">Hogyan kapcsolódik a mosás hőfoka a költségekhez?</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A mosási hőfok jelentősen befolyásolhatja az energiafelhasználást. A magasabb hőfok több energiát
                igényelhet, míg az alacsonyabb hőfok tudatos programválasztással segíthet csökkenteni a mosási
                költséget. A megtakarítás mértéke attól függ, milyen gyakran mosol, milyen programokat használsz, és
                milyen hőfokon indítod a gépet.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A{' '}
                <Link className={linkClassName} href="/mosasi-koltseg-kalkulator">
                  mosási költség kalkulátor
                </Link>{' '}
                és a{' '}
                <Link className={linkClassName} href="/mosas-30-fokon-vagy-40-fokon">
                  30 fokos vagy 40 fokos mosás
                </Link>{' '}
                témája abban segít, hogy ne megszokásból válassz programot, hanem a ruhákhoz és a szennyeződéshez
                igazítsd a döntést.
              </p>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">
                Miért fontos, hogy nincs közvetlen online értékesítés?
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Az Aquadrop.hu jelenleg márkaoldalként működik. Ez azt jelenti, hogy a terméket nem ezen az oldalon
                vásárolod meg közvetlenül, hanem viszonteladó partnereknél keresheted. A főoldal célja, hogy
                bemutassa a terméket, segítsen a helyes használatban, és megkönnyítse az ajándék promóció vagy a
                viszonteladói érdeklődés kezelését.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ez a modell a vásárlói edukációt is támogatja. Először megismerheted a használati szempontokat,
                átnézheted a leggyakoribb kérdéseket, majd a partnereknél tudsz tájékozódni az elérhetőségről és a
                beszerzésről.
              </p>

              <h3 className="mt-8 text-xl font-semibold text-slate-900">
                Kinek lehet jó választás az Aquadrop Expert Pro?
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Az Aquadrop Expert Pro azoknak készült, akik kényelmes, előre adagolt és prémium érzetű mosási
                megoldást keresnek a mindennapokra. Jó választás lehet családi háztartásokban, rendszeresen mosó
                felhasználóknak, valamint azoknak, akik szeretnék egyszerűbbé tenni a mosószer adagolását.
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Ha még csak ismerkedsz a kapszulás mosással, érdemes először a használati útmutatókat átnézni, majd a
                saját mosási szokásaidhoz igazítani a hőfokot, a programhosszt és az adagolást. Így a prémium
                mosókapszula kényelmesebb és kiszámíthatóbb része lehet a mindennapi mosásnak.
              </p>

              <div className="mt-6 flex justify-center">
                <ButtonLink href="#gift-form">
                  Próbáld ki most – 2 doboz vásárlása esetén adunk plusz egyet ajándékba
                </ButtonLink>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
