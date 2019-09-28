import bus from 'framebus'
import mutation from '../../lib/mutation'
import Modal from '../../lib/modal'
import scryfall from '../../lib/scryfall'
import deckParser from '../../lib/deck-parser'

export default async function makeEDHRecButton () {
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

  button.addEventListener('click', (e) => {
    e.preventDefault()

    modal.open()

    scryfall.getDeck().then((deck) => {
      openEDHRecFrame(deck, modal)
    })
  })

  // TODO tiemout for EDHREC frame taking too long to load
  bus.on('EDHREC_READY', function (reply) {
    scryfall.getDeck().then((deck) => {
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

  const initialDeck = await scryfall.getDeck()

  let commanders = initialDeck.entries.commanders.reduce((all, card) => {
    if (!card.card_digest) {
      return all
    }

    all.push(card.card_digest.name)

    return all
  }, []).sort()

  await setDisabledState(button, commanders)

  mutation.change('.deckbuilder-editor-inner .deckbuilder-column .deckbuilder-section', async (el) => {
    const title = el.querySelector('.deckbuilder-section-title')

    if (title.innerHTML.toLowerCase().indexOf('commander') === -1) {
      // only run mutation on commander column
      return
    }

    const commanderList = Array.from(el.querySelectorAll('ul .deckbuilder-entry')).reduce((all, entry) => {
      // if the select options have more than 2 disabled, this
      // indicates that the card lookup has not completed, so
      // we ignore this value
      const cardLookupNotComplete = entry.querySelectorAll('.deckbuilder-entry-menu-select option[disabled]').length > 2

      if (cardLookupNotComplete) {
        return all
      }

      const input = entry.querySelector('.deckbuilder-entry-input')
      const parts = input.value.trim().match(/^(\d+ )(.*)/)
      if (!parts) {
        return all
      }
      const name = parts[2]

      all.push(name)

      return all
    }, [])
    commanderList.sort()

    // hack to determine if the arrays are equal
    if (commanderList.join('|') !== commanders.join('|')) {
      commanders = commanderList
      await setDisabledState(button, commanders)
    }
  })

  return button
}

async function setDisabledState (button, commanders) {
  const allLegal = await deckParser.hasLegalCommanders(commanders)

  if (allLegal) {
    button.removeAttribute('disabled')
  } else {
    button.setAttribute('disabled', 'disabled')
  }
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
