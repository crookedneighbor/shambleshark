import Feature from '../../feature'
import bus from 'framebus'
import { sections } from '../../constants'
import Drawer from '../../../lib/ui-elements/drawer'
import AddCardElement from '../../../lib/ui-elements/add-card-element'
import { api } from '../../../lib/scryfall'

// TODO
// add multiples
// fix ff style

class ScryfallSearch extends Feature {
  async run () {
    this.drawer = this.createDrawer()

    document.getElementById('header-search-field').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') {
        return
      }
      e.preventDefault()

      this.onEnter(e.target.value)
    })
  }

  onEnter(query) {
    this.drawer.open()

    api.get('cards/search', {
      q: query
    }).then(cards => {
      this.cardList = cards
      this.addCards()
      this.drawer.setLoading(false)
    })
  }

  addCards () {
    this.cardList.forEach(card => {
      const addCardEl = new AddCardElement({
        cardInDeck: false, // TODO
        id: card.id,
        name: card.name,
        img: card.getImage(),
        type: card.type_line
      })

      this.container.appendChild(addCardEl.element)
    })
  }

  isReadyToLookupNextBatch (el) {
    if (self._nextInProgress || !self.cardList || !self.cardList.has_more) {
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
      onScroll (el) {
        if (!self.isReadyToLookupNextBatch(el)) {
          return
        }

        self._nextInProgress = true

        self.cardList.next().then(cards => {
          self.cardList = cards
          self.addCards()
          self._nextInProgress = false
        })
      },
      onClose (drawerInstance) {
        self.cardList = null
        bus.emit('CLEAN_UP_DECK')

        // reset this in case the error state changes it
        drawerInstance.setLoading(true)
        drawerInstance.resetHeader()
        self.container.innerHTML = ''

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
  description: 'Search for Scryfall cards right inside the deckbuilder! You can save the searches for later too!'
}

ScryfallSearch.settingsDefaults = {
  enabled: true
}

export default ScryfallSearch
