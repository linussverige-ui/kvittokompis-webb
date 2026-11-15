# KvittoKompis – hemsidan

Offentlig, mobilanpassad marknadsföringssida för KvittoKompis, byggd med den tidigare valda premiumprofilen:

- Marinblå KvittoKompis-symbol med grön detalj
- Orange symbol för Hantverkare
- Tydligt vägval till Hantverkare och steg-för-steg-information om webbappsinstallation
- Framtida branscher syns som planerade, utan att påstå att de redan finns

## Publicera gratis med GitHub Pages

**Detta repository innehåller enbart offentligt avsedda webbplatsfiler.** Hantverkare-appen, API, databas, användaruppgifter, auth och ekonomilogik är kvar i det separata privata app-projektet.

1. Öppna **Settings → Pages** för det här repositoryt.
2. Under **Build and deployment**, välj **Source: Deploy from a branch**.
3. Välj **Branch: main** och mappen **/(root)** och klicka **Save**.
4. GitHub bygger och visar webbplatsens exakta adress under samma Pages-inställning. Öppna den och testa menyn och länken till Hantverkare.
5. När hemsidan ska marknadsföras skarpt ska texterna, demo-adressen, integritetsinformation och `noindex` omprövas. Dessa inställningar finns där för att tydliggöra att detta ännu är en utvecklingsversion.

**Obs om repositorynamnet:** GitHub visar för närvarande `kvittokompis-webb.` med en punkt på slutet. För en ren, snygg GitHub Pages-adress kan ägaren döpa om repot under **Settings → General → Repository name** till `kvittokompis-webb` (utan slutpunkt), helst innan Pages aktiveras.

## Öppna appen / installera

Knapparna på hemsidan leder till den **lösenordsskyddade testappen** på Render. Besökare kan inte ladda ner en APK här. Om den riktiga appens HTTPS-domän stödjer PWA-installation kan den i stället läggas till på Androids eller iPhones hemskärm via webbläsarens meny. Detta ska verifieras på riktiga telefoner före lansering.

**Använd inga verkliga kundkvitton i testmiljön.** Sidan är inte en lanseringsförklaring eller garanti om ekonomisk korrekthet.

## Teknik och test

Ren HTML/CSS och två lokala SVG-logotyper; ingen inloggningskod, AI, tredjeparts-JavaScript, databas eller formulär på hemsidan. GitHub Actions kör `python3 scripts/check_site.py` när hemsidan ändras. Originalversionen har även testats med Chromium i sex bredder (320, 360, 390, 430, 768 och 1280 px).

Vid framtida ändringar: behåll originalprofilen och testappens tydliga förhandsversionsmärkning tills riktig lansering godkänts.
