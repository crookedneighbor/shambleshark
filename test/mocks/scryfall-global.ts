export function generateScryfallGlobal() {
  return {
    deckbuilder: {
      cleanUp: jest.fn(),
    },
    pushNotification: jest.fn(),
  };
}

export function generateScryfallAPIGlobal() {
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
