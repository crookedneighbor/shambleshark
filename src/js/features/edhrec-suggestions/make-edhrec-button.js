import bus from 'framebus'
import makePromisePlus from '../../lib/promise-plus'
import Modal from '../../lib/modal'
import scryfall from '../../lib/scryfall-client'

export default function makeEDHRecButton () {
  const modal = new Modal({
    id: 'edhrec-modal',
    header: 'EDHRec Suggestions',
    onClose () {
      // TODO call cleanup on close
    }
  })
  document.getElementById('deckbuilder').appendChild(modal.element)

  const button = document.createElement('button')

  button.id = 'edhrec-suggestions'
  button.classList.add('button-n', 'tiny')
  button.innerText = 'EDHRec Suggestions'

  let deckPromise

  button.addEventListener('click', (e) => {
    e.preventDefault()

    deckPromise = makePromisePlus()

    modal.open()

    bus.emit('REQUEST_DECK', (deck) => {
      deckPromise.resolve(deck)

      openEDHRecFrame(deck, modal)
    })
  })

  bus.on('EDHREC_READY', function (reply) {
    deckPromise.then((deck) => {
      const cardsInDeck = Object.keys(deck.entries).reduce((all, type) => {
        deck.entries[type].forEach((card) => {
          all[card.card_digest.name] = true
        })

        return all
      }, {})

      reply({
        cardsInDeck
      })

      modal.setLoading(false)
    })
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

  return button
}

function openEDHRecFrame (deck, modal) {
  const commanders = deck.entries.commanders

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

    modal.setContent(iframe)
  })
}
