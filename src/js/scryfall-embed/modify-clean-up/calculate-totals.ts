import { getPrimaryType } from "Lib/card-parser";
import type { Card } from "Js/types/deck";

type Total = Record<string, number>;

function getNameSection(name: string): string {
  const firstChar = name.charAt(0).toLowerCase();

  switch (firstChar) {
    case "a":
    case "b":
    case "c":
    case "d":
      return "abcd";
    case "e":
    case "f":
    case "g":
      return "efg";
    case "h":
    case "i":
    case "j":
    case "k":
      return "hijk";
    case "l":
    case "m":
    case "n":
    case "o":
    case "p":
      return "lmnop";
    case "q":
    case "r":
    case "s":
      return "qrs";
    case "t":
    case "u":
    case "v":
      return "tuv";
    case "w":
    case "x":
      return "wx";
    case "y":
    case "z":
      return "yz";
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "0":
      return "1234567890";
    default:
      return "symbols";
  }
}

export function calculateTotalsByName(entries: Card[]): Total {
  const totals: Total = {};

  return entries.reduce((accum, entry) => {
    if (!entry.card_digest) {
      return accum;
    }
    const nameGroup = getNameSection(entry.card_digest.name);

    if (!accum[nameGroup]) {
      accum[nameGroup] = 0;
    }

    accum[nameGroup]++;

    return accum;
  }, totals);
}

export function calculateTotalsByCardType(entries: Card[]): Total {
  const totals: Total = {};

  return entries.reduce((accum, entry) => {
    if (!entry.card_digest) {
      return accum;
    }

    const primaryType = getPrimaryType(entry);

    if (!accum[primaryType]) {
      accum[primaryType] = 0;
    }

    accum[primaryType]++;

    return accum;
  }, totals);
}
