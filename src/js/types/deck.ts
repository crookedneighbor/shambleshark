type sections =
  | "commanders"
  | "lands"
  | "mainboard"
  | "maybeboard"
  | "nonlands"
  | "sideboard";

export interface Card {
  id: string;
  section: sections;
  card_digest?: {
    type_line: string;
  };
  [propName: string]: any;
}

export interface Deck {
  id: string;
  sections: {
    primary: sections[];
    secondary: sections[];
  };
  entries: {
    [section in sections]?: Card[];
  };
}
