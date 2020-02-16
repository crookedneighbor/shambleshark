import Feature from '../../feature'
import bus from 'framebus'
import { sections } from '../../constants'
import Drawer from '../../../lib/ui-elements/drawer'
import AddCardElement from '../../../lib/ui-elements/add-card-element'
import deckParser from '../../../lib/deck-parser'
import scryfall from '../../../lib/scryfall'
import createElement from '../../../lib/create-element'
import emptyElement from '../../../lib/empty-element'
import injectCSS from '../../../lib/inject-css'
import css from './index.css'

import {
  EXTERNAL_ARROW
} from '../../../resources/svg'

injectCSS(css)

// TODO
// saved searches

class ScryfallSearch extends Feature {
  async run () {
    this.drawer = this.createDrawer()
    this.settings = await ScryfallSearch.getSettings()

    document.getElementById('header-search-field').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.value) {
        return
      }

      e.preventDefault()

      this.onEnter(e.target.value)
    })
  }

  async onEnter (query) {
    this.drawer.open()
    this.currentQuery = query

    if (this.settings.restrictFunnyCards) {
      this.currentQuery += ' not:funny'
    }

    this.deck = await scryfall.getDeck()

    this.isSingleton = deckParser.isSingletonTypeDeck(this.deck)

    if (this.settings.restrictToCommanderColorIdentity && deckParser.isCommanderLike(this.deck)) {
      const colors = await deckParser.getCommanderColorIdentity(this.deck)

      this.currentQuery += ` ids:${colors.join('')}`
    }

    this.cardList = await scryfall.api.get('cards/search', {
      q: this.currentQuery
    }).catch((e) => {
      // most likely a 404, return no results
      return []
    })

    this.addSearchOptionsElement()

    this.addCards()

    this.drawer.setLoading(false)
  }

  addSearchOptionsElement () {
    const totalCards = this.cardList.total_cards
    const el = createElement(`<div
      class="scryfall-search__options-container scryfall-search__non-card-element"
    >
      <div class="scryfall-search__search-results-counter">
        ${totalCards} result${totalCards !== 1 ? 's' : ''}&nbsp;
        <a class="scryfall-search__external-link-icon" href="/search?q=${encodeURI(this.currentQuery)}">${EXTERNAL_ARROW}</a>
      </div>

      <div class="form-row-content-band">
        <select id="scryfall-search__section-selection" class="form-input auto small-select">
          <option value="" selected disabled>Section (auto)</option>
        </select>
      </div>
    >
    </div>`).firstChild
    this.sectionSelect = el.querySelector('#scryfall-search__section-selection')

    deckParser.getSections(this.deck).sort().forEach(section => {
      const option = document.createElement('option')
      const sectionLabel = section[0].toUpperCase() + section.slice(1)

      option.value = section
      option.innerText = `Add to ${sectionLabel}`

      this.sectionSelect.appendChild(option)
    })

    const hr = document.createElement('hr')
    hr.classList.add('scryfall-search__hr')

    this.container.appendChild(el)
    this.container.appendChild(hr)
  }

  addCards () {
    if (this.cardList.length === 0) {
      emptyElement(this.container)
      this.container.appendChild(createElement('<div class="scryfall-search__no-results scryfall-search__non-card-element">No search results.</div>'))

      return
    }

    const entries = deckParser.flattenEntries(this.deck)
    this.cardList.forEach(card => {
      const cardInDeck = entries.find(entry => entry.card_digest && entry.card_digest.oracle_id === card.oracle_id)
      const quantity = cardInDeck ? cardInDeck.count : 0
      const addCardEl = new AddCardElement({
        quantity,
        singleton: this.isSingleton,
        id: card.id,
        name: card.name,
        img: card.getImage(),
        type: card.type_line,
        onAddCard: (payload) => {
          payload.section = this.sectionSelect.value
        }
      })

      this.container.appendChild(addCardEl.element)
    })
  }

  isReadyToLookupNextBatch (el) {
    if (this._nextInProgress || !this.cardList || !this.cardList.has_more) {
      return false
    }

    return el.scrollTop + el.clientHeight >= el.scrollHeight - 15000
  }

  createDrawer (button) {
    const self = this
    const drawer = new Drawer({
      id: 'scryfall-search-drawer',
      // TODO add scryfall symbol?
      // headerSymbol: EDHREC_SYMBOL,
      header: 'Scryfall Search',
      loadingMessage: 'Loading Scryfall Search',
      onScroll (drawerInstance) {
        if (!self.isReadyToLookupNextBatch(drawerInstance.getScrollableElement())) {
          return
        }

        self._nextInProgress = true

        return self.cardList.next().then(cards => {
          self.cardList = cards
          self.addCards()
          self._nextInProgress = false
        })
      },
      onClose (drawerInstance) {
        self.cardList = null
        // TODO constant
        bus.emit('CLEAN_UP_DECK')

        // reset this in case the error state changes it
        drawerInstance.setLoading(true)
        drawerInstance.resetHeader()
        emptyElement(self.container)

        // re-focus the Scryfall Search input
        // for accessibility navigation
        document.getElementById('header-search-field').focus()
      }
    })
    // TODO: the drawer class should probably handle this
    document.getElementById('deckbuilder').appendChild(drawer.element)

    this.container = document.createElement('div')
    drawer.setContent(this.container)

    return drawer
  }
}

ScryfallSearch.metadata = {
  id: 'scryfall-search',
  title: 'Scryfall Search',
  section: sections.DECK_BUILDER,
  description: 'Search for Scryfall cards right inside the deckbuilder! (Coming Soon: Save searches for specific decks for later)'
}

ScryfallSearch.settingsDefaults = {
  enabled: true,
  restrictToCommanderColorIdentity: true,
  restrictFunnyCards: false
}

ScryfallSearch.settingDefinitions = [{
  id: 'restrictToCommanderColorIdentity',
  label: 'Automatically restrict searches to commander\'s color identity (if applicable)',
  input: 'checkbox'
}, {
  id: 'restrictFunnyCards',
  label: 'Don\'t include funny cards when doing searches (adds not:funny to all searches)',
  input: 'checkbox'
}]

export default ScryfallSearch
