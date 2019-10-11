import bus from 'framebus'
import mutation from '../../lib/mutation'
import Modal from '../../lib/modal'
import scryfall from '../../lib/scryfall'
import deckParser from '../../lib/deck-parser'

const EDHREC_SYMBOL = `
<svg aria-hidden="true" focusable="false" viewbox="0 0 848 848" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
  <path d="m274.758564,4.548195a42.85523,47.51192 0 0 0 -42.8579,47.51482a42.85523,47.51192 0 0 0 42.8579,47.51482a42.85523,47.51192 0 0 0 6.16728,-0.57151l61.52529,148.5655l-58.67182,30.45193l0,356.34075l140.52144,-72.92545l140.52153,72.92545l0,-356.34072l-58.67181,-30.45196l61.52527,-148.56547a42.85523,47.51192 0 0 0 6.18567,0.57151a42.85523,47.51192 0 0 0 42.83943,-47.51482a42.85523,47.51192 0 0 0 -42.83943,-47.51482a42.85523,47.51192 0 0 0 -42.8578,47.51482a42.85523,47.51192 0 0 0 14.59884,35.65653l-62.61142,147.83068l-58.69028,-30.45194l-58.6902,30.45194l-62.59303,-147.8307a42.85523,47.51192 0 0 0 14.59884,-35.65654a42.85523,47.51192 0 0 0 -42.8578,-47.51482zm-43.7968,419.87754l-176.91749,90.60065l0,238.10478l176.91749,-91.15171l0,-237.55372zm386.67798,0l0,237.55372l176.91749,91.15171l0,-238.10478l-176.91749,-90.60065zm-193.35737,200.18274l0,0.0209l-419.98115,219.91882l419.98115,0l0.0377,0l419.98115,0l-419.98105,-219.91932l0,-0.0209l-0.0189,0l-0.0189,0.0005z" />
  <path d="m304.333314,87.719555l130.13697,-73.74926l0,35.8616l113.44379,-35.8616l-130.42049,75.04774l0,-35.7808l-113.16027,34.48232" />
</svg>
`
const PLUS_SYMBOL = `<svg aria-hidden="true" focusable="false" class="svg-plus-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path fill="#FFF" d="M15 0c-8.284 0-15 6.716-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15zm0 28c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zm1-22h-2v8h-8v2h8v8h2v-8h8v-2h-8v-8z"></path></svg>`
const CHECK_SYMBOL = `<svg aria-hidden="true" focusable="false" class="svg-check-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M413.505 91.951L133.49 371.966l-98.995-98.995c-4.686-4.686-12.284-4.686-16.971 0L6.211 284.284c-4.686 4.686-4.686 12.284 0 16.971l118.794 118.794c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-11.314-11.314c-4.686-4.686-12.284-4.686-16.97 0z" fill="#FFF"></path></svg>`
const TYPE_ORDER = [
  'creature',
  'instant',
  'sorcery',
  'artifact',
  'enchantment',
  'planeswalker',
  'land'
]
const TYPES_WITH_IRREGULAR_PLURALS = {
  Sorcery: 'Sorceries'
}

export default async function makeEDHRecButton () {
  addEDHRecIframe()

  const button = document.createElement('button')
  const modalTitle = 'EDHRec Suggestions'
  const modal = new Modal({
    id: 'edhrec-modal',
    headerSymbol: EDHREC_SYMBOL,
    header: modalTitle,
    loadingMessage: 'Loading EDHRec Suggestions',
    onClose (modalInstance) {
      // reset this in case the error state changes it
      modalInstance.setTitle(modalTitle)
      bus.emit('CLEAN_UP_DECK')
      modalInstance.setLoading(true)
      button.focus()
    }
  })
  document.getElementById('deckbuilder').appendChild(modal.element)

  button.id = 'edhrec-suggestions'
  button.setAttribute('aria-label', 'EDHRec Suggestions')
  button.classList.add('button-n', 'tiny')
  button.innerHTML = `
  ${EDHREC_SYMBOL}
  <i>EDHRec Suggestions</i>
  `
  button.setAttribute('disabled', true)

  button.addEventListener('click', (e) => {
    e.preventDefault()

    modal.open()

    scryfall.getDeck().then((deck) => {
      const commanders = deck.entries.commanders.reduce((all, card) => {
        if (!card.card_digest) {
          return all
        }

        all.push(card.card_digest.name)

        return all
      }, [])

      const cardsInDeck = Object.keys(deck.entries).reduce((all, type) => {
        if (type === 'commanders') {
          return all
        }

        deck.entries[type].forEach((card) => {
          if (!card.card_digest) {
            return all
          }
          all.push(`${card.count} ${card.card_digest.name}`)
        })

        return all
      }, [])

      bus.emit('REQUEST_EDHREC_RECOMENDATIONS', {
        commanders,
        cards: cardsInDeck
      }, function ([err, result]) {
        if (err) {
          createErrorModalState(modal, err)
          return
        }

        const recomendations = formatEDHRecSuggestions(result.inRecs)
        // TODO ENHANCEMENT: handle cuts
        // const cuts = formatEDHRecSuggestions(result.outRecs)

        const container = document.createElement('div')
        const sections = {}
        container.id = 'edhrec-card-suggestions'
        container.style.textAlign = 'center'
        container.style.overflowY = 'scroll'
        container.style.height = '500px'
        container.style.width = '100%'

        Object.values(recomendations).forEach(card => {
          const sectionId = card.type.toLowerCase()
          let section = sections[sectionId]
          if (!section) {
            section = sections[sectionId] = {}
            section.name = card.type
            section.element = document.createElement('div')
            section.element.id = `edhrec-suggestion-${sectionId}`
            section.element.classList.add('edhrec-suggestions-container')

            const sectionTitle = TYPES_WITH_IRREGULAR_PLURALS[section.name] || `${section.name}s`

            section.element.innerHTML = `
              <h3 style="font-size:20px;border-bottom: 1px solid #E0DEE3;padding:15px 0 5px;">${sectionTitle}</h3>
              <div class="edhrec-suggestions"></div>
              `
            section.cards = []
          }

          const cardElement = card.element = document.createElement('div')

          cardElement.classList.add('edhrec-suggestion-card-container')
          cardElement.setAttribute('role', 'button')
          cardElement.setAttribute('tabindex', '0')
          cardElement.setAttribute('aria-pressed', 'false')
          let cardAlreadyInDeck = false

          cardElement.innerHTML = `
            <img src="${card.img}" alt="Add ${card.name} to deck" />
            <div class="edhrec-suggestion-overlay">
            ${PLUS_SYMBOL}
            </div>
            `
          const img = cardElement.querySelector('img')
          cardElement.addEventListener('blur', function () {
            if (cardAlreadyInDeck) {
              img.alt = `Remove ${card.name} from deck`
            } else {
              img.alt = `Add ${card.name} to deck`
            }
          })

          const overlay = cardElement.querySelector('.edhrec-suggestion-overlay')

          function toggleCardState () {
            cardAlreadyInDeck = !cardAlreadyInDeck

            if (cardAlreadyInDeck) {
              cardElement.setAttribute('aria-pressed', 'true')

              cardElement.classList.add('in-deck')
              img.alt = `${card.name} added to deck.`
              overlay.innerHTML = CHECK_SYMBOL

              scryfall.api.get(`/cards/${card.set}/${card.collectorNumber}`).then((cardFromScryfall) => {
                bus.emit('ADD_CARD_TO_DECK', {
                  cardName: cardFromScryfall.name,
                  cardId: cardFromScryfall.id,
                  isLand: cardFromScryfall.type_line.toLowerCase().indexOf('land') > -1
                })
              }).catch(err => {
                console.error(err)

                bus.emit('SCRYFALL_PUSH_NOTIFICATION', {
                  header: 'Card could not be added',
                  message: `There was an error adding ${card.name} to the deck. See console for more details.`,
                  color: 'red'
                })

                img.alt = `Error adding ${card.name} to deck.`
                cardElement.classList.remove('in-deck')
                overlay.innerHTML = PLUS_SYMBOL
              })
            } else {
              img.alt = `${card.name} removed from deck.`
              cardElement.classList.remove('in-deck')
              overlay.innerHTML = PLUS_SYMBOL

              cardElement.setAttribute('aria-pressed', 'false')
              bus.emit('REMOVE_CARD_FROM_DECK', {
                cardName: card.name
              })
            }
          }

          cardElement.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
              toggleCardState()
            }
          })

          cardElement.addEventListener('click', toggleCardState)

          section.cards.push(card)
        })

        TYPE_ORDER.forEach(function (type) {
          const section = sections[type]

          if (!section) {
            return
          }

          const suggestions = section.element.querySelector('.edhrec-suggestions')

          section.cards.forEach(card => {
            suggestions.appendChild(card.element)
          })
          container.appendChild(section.element)
        })

        modal.setContent(container)
        modal.setLoading(false)
      })
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

function addEDHRecIframe () {
  const iframe = document.createElement('iframe')
  // does not matter where on edhrec we open the page
  // just need to be on the edhrec domain to access
  // the recs JSON endpoint
  iframe.src = 'https://edhrec.com/404'
  iframe.id = 'edhrec-suggestions-iframe'
  iframe.style.width = '0px'
  iframe.style.height = '0px'
  iframe.style.opacity = 0

  document.body.appendChild(iframe)
}

function formatEDHRecSuggestions (list) {
  return list.reduce((all, rec) => {
    const type = rec.primary_types[0]
    const name = rec.names.join(' // ')
    const scryfallParts = rec.scryfall_uri.split('/card/')[1].split('/')

    all[name] = {
      name,
      type,
      set: scryfallParts[0],
      collectorNumber: scryfallParts[1],
      img: rec.images[0],
      price: rec.price,
      salt: rec.salt,
      score: rec.score
    }

    return all
  }, {})
}

function createErrorModalState (modal, err) {
  modal.setTitle('Something went wrong')

  const container = document.createElement('div')

  if (err.errors) {
    const errorList = document.createElement('ul')
    err.errors.forEach(errorMessage => {
      const errorElement = document.createElement('li')
      errorElement.innerHTML = errorMessage
      errorList.appendChild(errorElement)
    })

    container.appendChild(errorList)
  } else {
    container.innerHTML = `
      <p>An unknown error occurred:</p>
      <pre><code>${err.toString()}</code></pre>
    `
  }

  modal.setContent(container)
  modal.setLoading(false)
}
