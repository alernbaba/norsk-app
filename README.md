# Norsk – lær norsk (bokmål)

En webapp for voksne nybegynnere som kan engelsk og vil lære norsk bokmål. Grensesnittet er på engelsk eller norsk (velges under Settings / Innstillinger).

- **Flashcards** med enkel spaced repetition (Leitner-bokser) og bøyingsformer på baksiden
- **Build the sentence**: bygg den norske setningen med ordbrikker (inkludert feil ord)
- **Write it**: skriv oversettelsen selv, med tolerant sjekk og knapper for æ, ø og å
- **Inflection**: fyll inn riktig bøyingsform i en setning
- 🔊 **Uttale** med nettleserens norske stemme, sakte tale og automatisk avspilling
- **Oversikt** med fremgang per tema, lærte og mestrede ord, streak og nullstilling
- **Due today**: liste over alt som skal repeteres i dag, med forklaring av boksene
- 🌐 **Språkvalg** for menyer, knapper og tilbakemeldinger: engelsk (standard) eller norsk bokmål, lagret i nettleseren

Innholdet er 35 temaer med ca. 1350 ord, 146 vanlige uttrykk, 350 setninger og 167 bøyingsøvelser.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tester for svarsjekk, spaced repetition, fremgang, ordbank-parser og innhold
npm run build      # produksjonsbygg
```

Krever Node.js 20 eller nyere.

## Mappestruktur

```text
app/                      sider (Next.js App Router)
components/               React-komponenter, øvingsmåtene ligger i components/practice/
lib/
  answer-check.ts         tolerant svarsjekk (store/små bokstaver, tegnsetting, ae/o/aa)
  srs.ts                  Leitner-bokser og valg av ord til en økt
  storage.ts              lagringslaget (localStorage i dag)
  progress.ts             registrering av svar, streak, statistikk
  speech.ts               uttale (speechSynthesis i dag)
  content.ts              leser data/ ved bygging
data/
  topics/*.json           ett tema per fil
  inflections.json        bøyingsformer, generert fra Norsk ordbank
  inflections-missing.txt ord som ikke ble funnet i ordbanken
scripts/import-ordbank.ts lager inflections.json
tests/                    Vitest
```

## Legge til et nytt tema

1. Lag en ny fil i `data/topics/`, for eksempel `data/topics/weather.json`. Filnavnet spiller ingen rolle, men `id` må være unik.
2. Fyll inn tema, ord, setninger og bøyingsøvelser:

```json
{
  "id": "weather",
  "title": "Weather",
  "description": "Sun, rain and snow.",
  "emoji": "⛅",
  "order": 36,
  "words": [
    { "id": "weather-sol", "no": "ei sol", "en": ["a sun"], "pos": "noun", "lemma": "sol" },
    { "id": "weather-regne", "no": "å regne", "en": ["to rain"], "pos": "verb", "lemma": "regne" },
    { "id": "weather-kald", "no": "kald", "en": ["cold"], "pos": "adj", "lemma": "kald" },
    { "id": "weather-det-regner", "no": "Det regner.", "en": ["It's raining."], "pos": "phrase" }
  ],
  "sentences": [
    {
      "id": "weather-s1",
      "en": "The sun is shining.",
      "no": ["Sola skinner.", "Solen skinner."],
      "distractors": ["sol", "regner", "månen"]
    }
  ],
  "inflectionDrills": [
    { "id": "weather-d1", "no": "I går ___ det hele dagen.", "en": "Yesterday it rained all day.", "lemma": "regne", "pos": "verb", "form": "past" }
  ]
}
```

3. Legg til norsk tittel og beskrivelse for temaet i `lib/i18n/topics.ts` (testene sjekker at alle temaer har det).
4. Kjør `npm run import:ordbank` hvis temaet har nye substantiv, verb eller adjektiv (se under), og så `npm test`.

Temaet dukker opp på forsiden neste gang du starter `npm run dev`. Testene i `tests/content.test.ts` sjekker at alt henger sammen.

### Feltene

**Ord (`words`)**

| Felt | Betydning |
| --- | --- |
| `id` | Unik id. Fremgangen lagres per id, så ikke endre den etterpå. Bruk gjerne `tema-ord`. |
| `no` | Det norske ordet slik det vises. Substantiv med artikkel (`en bil`, `ei bok`, `et hus`), verb med `å`. |
| `en` | Én eller flere engelske oversettelser. |
| `pos` | `noun`, `verb`, `adj`, `phrase` (uttrykk) eller `other` (småord, tall osv.). |
| `lemma` | Grunnformen uten artikkel og `å`. Trengs for å finne bøyingen. Bare for `noun`, `verb` og `adj`. |
| `ordbankId` | Valgfritt. Velger riktig oppslag når ordbanken har flere ord med samme grunnform (se under). |

**Setninger (`sentences`)**

| Felt | Betydning |
| --- | --- |
| `en` | Den engelske setningen brukeren skal oversette. |
| `no` | Liste med godkjente norske svar. Det første brukes til ordbrikkene og vises som fasit. |
| `distractors` | Feil ord som blandes inn blant brikkene. Bruk enkeltord som ikke finnes i det første svaret. |

Svarsjekken ignorerer store og små bokstaver, tegnsetting og ekstra mellomrom. Skriver brukeren `ae`, `o`/`oe` eller `aa` i stedet for æ, ø og å, godtas svaret med en påminnelse. Andre varianter (f.eks. `boka` og `boken`, eller annen ordstilling) må stå i `no`.

**Bøyingsøvelser (`inflectionDrills`)**

| Felt | Betydning |
| --- | --- |
| `no` | Norsk setning med `___` der ordet skal inn. |
| `en` | Engelsk oversettelse av hele setningen. |
| `lemma`, `pos` | Ordet som skal bøyes. Må finnes i `data/inflections.json`. |
| `form` | Hvilken form. Substantiv: `indefSg`, `defSg`, `indefPl`, `defPl`. Verb: `infinitive`, `present`, `past`, `perfect` (med «har»), `participle` (uten «har»), `imperative`. Adjektiv: `mf`, `f`, `n`, `def`, `pl`, `comparative`, `superlative`, `superlativeDef`. |

Fasiten hentes fra `inflections.json`, så alle tillatte former godtas (f.eks. både *boka* og *boken*).

## Bøying fra Norsk ordbank

Bøyingsformene kommer fra [Norsk ordbank – bokmål 2005](https://www.nb.no/sprakbanken/ressurskatalog/oai-nb-no-sbr-5/) (Språkbanken, Nasjonalbiblioteket, CC BY 4.0). Appen tar bare med formene til ordene som brukes i `data/topics/`, ikke hele ordbanken.

1. Last ned ordbanken og pakk ut filene i `data/raw/ordbank/` (mappen er i `.gitignore`). Skriptet trenger `lemma.txt` og `fullformsliste.txt`.
2. Kjør `npm run import:ordbank`.
3. Les loggen:
   - **NOT found**: ord som ikke finnes i ordbanken. De står også i `data/inflections-missing.txt`. Rett `lemma` eller `pos` i temafilen, eller sett `pos` til `other` hvis ordet ikke skal bøyes.
   - **had several ordbank entries**: grunnformen finnes flere ganger (f.eks. *bok* «book» og *bok* «beech»). Skriptet velger det vanligste oppslaget, og loggen viser hva som ble valgt og alternativene med id. Er valget feil, sett `"ordbankId"` på ordet i temafilen og kjør skriptet igjen.

Valgfritt: legger du en frekvensliste i `data/raw/frequency.txt` (én linje per ord: `ord antall`, f.eks. `no_50k.txt` fra [FrequencyWords](https://github.com/hermitdave/FrequencyWords)), bruker skriptet den til å velge mellom like oppslag. Uten den velges oppslaget med flest former.

## Publisere på GitHub Pages

Appen kjører helt i nettleseren (fremgang lagres i localStorage), så den kan publiseres som en statisk side.
Workflowen `.github/workflows/pages.yml` kjører testene, bygger en statisk eksport og publiserer den ved hver push til `main`.

Første gang: gå til **Settings → Pages** i repoet og velg **Source: GitHub Actions**. Siden havner på `https://<bruker>.github.io/<repo>/`.

Bygg den statiske versjonen lokalt med:

```bash
GITHUB_PAGES=true npx next build   # skriver til out/, med basePath /norsk-app
```

`PAGES_BASE_PATH` overstyrer stien hvis repoet heter noe annet.

## Bytte til database og innlogging senere

All lesing og skriving av fremgang går gjennom `StorageAdapter` i `lib/storage.ts`. Grensesnittet er asynkront, så en adapter som snakker med et API eller en database kan erstatte `LocalStorageAdapter` i `getStorage()` uten å endre sidene. På samme måte kan `lib/speech.ts` byttes til en skytjeneste for tale (Google Cloud TTS eller Azure) bak den samme `speak(text)`-funksjonen.

## Kilder og lisenser

- Bøyingsformer: Norsk ordbank – bokmål 2005, Språkbanken / Nasjonalbiblioteket, CC BY 4.0.
- Ordutvalget er laget med hjelp av en frekvensliste fra norske filmtekster: FrequencyWords (Hermit Dave) basert på OpenSubtitles, CC BY-SA 4.0. Selve listen er ikke en del av appen.
- Oversettelser og eksempelsetninger er skrevet for appen.
