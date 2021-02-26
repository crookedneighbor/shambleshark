import shortid = require("shortid");

import type { Deck, Card, CardDigest, DeckSections } from "Js/types/deck";
import type { EDHRecSuggestion } from "Js/types/edhrec";

type FakeDeckOptions = Partial<Deck> & {
  primarySections?: DeckSections[];
  secondarySections?: DeckSections[];
};
type FakeCardOptions = Partial<Card> & {
  rawText?: Card["raw_text"];
  cardDigest?: Partial<Card["card_digest"]> | boolean;
};
type FakeEDHRecSuggestionOptions = Partial<EDHRecSuggestion>;

export function makeFakeCard(overrides: FakeCardOptions = {}): Card {
  const id = shortid.generate();
  const cardDigest: CardDigest = {
    collector_number: `collector-${id}`,
    id: `id-${id}`,
    image_uris: {
      front: `https://img.scryfall.com/${id}`,
      back: `https://img.scryfall.com/back/${id}`,
    },
    mana_cost: "{0}",
    name: "name",
    object: "card_digest",
    oracle_id: `oracle-id-${id}`,
    scryfall_uri: `https://scryfall.com/${id}`,
    set: "set",
    sf: {
      cost_render_mode: "render",
      rendered_cost: "cost",
      collector_number_disambiguates: false,
      covered: false,
    },
    type_line: "type",
  };

  if (overrides.cardDigest !== false) {
    Object.assign(cardDigest, overrides.cardDigest);
  }

  return {
    id: overrides.id || shortid(),
    raw_text:
      typeof overrides.rawText === "string" ? overrides.rawText : "raw text",
    section: overrides.section || "commanders",
    count: typeof overrides.count === "number" ? overrides.count : 1,
    card_digest: overrides.cardDigest === false ? undefined : cardDigest,
  };
}

export function makeFakeDeck(overrides: FakeDeckOptions = {}): Deck {
  const primary = overrides.primarySections || ["commanders", "nonlands"];
  const secondary = overrides.secondarySections || ["lands", "maybeboard"];
  const allSections = primary.concat(secondary);
  const entries = overrides.entries || {};

  allSections.forEach((section: DeckSections) => {
    if (!entries[section]) {
      entries[section] = [
        makeFakeCard({
          id: `id-${shortid.generate()}`,
          section,
        }),
      ];
    }
  });

  return {
    id: overrides.id || `deck-id-${shortid.generate()}`,
    sections: {
      primary,
      secondary,
    },
    entries,
  };
}

export function makeFakeEDHRecSuggestion(
  options: FakeEDHRecSuggestionOptions = {}
): EDHRecSuggestion {
  return {
    primary_type: "Creature",
    names: ["Fake Name"],
    scryfall_uri: "set/id/fake-id",
    image: "fake-unknown.png",
    price: 19.99,
    salt: 10,
    score: 99,
    ...options,
  };
}
