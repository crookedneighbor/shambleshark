// TODO need to duplicate these types to make the d.ts file for scryfall-client work
// remove this when scryfall-client is converted to TypeScript itself
export type ScryfallAPICardResponse = {
  color_identity: string[];
  [propName: string]: any;
};

export class CardQueryResult extends Array<ScryfallAPICardResponse> {
  has_more: boolean;
  total_cards: number;
  next: () => Promise<CardQueryResult>;
}
