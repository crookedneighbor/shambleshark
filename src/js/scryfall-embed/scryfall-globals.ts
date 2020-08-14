import bus from "framebus";
import wait from "Lib/wait";
import url from "Lib/url";
import { BUS_EVENTS as events } from "Constants";
import type { Deck, Card } from "Js/types/deck";

type ScryfallFunction = (...args: unknown[]) => void;

export type ScryfallGlobal = {
  deckbuilder: {
    deckId: string;
    cleanUp: ScryfallFunction;
    entries: Record<string, Card[]>;
  };
  pushNotification: ScryfallFunction;
};

export type ScryfallAPIGlobal = {
  grantSecret: string;
  decks: Record<string, ScryfallFunction>;
};

declare global {
  interface Window {
    Scryfall: ScryfallGlobal;
    ScryfallAPI: ScryfallAPIGlobal;
  }
}

type DeckMetadata = {
  id: Deck["id"];
  sections: Deck["sections"];
};

let getActiveDeckPromise: Promise<Deck> | null;
let getDeckMetadataPromise: Promise<DeckMetadata> | null;

export function addHooksToCardManagementEvents(): void {
  if (window.ScryfallAPI) {
    [
      "addCard",
      "updateEntry",
      "replaceEntry",
      "createEntry",
      "destroyEntry",
    ].forEach((method) => {
      const original = window.ScryfallAPI.decks[method];
      window.ScryfallAPI.decks[method] = function (...args: unknown[]) {
        original(...args);
        bus.emit(events[`CALLED_${method.toUpperCase()}`], {
          deckId: args[0],
          payload: args[1],
        });
      };
    });
  }

  if (window.Scryfall && window.Scryfall.deckbuilder) {
    Object.defineProperties(window.Scryfall.deckbuilder, {
      entries: {
        get() {
          return this._entries;
        },
        set(entries) {
          this._entries = entries;

          bus.emit(events.DECK_ENTRIES_UPDATED, { entries });
        },
      },
    });
    const originalCleanup = window.Scryfall.deckbuilder.cleanUp;
    window.Scryfall.deckbuilder.cleanUp = function (...args: unknown[]) {
      originalCleanup(...args);
      bus.emit(events.CALLED_CLEANUP);
    };
  }
}

export function getActiveDeck(): Promise<Deck> {
  if (!getActiveDeckPromise) {
    getActiveDeckPromise = new Promise((resolve) => {
      window.ScryfallAPI.decks.active((deck: Deck) => {
        resolve(deck);
      });
    });
  }

  return getActiveDeckPromise;
}

export function getActiveDeckId(waitTime = 300): Promise<string> {
  if (!window.ScryfallAPI.grantSecret) {
    return wait(waitTime).then(() => {
      // progressively wait longer and longer to try looking up the grant secret
      return getActiveDeckId(waitTime * 2);
    });
  }

  const deckIDFromUrl = url.getDeckId();

  if (deckIDFromUrl) {
    return Promise.resolve(deckIDFromUrl);
  }

  if (
    window.Scryfall &&
    window.Scryfall.deckbuilder &&
    window.Scryfall.deckbuilder.deckId
  ) {
    return Promise.resolve(window.Scryfall.deckbuilder.deckId);
  }

  return getActiveDeck().then(({ id }) => id);
}

export function getDeck(): Promise<Deck> {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      window.ScryfallAPI.decks.get(id, (deck: Deck) => {
        resolve(deck);
      });
    });
  });
}

export function getDeckMetadata(): Promise<DeckMetadata> {
  if (!getDeckMetadataPromise) {
    getDeckMetadataPromise = getDeck().then((deck) => {
      return {
        id: deck.id,
        sections: deck.sections,
      };
    });
  }

  return getDeckMetadataPromise;
}

export function reset(): void {
  getActiveDeckPromise = null;
  getDeckMetadataPromise = null;
}

export function addCard(cardId: string): Promise<Card> {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      window.ScryfallAPI.decks.addCard(id, cardId, (card: Card) => {
        resolve(card);
      });
    });
  });
}

export function updateEntry(cardToUpdate: Card): Promise<Card> {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      window.ScryfallAPI.decks.updateEntry(id, cardToUpdate, (card: Card) => {
        resolve(card);
      });
    });
  });
}

export function removeEntry(cardId: string): Promise<void> {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      window.ScryfallAPI.decks.destroyEntry(id, cardId, () => {
        resolve();
      });
    });
  });
}

export function cleanUp(): Promise<void> {
  window.Scryfall.deckbuilder.cleanUp();

  return Promise.resolve();
}

export function pushNotification(
  title: string,
  message: string,
  color: string,
  type: string
): Promise<void> {
  window.Scryfall.pushNotification(title, message, color, type);

  return Promise.resolve();
}

export default {
  addCard,
  addHooksToCardManagementEvents,
  cleanUp,
  getDeck,
  getDeckMetadata,
  pushNotification,
  removeEntry,
  updateEntry,
};
