import type { Card } from "Js/types/deck";

type CardSorter = (first: Card, second: Card) => number;

const TYPE_PREFERENCE = [
  "creature",
  "land",
  "artifact",
  "enchantment",
  "planeswalker",
  "instant",
  "sorcery",
];

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
  return function (first: Card, second: Card): number {
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

function getPrimaryType(typeLine: string): string {
  typeLine = typeLine.toLowerCase().split(" - ")[0];

  return (
    TYPE_PREFERENCE.find((cardType) => {
      return typeLine.indexOf(cardType) > -1;
    }) || typeLine
  );
}

export function sortByPrimaryCardType(): CardSorter {
  return function (first: Card, second: Card): number {
    if (!first.card_digest) {
      return 1;
    }

    if (!second.card_digest) {
      return -1;
    }

    const firstTypeLine = getPrimaryType(first.card_digest.type_line);
    const secondTypeLine = getPrimaryType(second.card_digest.type_line);
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
