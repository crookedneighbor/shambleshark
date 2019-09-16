import bus from 'framebus'
import makePromisePlus from '../../lib/promise-plus'
import Modal from '../../lib/modal'
import scryfall from '../../lib/scryfall'

export default function makeEDHRecButton () {
  const modal = new Modal({
    id: 'edhrec-modal',
    header: 'EDHRec Suggestions',
    onClose (modalInstance) {
      bus.emit('CLEAN_UP_DECK')
      modalInstance.setLoading(true)
    }
  })
  document.getElementById('deckbuilder').appendChild(modal.element)

  const button = document.createElement('button')

  button.id = 'edhrec-suggestions'
  button.classList.add('button-n', 'tiny')
  button.innerText = 'EDHRec Suggestions'
  button.setAttribute('disabled', true)

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

  // TODO tiemout for EDHREC frame taking too long to load
  bus.on('EDHREC_READY', function (reply) {
    deckPromise.then((deck) => {
      const cardsInDeck = Object.keys(deck.entries).reduce((all, type) => {
        deck.entries[type].forEach((card) => {
          if (!card.card_digest) {
            return
          }
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
    scryfall.api.get('/cards/named', {
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

  bus.on('REMOVE_CARD_FROM_EDHREC', function (payload) {
    bus.emit('REMOVE_CARD_FROM_DECK', {
      cardName: payload.cardName
    })
  })

  return button
}

function findEDHRecUrl (commanders) {
  // TODO oathbreaker support
  const firstCommander = commanders[0]
  const id = firstCommander.card_digest.id
  const remainderCommanders = commanders.slice(1, commanders.length)

  return scryfall.api.get(`/cards/${id}`).then((card) => {
    let edhrecUrl = card.related_uris.edhrec
    const otherCommanders = remainderCommanders.reduce((string, card) => {
      if (!card.card_digest) {
        return string
      }

      string += '-' + card.card_digest.name.toLowerCase().replace(/\s/g, '-')

      return string
    }, '')

    if (otherCommanders) {
      edhrecUrl += otherCommanders
    }

    return edhrecUrl
  })
}

function openEDHRecFrame (deck, modal) {
  const commanders = deck.entries.commanders

  return findEDHRecUrl(commanders).then((edhrecUrl) => {
    const iframe = document.createElement('iframe')
    iframe.src = edhrecUrl
    iframe.style.width = '100%'
    iframe.style.minHeight = '500px'

    modal.setContent(iframe)
  })
}
