import { api as scryfall } from "./scryfall";
import { Card, Deck, section } from "Js/types/deck";
import { CardQueryResult } from "scryfall-client";

function getCommanders(deck: Deck): Promise<CardQueryResult> {
  const ids = deck.entries
    .commanders!.filter((card: Card) => card.card_digest)
    .map((card) => `oracle_id:"${card.card_digest?.oracle_id}"`)
    .join(" or ");

  return scryfall.get("/cards/search", {
    query: ids,
  });
}

function getIdFromEntry(entry: Card, idType: cardIdType) {
  switch (idType) {
    case "id":
      return entry.raw_text && entry.id;
    case "oracleId":
      return entry.card_digest?.oracle_id;
  }
}

export function isLandCard(card: Card) {
  const frontType = card.card_digest?.type_line?.split("//")[0].trim();

  return Boolean(
    frontType?.includes("Land") && !frontType.includes("Creature")
  );
}

export function hasDedicatedLandSection(deck: Deck) {
  return getSections(deck).includes("lands");
}

export function getCommanderColorIdentity(deck: Deck) {
  return getCommanders(deck)
    .then((cards) => cards.map((card) => card.color_identity))
    .catch(() => [])
    .then((colorIdentities) => {
      let colorIdentity = Array.of(new Set(colorIdentities.flat()));

      return colorIdentity.length > 0 ? colorIdentity : ["C"];
    });
}

export function getSections(deck: Deck): section[] {
  return [...deck.sections.primary, ...deck.sections.secondary];
}

export type cardIdType = "id" | "oracleId";

export interface FlattenEntriesOptions {
  idToGroupBy?: cardIdType;
  ignoredSections?: section[];
}

export function flattenEntries(deck: Deck, options?: FlattenEntriesOptions) {
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

export function hasLegalCommanders(commanders: string[]) {
  if (commanders.length === 0) {
    return Promise.resolve(false);
  }

  return Promise.all(
    commanders.map((cardName) =>
      scryfall.get("/cards/search", {
        query: `!"${cardName}" is:commander`,
      })
    )
  )
    .then(() => true)
    .catch(() => false);
}

export function isCommanderLike(deck: Deck) {
  return getSections(deck).includes("commanders");
}

export function isSingletonTypeDeck(deck: Deck) {
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
