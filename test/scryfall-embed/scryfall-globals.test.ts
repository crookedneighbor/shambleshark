import * as bus from "framebus";
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

import { Deck } from "Js/types/deck";
import {
  generateScryfallGlobal,
  generateScryfallAPIGlobal,
} from "../mocks/scryfall-global";

declare global {
  interface Window {
    Scryfall: any;
    ScryfallAPI: any;
  }
}

describe("Scryfall Globals", function () {
  let fakeDeck: Deck;

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
    window.ScryfallAPI = generateScryfallAPIGlobal();
    window.ScryfallAPI.decks.active.mockImplementation((cb: Function) => {
      cb(fakeDeck);
    });
    window.ScryfallAPI.decks.get.mockImplementation(
      (id: string, cb: Function) => {
        cb(fakeDeck);
      }
    );

    window.Scryfall = generateScryfallGlobal();
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
        const original = window.ScryfallAPI.decks[s];

        addHooksToCardManagementEvents();

        expect(original).not.toBe(window.ScryfallAPI.decks[s]);
        window.ScryfallAPI.decks[s]("foo", "bar");

        expect(bus.emit).toBeCalledTimes(1);
        expect(bus.emit).toBeCalledWith(`CALLED_${s.toUpperCase()}`, {
          deckId: "foo",
          payload: "bar",
        });
        expect(original).toBeCalledWith("foo", "bar");
      }
    );

    it("replaces Scryfall.deckbuilder.cleanUp with a method that emits a bus event when calling the original method", function () {
      const original = window.Scryfall.deckbuilder.cleanUp;

      addHooksToCardManagementEvents();

      expect(original).not.toBe(window.Scryfall.deckbuilder.cleanUp);
      window.Scryfall.deckbuilder.cleanUp("foo", "bar");

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith("CALLED_CLEANUP");
      expect(original).toBeCalledTimes(1);
      expect(original).toBeCalledWith("foo", "bar");
    });

    it("does not attempt to replace Scryfall.deckbuilder.cleanUp if Scryfall.deckbuilder global is not available", function () {
      delete window.Scryfall.deckbuilder;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });

    it("does not attempt to replace ScryfallAPI methods if Scryfall API is not availabel", function () {
      delete window.ScryfallAPI;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });
  });

  describe("getActiveDeckId", function () {
    it("calls getActiveDeck to get the active deck", function () {
      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id");
      });
    });

    it("waits progressively longer for grant secret", async function () {
      let hasResolved = false;
      jest.useFakeTimers();
      delete window.ScryfallAPI.grantSecret;

      const getActiveDeckIdPromise = getActiveDeckId().then(() => {
        hasResolved = true;
      });

      expect(hasResolved).toBe(false);

      await Promise.resolve().then(() => jest.advanceTimersByTime(300));

      expect(hasResolved).toBe(false);

      window.ScryfallAPI.grantSecret = "secret";

      await Promise.resolve().then(() => jest.advanceTimersByTime(10000));

      await getActiveDeckIdPromise;

      expect(hasResolved).toBe(true);
    });

    it("skips api call if the deck id is available in the url", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(window.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });

    it("skips api call if the deck id is available on the window", function () {
      window.Scryfall.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-window");
        expect(window.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });

    it("prefers deck id from url over window", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");
      window.Scryfall.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(window.ScryfallAPI.decks.active).not.toBeCalled();
      });
    });
  });

  describe("getActiveDeck", function () {
    it("resolves with the active deck", function () {
      return getActiveDeck().then((deck: Deck) => {
        expect(deck.id).toBe("deck-id");
      });
    });
  });

  describe("getDeck", function () {
    it("gets the active deck", function () {
      const deck = { id: "deck-id" };

      window.ScryfallAPI.decks.get.mockImplementation(
        (id: string, cb: Function) => {
          cb(deck);
        }
      );

      return getDeck().then((resolvedDeck: Deck) => {
        expect(window.ScryfallAPI.decks.get).toBeCalledWith(
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

      window.ScryfallAPI.decks.get.mockImplementation(
        (id: string, cb: Function) => {
          cb(deck);
        }
      );

      return getDeckMetadata().then((meta: {}) => {
        expect(window.ScryfallAPI.decks.get).toBeCalledWith(
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

      window.ScryfallAPI.decks.addCard.mockImplementation(
        (deckId: string, cardId: string, cb: Function) => {
          cb(card);
        }
      );

      return addCard("card-id").then((resolvedCard: {}) => {
        expect(window.ScryfallAPI.decks.addCard).toBeCalledWith(
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

      window.ScryfallAPI.decks.updateEntry.mockImplementation(
        (deckId: string, cardToUpdate: any, cb: Function) => {
          cb(card);
        }
      );

      return updateEntry(cardToUpdate).then((resolvedCard: {}) => {
        expect(window.ScryfallAPI.decks.updateEntry).toBeCalledWith(
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

      window.ScryfallAPI.decks.destroyEntry.mockImplementation(
        (deckId: string, cardId: string, cb: Function) => {
          cb(data);
        }
      );

      return removeEntry("card-id").then(() => {
        expect(window.ScryfallAPI.decks.destroyEntry).toBeCalledWith(
          "deck-id",
          "card-id",
          expect.any(Function)
        );
      });
    });
  });

  describe("cleanUp", function () {
    it("resolves after cleaning up", function () {
      return cleanUp().then(() => {
        expect(window.Scryfall.deckbuilder.cleanUp).toBeCalledTimes(1);
      });
    });
  });

  describe("pushNotification", function () {
    it("sends a push notification", function () {
      return pushNotification("Title", "message", "color", "category").then(
        function () {
          expect(window.Scryfall.pushNotification).toBeCalledTimes(1);
          expect(window.Scryfall.pushNotification).toBeCalledWith(
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
