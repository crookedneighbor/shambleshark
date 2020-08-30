import {
  calculateTotalsByName,
  calculateTotalsByCardType,
} from "Js/scryfall-embed/modify-clean-up/calculate-totals";
import shortid = require("shortid");
import { makeFakeCard } from "Helpers/fake";
import type { Card } from "Js/types/deck";

describe("calculate totals", () => {
  describe("calculateTotalsByName", () => {
    const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

    function createEntriesWithNames(stringOfFirstLetters: string): Card[] {
      return stringOfFirstLetters.split("").map((letter) => {
        return makeFakeCard({
          cardDigest: {
            name: `${letter}${shortid()}`,
          },
        });
      });
    }

    it("provides an object with totals for each section", () => {
      // one for each letter plus 2 extras to caculate repeats
      const entries = createEntriesWithNames(ALPHABET + "a" + "z");

      const totals = calculateTotalsByName(entries);

      expect(totals).toEqual({
        abcd: 5,
        efg: 3,
        hijk: 4,
        lmnop: 5,
        qrs: 3,
        tuv: 3,
        wx: 2,
        yz: 3,
      });
    });

    it("accounts for uppercase", () => {
      const entries = createEntriesWithNames(ALPHABET.toUpperCase());

      const totals = calculateTotalsByName(entries);

      expect(totals).toEqual({
        abcd: 4,
        efg: 3,
        hijk: 4,
        lmnop: 5,
        qrs: 3,
        tuv: 3,
        wx: 2,
        yz: 2,
      });
    });

    it("accounts for numbers", () => {
      const entries = createEntriesWithNames("1234567890");

      const totals = calculateTotalsByName(entries);

      expect(totals).toEqual({
        "1234567890": 10,
      });
    });

    it("accounts for non-alphanumeric characters", () => {
      const entries = createEntriesWithNames("_. !?");

      const totals = calculateTotalsByName(entries);

      expect(totals).toEqual({
        symbols: 5,
      });
    });

    it("ignores entries without a card_digest", () => {
      const entries = [
        makeFakeCard({
          cardDigest: { name: "Z Name" },
        }),
        makeFakeCard({ cardDigest: false }),
        makeFakeCard({
          cardDigest: { name: "A Name" },
        }),
      ];

      const totals = calculateTotalsByName(entries);

      expect(totals).toEqual({
        abcd: 1,
        yz: 1,
      });
    });
  });

  describe("calculateTotalsByCardType", () => {
    it("sorts by card type", () => {
      const entries = [
        makeFakeCard({
          cardDigest: { type_line: "artifact" },
        }),
        makeFakeCard({
          cardDigest: { type_line: "enchantment" },
        }),
        makeFakeCard({
          cardDigest: { type_line: "creature" },
        }),
        makeFakeCard({
          cardDigest: { type_line: "land" },
        }),
        makeFakeCard({
          cardDigest: { type_line: "artifact" },
        }),
      ];

      const totals = calculateTotalsByCardType(entries);

      expect(totals).toEqual({
        creature: 1,
        land: 1,
        enchantment: 1,
        artifact: 2,
      });
    });

    it("ignores entries without a card digest", () => {
      const entries = [
        makeFakeCard({
          cardDigest: { type_line: "creature" },
        }),
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          cardDigest: { type_line: "creature" },
        }),
      ];

      const totals = calculateTotalsByCardType(entries);

      expect(totals).toEqual({
        creature: 2,
      });
    });
  });
});
