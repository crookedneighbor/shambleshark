import bus from "framebus";
import url from "Lib/url";
import {
  addCard,
  addHooksToCardManagementEvents,
  cleanUp,
  getActiveDeck,
  getActiveDeckId,
  getDeck,
  getDeckMetadata,
  pushNotification,
  removeEntry,
  updateEntry,
} from "Js/scryfall-embed/scryfall-globals";

describe("Scryfall Globals", function () {
  let fakeDeck;

  beforeEach(function () {
    jest.spyOn(bus, "emit").mockImplementation();
    fakeDeck = {
      id: "deck-id",
      sections: {
        primary: ["mainboard"],
        secondary: ["sideboard", "maybeboard"],
      },
      entries: {
        mainboard: [],
        sideboard: [],
        maybeboard: [],
      },
    };
    global.ScryfallAPI = {
      grantSecret: "secret",
      decks: {
        active: jest.fn().mockImplementation((cb) => {
          cb(fakeDeck);
        }),
        addCard: jest.fn(),
        createEntry: jest.fn(),
        destroyEntry: jest.fn(),
        replaceEntry: jest.fn(),
        get: jest.fn().mockImplementation((id, cb) => {
          cb(fakeDeck);
        }),
        updateEntry: jest.fn(),
      },
    };

    global.Scryfall = {
      deckbuilder: {
        cleanUp: jest.fn(),
      },
      pushNotification: jest.fn(),
    };
  });

  describe("addHooksToCardManagementEvents", function () {
    it.each([
      "addCard",
      "updateEntry",
      "replaceEntry",
      "createEntry",
      "destroyEntry",
    ])(
      "replaces ScryfallAPI.decks.%s with a method that emits a bus event when calling the original method",
      function (s) {
        const original = global.ScryfallAPI.decks[s];

        addHooksToCardManagementEvents();

        expect(original).not.toBe(global.ScryfallAPI.decks[s]);
        global.ScryfallAPI.decks[s]("foo", "bar");

        expect(bus.emit).toBeCalledTimes(1);
        expect(bus.emit).toBeCalledWith(`CALLED_${s.toUpperCase()}`, {
          deckId: "foo",
          payload: "bar",
        });
        expect(original).toBeCalledWith("foo", "bar");
      }
    );

    it("replaces Scryfall.deckbuilder.cleanUp with a method that emits a bus event when calling the original method", function () {
      const original = global.Scryfall.deckbuilder.cleanUp;

      addHooksToCardManagementEvents();

      expect(original).not.toBe(global.Scryfall.deckbuilder.cleanUp);
      global.Scryfall.deckbuilder.cleanUp("foo", "bar");

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith("CALLED_CLEANUP");
      expect(original).toBeCalledTimes(1);
      expect(original).toBeCalledWith("foo", "bar");
    });

    it("does not attempt to replace Scryfall.deckbuilder.cleanUp if Scryfall.deckbuilder global is not available", function () {
      delete global.Scryfall.deckbuilder;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });

    it("does not attempt to replace ScryfallAPI methods if Scryfall API is not availabel", function () {
      delete global.ScryfallAPI;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });
  });

  describe("getActiveDeckId", function () {
    it("calls getActiveDeck to get the active deck", function () {
      return getActiveDeckId().then((id) => {
        expect(id).toBe("deck-id");
      });
    });

    it("waits progressively longer for grant secret", async function () {
      let hasResolved = false;
      jest.useFakeTimers();
      delete global.ScryfallAPI.grantSecret;

      const getActiveDeckIdPromise = getActiveDeckId().then(() => {
        hasResolved = true;
      });

      expect(hasResolved).toBe(false);

      await Promise.resolve().then(() => jest.advanceTimersByTime(300));

      expect(hasResolved).toBe(false);

      global.ScryfallAPI.grantSecret = "secret";

      await Promise.resolve().then(() => jest.advanceTimersByTime(10000));

      await getActiveDeckIdPromise;

      expect(hasResolved).toBe(true);
    });

    it("skips api call if the deck id is available in the url", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");

      return getActiveDeckId().then((id) => {
        expect(id).toBe("deck-id-from-url");
        expect(global.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });

    it("skips api call if the deck id is available on the window", function () {
      global.Scryfall.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id) => {
        expect(id).toBe("deck-id-from-window");
        expect(global.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });

    it("prefers deck id from url over window", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");
      global.Scryfall.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id) => {
        expect(id).toBe("deck-id-from-url");
        expect(global.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });
  });

  describe("getActiveDeck", function () {
    it("resolves with the active deck", function () {
      return getActiveDeck().then((deck) => {
        expect(deck.id).toBe("deck-id");
      });
    });
  });

  describe("getDeck", function () {
    it("gets the active deck", function () {
      const deck = { id: "deck-id" };

      global.ScryfallAPI.decks.get.mockImplementation((id, cb) => {
        cb(deck);
      });

      return getDeck().then((resolvedDeck) => {
        expect(global.ScryfallAPI.decks.get).toBeCalledWith(
          "deck-id",
          expect.any(Function)
        );

        expect(deck).toBe(resolvedDeck);
      });
    });
  });

  describe("getDeckMetadata", function () {
    it("gets the metadata from active deck", function () {
      const deck = { id: "deck-id", sections: {}, foo: "bar" };

      global.ScryfallAPI.decks.get.mockImplementation((id, cb) => {
        cb(deck);
      });

      return getDeckMetadata().then((meta) => {
        expect(global.ScryfallAPI.decks.get).toBeCalledWith(
          "deck-id",
          expect.any(Function)
        );

        expect(meta).toEqual({
          id: "deck-id",
          sections: {},
        });
      });
    });
  });

  describe("addCard", function () {
    it("resolves with the card", function () {
      const card = {};

      global.ScryfallAPI.decks.addCard.mockImplementation(
        (deckId, cardId, cb) => {
          cb(card);
        }
      );

      return addCard("card-id").then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.addCard).toBeCalledWith(
          "deck-id",
          "card-id",
          expect.any(Function)
        );

        expect(card).toBe(resolvedCard);
      });
    });
  });

  describe("updateEntry", function () {
    it("resolves with the card", function () {
      const cardToUpdate = { id: "card-id" };
      const card = {};

      global.ScryfallAPI.decks.updateEntry.mockImplementation(
        (deckId, cardToUpdate, cb) => {
          cb(card);
        }
      );

      return updateEntry(cardToUpdate).then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith(
          "deck-id",
          cardToUpdate,
          expect.any(Function)
        );

        expect(card).toBe(resolvedCard);
      });
    });
  });

  describe("removeEntry", function () {
    it("calls destroy API", function () {
      const data = {};

      global.ScryfallAPI.decks.destroyEntry.mockImplementation(
        (deckId, cardId, cb) => {
          cb(data);
        }
      );

      return removeEntry("card-id").then((result) => {
        expect(global.ScryfallAPI.decks.destroyEntry).toBeCalledWith(
          "deck-id",
          "card-id",
          expect.any(Function)
        );
        expect(result).toBeFalsy();
      });
    });
  });

  describe("cleanUp", function () {
    it("resolves after cleaning up", function () {
      return cleanUp().then(() => {
        expect(global.Scryfall.deckbuilder.cleanUp).toBeCalledTimes(1);
      });
    });
  });

  describe("pushNotification", function () {
    it("sends a push notification", function () {
      return pushNotification("Title", "message", "color", "category").then(
        function () {
          expect(global.Scryfall.pushNotification).toBeCalledTimes(1);
          expect(global.Scryfall.pushNotification).toBeCalledWith(
            "Title",
            "message",
            "color",
            "category"
          );
        }
      );
    });
  });
});
