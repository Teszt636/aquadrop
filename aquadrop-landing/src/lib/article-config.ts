export type ArticleSlug =
  | 'energiatakarekos-mosas'
  | 'mosokapszula-hasznalata'
  | 'mosokapszula-nem-oldodik-fel'
  | 'mosokapszula-vagy-folyekony-mososzer'
  | 'hogyan-mossunk-20-fokon'
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
    relatedSlugs: ['hogyan-mossunk-20-fokon', 'mosokapszula-hasznalata', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol']
  },
  'mosokapszula-hasznalata': {
    slug: 'mosokapszula-hasznalata',
    title: 'Mosókapszula használata: hova kell tenni és mennyit használj?',
    description:
      'Lépésről lépésre útmutató a mosókapszula helyes elhelyezéséhez, adagolásához és a stabil napi mosási rutinhoz.',
    category: 'Mosási útmutató',
    relatedSlugs: ['mosokapszula-nem-oldodik-fel', 'hogyan-mossunk-20-fokon', 'mosokapszula-vagy-folyekony-mososzer']
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
    relatedSlugs: ['energiatakarekos-mosas', 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol', 'mosokapszula-nem-oldodik-fel']
  },
  'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol': {
    slug: 'mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol',
    title: 'Mennyit spórolhatsz, ha 40 helyett 20 fokon mosol?',
    description:
      'Konkrét becslések és gyakorlati irányok arról, mekkora különbséget jelenthet a hőfokváltás a mosási költségekben.',
    category: 'Energiatakarékosság',
    relatedSlugs: ['energiatakarekos-mosas', 'hogyan-mossunk-20-fokon', 'mosokapszula-vagy-folyekony-mososzer']
  }
};

export function getRelatedArticles(slug: ArticleSlug): ArticleConfigItem[] {
  return articleConfig[slug].relatedSlugs.map((relatedSlug) => articleConfig[relatedSlug]);
}
