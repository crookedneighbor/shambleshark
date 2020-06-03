export type DeckSections =
  | "commanders"
  | "lands"
  | "mainboard"
  | "maybeboard"
  | "nonlands"
  | "sideboard";

export type DeckSectionKinds = "primary" | "secondary";

export interface CardDigest {
  collector_number: string;
  id: string;
  image: string;
  mana_cost: string;
  name: string;
  object: "card_digest";
  oracle_id: string;
  scryfall_uri: string;
  set: string;
  sf: {
    cost_render_mode: string;
    rendered_cost: string;
    collector_number_disambiguates: boolean;
    covered: boolean;
  };
  type_line: string;
}

export interface Card {
  id: string;
  section: DeckSections;
  raw_text: string;
  count: number;
  card_digest?: CardDigest;
}

export interface Deck {
  id: string;
  sections: {
    [deckType in DeckSectionKinds]: DeckSections[];
  };
  entries: {
    [section in DeckSections]?: Card[];
  };
}
