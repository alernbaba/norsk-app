import { describe, expect, it } from "vitest";
import { checkAnswer, foldNorwegian, normalize } from "@/lib/answer-check";

describe("normalize", () => {
  it("ignores case, punctuation and extra spaces", () => {
    expect(normalize("  Hei,   jeg heter  OLA! ")).toBe("hei jeg heter ola");
    expect(normalize("«Hva?» sa hun.")).toBe("hva sa hun");
  });
});

describe("foldNorwegian", () => {
  it("writes æ, ø and å as ae, o and aa", () => {
    expect(foldNorwegian("blåbærsyltetøy")).toBe("blaabaersyltetoy");
  });
});

describe("checkAnswer", () => {
  const accepted = ["Jeg har det bra, takk.", "Jeg har det fint, takk."];

  it("accepts an exact answer", () => {
    expect(checkAnswer("Jeg har det bra, takk.", accepted)).toEqual({ status: "correct", expected: accepted[0] });
  });

  it("ignores case, punctuation and whitespace", () => {
    expect(checkAnswer("jeg HAR det bra takk", accepted).status).toBe("correct");
    expect(checkAnswer("   jeg har   det bra,takk!!  ", accepted).status).toBe("correct");
  });

  it("accepts any listed variant", () => {
    expect(checkAnswer("jeg har det fint takk", accepted).status).toBe("correct");
  });

  it("accepts ae/o/aa with a hint", () => {
    const words = ["Hyggelig å møte deg."];
    expect(checkAnswer("hyggelig aa mote deg", words).status).toBe("correct-with-hint");
    expect(checkAnswer("Hyggelig aa moete deg", words).status).toBe("correct-with-hint");
    expect(checkAnswer("Vi spiser aere", ["Vi spiser ære"]).status).toBe("correct-with-hint");
  });

  it("does not need a hint when æ/ø/å are typed", () => {
    expect(checkAnswer("hyggelig å møte deg", ["Hyggelig å møte deg."]).status).toBe("correct");
  });

  it("rejects wrong answers and returns the model answer", () => {
    expect(checkAnswer("Jeg er bra", accepted)).toEqual({ status: "wrong", expected: accepted[0] });
  });

  it("rejects an empty answer", () => {
    expect(checkAnswer("   ", accepted).status).toBe("wrong");
    expect(checkAnswer("?!", accepted).status).toBe("wrong");
  });

  it("does not accept missing words", () => {
    expect(checkAnswer("Jeg har bra takk", accepted).status).toBe("wrong");
  });

  it("works for single inflected forms", () => {
    expect(checkAnswer("Boka", ["boka", "boken"]).status).toBe("correct");
    expect(checkAnswer("boken", ["boka", "boken"]).status).toBe("correct");
    expect(checkAnswer("bøkene", ["boka", "boken"]).status).toBe("wrong");
  });

  it("throws without accepted answers", () => {
    expect(() => checkAnswer("hei", [])).toThrow();
  });
});
