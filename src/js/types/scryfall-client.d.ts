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
    // TODO thesre are not really accurate
    // probably should just fix this in the actual client
    post: (uri: string, options: postOptions) => Promise<any>;
    get: (uri: string, options: { q: string }) => Promise<CardQueryResult>;
  }

  export = api;
}
