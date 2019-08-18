import bus from 'framebus'

let activeDeckId = null

// TODO convert page scryfall methods to promise based lib

bus.on('REQUEST_COMMANDERS', function (reply) {
  window.ScryfallAPI.decks.active(({ id }) => {
    activeDeckId = id

    window.ScryfallAPI.decks.get(id, (deck) => {
      const commanders = deck.entries.commanders
      reply({
        commanders
      })
    })
  })
})

bus.on('ADD_CARD_TO_DECK', function ({
  cardName,
  cardId,
  isLand
}) {
  window.ScryfallAPI.decks.addCard(activeDeckId, cardId, function (addedCardInfo) {
    if (isLand) {
      addedCardInfo.section = 'lands'
      window.ScryfallAPI.decks.updateEntry(activeDeckId, addedCardInfo, function (updateInfo) {
        // TODO do anything here?
      })
    }
    window.Scryfall.pushNotification('Card Added', `Added ${cardName}.`, 'purple', 'deck')
  })
})
