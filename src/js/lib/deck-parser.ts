import { search } from "./scryfall";
import { Card, Deck, DeckSections } from "Js/types/deck";

type IdTypes = "id" | "oracleId";

type FlattenEntryOptions = {
  idToGroupBy?: IdTypes;
  ignoredSections?: {
    [section in DeckSections]?: boolean;
  };
};

function getCommandersWithSearch(deck: Deck) {
  const commanders = getCommanders(deck);
  const ids = commanders
    .map((card) => `oracle_id:"${card.card_digest?.oracle_id}"`)
    .join(" or ");

  return search(ids);
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

export function getCommanders(deck: Deck): Card[] {
  const commanders = deck.entries.commanders || [];

  return commanders.filter((card: Card) => card.card_digest);
}

// TODO should be more accuate about the string array the promise resolves
export function getCommanderColorIdentity(deck: Deck): Promise<string[]> {
  return getCommandersWithSearch(deck)
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
  const entries: Record<string, Card> = {};

  getSections(deck)
    .filter((section) => !(section in (options?.ignoredSections || [])))
    .map((section) => deck.entries[section])
    .flat()
    .forEach((entry) => {
      // TODO why do I need to do this?
      const card = entry as Card;
      const id = getIdFromEntry(card, options?.idToGroupBy || "id");

      if (id) {
        if (entries[id]) {
          entries[id].count += card.count;
        } else {
          entries[id] = card;
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
    commanders.map((cardName) => search(`!"${cardName}" is:commander`))
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
  getCommanders,
  isLandCard,
  getSections,
  flattenEntries,
  hasDedicatedLandSection,
  hasLegalCommanders,
  isCommanderLike,
  isSingletonTypeDeck,
};
