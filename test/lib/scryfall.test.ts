import scryfall = require("scryfall-client");
import type List from "scryfall-client/dist/models/list";
import type Card from "scryfall-client/dist/models/card";
import { getCollection, getDeck } from "Lib/scryfall";
import Framebus from "framebus";
import SpyInstance = jest.SpyInstance;
import { makeFakeDeck } from "Helpers/fake";

jest.mock("framebus");
jest.mock("scryfall-client");

describe("scryfall", () => {
  describe("getDeck", () => {
    let emitSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      emitSpy = jest.mocked(Framebus.prototype.emitAsPromise);
    });

    afterEach(() => {
      jest.runAllTimers();
      emitSpy.mockReset();
    });

    it("requests deck from Scryfall page", async () => {
      const deck = makeFakeDeck();

      emitSpy.mockResolvedValue(deck);

      const resolvedDeck = await getDeck();

      expect(resolvedDeck).toEqual(deck);
      expect(emitSpy).toBeCalledWith("REQUEST_DECK");
    });

    it("caches result if request is made a second time within 2 seconds", async () => {
      const firstDeck = makeFakeDeck();
      const secondDeck = makeFakeDeck();

      emitSpy.mockResolvedValueOnce(firstDeck);
      emitSpy.mockResolvedValueOnce(secondDeck);

      const resolvedDeck = await getDeck();

      jest.advanceTimersByTime(1999);

      const compareDeck = await getDeck();

      expect(resolvedDeck).toEqual(firstDeck);
      expect(resolvedDeck).toEqual(compareDeck);
      expect(compareDeck).toEqual(firstDeck);

      jest.advanceTimersByTime(2);

      const deckAfterTimeout = await getDeck();

      expect(deckAfterTimeout).not.toEqual(resolvedDeck);
      expect(deckAfterTimeout).toEqual(secondDeck);
    });
  });

  describe("getCollection", () => {
    let fakeCards: { id: string }[];
    let getCollectionSpy: SpyInstance;

    beforeEach(() => {
      fakeCards = [{ id: "foo" }];

      getCollectionSpy = jest
        .mocked(scryfall.getCollection)
        .mockResolvedValue(fakeCards as List<Card>);
    });

    it("looks up collection endpoint", async () => {
      const cards = await getCollection([
        {
          set: "DOM",
          collector_number: "102",
        },
      ]);

      expect(getCollectionSpy).toBeCalledTimes(1);
      expect(getCollectionSpy).toBeCalledWith([
        {
          set: "DOM",
          collector_number: "102",
        },
      ]);

      expect(cards).toEqual(fakeCards);
    });
  });
});
