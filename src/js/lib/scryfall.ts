import bus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import { Deck } from "Js/types/deck";
import api = require("scryfall-client");

const CACHE_TIMEOUT_FOR_DECK_REQUESTS = 2000; // 2 seconds

let getDeckPromise: Promise<Deck> | null;

export type Identifier =
  | { id: string }
  | { name: string }
  | { set: string; collector_number: string };

// TODO move this logic of batching to scryfall-client
// TODO get types from Scryfall Client
export async function getCollection(ids: Identifier[]) {
  const idBatches = ids.reduce((array: Identifier[][], entry, i) => {
    if (i % 75 !== 0) {
      return array;
    }

    return array.concat([ids.slice(i, i + 75)]);
  }, []);

  const collectionResults = await Promise.all(
    idBatches.map((identifiers) => api.getCollection(identifiers))
  );

  return collectionResults.flat();
}

export const getCardBySetCodeAndCollectorNumber =
  api.getCardBySetCodeAndCollectorNumber;

export const search = api.search;

export function getDeck(): Promise<Deck> {
  if (getDeckPromise) {
    return getDeckPromise;
  }

  getDeckPromise = new Promise((resolve) => {
    bus.emit(events.REQUEST_DECK, (deck) => {
      resolve(deck as Deck);
    });
  });

  setTimeout(() => {
    getDeckPromise = null;
  }, CACHE_TIMEOUT_FOR_DECK_REQUESTS);

  return getDeckPromise;
}
