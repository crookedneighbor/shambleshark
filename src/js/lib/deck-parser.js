import scryfall from './scryfall-client'

export function isCommanderLikeDeck (deck) {
  return Promise.resolve(Boolean(deck.entries.commanders))
}

export function hasLegalCommanders (commanders) {
  if (commanders.length === 0) {
    // no commanders in commander section
    return Promise.resolve(false)
  }

  if (!commanders.find(c => c.card_digest)) {
    // has entries in commander section of deck, but none of them
    // have a card digest yet, so we can't calculate commanders
    return Promise.resolve(false)
  }

  return Promise.all(commanders.map((card) => {
    if (!card.card_digest) {
      // ignore blank lines
      return true
    }

    return scryfall.get('/cards/search', {
      q: `!"${card.card_digest.name}" is:commander`
    })
  })).then(() => {
    // if all promises resolve, all were commanders
    return true
  }).catch(() => {
    // if even one promise 404s, then not all were commanders
    return false
  })
}

export default {
  isCommanderLikeDeck,
  hasLegalCommanders
}
