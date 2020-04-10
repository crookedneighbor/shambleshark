import bus from "framebus";
import ScryfallClient from "scryfall-client";
import { BUS_EVENTS as events } from "Constants";

const CACHE_TIMEOUT_FOR_DECK_REQUESTS = 2000; // 2 seconds

let getDeckPromise;

export const api = new ScryfallClient();

export async function getCollection(ids) {
  const idsInBatches = ids.reduce((array, entry, i) => {
    if (i % 75 !== 0) {
      return array;
    }

    return array.concat([ids.slice(i, i + 75)]);
  }, []);

  const collectionResults = await Promise.all(
    idsInBatches.map((idBatch) =>
      api.post("/cards/collection", {
        identifiers: idBatch,
      })
    )
  );

  return collectionResults.flat();
}

export function getDeck() {
  if (getDeckPromise) {
    return getDeckPromise;
  }

  getDeckPromise = new Promise((resolve) => {
    bus.emit(events.REQUEST_DECK, resolve);
  });

  setTimeout(() => {
    getDeckPromise = null;
  }, CACHE_TIMEOUT_FOR_DECK_REQUESTS);

  return getDeckPromise;
}

export default {
  api,
  getCollection,
  getDeck,
};
