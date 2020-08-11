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

export async function getCollection(
  ids: Identifier[]
): ReturnType<typeof api.getCollection> {
  return api.getCollection(ids);
}

export const getCardBySetCodeAndCollectorNumber =
  api.getCardBySetCodeAndCollectorNumber;

export const search = api.search;

export function getDeck(): Promise<Deck> {
  if (getDeckPromise) {
    return getDeckPromise;
  }

  getDeckPromise = new Promise((resolve) => {
    bus.emit(events.REQUEST_DECK, (deck: Deck) => {
      resolve(deck);
    });
  });

  setTimeout(() => {
    getDeckPromise = null;
  }, CACHE_TIMEOUT_FOR_DECK_REQUESTS);

  return getDeckPromise;
}
