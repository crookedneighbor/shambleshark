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
  section: DeckSections;
  raw_text: string;
  count?: number;
  card_digest?: {
    oracle_id: string;
    type_line: string;
  };
  [propName: string]: any;
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
