export type section =
  | "commanders"
  | "lands"
  | "mainboard"
  | "maybeboard"
  | "nonlands"
  | "sideboard";

export type color = "W" | "U" | "B" | "R" | "G";

export interface Card {
  id: string;
  section: section;
  raw_text: string;
  count?: number;
  card_digest?: {
    name?: string;
    type_line?: string;
    oracle_id?: string;
  };
  color_identity: color[] | ["C"];
  [propName: string]: any;
}

export interface Deck {
  id: string;
  sections: {
    primary: section[];
    secondary: section[];
  };
  entries: {
    [key in section]?: Card[];
  };
}
