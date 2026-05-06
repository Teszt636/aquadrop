export type ArticleSlug =
  | 'energiatakarekos-mosas'
  | 'mosas-30-fokon-vagy-40-fokon'
  | 'mosokapszula-20-fokon'
  | 'mosokapszula-adagolas'
  | 'mosokapszula-dobba-vagy-adagoloba'
  | 'mosokapszula-hasznalata'
  | 'mosokapszula-nem-oldodik-fel'
  | 'mosokapszula-vagy-folyekony-mososzer'
  | 'hogyan-mossunk-20-fokon'
  | 'mosasi-koltseg-kalkulator'
  | 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol';

export type ArticleConfigItem = {
  slug: ArticleSlug;
  title: string;
  description: string;
  category: string;
  relatedSlugs: [ArticleSlug, ArticleSlug, ArticleSlug];
};

export const articleConfig: Record<ArticleSlug, ArticleConfigItem> = {
  'energiatakarekos-mosas': {
    slug: 'energiatakarekos-mosas',
    title: 'Energiatakarékos mosás: tiszta ruhák alacsony hőfokon is',
    description:
      'Alapok, beállítások és gyakorlati rutinok az energiatudatos, alacsony hőfokú mosáshoz kompromisszumok nélkül.',
    category: 'Mosási útmutató',
    relatedSlugs: ['hogyan-mossunk-20-fokon', 'mosas-30-fokon-vagy-40-fokon', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol']
  },
  'mosas-30-fokon-vagy-40-fokon': {
    slug: 'mosas-30-fokon-vagy-40-fokon',
    title: '30 fokos vagy 40 fokos mosás: mikor melyiket válaszd?',
    description:
      'Gyakorlati útmutató a 30 és 40 fokos mosás közötti választáshoz, költségekkel és ruhakíméléssel együtt.',
    category: 'Összehasonlító útmutató',
    relatedSlugs: ['energiatakarekos-mosas', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol', 'mosasi-koltseg-kalkulator']
  },
  'mosokapszula-20-fokon': {
    slug: 'mosokapszula-20-fokon',
    title: 'Mosókapszula 20 fokon: feloldódik és tisztít rendesen?',
    description:
      'Mikor működik jól a mosókapszula 20 fokon, hova tedd, és hogyan előzd meg az oldódási hibákat.',
    category: 'Mosási útmutató',
    relatedSlugs: ['hogyan-mossunk-20-fokon', 'mosokapszula-dobba-vagy-adagoloba', 'mosokapszula-nem-oldodik-fel']
  },
  'mosokapszula-adagolas': {
    slug: 'mosokapszula-adagolas',
    title: 'Mosókapszula adagolás: hány kapszula kell?',
    description:
      'Tudd meg, mikor elég egy kapszula, mikor lehet szükség többre, és hogyan kerüld el a túladagolást.',
    category: 'Mosási útmutató',
    relatedSlugs: ['mosokapszula-hasznalata', 'mosokapszula-nem-oldodik-fel', 'hogyan-mossunk-20-fokon']
  },
  'mosokapszula-dobba-vagy-adagoloba': {
    slug: 'mosokapszula-dobba-vagy-adagoloba',
    title: 'Mosókapszula dobba vagy adagolóba?',
    description:
      'Megmutatjuk, hova kell tenni a mosókapszulát, és miért nem érdemes az adagolófiókba rakni.',
    category: 'Mosási útmutató',
    relatedSlugs: ['mosokapszula-hasznalata', 'mosokapszula-adagolas', 'mosokapszula-nem-oldodik-fel']
  },
  'mosokapszula-hasznalata': {
    slug: 'mosokapszula-hasznalata',
    title: 'Mosókapszula használata: hova kell tenni és mennyit használj?',
    description:
      'Lépésről lépésre útmutató a mosókapszula helyes elhelyezéséhez, adagolásához és a stabil napi mosási rutinhoz.',
    category: 'Mosási útmutató',
    relatedSlugs: ['mosokapszula-20-fokon', 'mosokapszula-nem-oldodik-fel', 'hogyan-mossunk-20-fokon']
  },
  'mosokapszula-nem-oldodik-fel': {
    slug: 'mosokapszula-nem-oldodik-fel',
    title: 'Miért nem oldódik fel a mosókapszula? Gyakori hibák és megoldások',
    description:
      'A leggyakoribb oldódási hibák és azonnal alkalmazható megoldások, hogy maradék nélkül, kiszámíthatóbban működjön a mosás.',
    category: 'Hibaelhárítás',
    relatedSlugs: ['mosokapszula-hasznalata', 'hogyan-mossunk-20-fokon', 'energiatakarekos-mosas']
  },
  'mosokapszula-vagy-folyekony-mososzer': {
    slug: 'mosokapszula-vagy-folyekony-mososzer',
    title: 'Mosókapszula vagy folyékony mosószer – melyik a jobb választás?',
    description:
      'Objektív összehasonlítás a kapszulás és folyékony mosási megoldások között a kényelmesebb, tudatosabb döntéshez.',
    category: 'Összehasonlító útmutató',
    relatedSlugs: ['mosokapszula-hasznalata', 'mosokapszula-nem-oldodik-fel', 'energiatakarekos-mosas']
  },
  'hogyan-mossunk-20-fokon': {
    slug: 'hogyan-mossunk-20-fokon',
    title: 'Hogyan mossunk hatékonyan 20 fokon?',
    description:
      'Gyakorlati tanácsok a 20 fokos mosáshoz: programidő, adagolás, kapszulaelhelyezés és mindennapi hibák megelőzése.',
    category: 'Mosási útmutató',
    relatedSlugs: ['mosokapszula-20-fokon', 'energiatakarekos-mosas', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol']
  },
  'mosasi-koltseg-kalkulator': {
    slug: 'mosasi-koltseg-kalkulator',
    title: 'Mosási költség kalkulátor',
    description:
      'Interaktív kalkulátor a mosási hőfok, heti mosásszám és energiaár alapján becsült költségkülönbséghez.',
    category: 'Energiatakarékosság',
    relatedSlugs: ['mosas-30-fokon-vagy-40-fokon', 'energiatakarekos-mosas', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol']
  },
  'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol': {
    slug: 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol',
    title: 'Mennyit spórolhatsz, ha 40 helyett 20 fokon mosol?',
    description:
      'Konkrét becslések és gyakorlati irányok arról, mekkora különbséget jelenthet a hőfokváltás a mosási költségekben.',
    category: 'Energiatakarékosság',
    relatedSlugs: ['energiatakarekos-mosas', 'mosas-30-fokon-vagy-40-fokon', 'hogyan-mossunk-20-fokon']
  }
};

export function getRelatedArticles(slug: ArticleSlug): ArticleConfigItem[] {
  return articleConfig[slug].relatedSlugs.map((relatedSlug) => articleConfig[relatedSlug]);
}
