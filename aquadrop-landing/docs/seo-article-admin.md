# SEO cikk admin

## Új cikk feltöltése

1. Lépj be az admin felületre.
2. Nyisd meg a **SEO cikkek** menüpontot.
3. Kattints az **Új SEO cikk** gombra.
4. A megnyíló cikk szerkesztőben töltsd ki az alapadatokat, SEO adatokat és a törzsszöveget.
5. Hagyd `draft` státuszban, amíg a cikk nincs ellenőrizve.
6. Publikáláskor állítsd a státuszt `published` értékre.

## Cím, slug, SEO cím és meta leírás

- A **Cikk címe** a publikus oldali H1.
- A **Slug** a publikus URL vége. A szerkesztőben a cím alapján generálható, de publikálás előtt kézzel ellenőrizd.
- A **SEO cím** jelenik meg a metadata title mezőben.
- A **Meta leírás** jelenik meg a keresőtalálati leírásként és az Open Graph leírásban.

## Markdown törzsszöveg

A `body` mező Markdown szövegként értelmezett. Nincs külön `body_format` mező, ezért a rendszer minden SEO cikk törzsszövegét Markdownként kezeli.

Használható alap formázások:

- `## Alcím` H2 alcímhez
- `### Kisebb alcím` H3 alcímhez
- `- felsorolás` listához
- `**kiemelés**` félkövér szöveghez
- `[link szövege](https://pelda.hu)` linkhez

A publikus oldalon a cikk címe az egyetlen H1. Ha a body első sora `# Cikk címe`, a rendszer azt H2-ként jeleníti meg.

## Előnézet

A szerkesztőben az **Előnézet** blokk a Markdown törzsszöveg publikus megjelenéséhez közeli képet mutat. Az előnézet nem futtat HTML-t, csak a támogatott Markdown elemeket alakítja React elemekké.

## Célcsoport

- `consumer`: Lakossági tudástár, a `/tudastar` oldalon jelenik meg.
- `partner`: Viszonteladói tudástár, a `/partner/tudastar` oldalon jelenik meg.

## Cikk célja és CTA

A cikk célja határozza meg, milyen automatikus CTA jelenik meg a cikk végén. A CTA-t nem kell kézzel beírni a törzsszövegbe. A rendszer az `article_goal` mező alapján választ címet, szöveget, gombfeliratot és linket.

## Másodlagos kulcsszavak

Az adminban a másodlagos kulcsszavakat vesszővel elválasztva lehet megadni. Mentéskor a rendszer trimeli az elemeket, törli az üres értékeket, és `text[]` tömbként menti az adatbázisba.

## Ajánlott cikkek

Alapértelmezetten az automatikus ajánlók működnek. A rendszer legfeljebb 3 cikket jelenít meg:

- csak `published` és `is_indexable=true` cikkeket mutat
- saját cikket nem ajánl
- azonos célcsoporton belül keres
- előnyben részesíti az azonos kategóriát és azonos cikk célt
- ha nincs elég találat, a legfrissebb azonos célcsoportú publikált cikkekkel egészít ki

A kézi ajánlott cikk ID-k haladó blokkban érhetők el, így normál cikkfeltöltéskor nem kell nyers tömböt szerkeszteni.

## Sitemap

Egy cikk akkor kerül sitemapbe, ha:

- `status = published`
- `is_indexable = true`
- lakossági cikk esetén az URL `/tudastar/[slug]`
- partner cikk esetén az URL `/partner/tudastar/[slug]`

Ha egy cikk publikált, de nem indexelhető, megjelenhet publikus URL-en csak akkor, ha a publikus lekérő engedi. A jelenlegi publikus lekérők és sitemap csak `is_indexable=true` cikket adnak vissza.

## IndexNow

Az adminos SEO cikkek akkor alkalmasak IndexNow beküldésre, ha:

- `status = published`
- `is_indexable = true`
- a cikk URL-je szerepel a sitemapben

A `/tudastar` és `/partner/tudastar` listaoldalak is beküldhetők IndexNow-ra. A cikk detail oldalaknál az IndexNow szűrés a sitemapben szereplő URL-ekkel van összhangban, ezért draft, archived és nem indexelhető cikkek nem küldhetők be.

Az IndexNow beküldés canonical hostja egységesen `https://www.aquadrop.hu`.

## Publikálás előtti ellenőrzés

Publikálás előtt kötelező:

- cím
- slug
- legalább 1000 karakteres törzsszöveg
- SEO cím
- meta leírás
- célcsoport
- cikk célja

Ha `published_at` üres és a cikk `published` státuszt kap, a rendszer automatikusan beállítja az aktuális dátumot. Ha a cikk publikált, de `is_indexable=false`, az admin figyelmeztet, hogy nem kerül sitemapbe.
