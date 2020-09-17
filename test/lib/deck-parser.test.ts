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
import { search } from "Lib/scryfall";

import SpyInstance = jest.SpyInstance;
import { Deck } from "Js/types/deck";
import { makeFakeDeck, makeFakeCard } from "Helpers/fake";

import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");

describe("Deck Parser", () => {
  let searchSpy: SpyInstance;

  beforeEach(() => {
    searchSpy = mocked(search);
  });

  afterEach(() => {
    searchSpy.mockReset();
  });

  describe("getCommanderColorIdentity", () => {
    it("returns array of color identity for commander", async () => {
      const fakeDeck = makeFakeDeck({
        entries: {
          commanders: [
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-1",
              },
            }),
          ],
        },
      });

      searchSpy.mockResolvedValue([
        {
          color_identity: ["U", "R"],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["U", "R"]);
      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith('oracle_id:"id-1"');
    });

    it("returns array of color identity for multiple commanders", async () => {
      const fakeDeck = makeFakeDeck({
        entries: {
          commanders: [
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-1",
              },
            }),
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-2",
              },
            }),
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-3",
              },
            }),
          ],
        },
      });

      searchSpy.mockResolvedValue([
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
      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith(
        'oracle_id:"id-1" or oracle_id:"id-2" or oracle_id:"id-3"'
      );
    });

    it("returns array of c when color idenity is empty", async () => {
      const fakeDeck = makeFakeDeck({
        entries: {
          commanders: [
            makeFakeCard({
              section: "commanders",
            }),
          ],
        },
      });

      searchSpy.mockResolvedValue([
        {
          color_identity: [],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["C"]);
    });

    it("ignores cards without a card digeest", async () => {
      const fakeDeck = makeFakeDeck({
        entries: {
          commanders: [
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-1",
              },
            }),
            makeFakeCard({
              section: "commanders",
              cardDigest: false,
            }),
            makeFakeCard({
              section: "commanders",
              cardDigest: {
                oracle_id: "id-3",
              },
            }),
          ],
        },
      });

      searchSpy.mockResolvedValue([
        {
          color_identity: ["U", "R"],
        },
        {
          color_identity: ["W"],
        },
      ]);

      const colors = await getCommanderColorIdentity(fakeDeck);

      expect(colors).toEqual(["U", "R", "W"]);
      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith('oracle_id:"id-1" or oracle_id:"id-3"');
    });
  });

  describe("getSections", () => {
    it("returns a flattened array of deck sections", () => {
      const fakeDeck = makeFakeDeck({
        primarySections: ["nonlands", "lands"],
        secondarySections: ["maybeboard", "sideboard"],
      });

      expect(getSections(fakeDeck)).toEqual([
        "nonlands",
        "lands",
        "maybeboard",
        "sideboard",
      ]);
    });
  });

  describe("isLandCard", () => {
    it("returns false if card is not a land card", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Enchantment",
            },
          })
        )
      ).toBe(false);
    });

    it("returns true if card is a land card", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Land",
            },
          })
        )
      ).toBe(true);
    });

    it("returns false if card is land card on flip side", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Enchantment // Land",
            },
          })
        )
      ).toBe(false);
    });

    it("returns true if card is a land card on front side", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Land // Creature",
            },
          })
        )
      ).toBe(true);
    });

    it("returns false if card is a creature land", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Land Creature",
            },
          })
        )
      ).toBe(false);
    });

    it("returns true if card is a creature on the flipside", () => {
      expect(
        isLandCard(
          makeFakeCard({
            cardDigest: {
              type_line: "Land // Creature",
            },
          })
        )
      ).toBe(true);
    });
  });

  describe("hasDedicatedLandSection", () => {
    it("returns false if deck does not have a lands section", () => {
      expect(
        hasDedicatedLandSection(
          makeFakeDeck({
            primarySections: ["mainboard", "sideboard"],
            secondarySections: ["maybeboard"],
          })
        )
      ).toBe(false);
    });

    it("returns true if deck does have a lands section", () => {
      expect(
        hasDedicatedLandSection(
          makeFakeDeck({
            primarySections: ["mainboard", "lands"],
            secondarySections: ["maybeboard"],
          })
        )
      ).toBe(true);
    });
  });

  describe("flattenEntries", () => {
    let fakeDeck: Deck;

    beforeEach(() => {
      fakeDeck = makeFakeDeck({
        primarySections: ["commanders", "nonlands"],
        secondarySections: ["lands", "maybeboard"],
        entries: {
          commanders: [
            makeFakeCard({
              id: "id-1",
              section: "commanders",
            }),
            makeFakeCard({
              id: "id-2",
              section: "commanders",
            }),
          ],
          nonlands: [
            makeFakeCard({
              id: "id-3",
              section: "nonlands",
            }),
            makeFakeCard({
              id: "id-4",
              section: "nonlands",
            }),
          ],
          lands: [
            makeFakeCard({
              id: "id-5",
              section: "lands",
            }),
            makeFakeCard({
              id: "id-6",
              section: "lands",
            }),
          ],
          maybeboard: [
            makeFakeCard({
              id: "id-7",
              section: "maybeboard",
            }),
            makeFakeCard({
              id: "id-8",
              section: "maybeboard",
            }),
          ],
        },
      });
    });

    it("takes deck entries and flattens them into a single list", () => {
      const entries = flattenEntries(fakeDeck);

      expect(entries.length).toBe(8);
      expect(entries.find((e) => e.id === "id-1")).toMatchObject({
        id: "id-1",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-2")).toMatchObject({
        id: "id-2",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-3")).toMatchObject({
        id: "id-3",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-4")).toMatchObject({
        id: "id-4",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-5")).toMatchObject({
        id: "id-5",
        section: "lands",
      });
      expect(entries.find((e) => e.id === "id-6")).toMatchObject({
        id: "id-6",
        section: "lands",
      });
      expect(entries.find((e) => e.id === "id-7")).toMatchObject({
        id: "id-7",
        section: "maybeboard",
      });
      expect(entries.find((e) => e.id === "id-8")).toMatchObject({
        id: "id-8",
        section: "maybeboard",
      });
    });

    it("by default collapses cards with the same orracle id in multiple entries in sections into one", () => {
      fakeDeck.entries.commanders![1].card_digest!.oracle_id = "oracle-custom";
      fakeDeck.entries.lands = [
        makeFakeCard({
          id: "id-2",
          section: "lands",
          count: 2,
          cardDigest: {
            oracle_id: "oracle-custom",
          },
        }),
      ];

      const entries = flattenEntries(fakeDeck);

      expect(entries.length).toBe(6);
      expect(entries.find((e) => e.id === "id-1")).toMatchObject({
        id: "id-1",
        count: 1,
      });
      expect(entries.find((e) => e.id === "id-2")).toMatchObject({
        id: "id-2",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-3")).toMatchObject({
        id: "id-3",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-4")).toMatchObject({
        id: "id-4",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-7")).toMatchObject({
        id: "id-7",
        section: "maybeboard",
      });
      expect(entries.find((e) => e.id === "id-8")).toMatchObject({
        id: "id-8",
        section: "maybeboard",
      });
    });

    it("can specify to collapse by id", () => {
      fakeDeck.entries.lands = [
        makeFakeCard({
          id: "id-9",
          count: 2,
          section: "lands",
          raw_text: "text",
          cardDigest: {
            oracle_id: "oracle-2",
          },
        }),
      ];

      const entries = flattenEntries(fakeDeck, {
        idToGroupBy: "id",
      });

      expect(entries.length).toBe(7);
      expect(entries.find((e) => e.id === "id-1")).toMatchObject({
        id: "id-1",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-2")).toMatchObject({
        id: "id-2",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-9")).toMatchObject({
        id: "id-9",
        section: "lands",
      });
      expect(entries.find((e) => e.id === "id-3")).toMatchObject({
        id: "id-3",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-4")).toMatchObject({
        id: "id-4",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-7")).toMatchObject({
        id: "id-7",
        section: "maybeboard",
      });
      expect(entries.find((e) => e.id === "id-8")).toMatchObject({
        id: "id-8",
        section: "maybeboard",
      });
    });

    it("ignores entries without raw_text when grouping by id", () => {
      fakeDeck.entries.lands = [
        makeFakeCard({
          section: "lands",
          count: 2,
          rawText: "",
          cardDigest: {
            oracle_id: "oracle-2",
            type_line: "type",
          },
        }),
      ];

      const entries = flattenEntries(fakeDeck, {
        idToGroupBy: "id",
      });

      expect(entries.length).toBe(6);
      expect(entries.find((e) => e.id === "id-1")).toMatchObject({
        id: "id-1",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-2")).toMatchObject({
        id: "id-2",
        section: "commanders",
      });
      expect(entries.find((e) => e.id === "id-3")).toMatchObject({
        id: "id-3",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-4")).toMatchObject({
        id: "id-4",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-7")).toMatchObject({
        id: "id-7",
        section: "maybeboard",
      });
      expect(entries.find((e) => e.id === "id-8")).toMatchObject({
        id: "id-8",
        section: "maybeboard",
      });
    });

    it("can ignore sections", () => {
      const entries = flattenEntries(fakeDeck, {
        ignoredSections: {
          commanders: true,
          lands: true,
        },
      });

      expect(entries.length).toBe(4);
      expect(entries.find((e) => e.id === "id-3")).toMatchObject({
        id: "id-3",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-4")).toMatchObject({
        id: "id-4",
        section: "nonlands",
      });
      expect(entries.find((e) => e.id === "id-7")).toMatchObject({
        id: "id-7",
        section: "maybeboard",
      });
      expect(entries.find((e) => e.id === "id-8")).toMatchObject({
        id: "id-8",
        section: "maybeboard",
      });
    });
  });

  describe("hasLegalCommanders", () => {
    it("returns false if deck has a commanders section, but no commanders", async () => {
      const commanders: string[] = [];

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false);
    });

    it("returns true if deck has a commanders section and all cards in it are legal commanders", async () => {
      const commanders = ["Sidar Kondo of Jamuraa", "Tana the Bloodsower"];

      searchSpy.mockResolvedValue({});

      await expect(hasLegalCommanders(commanders)).resolves.toBe(true);
      expect(search).toBeCalledWith('!"Sidar Kondo of Jamuraa" is:commander');
      expect(search).toBeCalledWith('!"Tana the Bloodsower" is:commander');
    });

    it("returns false if any cards in it are not legal commanders", async () => {
      const commanders = ["Tana the Bloodsower", "Craterhoof Behemoth"];

      searchSpy.mockResolvedValueOnce({});
      searchSpy.mockRejectedValueOnce(new Error("404"));

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false);
      expect(search).toBeCalledWith('!"Tana the Bloodsower" is:commander');
      expect(search).toBeCalledWith('!"Craterhoof Behemoth" is:commander');
    });
  });

  describe("isCommanderLike", () => {
    it("returns true when deck has a commanders section", () => {
      const deck = makeFakeDeck({
        primarySections: ["mainboard"],
        secondarySections: ["sideboard", "commanders", "maybeboard"],
      });

      expect(isCommanderLike(deck)).toBe(true);
    });

    it("returns false when deck has no commanders", () => {
      const deck = makeFakeDeck({
        primarySections: ["mainboard"],
        secondarySections: ["sideboard", "lands", "maybeboard"],
      });

      expect(isCommanderLike(deck)).toBe(false);
    });
  });

  describe("isSingletonTypeDeck", () => {
    it("returns true when deck has a commanders section", () => {
      const deck = makeFakeDeck({
        primarySections: ["mainboard"],
        secondarySections: ["sideboard", "lands", "commanders", "maybeboard"],
      });

      expect(isSingletonTypeDeck(deck)).toBe(true);
    });

    it("returns true when deck has a nonlands section", () => {
      const deck = makeFakeDeck({
        primarySections: ["commanders"],
        secondarySections: ["lands", "nonlands", "maybeboard"],
      });

      expect(isSingletonTypeDeck(deck)).toBe(true);
    });

    it("returns false when deck has no commanders or nonlands section", () => {
      const deck = makeFakeDeck({
        primarySections: ["mainboard"],
        secondarySections: ["sideboard"],
      });

      expect(isSingletonTypeDeck(deck)).toBe(false);
    });
  });
});
