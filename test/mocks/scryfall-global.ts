import type {
  ScryfallGlobal,
  ScryfallAPIGlobal,
} from "Js/scryfall-embed/scryfall-globals";

export function generateScryfallGlobal(): ScryfallGlobal {
  return {
    deckbuilder: {
      deckId: "deck-id",
      cleanUp: jest.fn(),
      entries: {
        mainboard: [],
        sideboard: [],
        maybeboard: [],
      },
      flatSections: [],
      totalCount: jest.fn().mockReturnValue(0),
      $forceUpdate: jest.fn(),
      $nextTick: jest.fn().mockImplementation((cb) => {
        cb();
      }),
    },
    pushNotification: jest.fn(),
  };
}

export function generateScryfallAPIGlobal(): ScryfallAPIGlobal {
  return {
    grantSecret: "secret",
    decks: {
      active: jest.fn(),
      addCard: jest.fn(),
      createEntry: jest.fn(),
      destroyEntry: jest.fn(),
      replaceEntry: jest.fn(),
      get: jest.fn(),
      updateEntry: jest.fn(),
    },
  };
}
