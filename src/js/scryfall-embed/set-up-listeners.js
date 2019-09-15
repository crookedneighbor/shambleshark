import bus from 'framebus'
import Scryfall from '../lib/scryfall-globals'

export default function setUpListeners () {
  bus.on('REQUEST_DECK', function (reply) {
    Scryfall.getDeck().then(reply)
  })

  bus.on('ADD_CARD_TO_DECK', function ({
    cardName,
    cardId,
    isLand
  }) {
    Scryfall.addCard(cardId).then(function (addedCardInfo) {
      if (isLand) {
        addedCardInfo.section = 'lands'
        Scryfall.updateEntry(addedCardInfo)
      }
      Scryfall.pushNotification('Card Added', `Added ${cardName}.`, 'purple', 'deck')
    })
  })

  bus.on('REMOVE_CARD_FROM_DECK', function ({
    cardName
  }) {
    Scryfall.getDeck().then((deck) => {
      const cardToRemove = Object.keys(deck.entries).reduce((match, category) => {
        if (match) {
          return match
        }

        return deck.entries[category].find((card) => {
          if (!card.card_digest) {
            return false
          }

          return card.card_digest.name === cardName
        })
      }, false)

      return cardToRemove.id
    }).then((cardId) => {
      return Scryfall.removeEntry(cardId)
    }).then(() => {
      Scryfall.pushNotification('Card Removed', `Removed ${cardName}.`, 'purple', 'deck')
    })
  })

  bus.on('CLEAN_UP_DECK', function () {
    Scryfall.cleanUp()
  })
}
