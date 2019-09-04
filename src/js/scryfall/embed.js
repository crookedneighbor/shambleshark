import bus from 'framebus'
import {
  addCard,
  getActiveDeck,
  getDeck,
  updateEntry,
  pushNotification
} from '../lib/scryfall-globals'

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
      updateEntry(activeDeckId, addedCardInfo).then(function (updateInfo) {
        // TODO do anything here?
      })
    }
    // TODO does this work?
    pushNotification('Card Added', `Added ${cardName}.`, 'purple', 'deck')
  })
})
