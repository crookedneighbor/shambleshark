import { getPrimaryType } from "Lib/card-parser";
import { makeFakeCard } from "Helpers/fake";

const CARD_TYPES = [
  "artifact",
  "creature",
  "enchantment",
  "instant",
  "land",
  "planeswalker",
  "sorcery",
];

describe("Card Parser", () => {
  describe("getPrimaryType", () => {
    it("returns an empty string when card has no card digest", () => {
      const entry = makeFakeCard({ cardDigest: false });

      expect(getPrimaryType(entry)).toBe("");
    });

    it("returns the super type of the type line lowercased when card has no recognized type", () => {
      const entry = makeFakeCard({
        cardDigest: { type_line: "No Type - Subtype" },
      });

      expect(getPrimaryType(entry)).toBe("no type");
    });

    it("ignores subtypes", () => {
      const entry = makeFakeCard({
        cardDigest: { type_line: "Artifact - Creature" },
      });

      expect(getPrimaryType(entry)).toBe("artifact");
    });

    it("ignores supertypes", () => {
      const entry = makeFakeCard({
        cardDigest: { type_line: "Legendary Tribal World Enchantment" },
      });

      expect(getPrimaryType(entry)).toBe("enchantment");
    });

    it("prefers creatures first", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("creature");
    });

    it("prefers lands second", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("land");
    });

    it("prefers artifacts third", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
              case "land":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("artifact");
    });

    it("prefers enchantments fourth", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
              case "land":
              case "artifact":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("enchantment");
    });

    it("prefers planewalkers fifth", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
              case "land":
              case "artifact":
              case "enchantment":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("planeswalker");
    });

    it("prefers instants sixth", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
              case "land":
              case "artifact":
              case "enchantment":
              case "planeswalker":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("instant");
    });

    it("prefers sorceries seventh", () => {
      const entry = makeFakeCard({
        cardDigest: {
          type_line: CARD_TYPES.filter((cardType) => {
            switch (cardType) {
              case "creature":
              case "land":
              case "artifact":
              case "enchantment":
              case "planeswalker":
              case "instant":
                return false;
              default:
                return true;
            }
          }).join(" "),
        },
      });

      expect(getPrimaryType(entry)).toBe("sorcery");
    });

    it("prefers front side of card over backside", () => {
      expect(
        getPrimaryType(
          makeFakeCard({
            cardDigest: {
              type_line: "Sorcery // Creature",
            },
          })
        )
      ).toBe("sorcery");
    });
  });
});
