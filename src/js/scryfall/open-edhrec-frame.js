import scryfall from '../lib/scryfall-client'
import bus from 'framebus'

export default function (commanders) {
  const modal = document.getElementById('edhrec-modal')

  document.querySelector('.left-tray').style.zIndex = 9000

  // TODO figure out partners
  const cmdr = commanders[0]
  const id = cmdr.card_digest.id

  scryfall.get(`/cards/${id}`).then((card) => {
    const edhrecUrl = card.related_uris.edhrec

    // TODO this can be called multiple times and it duplcates the code, so many button listeners get added
    const iframe = document.createElement('iframe')
    iframe.src = edhrecUrl
    iframe.style.width = '100%'
    iframe.style.minHeight = '500px'
    const content = modal.querySelector('.modal-dialog-stage')

    bus.on('EDHREC_READY', function (reply) {
      reply({
        // TODO send along all cards in deck
        cardsInDeck: {}
      })

      modal.querySelector('.modal-dialog-content').style.display = 'none'
      content.removeAttribute('style')
    })

    bus.on('ADD_CARD_FROM_EDHREC', function (payload) {
      scryfall.get('/cards/named', {
        exact: payload.cardName
      }).then((card) => {
        bus.emit('ADD_CARD_TO_DECK', {
          cardName: card.name,
          cardId: card.id,
          isLand: card.type_line.toLowerCase().indexOf('land') > -1
        })
      }).catch((err) => {
        // TODO scryfall message an error
        console.log(err)
      })
    })
    // TODO add REMOVE_CARD_FROM_EDHREC event

    content.appendChild(iframe)
  })
}
