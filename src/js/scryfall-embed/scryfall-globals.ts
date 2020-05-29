import bus from "framebus";
import wait from "Lib/wait";
import url from "Lib/url";
import { BUS_EVENTS as events } from "Constants";
import type { Deck, Card } from "Js/types/deck";

declare global {
  interface Window {
    Scryfall: {
      deckbuilder: {
        deckId: string;
        cleanUp: Function;
      };
      pushNotification: Function;
    };
    ScryfallAPI: {
      grantSecret: string;
      decks: {
        [prop: string]: Function;
      };
    };
  }
}

type DeckMetadata = {
  id: Deck["id"];
  sections: Deck["sections"];
};

let getActiveDeckPromise: Promise<Deck>;
let getDeckMetadataPromise: Promise<DeckMetadata>;

export function addHooksToCardManagementEvents() {
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
    const originalCleanup = window.Scryfall.deckbuilder.cleanUp;
    window.Scryfall.deckbuilder.cleanUp = function (...args: unknown[]) {
      originalCleanup(...args);
      bus.emit(events.CALLED_CLEANUP);
    };
  }
}

export function getActiveDeck() {
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

export function reset() {
  // @ts-ignore
  getActiveDeckPromise = undefined;
  // @ts-ignore
  getDeckMetadataPromise = undefined;
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
      window.ScryfallAPI.decks.destroyEntry(id, cardId, (card: Card) => {
        resolve();
      });
    });
  });
}

export function cleanUp() {
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