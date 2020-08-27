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
  ScryfallGlobal,
  ScryfallAPIGlobal,
} from "Js/scryfall-embed/scryfall-globals";

import { Deck } from "Js/types/deck";
import {
  generateScryfallGlobal,
  generateScryfallAPIGlobal,
} from "../mocks/scryfall-global";
import { makeFakeDeck, makeFakeCard } from "Helpers/fake";

describe("Scryfall Globals", function () {
  let ScryfallAPISpy: ScryfallAPIGlobal;
  let ScryfallSpy: ScryfallGlobal;
  let fakeDeck: Deck;

  beforeEach(function () {
    jest.spyOn(bus, "emit").mockImplementation();
    fakeDeck = makeFakeDeck({
      id: "deck-id",
      primarySections: ["mainboard"],
      secondarySections: ["sideboard", "maybeboard"],
      entries: {
        mainboard: [],
        sideboard: [],
        maybeboard: [],
      },
    });
    ScryfallAPISpy = window.ScryfallAPI = generateScryfallAPIGlobal();
    (ScryfallAPISpy.decks.active as jest.Mock).mockImplementation(
      (cb: (deck: Deck) => void) => {
        cb(fakeDeck);
      }
    );
    (ScryfallAPISpy.decks.get as jest.Mock).mockImplementation(
      (id: string, cb: (deck: Deck) => void) => {
        cb(fakeDeck);
      }
    );

    ScryfallSpy = window.Scryfall = generateScryfallGlobal();
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
        const original = ScryfallAPISpy.decks[s];

        addHooksToCardManagementEvents();

        expect(original).not.toBe(ScryfallAPISpy.decks[s]);
        ScryfallAPISpy.decks[s]("foo", "bar");

        expect(bus.emit).toBeCalledTimes(1);
        expect(bus.emit).toBeCalledWith(`CALLED_${s.toUpperCase()}`, {
          deckId: "foo",
          payload: "bar",
        });
        expect(original).toBeCalledWith("foo", "bar");
      }
    );

    it("emits event when deck entries are updated", () => {
      addHooksToCardManagementEvents();

      const entries = {
        mainboard: [],
        sideboard: [],
        maybeboard: [],
      };

      window.Scryfall.deckbuilder.entries = entries;

      expect(bus.emit).toBeCalledWith("DECK_ENTRIES_UPDATED", { entries });
    });

    it("does not attempt to replace Scryfall.deckbuilder.cleanUp if Scryfall.deckbuilder global is not available", function () {
      delete ScryfallSpy.deckbuilder;

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
      delete ScryfallAPISpy.grantSecret;

      const getActiveDeckIdPromise = getActiveDeckId().then(() => {
        hasResolved = true;
      });

      expect(hasResolved).toBe(false);

      await Promise.resolve().then(() => jest.advanceTimersByTime(300));

      expect(hasResolved).toBe(false);

      ScryfallAPISpy.grantSecret = "secret";

      await Promise.resolve().then(() => jest.advanceTimersByTime(10000));

      await getActiveDeckIdPromise;

      expect(hasResolved).toBe(true);
    });

    it("skips api call if the deck id is available in the url", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
      });
    });

    it("skips api call if the deck id is available on the window", function () {
      ScryfallSpy.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-window");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
      });
    });

    it("prefers deck id from url over window", function () {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");
      ScryfallSpy.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
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
      const deck = makeFakeDeck({ id: "deck-id" });

      (ScryfallAPISpy.decks.get as jest.Mock).mockImplementation((id, cb) => {
        cb(deck);
      });

      return getDeck().then((resolvedDeck: Deck) => {
        expect(ScryfallAPISpy.decks.get).toBeCalledWith(
          "deck-id",
          expect.any(Function)
        );

        expect(deck).toBe(resolvedDeck);
      });
    });
  });

  describe("getDeckMetadata", function () {
    it("gets the metadata from active deck", function () {
      const deck = makeFakeDeck({
        id: "deck-id",
        primarySections: ["mainboard"],
        secondarySections: ["sideboard", "lands"],
      });

      (ScryfallAPISpy.decks.get as jest.Mock).mockImplementation((id, cb) => {
        cb(deck);
      });

      return getDeckMetadata().then((meta) => {
        expect(ScryfallAPISpy.decks.get).toBeCalledWith(
          "deck-id",
          expect.any(Function)
        );

        expect(meta).toEqual({
          id: "deck-id",
          sections: {
            primary: ["mainboard"],
            secondary: ["sideboard", "lands"],
          },
        });
      });
    });
  });

  describe("addCard", function () {
    it("resolves with the card", function () {
      const card = makeFakeCard();

      (ScryfallAPISpy.decks.addCard as jest.Mock).mockImplementation(
        (deckId, cardId, cb) => {
          cb(card);
        }
      );

      return addCard("card-id").then((resolvedCard) => {
        expect(ScryfallAPISpy.decks.addCard).toBeCalledWith(
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
      const cardToUpdate = makeFakeCard({ id: "card-id" });
      const card = makeFakeCard();

      (ScryfallAPISpy.decks.updateEntry as jest.Mock).mockImplementation(
        (deckId, cardToUpdate, cb) => {
          cb(card);
        }
      );

      return updateEntry(cardToUpdate).then((resolvedCard) => {
        expect(ScryfallAPISpy.decks.updateEntry).toBeCalledWith(
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

      (ScryfallAPISpy.decks.destroyEntry as jest.Mock).mockImplementation(
        (deckId, cardId, cb) => {
          cb(data);
        }
      );

      return removeEntry("card-id").then(() => {
        expect(ScryfallAPISpy.decks.destroyEntry).toBeCalledWith(
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
        expect(ScryfallSpy.deckbuilder.cleanUp).toBeCalledTimes(1);
      });
    });
  });

  describe("pushNotification", function () {
    it("sends a push notification", function () {
      return pushNotification("Title", "message", "color", "category").then(
        function () {
          expect(ScryfallSpy.pushNotification).toBeCalledTimes(1);
          expect(ScryfallSpy.pushNotification).toBeCalledWith(
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
