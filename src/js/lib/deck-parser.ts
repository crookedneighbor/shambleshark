import { api as scryfall } from "./scryfall";
import { Card, Deck, DeckSections } from "Js/types/deck";
import { CardQueryResult } from "Js/types/scryfall-api-responses";

type IdTypes = "id" | "oracleId";

type FlattenEntryOptions = {
  idToGroupBy?: IdTypes;
  ignoredSections?: {
    [section in DeckSections]?: boolean;
  };
};

function getCommanders(deck: Deck): Promise<CardQueryResult> {
  const ids = deck.entries
    .commanders!.filter((card: Card) => card.card_digest)
    .map((card) => `oracle_id:"${card.card_digest?.oracle_id}"`)
    .join(" or ");

  return scryfall.get("/cards/search", {
    q: ids,
  });
}

function getIdFromEntry(entry: Card, idType: IdTypes): string {
  switch (idType) {
    case "id":
      return (entry.raw_text && entry.id) || "";
    case "oracleId":
      return entry.card_digest?.oracle_id || "";
  }
}

export function isLandCard(card: Card): boolean {
  const frontType = card.card_digest?.type_line?.split("//")[0].trim();

  return Boolean(
    frontType?.includes("Land") && !frontType.includes("Creature")
  );
}

export function getSections(deck: Deck): DeckSections[] {
  // TODO is it worth hardcoding the keys for the sections
  // it's possible that Scryfall could add or change these
  // values in the future
  return [...deck.sections.primary, ...deck.sections.secondary];
}

export function hasDedicatedLandSection(deck: Deck): boolean {
  return getSections(deck).includes("lands");
}

// TODO should be more accuate about the string array the promise resolves
export function getCommanderColorIdentity(deck: Deck) {
  return getCommanders(deck)
    .then((cards) => cards.map((card) => card.color_identity))
    .catch(() => [])
    .then((colorIdentities) => {
      const colorIdentity = Array.from(new Set(colorIdentities.flat()));

      return colorIdentity.length > 0 ? colorIdentity : ["C"];
    });
}

export function flattenEntries(
  deck: Deck,
  options: FlattenEntryOptions = {}
): Card[] {
  const entries: { [id: string]: Card } = {};

  getSections(deck)
    .filter((section) => !(section in (options?.ignoredSections || [])))
    .map((section) => deck.entries[section])
    .flat()
    .forEach((entry) => {
      const id = getIdFromEntry(entry, options?.idToGroupBy || "id");

      if (id) {
        if (entries[id]) {
          entries[id].count += entry.count;
        } else {
          entries[id] = entry;
        }
      }
    });

  return Object.values(entries);
}

export function hasLegalCommanders(commanders: string[]): Promise<boolean> {
  if (commanders.length === 0) {
    return Promise.resolve(false);
  }

  return Promise.all(
    commanders.map((cardName) =>
      scryfall.get("/cards/search", {
        q: `!"${cardName}" is:commander`,
      })
    )
  )
    .then(() => {
      // if all promises resolve, all were commanders
      return true;
    })
    .catch(() => {
      // if even one promise 404s, then not all were commanders
      return false;
    });
}

export function isCommanderLike(deck: Deck): boolean {
  return getSections(deck).includes("commanders");
}

export function isSingletonTypeDeck(deck: Deck): boolean {
  return getSections(deck).includes("nonlands") || isCommanderLike(deck);
}

export default {
  getCommanderColorIdentity,
  isLandCard,
  getSections,
  flattenEntries,
  hasDedicatedLandSection,
  hasLegalCommanders,
  isCommanderLike,
  isSingletonTypeDeck,
};
