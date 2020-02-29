import bus from 'framebus'
import mutation from 'Lib/mutation'
import createElement from 'Lib/create-element'
import DeckSectionChooser from 'Ui/deck-section-chooser'
import AddCardElement from 'Ui/add-card-element'
import Drawer from 'Ui/drawer'
import scryfall from 'Lib/scryfall'
import deckParser from 'Lib/deck-parser'
import iframe from 'Lib/iframe'
import {
  EDHREC_SYMBOL
} from '../../../resources/svg'

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
  await iframe.create({
    // does not matter where on edhrec we open the page
    // just need to be on the edhrec domain to access
    // the recs JSON endpoint
    src: 'https://edhrec.com/404',
    id: 'edhrec-suggestions-iframe'
  })

  const button = createElement(`<button
    id="edhrec-suggestions"
    aria-label="EDHRec Suggestions"
    class="button-n tiny"
    disabled="true"
  >
    ${EDHREC_SYMBOL}
    <i>EDHRec Suggestions</i>
</button>`).firstChild
  createDrawer(button)

  const initialCommanders = await getInitialCommanderList()
  await setDisabledState(button, initialCommanders)

  updateButtonStateOnCommanderChange(button, initialCommanders)

  return button
}

async function setDisabledState (button, commanders) {
  const allLegal = await deckParser.hasLegalCommanders(commanders)

  // TODO: should we mark it as enabled if at least one commander
  // is a legal commander, and then only send the legal ones to edhrec?
  if (allLegal) {
    button.removeAttribute('disabled')
  } else {
    button.setAttribute('disabled', 'disabled')
  }
}

function createDrawer (button) {
  const drawer = new Drawer({
    id: 'edhrec-drawer',
    headerSymbol: EDHREC_SYMBOL,
    header: 'EDHRec Suggestions',
    loadingMessage: 'Loading EDHRec Suggestions',
    onClose (drawerInstance) {
      bus.emit('CLEAN_UP_DECK')

      // reset this in case the error state changes it
      drawerInstance.resetHeader()
      drawerInstance.setLoading(true)

      // re-focus the EDHRec Suggestion button
      // for accessibility navigation
      button.focus()
    }
  })
  // TODO: the drawer class should probably handle this
  document.getElementById('deckbuilder').appendChild(drawer.element)

  button.addEventListener('click', (e) => {
    e.preventDefault()

    drawer.open()

    scryfall.getDeck().then((deck) => {
      const commanders = deck.entries.commanders.filter(filterOutInvalidCards).map(getCardName)
      const cardsInDeck = getCardsInDeck(deck.entries)

      bus.emit('REQUEST_EDHREC_RECOMENDATIONS', {
        commanders,
        cards: cardsInDeck
      }, createEDHRecResponseHandler(drawer, deck))
    })
  })

  return drawer
}

async function getInitialCommanderList () {
  const initialDeck = await scryfall.getDeck()

  return initialDeck.entries.commanders
    .filter(filterOutInvalidCards)
    .map(getCardName)
    .sort()
}

function updateButtonStateOnCommanderChange (button, commanders) {
  mutation.change('.deckbuilder-editor-inner .deckbuilder-column .deckbuilder-section', async (el) => {
    const title = el.querySelector('.deckbuilder-section-title')

    if (title.innerText.toLowerCase().indexOf('commander') === -1) {
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
}

function getCardsInDeck (entries) {
  return Object.keys(entries).reduce((all, type) => {
    // don't add commanders to decklist
    if (type === 'commanders') {
      return all
    }

    entries[type].filter(filterOutInvalidCards).forEach((card) => {
      all.push(`${card.count} ${card.card_digest.name}`)
    })

    return all
  }, [])
}

function constructEDHRecSection (sectionId, cardType) {
  const section = {
    name: cardType
  }
  const sectionTitle = TYPES_WITH_IRREGULAR_PLURALS[section.name] || `${section.name}s`

  section.element = createElement(`<div
    id="edhrec-suggestion-${sectionId}"
    class="edhrec-suggestions-container"
    >
      <!-- TODO move this css to a css file -->
      <h3 style="font-size:20px;border-bottom: 1px solid #E0DEE3;padding:15px 0 5px;">${sectionTitle}</h3>
      <div class="edhrec-suggestions"></div>
  </div>`).firstChild

  section.cards = []

  return section
}

// TODO pull out into helper function

function createEDHRecResponseHandler (drawer, deck) {
  return function ([err, result]) {
    if (err) {
      createErrorDrawerState(drawer, err)
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
    const deckSectionChooser = new DeckSectionChooser({
      id: 'edhrec-suggestions-section-chooser',
      deck
    })
    container.appendChild(deckSectionChooser.element)
    container.appendChild(document.createElement('hr'))

    Object.values(recomendations).forEach(card => {
      const sectionId = card.type.toLowerCase()
      let section = sections[sectionId]

      if (!section) {
        section = sections[sectionId] = constructEDHRecSection(sectionId, card.type)
      }

      card.cardElement = new AddCardElement({
        name: card.name,
        img: card.img,
        type: card.type,
        singleton: true,
        getScryfallId () {
          return scryfall.api.get(`/cards/${card.set}/${card.collectorNumber}`).then((cardFromScryfall) => {
            return cardFromScryfall.id
          })
        },
        onAddCard: (payload) => {
          const section = deckSectionChooser.getValue()

          if (section) {
            payload.section = section
          }
        }
      })

      section.cards.push(card)
    })

    TYPE_ORDER.forEach(function (type) {
      const section = sections[type]

      if (!section) {
        return
      }

      const suggestions = section.element.querySelector('.edhrec-suggestions')

      section.cards.forEach(card => {
        suggestions.appendChild(card.cardElement.element)
      })
      container.appendChild(section.element)
    })

    drawer.setContent(container)
    drawer.setLoading(false)
  }
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

function createErrorDrawerState (drawer, err) {
  drawer.setHeader('Something went wrong')

  const container = document.createElement('div')

  if (err.errors) {
    const errorList = document.createElement('ul')
    err.errors.forEach(errorMessage => {
      const errorElement = document.createElement('li')
      errorElement.innerText = errorMessage
      errorList.appendChild(errorElement)
    })

    container.appendChild(errorList)
  } else {
    container.appendChild(createElement(`<div>
      <p>An unknown error occurred:</p>
      <pre><code>${err.toString()}</code></pre>
    </div>`))
  }

  drawer.setContent(container)
  drawer.setLoading(false)
}

function filterOutInvalidCards (card) {
  return card.card_digest
}

function getCardName (card) {
  return card.card_digest.name
}
