let getActiveDeckPromise = null

export function getActiveDeckId () {
  if (Scryfall.deckbuilder && Scryfall.deckbuilder.deckId) {
    return Promise.resolve(Scryfall.deckbuilder.deckId)
  }

  return getActiveDeck().then(({ id }) => id)
}

export function getActiveDeck () {
  if (!getActiveDeckPromise) {
    getActiveDeckPromise = new Promise((resolve) => {
      ScryfallAPI.decks.active((deck) => {
        resolve(deck)
      })
    })
  }

  return getActiveDeckPromise
}

export function resetActiveDeck () {
  getActiveDeckPromise = null
}

export function getDeck () {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.get(id, (deck) => {
        resolve(deck)
      })
    })
  })
}

export function addCard (cardId) {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.addCard(id, cardId, (card) => {
        resolve(card)
      })
    })
  })
}

export function updateEntry (cardToUpdate) {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.updateEntry(id, cardToUpdate, (card) => {
        resolve(card)
      })
    })
  })
}

export function removeEntry (cardId) {
  return getActiveDeckId().then((id) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.destroyEntry(id, cardId, (card) => {
        resolve()
      })
    })
  })
}

export function cleanUp () {
  Scryfall.deckbuilder.cleanUp()

  return Promise.resolve()
}

export function pushNotification (title, message, color, type) {
  Scryfall.pushNotification(title, message, color, type)

  return Promise.resolve()
}

export default {
  addCard,
  cleanUp,
  getDeck,
  removeEntry,
  updateEntry,
  pushNotification
}
