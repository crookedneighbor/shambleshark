let getActiveDeckPromise = null

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
  return getActiveDeck().then(({ id }) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.get(id, (deck) => {
        resolve(deck)
      })
    })
  })
}

export function addCard (cardId) {
  return getActiveDeck().then(({ id }) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.addCard(id, cardId, (card) => {
        resolve(card)
      })
    })
  })
}

export function updateEntry (cardToUpdate) {
  return getActiveDeck().then(({ id }) => {
    return new Promise((resolve) => {
      ScryfallAPI.decks.updateEntry(id, cardToUpdate, (card) => {
        resolve(card)
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
  updateEntry,
  pushNotification
}
