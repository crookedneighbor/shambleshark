import {
  api as scryfall
} from './scryfall'

function getCommanders (deck) {
  const ids = deck.entries.commanders
    .filter(card => card.card_digest)
    .map(card => `oracle_id:"${card.card_digest.oracle_id}"`)
    .join(' or ')

  return scryfall.get('/cards/search', {
    q: ids
  })
}

export function getCommanderColorIdentity (deck) {
  return getCommanders(deck).then(cards => {
    return cards.map(c => c.color_identity)
  }).catch(() => []).then(colorIdentities => {
    const colors = new Set(colorIdentities.reduce((id, ci) => {
      id.push.apply(id, ci)

      return id
    }, []))

    if (colors.size === 0) {
      colors.add('C')
    }

    return Array.from(colors)
  })
}

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

export function isCommanderLike (deck) {
  return getSections(deck).includes('commanders')
}

export function isSingletonTypeDeck (deck) {
  return getSections(deck).includes('nonlands') || isCommanderLike(deck)
}

export default {
  getCommanderColorIdentity,
  getSections,
  flattenEntries,
  hasLegalCommanders,
  isCommanderLike,
  isSingletonTypeDeck
}
