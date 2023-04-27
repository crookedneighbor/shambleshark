import Framebus from "framebus";
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
describe("Scryfall Globals", () => {
  let ScryfallAPISpy: ScryfallAPIGlobal;
  let ScryfallSpy: ScryfallGlobal;
  let fakeDeck: Deck;

  beforeEach(() => {
    jest.spyOn(Framebus.prototype, "emit").mockImplementation();
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

  describe("addHooksToCardManagementEvents", () => {
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

        expect(Framebus.prototype.emit).toBeCalledTimes(1);
        expect(Framebus.prototype.emit).toBeCalledWith(
          `CALLED_${s.toUpperCase()}`,
          {
            deckId: "foo",
            payload: "bar",
          }
        );
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

      expect(Framebus.prototype.emit).toBeCalledWith("DECK_ENTRIES_UPDATED", {
        entries,
      });
    });

    it("emits event when totalCount is called and count has changed", () => {
      const spy = jest.mocked(window.Scryfall.deckbuilder.totalCount);
      spy.mockReturnValue(10);

      addHooksToCardManagementEvents();

      expect(Framebus.prototype.emit).not.toBeCalledWith(
        "DECK_TOTAL_COUNT_UPDATED",
        expect.anything()
      );

      spy.mockReturnValue(100);

      window.Scryfall.deckbuilder.totalCount();

      expect(Framebus.prototype.emit).toBeCalledWith(
        "DECK_TOTAL_COUNT_UPDATED",
        {
          totalCount: 100,
        }
      );
    });

    it("emits event when totalCount is called and count has changed", () => {
      const spy = jest.mocked(window.Scryfall.deckbuilder.totalCount);
      spy.mockReturnValue(10);

      addHooksToCardManagementEvents();

      window.Scryfall.deckbuilder.totalCount();

      expect(Framebus.prototype.emit).not.toBeCalledWith(
        "DECK_TOTAL_COUNT_UPDATED",
        expect.anything()
      );
    });

    it("does not attempt to replace Scryfall.deckbuilder.cleanUp if Scryfall.deckbuilder global is not available", () => {
      // @ts-ignore
      delete ScryfallSpy.deckbuilder;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });

    it("does not attempt to replace ScryfallAPI methods if Scryfall API is not availabel", () => {
      // @ts-ignore
      delete window.ScryfallAPI;

      expect(() => {
        addHooksToCardManagementEvents();
      }).not.toThrow();
    });
  });

  describe("getActiveDeckId", () => {
    it("calls getActiveDeck to get the active deck", () => {
      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id");
      });
    });

    it("waits progressively longer for grant secret", async () => {
      let hasResolved = false;
      jest.useFakeTimers();
      // @ts-ignore
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

    it("skips api call if the deck id is available in the url", () => {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
      });
    });

    it("skips api call if the deck id is available on the window", () => {
      ScryfallSpy.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-window");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
      });
    });

    it("prefers deck id from url over window", () => {
      jest.spyOn(url, "getDeckId").mockReturnValue("deck-id-from-url");
      ScryfallSpy.deckbuilder.deckId = "deck-id-from-window";

      return getActiveDeckId().then((id: string) => {
        expect(id).toBe("deck-id-from-url");
        expect(ScryfallAPISpy.decks.active).not.toBeCalled();
      });
    });
  });

  describe("getActiveDeck", () => {
    it("resolves with the active deck", () => {
      return getActiveDeck().then((deck: Deck) => {
        expect(deck.id).toBe("deck-id");
      });
    });
  });

  describe("getDeck", () => {
    it("gets the active deck", () => {
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

  describe("getDeckMetadata", () => {
    it("gets the metadata from active deck", () => {
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

  describe("addCard", () => {
    it("resolves with the card", () => {
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

  describe("updateEntry", () => {
    it("resolves with the card", () => {
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

  describe("removeEntry", () => {
    it("calls destroy API", () => {
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

  describe("cleanUp", () => {
    it("resolves after cleaning up", () => {
      return cleanUp().then(() => {
        expect(ScryfallSpy.deckbuilder.cleanUp).toBeCalledTimes(1);
      });
    });
  });

  describe("pushNotification", () => {
    it("sends a push notification", () => {
      return pushNotification("Title", "message", "color", "category").then(
        () => {
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
