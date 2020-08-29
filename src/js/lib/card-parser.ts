import { Card } from "Js/types/deck";

const TYPE_PREFERENCE_FOR_PRIMARY_TYPE = [
  "creature",
  "land",
  "artifact",
  "enchantment",
  "planeswalker",
  "instant",
  "sorcery",
];

export function getPrimaryType(card: Card): string {
  if (!card.card_digest) {
    return "";
  }
  const typeLine = card.card_digest.type_line.toLowerCase().split(" - ")[0];

  return (
    TYPE_PREFERENCE_FOR_PRIMARY_TYPE.find((cardType) => {
      return typeLine.indexOf(cardType) > -1;
    }) || typeLine
  );
}
