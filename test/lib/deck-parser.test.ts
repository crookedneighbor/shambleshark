import {
  getCommanderColorIdentity,
  getSections,
  flattenEntries,
  hasDedicatedLandSection,
  isCommanderLike,
  isLandCard,
  isSingletonTypeDeck,
  hasLegalCommanders,
} from "Lib/deck-parser";
import { api as scryfall } from "Lib/scryfall";

import { Deck } from "Js/types/deck";

describe("Deck Parser", function () {
  describe("getCommanderColorIdentity", function () {
    beforeEach(function () {
      jest.spyOn(scryfall, "get");
    });

    it("returns array of color identity for commander", async function () {
      const fakeDeck = {
        entries: {
          commanders: [
            {
              id: "id",
              section: "commanders",
              card_digest: { oracle_id: "id-1", type_line: "type" },
            },
          ],
        },
      };

      scryfall.get.mockResolvedValue([
        {
          color_identity: ["U", "R"],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["U", "R"]);
      expect(scryfall.get).toBeCalledTimes(1);
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: 'oracle_id:"id-1"',
      });
    });

    it("returns array of color identity for multiple commanders", async function () {
      const fakeDeck = {
        entries: {
          commanders: [
            {
              id: "1",
              section: "commanders",
              card_digest: { oracle_id: "id-1", type_line: "type" },
            },
            {
              id: "2",
              section: "commanders",
              card_digest: { oracle_id: "id-2", type_line: "type" },
            },
            {
              id: "3",
              section: "commanders",
              card_digest: { oracle_id: "id-3", type_line: "type" },
            },
          ],
        },
      };

      scryfall.get.mockResolvedValue([
        {
          color_identity: ["U", "R"],
        },
        {
          color_identity: ["U", "B"],
        },
        {
          color_identity: ["W"],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["U", "R", "B", "W"]);
      expect(scryfall.get).toBeCalledTimes(1);
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: 'oracle_id:"id-1" or oracle_id:"id-2" or oracle_id:"id-3"',
      });
    });

    it("returns array of c when color idenity is empty", async function () {
      const fakeDeck = {
        entries: {
          commanders: [
            {
              id: "1",
              section: "commanders",
              card_digest: { oracle_id: "id-1", type_line: "type" },
            },
          ],
        },
      };

      scryfall.get.mockResolvedValue([
        {
          color_identity: [],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["C"]);
    });

    it("ignores cards without a card digeest", async function () {
      const fakeDeck = {
        entries: {
          commanders: [
            {
              id: "1",
              section: "commanders",
              card_digest: { oracle_id: "id-1", type_line: "type" },
            },
            {
              id: "2",
              section: "commanders",
              // no card digetst
            },
            {
              id: "3",
              section: "commanders",
              card_digest: { oracle_id: "id-3", type_line: "type" },
            },
          ],
        },
      };

      scryfall.get.mockResolvedValue([
        {
          color_identity: ["U", "R"],
        },
        {
          color_identity: ["W"],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["U", "R", "W"]);
      expect(scryfall.get).toBeCalledTimes(1);
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: 'oracle_id:"id-1" or oracle_id:"id-3"',
      });
    });
  });

  describe("getSections", function () {
    it("returns a flattened array of deck sections", function () {
      const fakeDeck = {
        id: "fake-id",
        sections: {
          primary: ["1", "2"],
          secondary: ["3", "4"],
        },
        entries: {},
      };

      expect(getSections(fakeDeck)).toEqual(["1", "2", "3", "4"]);
    });
  });

  describe("isLandCard", function () {
    it("returns false if card is not a land card", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Enchantment",
          },
        })
      ).toBe(false);
    });

    it("returns true if card is a land card", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Land",
          },
        })
      ).toBe(true);
    });

    it("returns false if card is land card on flip side", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Enchantment // Land",
          },
        })
      ).toBe(false);
    });

    it("returns true if card is a land card on front side", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Land // Creature",
          },
        })
      ).toBe(true);
    });

    it("returns false if card is a creature land", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Land Creature",
          },
        })
      ).toBe(false);
    });

    it("returns true if card is a creature on the flipside", function () {
      expect(
        isLandCard({
          card_digest: {
            oracle_id: "id",
            type_line: "Land // Creature",
          },
        })
      ).toBe(true);
    });
  });

  describe("hasDedicatedLandSection", function () {
    it("returns false if deck does not have a lands section", function () {
      expect(
        hasDedicatedLandSection({
          sections: {
            primary: ["mainboard", "sideboard"],
            seconday: ["maybeboard"],
          },
        })
      ).toBe(false);
    });

    it("returns true if deck does have a lands section", function () {
      expect(
        hasDedicatedLandSection({
          sections: {
            primary: ["mainboard", "lands"],
            seconday: ["maybeboard"],
          },
        })
      ).toBe(true);
    });
  });

  describe("flattenEntries", function () {
    let fakeDeck: Deck;

    beforeEach(function () {
      fakeDeck = {
        id: "fake-id",
        sections: {
          primary: ["commanders", "nonlands"],
          secondary: ["lands", "maybeboard"],
        },
        entries: {
          commanders: [
            {
              id: "id-1",
              raw_text: "text",
              section: "commanders",
              count: 1,
              card_digest: { oracle_id: "oracle-1", type_line: "type" },
            },
            {
              id: "id-2",
              raw_text: "text",
              section: "commanders",
              count: 1,
              card_digest: { oracle_id: "oracle-2", type_line: "type" },
            },
          ],
          nonlands: [
            {
              id: "id-3",
              raw_text: "text",
              section: "nonlands",
              count: 1,
              card_digest: { oracle_id: "oracle-3", type_line: "type" },
            },
            {
              id: "id-4",
              raw_text: "text",
              section: "nonlands",
              count: 1,
              card_digest: { oracle_id: "oracle-4", type_line: "type" },
            },
          ],
          lands: [
            {
              id: "id-5",
              raw_text: "text",
              section: "lands",
              count: 1,
              card_digest: { oracle_id: "oracle-5", type_line: "type" },
            },
            {
              id: "id-6",
              raw_text: "text",
              section: "lands",
              count: 1,
              card_digest: { oracle_id: "oracle-6", type_line: "type" },
            },
          ],
          maybeboard: [
            {
              id: "id-7",
              raw_text: "text",
              section: "maybeboard",
              count: 1,
              card_digest: { oracle_id: "oracle-7", type_line: "type" },
            },
            {
              id: "id-8",
              section: "maybeboard",
              raw_text: "text",
              count: 1,
              card_digest: { oracle_id: "oracle-8", type_line: "type" },
            },
          ],
        },
      };
    });

    it("takes deck entries and flattens them into a single list", function () {
      const entries = flattenEntries(fakeDeck);

      expect(entries.length).toBe(8);
      expect(entries).toContainEqual({
        id: "id-1",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-1", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-2",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-2", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-3",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-3", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-4",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-4", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-5",
        raw_text: "text",
        section: "lands",
        count: 1,
        card_digest: { oracle_id: "oracle-5", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-6",
        raw_text: "text",
        section: "lands",
        count: 1,
        card_digest: { oracle_id: "oracle-6", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-7",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-7", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-8",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-8", type_line: "type" },
      });
    });

    it("by default collapses cards with the same orracle id in multiple entries in sections into one", function () {
      fakeDeck.entries.lands = [
        {
          id: "id-2",
          raw_text: "text",
          section: "lands",
          count: 2,
          card_digest: {
            oracle_id: "oracle-2",
            type_line: "type",
          },
        },
      ];

      const entries = flattenEntries(fakeDeck);

      expect(entries.length).toBe(6);
      expect(entries).toContainEqual({
        id: "id-1",
        raw_text: "text",
        count: 1,
        section: "commanders",
        card_digest: { oracle_id: "oracle-1", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-2",
        raw_text: "text",
        section: "commanders",
        count: 3,
        card_digest: { oracle_id: "oracle-2", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-3",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-3", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-4",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-4", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-7",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-7", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-8",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-8", type_line: "type" },
      });
    });

    it("can specify to collapse by id", function () {
      fakeDeck.entries.lands = [
        {
          id: "id-9",
          count: 2,
          section: "lands",
          raw_text: "text",
          card_digest: {
            oracle_id: "oracle-2",
            type_line: "type",
          },
        },
      ];

      const entries = flattenEntries(fakeDeck, {
        idToGroupBy: "id",
      });

      expect(entries.length).toBe(7);
      expect(entries).toContainEqual({
        id: "id-1",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-1", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-2",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-2", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-9",
        raw_text: "text",
        section: "lands",
        count: 2,
        card_digest: { oracle_id: "oracle-2", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-3",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-3", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-4",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-4", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-7",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-7", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-8",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-8", type_line: "type" },
      });
    });

    it("ignores entries without raw_text when grouping by id", function () {
      fakeDeck.entries.lands = [
        {
          id: "id-9",
          section: "lands",
          count: 2,
          raw_text: "",
          card_digest: {
            oracle_id: "oracle-2",
            type_line: "type",
          },
        },
      ];

      const entries = flattenEntries(fakeDeck, {
        idToGroupBy: "id",
      });

      expect(entries.length).toBe(6);
      expect(entries).toContainEqual({
        id: "id-1",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-1", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-2",
        raw_text: "text",
        section: "commanders",
        count: 1,
        card_digest: { oracle_id: "oracle-2", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-3",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-3", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-4",
        raw_text: "text",
        section: "nonlands",
        count: 1,
        card_digest: { oracle_id: "oracle-4", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-7",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-7", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-8",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-8", type_line: "type" },
      });
    });

    it("can ignore sections", function () {
      const entries = flattenEntries(fakeDeck, {
        ignoredSections: {
          commanders: true,
          lands: true,
        },
      });

      expect(entries.length).toBe(4);
      expect(entries).toContainEqual({
        id: "id-3",
        section: "nonlands",
        raw_text: "text",
        count: 1,
        card_digest: { oracle_id: "oracle-3", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-4",
        section: "nonlands",
        raw_text: "text",
        count: 1,
        card_digest: { oracle_id: "oracle-4", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-7",
        section: "maybeboard",
        raw_text: "text",
        count: 1,
        card_digest: { oracle_id: "oracle-7", type_line: "type" },
      });
      expect(entries).toContainEqual({
        id: "id-8",
        raw_text: "text",
        section: "maybeboard",
        count: 1,
        card_digest: { oracle_id: "oracle-8", type_line: "type" },
      });
    });
  });

  describe("hasLegalCommanders", function () {
    beforeEach(function () {
      jest.spyOn(scryfall, "get");
    });

    it("returns false if deck has a commanders section, but no commanders", async function () {
      const commanders: string[] = [];

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false);
    });

    it("returns true if deck has a commanders section and all cards in it are legal commanders", async function () {
      const commanders = ["Sidar Kondo of Jamuraa", "Tana the Bloodsower"];

      scryfall.get.mockResolvedValue({});

      await expect(hasLegalCommanders(commanders)).resolves.toBe(true);
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: '!"Sidar Kondo of Jamuraa" is:commander',
      });
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: '!"Tana the Bloodsower" is:commander',
      });
    });

    it("returns false if any cards in it are not legal commanders", async function () {
      const commanders = ["Tana the Bloodsower", "Craterhoof Behemoth"];

      scryfall.get.mockResolvedValueOnce({});
      scryfall.get.mockRejectedValueOnce(new Error("404"));

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false);
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: '!"Tana the Bloodsower" is:commander',
      });
      expect(scryfall.get).toBeCalledWith("/cards/search", {
        q: '!"Craterhoof Behemoth" is:commander',
      });
    });
  });

  describe("isCommanderLike", function () {
    it("returns true when deck has a commanders section", function () {
      const deck = {
        sections: {
          a: ["foo"],
          b: ["foo", "bar", "commanders", "baz"],
          c: ["foo"],
        },
      };

      expect(isCommanderLike(deck)).toBe(true);
    });

    it("returns false when deck has no commanders", function () {
      const deck = {
        sections: {
          a: ["foo"],
          b: ["foo", "bar", "baz", "nonlands"],
          c: ["foo"],
        },
      };

      expect(isCommanderLike(deck)).toBe(false);
    });
  });

  describe("isSingletonTypeDeck", function () {
    it("returns true when deck has a commanders section", function () {
      const deck = {
        sections: {
          a: ["foo"],
          b: ["foo", "bar", "commanders", "baz"],
          c: ["foo"],
        },
      };

      expect(isSingletonTypeDeck(deck)).toBe(true);
    });

    it("returns true when deck has a nonlands section", function () {
      const deck = {
        sections: {
          a: ["foo"],
          b: ["foo", "bar", "nonlands", "baz"],
          c: ["foo"],
        },
      };

      expect(isSingletonTypeDeck(deck)).toBe(true);
    });

    it("returns false when deck has no commanders or nonlands section", function () {
      const deck = {
        sections: {
          a: ["foo"],
          b: ["foo", "bar", "baz"],
          c: ["foo"],
        },
      };

      expect(isSingletonTypeDeck(deck)).toBe(false);
    });
  });
});
