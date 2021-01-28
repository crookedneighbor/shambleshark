import Framebus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import { Deck } from "Js/types/deck";
import api = require("scryfall-client");

const CACHE_TIMEOUT_FOR_DECK_REQUESTS = 2000; // 2 seconds

let getDeckPromise: Promise<Deck> | null;

export type Identifier =
  | { id: string }
  | { name: string }
  | { set: string; collector_number: string };

const bus = new Framebus();

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

  getDeckPromise = bus.emitAsPromise<Deck>(events.REQUEST_DECK);

  setTimeout(() => {
    getDeckPromise = null;
  }, CACHE_TIMEOUT_FOR_DECK_REQUESTS);

  return getDeckPromise;
}
