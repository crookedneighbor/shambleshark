import { api, getCollection, getDeck } from "Lib/scryfall";
import bus from "framebus";

describe("scryfall", function () {
  beforeEach(function () {
    jest.spyOn(bus, "emit");
  });

  describe("getDeck", function () {
    beforeEach(function () {
      jest.useFakeTimers();
    });

    afterEach(function () {
      jest.runAllTimers();
    });

    it("requests deck from Scryfall page", async function () {
      const deck = {};

      bus.emit.mockImplementation((event, cb) => {
        cb(deck);
      });

      const resolvedDeck = await getDeck();

      expect(resolvedDeck).toEqual(deck);
      expect(bus.emit).toBeCalledWith("REQUEST_DECK", expect.any(Function));
    });

    it("caches result if request is made a second time within 2 seconds", async function () {
      const firstDeck = { id: "1" };
      const secondDeck = { id: "2" };

      bus.emit.mockImplementationOnce((event, cb) => {
        cb(firstDeck);
      });
      bus.emit.mockImplementationOnce((event, cb) => {
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
    let fakeCards;

    beforeEach(function () {
      fakeCards = [{ id: "foo" }];

      jest.spyOn(api, "post").mockResolvedValue(fakeCards);
    });

    it("looks up collection endpoint", async function () {
      const cards = await getCollection([
        {
          set: "DOM",
          collector_number: "102",
        },
      ]);

      expect(api.post).toBeCalledTimes(1);
      expect(api.post).toBeCalledWith("/cards/collection", {
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

      expect(api.post).toBeCalledTimes(6);
      expect(api.post.mock.calls[0][1].identifiers.length).toBe(75);
      expect(api.post.mock.calls[1][1].identifiers.length).toBe(75);
      expect(api.post.mock.calls[2][1].identifiers.length).toBe(75);
      expect(api.post.mock.calls[3][1].identifiers.length).toBe(75);
      expect(api.post.mock.calls[4][1].identifiers.length).toBe(75);
      expect(api.post.mock.calls[5][1].identifiers.length).toBe(25);
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
