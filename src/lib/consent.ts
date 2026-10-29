import { EVENT_NAME } from "@/lib/event";
import { tie } from "@/lib/tie";

/**
 * Texty, které odesílatel odsouhlasí. Při změně znění zvedněte CONSENT_VERSION.
 * Starší příspěvky si v záznamu nesou znění, které platilo v době odeslání.
 *
 * Tři samostatná potvrzení jsou schválně oddělená:
 * - souhlas se zpracováním osobních údajů (čl. 6 odst. 1 písm. a) GDPR)
 * - bezúplatná nevýhradní licence (autorský zákon)
 * - prohlášení o právech k záznamu a o svolení zachycených osob (§ 84 a násl. občanského zákoníku)
 * Věk navíc kryje čl. 8 GDPR a § 7 zákona č. 110/2019 Sb. (u služeb informační společnosti 15 let).
 */
export const CONSENT_VERSION = "2026-10-29-3";

export const consentFields = [
  {
    key: "age",
    text: tie(
      "Je mi nejméně 15 let, nebo tento formulář odesílám jako zákonný zástupce osoby mladší 15 let.",
    ),
  },
  {
    key: "personalData",
    text: tie(
      `Souhlasím, aby město Unhošť zpracovalo mé jméno, e-mail, telefon, popis videa a nahrané video, včetně mé podoby a hlasu, pokud v něm jsou. Účel je posoudit příspěvek, případně ho sestříhat a zařadit do filmu „${EVENT_NAME}“, veřejně ho promítnout 1. ledna 2027 na náměstí v Unhošti a případně zveřejnit hotový film. Souhlas je dobrovolný a můžu ho odvolat. Odvoláním se ruší další použití mého záběru. Už proběhlé promítání vzít zpět nejde a z hotového filmu se záběr odstraní, jen když to půjde bez rozbití celého filmu. Podrobnosti jsou v informacích o zpracování na této stránce.`,
    ),
  },
  {
    key: "license",
    text: tie(
      "Uděluji městu Unhošť bezúplatnou nevýhradní licenci nahrané video užít: rozmnožit ho, zpracovat včetně střihu a zařazení do souhrnného videa, veřejně ho promítnout a sdělovat veřejnosti. Licence je bez územního omezení a trvá po dobu potřebnou k výrobě souhrnného videa roku 2026, k jeho veřejnému užití a k uchování hotového filmu jako záznamu tohoto roku. Když odvolám souhlas se zpracováním údajů, beru v tom samém rozsahu zpět i další užití videa.",
    ),
  },
  {
    key: "rights",
    text: tie(
      "Prohlašuji, že video můžu městu poskytnout: jsem jeho autor, nebo k tomu mám svolení autora. Lidé, kteří jsou na videu hlavním námětem a dají se poznat, souhlasí s pořízením záznamu i s použitím v souhrnném videu a vědí, že se může promítnout 1. ledna 2027 na náměstí. U osoby mladší 18 let, která je takto zachycená, tento souhlas dal její zákonný zástupce. Náhodní kolemjdoucí v pozadí veřejného místa, kteří nejsou námětem záběru, souhlas mít nemusí. Video neporušuje práva jiných lidí.",
    ),
  },
] as const;

export type ConsentKey = (typeof consentFields)[number]["key"];

export const consentText = Object.fromEntries(
  consentFields.map((field) => [field.key, field.text]),
) as Record<ConsentKey, string>;
