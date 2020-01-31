import {
  api as scryfall
} from './scryfall'

export function getSections (deck) {
  return Object.keys(deck.sections).reduce((sections, type) => {
    deck.sections[type].forEach(section => sections.push(section))
    return sections
  }, [])
}

export function flattenEntries (deck) {
  const sections = getSections(deck)
  const entries = []
  const oracleIds = {}

  sections.forEach(section => {
    deck.entries[section].forEach(entry => {
      const oracleId = entry.card_digest && entry.card_digest.oracle_id

      if (oracleId) {
        if (oracleId in oracleIds) {
          const original = oracleIds[oracleId]
          original.count = Number(original.count) + Number(entry.count)
        } else {
          oracleIds[oracleId] = entry
          entries.push(entry)
        }
      }
    })
  })

  return entries
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

export function isSingletonTypeDeck (deck) {
  const section = getSections(deck)
    .find(section => section === 'commanders' || section === 'nonlands')

  return Boolean(section)
}

export default {
  getSections,
  flattenEntries,
  hasLegalCommanders,
  isSingletonTypeDeck
}
