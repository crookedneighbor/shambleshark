declare module "scryfall-client" {
  import { Card } from "Js/types/deck";

  export type postOptions = {
    identifiers?: string[];
  };

  export class CardQueryResult extends Array<Card> {
    has_more: boolean;
    total_cards: number;
    next: () => Promise<CardQueryResult>;
  }

  class api {
    post: (uri: string, options: postOptions) => void;
    get: (uri: string, options: { query: string }) => Promise<CardQueryResult>;
  }

  export default api;
}
