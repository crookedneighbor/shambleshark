export function getActiveDeck () {
  return new Promise((resolve) => {
    ScryfallAPI.decks.active((deck) => {
      resolve(deck)
    })
  })
}

export function getDeck (id) {
  return new Promise((resolve) => {
    ScryfallAPI.decks.get(id, (deck) => {
      resolve(deck)
    })
  })
}

export function addCard (deckId, cardId) {
  return new Promise((resolve) => {
    ScryfallAPI.decks.addCard(deckId, cardId, (card) => {
      resolve(card)
    })
  })
}

export function updateEntry (deckId, cardToUpdate) {
  return new Promise((resolve) => {
    ScryfallAPI.decks.updateEntry(deckId, cardToUpdate, (card) => {
      resolve(card)
    })
  })
}

export function pushNotification (title, message, color, type) {
  Scryfall.pushNotification(title, message, color, type)

  return Promise.resolve()
}
