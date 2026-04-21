import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function SeoSection() {
  return (
    <section className="ds-section pt-10">
      <div className="ds-container">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-card md:px-10 md:py-12">
          <SectionHeading>Mosókapszula – amit érdemes tudni választás előtt</SectionHeading>

          <div className="mt-8 space-y-8 text-base leading-7 text-slate-700">
            <article>
              <h3 className="text-xl font-semibold text-slate-900">Mi az a mosókapszula, és miért egyre népszerűbb?</h3>
              <p className="mt-3">
                A mosókapszula egy előre adagolt, koncentrált mosószer, amely megkönnyíti a mindennapi mosást. Nem
                kell külön mérni vagy adagolni, egyetlen kapszula elegendő egy mosáshoz.
              </p>
              <p className="mt-3">
                Az elmúlt években egyre többen váltanak kapszulás megoldásra, mert gyorsabb, kényelmesebb és sok
                esetben hatékonyabb is, mint a hagyományos por vagy folyékony mosószerek.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-semibold text-slate-900">
                Miért jobb választás a mosókapszula a hagyományos mosószernél?
              </h3>
              <p className="mt-3">
                A kapszulák egyik legnagyobb előnye a pontos adagolás. Nem fordul elő túladagolás vagy aluladagolás,
                ami nemcsak a ruhák tisztaságára, hanem a mosógép állapotára is pozitív hatással van.
              </p>
              <p className="mt-3">
                A koncentrált formula gyorsan oldódik, és már alacsonyabb hőfokon is hatékonyan működik. Ez
                energiatakarékosabb mosást is lehetővé tesz.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-semibold text-slate-900">Mitől számít prémium minőségűnek egy mosókapszula?</h3>
              <p className="mt-3">Egy prémium mosókapszula nem csak tisztít, hanem komplex megoldást kínál:</p>
              <ul className="mt-3 list-inside list-disc space-y-1">
                <li>hatékony folteltávolítás</li>
                <li>friss illat</li>
                <li>színvédelem</li>
                <li>gyors oldódás</li>
              </ul>
              <p className="mt-3">
                Az Aquadrop Expert Pro ilyen szempontból egy modern, koncentrált megoldás, amely a mindennapi
                használat során is stabil teljesítményt nyújt.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-semibold text-slate-900">Mikor érdemes mosókapszulát használni?</h3>
              <p className="mt-3">A kapszulás mosás ideális választás:</p>
              <ul className="mt-3 list-inside list-disc space-y-1">
                <li>ha gyors és egyszerű megoldást keresel</li>
                <li>ha fontos a kényelmes adagolás</li>
                <li>ha szeretnéd elkerülni a mosószer pazarlását</li>
                <li>ha egységes, megbízható eredményt szeretnél</li>
              </ul>
            </article>

            <article>
              <h3 className="text-xl font-semibold text-slate-900">Hogyan illeszkedik ebbe az Aquadrop Expert Pro?</h3>
              <p className="mt-3">
                Az Aquadrop Expert Pro egy olyan mosókapszula, amely a modern elvárásokhoz igazodik. A Dubai gyártói
                háttér, a koncentrált formula és a felhasználóbarát kialakítás együtt biztosítják, hogy a mosás
                egyszerűbb és hatékonyabb legyen.
              </p>
              <p className="mt-3">
                Ha egy megbízható, könnyen használható és korszerű megoldást keresel, érdemes kipróbálni.
              </p>
              <ButtonLink
                href="#gift-campaign"
                className="mt-4 inline-flex px-6 py-3 text-sm md:text-base"
              >
                Próbáld ki most – 2 doboz vásárlása esetén adunk plusz egyet ajándékba
              </ButtonLink>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
