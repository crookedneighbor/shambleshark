import scryfall from './scryfall-globals'
import {
  hasDedicatedLandSection,
  isLandCard
} from '../lib/deck-parser'

function correctLandNonLandColumns (deck) {
  if (!hasDedicatedLandSection(deck)) {
    return Promise.resolve()
  }

  const landsInNonLands = deck.entries.nonlands
    .filter(c => c.card_digest).filter(c => isLandCard(c))
  const nonLandsInLands = deck.entries.lands
    .filter(c => c.card_digest).filter(c => !isLandCard(c))

  landsInNonLands.forEach(c => {
    c.section = 'lands'
  })
  nonLandsInLands.forEach(c => {
    c.section = 'nonlands'
  })
  const cardPromises = landsInNonLands
    .concat(nonLandsInLands)
    .map(c => scryfall.updateEntry(c))

  return Promise.all(cardPromises)
}

export default function modifyCleanUp (config = {}) {
  const oldCleanup = Scryfall.deckbuilder.cleanUp

  Scryfall.deckbuilder.cleanUp = () => {
    return scryfall.getDeck().then(deck => {
      if (config.cleanUpLandsInSingleton) {
        return correctLandNonLandColumns(deck)
      }
    }).then(() => {
      return oldCleanup()
    })
  }
}
