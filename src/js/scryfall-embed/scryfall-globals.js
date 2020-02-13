import bus from 'framebus'
import wait from '../lib/wait'

let getActiveDeckPromise = null
let getDeckMetadataPromise = null

export function addHooksToCardManagementEvents () {
  [
    'addCard',
    'updateEntry',
    'replaceEntry',
    'createEntry',
    'destroyEntry'
  ].forEach(method => {
    const original = ScryfallAPI.decks[method]
    ScryfallAPI.decks[method] = function (deckId, payload, cb, ____) {
      original(...arguments)
      bus.emit(`CALLED_${method.toUpperCase()}`, {
        deckId,
        payload
      })
    }
  })

  const originalCleanup = Scryfall.deckbuilder.cleanUp
  Scryfall.deckbuilder.cleanUp = function () {
    originalCleanup(...arguments)
    bus.emit('CALLED_CLEANUP')
  }
}

export function getDeckMetadata () {
  if (!getDeckMetadataPromise) {
    getDeckMetadataPromise = getDeck().then(deck => {
      return {
        id: deck.id,
        sections: deck.sections
      }
    })
  }

  return getDeckMetadataPromise
}

export function getActiveDeckId (waitTime = 300) {
  if (!ScryfallAPI.grantSecret) {
    return wait(waitTime).then(() => {
      // progressively wait longer and longer to try looking up the grant secret
      return getActiveDeckId(waitTime * 2)
    })
  }

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

export function reset () {
  getActiveDeckPromise = null
  getDeckMetadataPromise = null
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
  addHooksToCardManagementEvents,
  cleanUp,
  getDeck,
  getDeckMetadata,
  pushNotification,
  removeEntry,
  updateEntry
}
