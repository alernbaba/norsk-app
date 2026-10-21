"use client";

import { useLanguage } from "./i18n";

const linkClass = "text-fjord underline decoration-fjord/40 underline-offset-2 hover:decoration-fjord";

export function AboutContent() {
  return useLanguage() === "nb" ? <AboutNb /> : <AboutEn />;
}

function AboutEn() {
  return (
    <article className="space-y-6">
      <h1 className="text-4xl font-medium">About</h1>

      <section className="space-y-3 text-lg leading-relaxed">
        <p>
          Norsk helps English speakers learn Norwegian (bokmål). Practise words with flashcards, build and write sentences,
          and learn how words change form. Words you find hard come back more often.
        </p>
        <p className="text-base text-muted">
          Your progress is stored only in this browser. Pronunciation uses your device&apos;s built-in Norwegian voice when one
          is available.
        </p>
      </section>

      <section className="sheet space-y-3 p-5 leading-relaxed">
        <h2 className="text-xl font-medium">Sources</h2>
        <p>
          Inflections (bøyingsformer) come from{" "}
          <a className={linkClass} href="https://www.nb.no/sprakbanken/ressurskatalog/oai-nb-no-sbr-5/">
            Norsk ordbank – bokmål 2005
          </a>
          , published by Språkbanken at the National Library of Norway (Nasjonalbiblioteket) under the{" "}
          <a className={linkClass} href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>{" "}
          licence. The app only includes the forms of the words it teaches, reformatted to JSON.
        </p>
        <p>
          The words were chosen with help from a word frequency list based on Norwegian film and TV subtitles:{" "}
          <a className={linkClass} href="https://github.com/hermitdave/FrequencyWords">
            FrequencyWords
          </a>{" "}
          by Hermit Dave, built from the{" "}
          <a className={linkClass} href="https://opus.nlpl.eu/OpenSubtitles.php">
            OpenSubtitles
          </a>{" "}
          corpus (CC BY-SA 4.0). The list itself is not part of the app.
        </p>
        <p className="text-sm text-muted">Translations and example sentences were written for this app.</p>
      </section>
    </article>
  );
}

function AboutNb() {
  return (
    <article className="space-y-6">
      <h1 className="text-4xl font-medium">Om appen</h1>

      <section className="space-y-3 text-lg leading-relaxed">
        <p>
          Norsk hjelper engelskspråklige å lære norsk (bokmål). Øv på ord med ordkort, bygg og skriv setninger, og lær
          hvordan ord bøyes. Ord du synes er vanskelige, kommer oftere tilbake.
        </p>
        <p className="text-base text-muted">
          Fremgangen din lagres bare i denne nettleseren. Uttalen bruker den innebygde norske stemmen på enheten din når
          den finnes.
        </p>
      </section>

      <section className="sheet space-y-3 p-5 leading-relaxed">
        <h2 className="text-xl font-medium">Kilder</h2>
        <p>
          Bøyingsformene kommer fra{" "}
          <a className={linkClass} href="https://www.nb.no/sprakbanken/ressurskatalog/oai-nb-no-sbr-5/">
            Norsk ordbank – bokmål 2005
          </a>
          , utgitt av Språkbanken ved Nasjonalbiblioteket under lisensen{" "}
          <a className={linkClass} href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          . Appen tar bare med formene til ordene den lærer bort, omformatert til JSON.
        </p>
        <p>
          Ordene ble valgt med hjelp av en frekvensliste basert på norske film- og TV-undertekster:{" "}
          <a className={linkClass} href="https://github.com/hermitdave/FrequencyWords">
            FrequencyWords
          </a>{" "}
          av Hermit Dave, laget fra korpuset{" "}
          <a className={linkClass} href="https://opus.nlpl.eu/OpenSubtitles.php">
            OpenSubtitles
          </a>{" "}
          (CC BY-SA 4.0). Selve listen er ikke en del av appen.
        </p>
        <p className="text-sm text-muted">Oversettelser og eksempelsetninger er skrevet for denne appen.</p>
      </section>
    </article>
  );
}
