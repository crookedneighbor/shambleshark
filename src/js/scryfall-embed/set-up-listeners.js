import bus from 'framebus'
import {
  addCard,
  getActiveDeck,
  getDeck,
  updateEntry,
  pushNotification
} from '../lib/scryfall-globals'

export default function setUpListeners () {
  let activeDeckId = null

  bus.on('REQUEST_DECK', function (reply) {
    getActiveDeck().then(({ id }) => {
      activeDeckId = id

      return getDeck(id)
    }).then(reply)
  })

  bus.on('ADD_CARD_TO_DECK', function ({
    cardName,
    cardId,
    isLand
  }) {
    addCard(activeDeckId, cardId).then(function (addedCardInfo) {
      if (isLand) {
        addedCardInfo.section = 'lands'
        updateEntry(activeDeckId, addedCardInfo)
      }
      pushNotification('Card Added', `Added ${cardName}.`, 'purple', 'deck')
    })
  })
}
