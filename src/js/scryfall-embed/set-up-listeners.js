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
}
