import type AddCardElement from "Ui/add-card-element";

export interface EDHRecResponse {
  commanders: [];
  outRecs: EDHRecSuggestion[];
  inRecs: EDHRecSuggestion[];
}

export type EDHRecResponseHandler = (
  args: [EDHRecError | null, EDHRecResponse]
) => void;

export interface EDHRecSuggestion {
  primary_types: string[];
  names: string[];
  scryfall_uri: string;
  images: string[];
  price: number;
  salt: number;
  score: number;
}

export type EDHRecError = {
  errors?: string[];
  toString: () => string;
};

export interface Suggestion {
  name: string;
  type: string;
  set: string;
  collectorNumber: string;
  img: string;
  price: number;
  salt: number;
  score: number;
  cardElement?: AddCardElement;
}

export interface Suggestions {
  [name: string]: Suggestion;
}

export interface EDHRecSection {
  name: string;
  element: HTMLDivElement;
  cards: Suggestion[];
}
