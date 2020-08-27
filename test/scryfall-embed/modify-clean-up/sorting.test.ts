import {
  sortByName,
  sortByPrimaryCardType,
} from "Js/scryfall-embed/modify-clean-up/sorting";
import { makeFakeCard } from "Helpers/fake";

describe("sorting", () => {
  describe("sortByName", () => {
    it("creates a sorter that sorts entries by card name", () => {
      const entries = [
        makeFakeCard({
          cardDigest: {
            name: "Z Name",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "A Name",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "G Name",
          },
        }),
      ];

      const sorter = sortByName();

      entries.sort(sorter);

      expect(entries[0].card_digest?.name).toBe("A Name");
      expect(entries[1].card_digest?.name).toBe("G Name");
      expect(entries[2].card_digest?.name).toBe("Z Name");
    });

    it("puts entries without a card digest at the back", () => {
      const entries = [
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          cardDigest: {
            name: "Z Name",
          },
        }),
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          cardDigest: {
            name: "A Name",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "G Name",
          },
        }),
      ];

      const sorter = sortByName();

      entries.sort(sorter);

      expect(entries[0].card_digest?.name).toBe("A Name");
      expect(entries[1].card_digest?.name).toBe("G Name");
      expect(entries[2].card_digest?.name).toBe("Z Name");
      expect(entries[3].card_digest).toBeFalsy();
      expect(entries[4].card_digest).toBeFalsy();
    });
  });

  describe("sortByPrimaryCardType", () => {
    it("creates a sorter that sorts entries by card type", () => {
      const entries = [
        makeFakeCard({
          cardDigest: {
            type_line: "Artifact",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Creature",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Enchantment",
          },
        }),
      ];

      const sorter = sortByPrimaryCardType();

      entries.sort(sorter);

      expect(entries[0].card_digest?.type_line).toBe("Creature");
      expect(entries[1].card_digest?.type_line).toBe("Artifact");
      expect(entries[2].card_digest?.type_line).toBe("Enchantment");
    });

    it("sorts entries by primary card type when multiple are available", () => {
      const entries = [
        makeFakeCard({
          cardDigest: {
            type_line: "Artifact Creature",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Instant",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Enchantment Creature",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Tribal Sorcery",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Planeswalker",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Land",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Enchantment Artifact",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Enchantment",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Land Creature",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Artifact Land",
          },
        }),
      ];

      const sorter = sortByPrimaryCardType();

      entries.sort(sorter);

      expect(entries[0].card_digest?.type_line).toBe("Artifact Creature");
      expect(entries[1].card_digest?.type_line).toBe("Enchantment Creature");
      expect(entries[2].card_digest?.type_line).toBe("Land Creature");
      expect(entries[3].card_digest?.type_line).toBe("Planeswalker");
      expect(entries[4].card_digest?.type_line).toBe("Enchantment Artifact");
      expect(entries[5].card_digest?.type_line).toBe("Enchantment");
      expect(entries[6].card_digest?.type_line).toBe("Instant");
      expect(entries[7].card_digest?.type_line).toBe("Tribal Sorcery");
      expect(entries[8].card_digest?.type_line).toBe("Land");
      expect(entries[9].card_digest?.type_line).toBe("Artifact Land");
    });

    it("puts entries without a card digest at the back", () => {
      const entries = [
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Creature",
          },
        }),
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Artifact",
          },
        }),
        makeFakeCard({
          cardDigest: {
            type_line: "Enchantment",
          },
        }),
      ];

      const sorter = sortByPrimaryCardType();

      entries.sort(sorter);

      expect(entries[0].card_digest?.type_line).toBe("Creature");
      expect(entries[1].card_digest?.type_line).toBe("Artifact");
      expect(entries[2].card_digest?.type_line).toBe("Enchantment");
      expect(entries[3].card_digest).toBeFalsy();
      expect(entries[4].card_digest).toBeFalsy();
    });
  });
});
