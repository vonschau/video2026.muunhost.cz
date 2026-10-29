import { Tied } from "@/components/tied";
import { DEADLINE_LABEL } from "@/lib/deadline";
import { EVENT_NAME } from "@/lib/event";

export function PrivacyNotice() {
  return (
    <Tied>
    <div id="informace" className="space-y-8 text-sm leading-6 text-ink">
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Kdo údaje zpracovává</h2>
        <p>
          Správce je město Unhošť, Václavské náměstí 44, 273&nbsp;51 Unhošť,
          IČO 00235075, e-mail{" "}
          <a className="underline decoration-unhost-blue/40 underline-offset-4" href="mailto:muunhost@muunhost.cz">
            muunhost@muunhost.cz
          </a>
          , telefon 312&nbsp;679&nbsp;040.
        </p>
        <p>
          Pověřencem pro ochranu osobních údajů je Keystone Company a.s.,
          Korunní 2569/108, Praha&nbsp;10, e-mail{" "}
          <a className="underline decoration-unhost-blue/40 underline-offset-4" href="mailto:muunhost.dpo@keystonecompany.cz">
            muunhost.dpo@keystonecompany.cz
          </a>
          . Jde o kontakt zveřejněný městem. Na pověřence se obracejte s dotazy
          a s uplatněním práv. Vyřídit je musí město.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Proč a na jakém základě</h2>
        <p>
          Jde o dobrovolný příspěvek videa do filmu {EVENT_NAME}. Videa
          přijímáme do {DEADLINE_LABEL}. Zpracováváme údaje k těmto účelům:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>přijetí videa a kontaktování vás, když bude potřeba něco upřesnit,</li>
          <li>posouzení, jestli se záběr do filmu hodí, a případný střih,</li>
          <li>veřejné promítnutí 1.&nbsp;ledna 2027 na náměstí v Unhošti a případné zveřejnění hotového filmu,</li>
          <li>uchování záznamu o tom, co jste odsouhlasili, abychom souhlas uměli doložit.</li>
        </ul>
        <p>
          Jméno, e-mail, telefon a obsah videa zpracováváme na základě vašeho
          souhlasu podle čl.&nbsp;6 odst.&nbsp;1 písm.&nbsp;a) nařízení (EU)
          2016/679. Souhlas je zvlášť od licence k užití videa a od prohlášení,
          že máte práva k záznamu. Všechna tři potvrzení jsou podmínkou toho,
          abychom video mohli přijmout. Odeslat ho nemusíte.
        </p>
        <p>
          Záznam o souhlasu (kdo, kdy a jaké znění) držíme i po odvolání souhlasu
          s videem, protože správce musí umět souhlas doložit (čl.&nbsp;7
          odst.&nbsp;1 nařízení). Město je orgán veřejné moci, proto se
          o zpracování neopíráme o oprávněný zájem.
        </p>
        <p>
          Licence ke videu není souhlas se zpracováním údajů. Je to svolení
          užít autorské dílo: rozmnožit ho, sestříhat, zařadit do souhrnného
          filmu, veřejně promítnout a sdělit veřejnosti, bezúplatně, nevýhradně
          a bez územního omezení, po dobu výroby, uvedení a uchování filmu
          o roce 2026.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Jaké údaje a odkud</h2>
        <p>
          Od vás bereme jméno, e-mail, telefon, video a technický údaj o odeslání:
          čas a znění potvrzení, které jste zaškrtli, a identifikaci prohlížeče.
          IP adresu si k příspěvku neukládáme.
        </p>
        <p>
          Video může obsahovat podobu a hlas vás i dalších lidí. Tyhle údaje
          nebereme od nich, ale z nahrávky, kterou pošlete vy. Proto máte
          potvrdit, že poznatelní lidé, kteří jsou námětem záběru, s použitím
          souhlasí a že vědí o promítání. U osoby mladší 18&nbsp;let souhlas
          dává zákonný zástupce. To plyne z ochrany podoby podle §&nbsp;84
          a násl. občanského zákoníku. Kdo se na videu pozná a nechce v něm být,
          může se ozvat pověřenci.
        </p>
        <p>
          Formulář může vyplnit člověk od 15&nbsp;let. Mladšího zastoupí zákonný
          zástupce. Hranice 15&nbsp;let je věk pro souhlas se zpracováním údajů
          u služeb informační společnosti (§&nbsp;7 zákona č.&nbsp;110/2019&nbsp;Sb.).
        </p>
        <p>
          Nepoužíváme video k hodnocení citlivých údajů. Neposílejte záznam,
          jehož smyslem je ukázat něčí zdravotní stav, vyznání nebo politický
          postoj.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Kdo video uvidí</h2>
        <p>
          Surová nahrávka není veřejná. Uvidí ji pověření pracovníci města,
          Antonín Mittelbach, který z příspěvků souhrnné video sestavuje,
          a Martin Cajthaml, který tuto stránku vytvořil a technicky ji provozuje.
          Přístup mají jen kvůli tomuto filmu a provozu stránky.
        </p>
        <p>
          Soubory se ukládají v Evropské unii, v regionu Frankfurt nad Mohanem,
          u společnosti Vercel Inc. jako zpracovatele. Vercel sídlí ve Spojených
          státech a může k údajům přistupovat i odtud, případně přes další
          zpracovatele. Takové předání se opírá o rozhodnutí Komise k EU-US
          Data Privacy Framework, v jehož rámci je Vercel certifikován, a o
          standardní smluvní doložky podle zpracovatelské smlouvy Vercelu.
        </p>
        <p>
          Když záběr do filmu vybereme, uvidí ho lidé na promítání 1.&nbsp;ledna
          2027. Hotové video může město dál zveřejnit jako záznam roku 2026.
          Ne každé zaslané video se do filmu vejde.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Jak dlouho údaje držíme</h2>
        <p>
          Nahrané video a kontaktní údaje smažeme do 31.&nbsp;března 2027,
          pokud je nebudeme muset držet déle kvůli uplatnění práv. Záznam
          o uděleném souhlasu necháme ještě tři roky poté, abychom ho uměli
          doložit.
        </p>
        <p>
          Když bude záběr součástí hotového souhrnného videa, film samotný
          může město uchovat jako záznam roku 2026. Odvoláte-li souhlas až
          po zařazení, záběr z už hotového filmu odstraníme, jen pokud to půjde
          bez rozbití celého díla. Už proběhlé promítání vzít zpět nejde.
          Samotnou nahrávku a kontaktní údaje smažeme i tak.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-unhost-navy">Vaše práva</h2>
        <p>Můžete žádat přístup k údajům, jejich opravu, výmaz, omezení zpracování a přenositelnost. Souhlas můžete kdykoli odvolat, aniž by to mělo vliv na zákonnost zpracování před odvoláním. Odvolání pošlete pověřenci nebo na muunhost@muunhost.cz.</p>
        <p>
          Město si u žádostí ověřuje totožnost datovou schránkou, uznávaným
          elektronickým podpisem, úředně ověřeným podpisem, nebo osobně na
          podatelně. Stejný postup platí i tady. Podrobnosti má město na stránce{" "}
          <a
            className="underline decoration-unhost-blue/40 underline-offset-4"
            href="https://www.muunhost.cz/gdpr-narizeni-eu-2016-679/d-54291"
          >
            GDPR
          </a>
          .
        </p>
        <p>
          Stížnost můžete podat u Úřadu pro ochranu osobních údajů, Pplk.&nbsp;Sochora
          27, 170&nbsp;00 Praha&nbsp;7, e-mail posta@uoou.cz,{" "}
          <a className="underline decoration-unhost-blue/40 underline-offset-4" href="https://uoou.gov.cz">
            uoou.gov.cz
          </a>
          .
        </p>
        <p>
          Údaje poskytujete dobrovolně. Když je neposkytnete, video prostě
          nepřijmeme. Nerozhodujeme o vás automatizovaně a neprofilujeme vás.
        </p>
      </section>
    </div>
    </Tied>
  );
}
