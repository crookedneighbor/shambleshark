import bus from 'framebus'
import {
  addCard,
  getActiveDeck,
  getDeck,
  updateEntry,
  pushNotification
} from '../lib/scryfall-globals'

let activeDeckId = null

bus.on('REQUEST_COMMANDERS', function (reply) {
  getActiveDeck().then(({ id }) => {
    activeDeckId = id

    return getDeck(id)
  }).then((deck) => {
    const commanders = deck.entries.commanders

    reply({
      commanders
    })
  })
})

bus.on('ADD_CARD_TO_DECK', function ({
  cardName,
  cardId,
  isLand
}) {
  addCard(activeDeckId, cardId, function (addedCardInfo) {
    if (isLand) {
      addedCardInfo.section = 'lands'
      updateEntry(activeDeckId, addedCardInfo, function (updateInfo) {
        // TODO do anything here?
      })
    }
    pushNotification('Card Added', `Added ${cardName}.`, 'purple', 'deck')
  })
})
