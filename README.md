# Novoroční video – rok 2026 v Unhošti

Stránka, kam obyvatelé Unhoště posílají videa do filmu, který skládá Tonda Mittelbach. Veřejně se jmenuje akce **Novoroční video – rok 2026 v Unhošti**. V právních textech je celé jméno Antonín Mittelbach. K nahrávkám má přístup i Martin Cajthaml, tvůrce stránky, a pověření lidé města. Film se 1. ledna 2027 promítá na náměstí.

Výzva přijímá videa do 30. listopadu 2026, 23:59:59 středoevropského času. Po tomhle okamžiku server příspěvek odmítne.

Databáze v projektu není. Velká videa i malé záznamy o nich leží v jednom soukromém Vercel Blobu.

## Stack

- Next.js 16 (App Router), React 19, Tailwind CSS 4
- `cacheComponents` a `partialPrefetching` v `next.config.ts`
- `@vercel/blob` 2.x, úložiště `video2026`, region Frankfurt (`fra1`), přístup `private`
- Nasazení na Vercelu, projekt `video2026.muunhost.cz`

## Stránky

| Cesta | K čemu je |
| --- | --- |
| `/` | Výzva a formulář. Není v ní odkaz na správu. |
| `/ochrana-udaju` | Celé informace o zpracování osobních údajů. |
| `/spravce` | Heslem chráněný seznam videí, přehrání a stažení. `robots.txt` ji i `/api/spravce/` zakazuje. |

Ve formuláři jsou celé informace sbalené. Rozbalí se odkazem „Celé informace o zpracování osobních údajů“.

## Nahrání

Soubor nejde přes serverless funkci. Prohlížeč ho posílá rovnou do Blobu. Limit je 2 GB (`2 * 1024^3` bajtů). Povolené přípony jsou mp4, m4v, mov, webm, mkv, avi, mpeg, mpg a 3gp.

1. `POST /api/prispevky` ověří jméno, e-mail, telefon, typ a velikost souboru, verzi souhlasu a všechna čtyři potvrzení. Prázdné pole `fax` je past na roboty; vyplněné se tiše odmítne. Vznikne koncept `drafts/{uuid}.json` se stavem `pending` a plánovanou cestou `videos/{uuid}/{nazev}`.
2. Prohlížeč zavolá `upload()` z `@vercel/blob/client` na `POST /api/upload`. Token platí 3 hodiny, soubor nad 4 MB jde po částech, přístup je `private`. Server token vydá jen k existujícímu konceptu a jen na jeho cestu.
3. `POST /api/prispevky/{id}` koncept uzavře: ověří velikost a typ přes `head`, zapíše `submissions/{id}.json` se stavem `complete` a koncept smaže. Stejný krok umí udělat webhook `onUploadCompleted`. Na localhostu webhook neběží, proto je dokončení z prohlížeče směrodatné. Oba vstupy jsou idempotentní.
4. Zrušení nebo selhání před uzavřením volá `DELETE /api/prispevky/{id}` a smaže rozpracované video i JSON. Když koncept už neexistuje a hotový záznam taky ne, osiřelý soubor se zahodí.

Koncept starší než 48 hodin se smaže při založení dalšího příspěvku. Maže se jen prefix `drafts/`.

Telefon lidé vyplňují bez předvolby. Pole má pevné `+420`. Když někdo vloží `+420` nebo `00420`, předvolba se ořízne. Uložený tvar je `+420 XXX XXX XXX`, devět číslic.

IP adresa se neukládá. U záznamu zůstane oříznutý `User-Agent` (nejvýš 300 znaků).

## Co leží v Blobu

| Cesta | Obsah |
| --- | --- |
| `drafts/{uuid}.json` | Rozpracovaný příspěvek. |
| `submissions/{uuid}.json` | Hotový příspěvek: kontakt, znění souhlasů, název souboru, velikost, časy. |
| `videos/{uuid}/{nazev}` | Samotné video. |

Správa čte jen `submissions/`. Seznam vznikne vypsáním prefixu a přečtením jednotlivých JSON (po osmi najednou), seřazený od nejnovějšího. Pro desítky až nízké stovky příspěvků stačí. Databáze by začala dávat smysl až u tisíců záznamů, které se mají filtrovat.

Přehrání a stažení nejde přes funkci. `POST /api/spravce/odkaz` vyžaduje přihlášení a vrátí podepsaný odkaz na `get`. Platí 30 minut. Stažení je stejný odkaz s `download=1`; ten parametr není součástí podpisu. Bez přihlášení endpoint vrací 401.

Surové nahrávky nejsou veřejné. Text na stránce říká, že kontakt a video se mažou do 31. března 2027. Tohle mazání není v kódu naplánované, musí ho udělat člověk ve Blobu.

## Souhlasy

Čtyři samostatná, nepředzaškrtnutá potvrzení: věk (15 let, nebo zákonný zástupce), souhlas se zpracováním údajů, bezúplatná nevýhradní licence a prohlášení o právech k záznamu. Znění je v `src/lib/consent.ts`. Server si do záznamu uloží kanonický text, ne to, co pošle prohlížeč.

`CONSENT_VERSION` se zvedne, když se změní věty, které lidé odsouhlasí. Teď je `2026-10-29-2`. Starší příspěvky si nesou znění z doby odeslání.

## Správa

`/spravce` je částečně předrenderovaná stránka. Přihlášení čte cookie, proto je brána za `Suspense`.

Heslo je `ADMIN_PASSWORD`. Porovnání je časově bezpečné (SHA-256 obou řetězců). Špatné heslo čeká 600 ms a vrátí „Heslo nesedí.“ Session je cookie `spravce_session`: HMAC-SHA256 payloadu `v1.{expirace}` klíčem hesla, 12 hodin, `httpOnly`, `sameSite=lax`, v produkci `secure`. Odhlášení cookie smaže.

## Proměnné

`.env.local` se necommituje. Vzor je v `.env.example`.

| Proměnná | K čemu |
| --- | --- |
| `ADMIN_PASSWORD` | Heslo do `/spravce`. Musí být i v produkci na Vercelu. |
| `BLOB_STORE_ID` | Připojené úložiště. Na Vercelu se k němu sahá přes OIDC. |
| `VERCEL_OIDC_TOKEN` | Lokální přístup po `vercel env pull`. |
| `BLOB_READ_WRITE_TOKEN` | Alternativa, když store není připojený přes OIDC. |

`vercel env pull` umí citlivé proměnné v `.env.local` vyprázdnit. Heslo po pullu zkontrolovat.

## Lokálně

```bash
npm install
npx vercel link
npx vercel env pull .env.local --yes
npm run dev
```

Úložiště, pokud by se zakládalo znovu:

```bash
npx vercel blob create-store video2026 --access private --region fra1
```

Store `video2026` už existuje a je k projektu připojený. Příkazy výše jsou pro obnovu, ne pro běžný start.

Kontrola typů a lintu:

```bash
npx tsc --noEmit
npx eslint src --max-warnings 0
```

Testovací sada v projektu není.
