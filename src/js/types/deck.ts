export type DeckSections =
  | "commanders"
  | "lands"
  | "mainboard"
  | "maybeboard"
  | "nonlands"
  | "sideboard";

export type DeckSectionKinds = "primary" | "secondary";

export interface Card {
  id: string;
  section?: DeckSections;
  raw_text?: string;
  count?: number;
  card_digest?: {
    name?: string;
    type_line?: string;
    oracle_id?: string;
    image?: string;
  };
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
