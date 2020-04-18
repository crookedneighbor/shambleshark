declare module "scryfall-client" {
  type ScryfallAPICardResponse = {
    color_identity: string[];
    [propName: string]: any;
  };

  type postOptions = {
    identifiers?: any[];
  };

  class CardQueryResult extends Array<ScryfallAPICardResponse> {
    has_more: boolean;
    total_cards: number;
    next: () => Promise<CardQueryResult>;
  }

  class api {
    post: (uri: string, options: postOptions) => void;
    get: (uri: string, options: { query: string }) => Promise<CardQueryResult>;
  }

  export = api;
}
