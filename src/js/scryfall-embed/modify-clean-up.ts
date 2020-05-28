import scryfall from "./scryfall-globals";
import { hasDedicatedLandSection, isLandCard } from "Lib/deck-parser";

import type { Deck } from "Js/types/deck";

function correctLandNonLandColumns(deck: Deck) {
  if (!hasDedicatedLandSection(deck)) {
    return Promise.resolve([]);
  }

  const landsInNonLands = deck.entries
    .nonlands!.filter((c) => c.card_digest)
    .filter((c) => isLandCard(c));
  const nonLandsInLands = deck.entries
    .lands!.filter((c) => c.card_digest)
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

type ModifyCleanupOptions = {
  cleanUpLandsInSingleton?: boolean;
};

export default function modifyCleanUp(config: ModifyCleanupOptions = {}) {
  const oldCleanup = window.Scryfall.deckbuilder.cleanUp;

  window.Scryfall.deckbuilder.cleanUp = () => {
    return scryfall
      .getDeck()
      .then((deck) => {
        if (config.cleanUpLandsInSingleton) {
          return correctLandNonLandColumns(deck);
        }
      })
      .then(() => {
        return oldCleanup();
      });
  };
}
