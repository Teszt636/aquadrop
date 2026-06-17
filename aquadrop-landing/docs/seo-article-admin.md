# SEO cikk admin

## Új cikk feltöltése

1. Lépj be az admin felületre.
2. Nyisd meg a **SEO cikkek** menüpontot.
3. Kattints az **Új SEO cikk** gombra.
4. Töltsd ki a címet, slugot, célcsoportot, cikk célt, SEO címet, meta leírást és a törzsszöveget.
5. Hagyd `draft` státuszban, amíg a cikk nincs ellenőrizve.
6. Publikáláskor állítsd a státuszt `published` értékre és kapcsold be az indexelhetőséget.

## Célcsoport

- `consumer`: Lakossági tudástár, a `/tudastar` oldalon jelenik meg.
- `partner`: Viszonteladói tudástár, a `/partner/tudastar` oldalon jelenik meg.

## Cikk célja

A cikk célja határozza meg, milyen automatikus CTA jelenik meg a cikk végén. A lakossági célok termékedukációra, problémamegoldásra, energiatakarékosságra és használati útmutatóra valók. A partner célok viszonteladói érdeklődésre, nagykereskedelmi érdeklődésre, kiskereskedelmi stratégiára és partner edukációra valók.

## CTA működése

A cikk végén nem kézzel szerkesztett CTA jelenik meg. A rendszer az `article_goal` mező alapján választ címet, szöveget, gombfeliratot és linket. Így a SEO cikkek egységesen vezetnek tovább a főoldalra, kapcsolódó útmutatóra vagy a partner oldalra.

## Ajánlott cikkek

A rendszer legfeljebb 3 ajánlott cikket jelenít meg:

1. Először a `manual_related_article_ids` mezőben megadott cikkeket.
2. Csak `published` és `is_indexable=true` cikk jelenhet meg.
3. A saját cikk soha nem ajánlott.
4. Azonos célcsoporton belül előnyt kap az azonos kategória és azonos cikk cél.
5. Ha nincs elég találat, a legfrissebb, azonos célcsoportú publikált cikkek egészítik ki a listát.

## Sitemap

Egy cikk akkor kerül sitemapbe, ha:

- `status = published`
- `is_indexable = true`
- lakossági cikk esetén a címe `/tudastar/[slug]`
- partner cikk esetén a címe `/partner/tudastar/[slug]`

Draft és archived cikk nem kerül sitemapbe.

## Publikálás előtti ellenőrzés

Publikálás előtt ellenőrizd:

- A cím nem üres.
- A slug nem üres.
- A törzsszöveg legalább 1000 karakter.
- A SEO cím ki van töltve.
- A meta leírás ki van töltve.
- A célcsoport és a cikk célja megfelelő.
- Az `is_indexable` be van kapcsolva, ha a cikk publikus és indexelhető legyen.
- A hero kép URL és alt szöveg akkor legyen kitöltve, ha a cikkhez saját kép tartozik.
