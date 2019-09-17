import {
  api as scryfall
} from './scryfall'

export function isCommanderLikeDeck (deck) {
  return Promise.resolve(Boolean(deck.entries.commanders))
}

export function hasLegalCommanders (commanders) {
  if (commanders.length === 0) {
    // no commanders in commander section
    return Promise.resolve(false)
  }

  return Promise.all(commanders.map((cardName) => {
    return scryfall.get('/cards/search', {
      q: `!"${cardName}" is:commander`
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
