import Link from 'next/link';

const knowledgeArticles = [
  {
    title: 'Mosókapszula használata',
    description:
      'Hova kerüljön a kapszula, mennyit használj, és mire figyelj a helyes adagolásnál.',
    href: '/mosokapszula-hasznalata',
    category: 'Alapok'
  },
  {
    title: 'Miért nem oldódik fel a mosókapszula?',
    description:
      'Gyakori hibák és gyakorlati megoldások, ha maradvány marad a ruhán vagy a mosógépben.',
    href: '/mosokapszula-nem-oldodik-fel',
    category: 'Alapok'
  },
  {
    title: 'Mosókapszula vagy folyékony mosószer',
    description:
      'Összehasonlító útmutató a kényelmes, modern és kiszámítható mosási megoldásokhoz.',
    href: '/mosokapszula-vagy-folyekony-mososzer',
    category: 'Összehasonlítás'
  },
  {
    title: 'Energiatakarékos mosás',
    description:
      'Átfogó útmutató az alacsony hőfokú, textilkímélő és tudatos mosási szokásokhoz.',
    href: '/energiatakarekos-mosas',
    category: 'Energiatakarékosság'
  },
  {
    title: 'Hogyan mossunk 20 fokon',
    description:
      'Mire figyelj, ha alacsony hőfokon is tiszta és foltmentes eredményt szeretnél elérni.',
    href: '/hogyan-mossunk-20-fokon',
    category: 'Energiatakarékosság'
  },
  {
    title: 'Mennyit spórolhatsz 20 fokos mosással',
    description:
      'Interaktív kalkulátorral mutatjuk meg, mit jelenthet a hőfokváltás a mosási költségekben.',
    href: '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol',
    category: 'Energiatakarékosság'
  }
] as const;

export function HomeKnowledgeHub() {
  return (
    <section className="ds-section" aria-labelledby="knowledge-hub-title">
      <div className="ds-container">
        <div className="ds-floating-panel space-y-7 px-5 py-7 sm:px-7 md:px-10 md:py-9">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <h2
              id="knowledge-hub-title"
              className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
            >
              Mosókapszula tudástár
            </h2>
            <p className="text-base leading-relaxed text-slate-700 md:text-lg">
              Még bizonytalan vagy, vagy szeretnéd jobban átlátni, hogyan működik az energiatakarékos és
              kiszámítható mosás? Nézd meg az alábbi útmutatókat.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {knowledgeArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="group flex h-full min-h-[190px] flex-col rounded-2xl border border-white/55 bg-white/60 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] backdrop-blur-md transition duration-300 ease-out hover:-translate-y-0.5 hover:border-sky-200/70 hover:bg-white/70 hover:shadow-[0_14px_34px_rgba(14,116,144,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2"
              >
                <span className="inline-flex w-fit rounded-full border border-sky-100 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700/85">
                  {article.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-sky-800">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{article.description}</p>
                <span className="mt-auto pt-4 text-sm font-medium text-sky-800/90">Útmutató megnyitása</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
