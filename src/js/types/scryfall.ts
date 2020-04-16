// TODO: should be the responsibility of scryfall-client?
export type ScryfallAPICardResponse = {
  color_identity: string[];
  [propName: string]: any;
};

export type ScryfallAPICardListResponse = Promise<ScryfallAPICardResponse[]>;
