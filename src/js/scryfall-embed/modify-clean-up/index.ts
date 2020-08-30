import bus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import scryfall from "../scryfall-globals";
import { hasDedicatedLandSection, isLandCard } from "Lib/deck-parser";
import { sortByName, sortByPrimaryCardType } from "./sorting";
import {
  addDeckTotalUpdateListener,
  insertHeadings,
  Headings,
} from "./add-section-heading";
import type { Card, Deck } from "Js/types/deck";
type SortEntryOptions = "card-type" | "name" | "none";
type ModifyCleanupOptions = {
  cleanUpLandsInSingleton?: boolean;
  sortEntriesPrimary?: SortEntryOptions;
  insertSortingHeadings?: boolean;
};

const sorters = {
  "card-type": sortByPrimaryCardType,
  name: sortByName,
};

function correctLandNonLandColumns(deck: Deck): Promise<Card[]> {
  if (!hasDedicatedLandSection(deck)) {
    return Promise.resolve([]);
  }
  const landsInNonLands = (deck.entries.nonlands || [])
    .filter((c) => c.card_digest)
    .filter((c) => isLandCard(c));
  const nonLandsInLands = (deck.entries.lands || [])
    .filter((c) => c.card_digest)
    .filter((c) => !isLandCard(c));

  landsInNonLands.forEach((c) => {
    c.section = "lands";
  });
  nonLandsInLands.forEach((c) => {
    c.section = "nonlands";
  });
  const cardPromises = landsInNonLands
    .concat(nonLandsInLands)
    .map((c) => scryfall.updateEntry(c));

  return Promise.all(cardPromises);
}

export default function modifyCleanUp(config: ModifyCleanupOptions = {}): void {
  const oldCleanup = window.Scryfall.deckbuilder.cleanUp;
  const sortChoice = config.sortEntriesPrimary;

  if (sortChoice && sortChoice !== "none") {
    const sorter = sorters[sortChoice]();
    const headings: Headings = {};

    if (config.insertSortingHeadings) {
      addDeckTotalUpdateListener(sortChoice);
    }

    bus.on(events.DECK_ENTRIES_UPDATED, () => {
      window.Scryfall.deckbuilder.flatSections.forEach((section) => {
        window.Scryfall.deckbuilder.entries[section].sort(sorter);
      });

      window.Scryfall.deckbuilder.$forceUpdate();

      if (config.insertSortingHeadings) {
        insertHeadings(sortChoice, headings);
      }
    });
  }

  window.Scryfall.deckbuilder.cleanUp = (...args) => {
    return scryfall
      .getDeck()
      .then((deck) => {
        if (config.cleanUpLandsInSingleton) {
          return correctLandNonLandColumns(deck);
        }
      })
      .then(() => {
        return oldCleanup(...args);
      });
  };
}
