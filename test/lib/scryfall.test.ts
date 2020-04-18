import { api, getCollection, getDeck } from "Lib/scryfall";
import * as bus from "framebus";
import { mocked } from "ts-jest/utils";

import SpyInstance = jest.SpyInstance;
import { makeFakeDeck } from "Helpers/fake";

// TODO mock scryfall-client
jest.mock("framebus");
jest.mock("scryfall-client");

describe("scryfall", function () {
  describe("getDeck", function () {
    beforeEach(function () {
      jest.useFakeTimers();
    });

    afterEach(function () {
      jest.runAllTimers();
    });

    it("requests deck from Scryfall page", async function () {
      const deck = makeFakeDeck();

      mocked(bus.emit).mockImplementation((event, cb) => {
        cb(deck);
      });

      const resolvedDeck = await getDeck();

      expect(resolvedDeck).toEqual(deck);
      expect(bus.emit).toBeCalledWith("REQUEST_DECK", expect.any(Function));
    });

    it("caches result if request is made a second time within 2 seconds", async function () {
      const firstDeck = makeFakeDeck();
      const secondDeck = makeFakeDeck();

      mocked(bus.emit).mockImplementationOnce((event, cb) => {
        cb(firstDeck);
      });
      mocked(bus.emit).mockImplementationOnce((event, cb) => {
        cb(secondDeck);
      });

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

  describe("getCollection", function () {
    let fakeCards: { id: string }[];
    let postSpy: SpyInstance;

    beforeEach(function () {
      fakeCards = [{ id: "foo" }];

      postSpy = mocked(api.post).mockResolvedValue(fakeCards);
    });

    it("looks up collection endpoint", async function () {
      const cards = await getCollection([
        {
          set: "DOM",
          collector_number: "102",
        },
      ]);

      expect(postSpy).toBeCalledTimes(1);
      expect(postSpy).toBeCalledWith("/cards/collection", {
        identifiers: [
          {
            set: "DOM",
            collector_number: "102",
          },
        ],
      });

      expect(cards).toEqual(fakeCards);
    });

    it("calls collection endpoint in batches of 75", async function () {
      const fakeEntry = {
        set: "foo",
        collector_number: "1",
      };
      const entries = [];
      let i = 0;
      while (i < 400) {
        entries.push(fakeEntry);
        i++;
      }

      await getCollection(entries);

      expect(postSpy).toBeCalledTimes(6);
      expect(postSpy.mock!.calls[0][1].identifiers.length).toBe(75);
      expect(postSpy.mock!.calls[1][1].identifiers.length).toBe(75);
      expect(postSpy.mock!.calls[2][1].identifiers.length).toBe(75);
      expect(postSpy.mock!.calls[3][1].identifiers.length).toBe(75);
      expect(postSpy.mock!.calls[4][1].identifiers.length).toBe(75);
      expect(postSpy.mock!.calls[5][1].identifiers.length).toBe(25);
    });

    it("resolves with flattened array of the results of each card's getTokens call", async function () {
      const fakeEntry = {
        set: "foo",
        collector_number: "1",
      };
      const entries = [];
      let i = 0;
      while (i < 200) {
        entries.push(fakeEntry);
        i++;
      }

      const cards = await getCollection(entries);

      expect(api.post).toBeCalledTimes(3);

      cards.forEach((c) => {
        expect(Array.isArray(c)).toBe(false);
      });
    });
  });
});
