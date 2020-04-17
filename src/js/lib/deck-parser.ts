import { api as scryfall } from "./scryfall";
import { Deck, Card, DeckSections, DeckSectionKinds } from "../types/deck";
import { ScryfallAPICardListResponse } from "../types/scryfall";

type IdTypes = "id" | "oracleId";

type FlattenEntryOptions = {
  idToGroupBy?: IdTypes;
  ignoredSections?: {
    [section in DeckSections]?: boolean;
  };
};

function getCommanders(deck: Deck): ScryfallAPICardListResponse {
  const ids = deck.entries
    .commanders!.filter((card) => card.card_digest)
    .map((card: Card) => `oracle_id:"${card.card_digest!.oracle_id}"`)
    .join(" or ");

  return scryfall.get("/cards/search", {
    q: ids,
  });
}

function getIdFromEntry(entry: Card, idType: IdTypes): string {
  if (idType === "id") {
    return entry.raw_text && entry.id;
  } else if (idType === "oracleId" && entry.card_digest) {
    return entry.card_digest.oracle_id;
  }

  return "";
}

export function isLandCard(card: Card): boolean {
  const frontType = card.card_digest!.type_line.split("//")[0].trim();

  return Boolean(frontType.includes("Land") && !frontType.includes("Creature"));
}

export function getSections(deck: Deck): DeckSections[] {
  const deckSections: DeckSections[] = [];

  Object.keys(deck.sections).reduce((sections, type) => {
    deck.sections[type as DeckSectionKinds].forEach((section) =>
      sections.push(section)
    );
    return sections;
  }, deckSections);

  return deckSections;
}

export function hasDedicatedLandSection(deck: Deck): boolean {
  return getSections(deck).includes("lands");
}

// TODO
export function getCommanderColorIdentity(deck: Deck): Promise<string[]> {
  return getCommanders(deck)
    .then((cards) => {
      return cards.map((c) => c.color_identity);
    })
    .catch(() => [])
    .then((colorIdentities) => {
      const colors = new Set(colorIdentities.flat());

      if (colors.size === 0) {
        colors.add("C");
      }

      return Array.from(colors);
    });
}

export function flattenEntries(
  deck: Deck,
  options: FlattenEntryOptions = {}
): Card[] {
  const sections = getSections(deck);
  const entries: Card[] = [];
  const ids: Record<string, Card> = {};
  const idToGroupBy = options.idToGroupBy || "oracleId";
  const ignoredSections = options.ignoredSections || {};

  sections.forEach((section) => {
    if (section in ignoredSections) {
      return;
    }
    deck.entries[section]!.forEach((entry) => {
      const id = getIdFromEntry(entry, idToGroupBy);

      if (id) {
        if (id in ids) {
          const original = ids[id];
          original.count = Number(original.count) + Number(entry.count);
        } else {
          ids[id] = entry;
          entries.push(entry);
        }
      }
    });
  });

  return entries;
}

export function hasLegalCommanders(commanders: string[]): Promise<boolean> {
  if (commanders.length === 0) {
    // no commanders in commander section
    return Promise.resolve(false);
  }

  return Promise.all(
    commanders.map((cardName) => {
      return scryfall.get("/cards/search", {
        q: `!"${cardName}" is:commander`,
      });
    })
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
