import type { Card } from "Js/types/deck";
import { getPrimaryType } from "Lib/card-parser";

type CardSorter = (first: Card, second: Card) => number;

const TYPE_ORDER = [
  "creature",
  "planeswalker",
  "artifact",
  "enchantment",
  "instant",
  "sorcery",
  "land",
];

export function sortByName(): CardSorter {
  return (first: Card, second: Card): number => {
    if (!first.card_digest) {
      return 1;
    }

    if (!second.card_digest) {
      return -1;
    }

    if (first.card_digest.name > second.card_digest.name) {
      return 1;
    }

    if (first.card_digest.name < second.card_digest.name) {
      return -1;
    }

    return 0;
  };
}

export function sortByPrimaryCardType(): CardSorter {
  return (first: Card, second: Card): number => {
    if (!first.card_digest) {
      return 1;
    }

    if (!second.card_digest) {
      return -1;
    }

    const firstTypeLine = getPrimaryType(first);
    const secondTypeLine = getPrimaryType(second);
    const firstPref = TYPE_ORDER.indexOf(firstTypeLine);
    const secondPref = TYPE_ORDER.indexOf(secondTypeLine);

    if (firstPref > secondPref) {
      return 1;
    }

    if (firstPref < secondPref) {
      return -1;
    }

    return 0;
  };
}
