import Feature from 'Feature'
import CardTooltip from 'Ui/card-tooltip'
import mutation from 'Lib/mutation'
import scryfall from 'Lib/scryfall'
import {
  sortByAttribute
} from 'Lib/sort'
import createElement from 'Lib/create-element'
import {
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
  SPINNER_GIF
} from 'Constants'

import './index.css'

class TokenList extends Feature {
  constructor () {
    super()

    this.tooltip = new CardTooltip({
      onMouseover: (el) => {
        const img = el.getAttribute('data-scryfall-image')

        this.tooltip.setImage(img)
      }
    })
  }

  async run () {
    mutation.ready('.sidebar', async (container) => {
      this.createUI(container)

      const tokens = await this.generateTokenCollection()

      this.addToUI(tokens)
    })
  }

  createUI (container) {
    const section = createElement(`<div>
      <p class="deck-details-subtitle token-list-title"><strong>Tokens</strong></p>
      <img src="${SPINNER_GIF}" class="token-list-loading modal-dialog-spinner" aria-hidden="true">
      <ul class="token-list-container deck-details-description"></ul>
    </div>`).firstChild
    section.classList.add('sidebar-toolbox')

    this.tokenListContainer = section.querySelector('.token-list-container')
    this.spinner = section.querySelector('.token-list-loading')

    container.appendChild(section)
  }

  addToUI (tokens) {
    this.spinner.classList.add('hidden')

    if (tokens.length === 0) {
      this.tokenListContainer.appendChild(createElement('<li>No tokens detected.</li>'))

      return
    }

    tokens.forEach(token => {
      const el = createElement(`
        <li data-scryfall-image="${token.getImage()}">
          <a href="${token.scryfall_uri}">${token.name}</a>
        </li>
      `).firstChild

      this.tooltip.addElement(el)
      this.tokenListContainer.appendChild(el)
    })
  }

  lookupCardCollection (cards) {
    return scryfall.api.post('/cards/collection', {
      identifiers: cards
    })
  }

  async generateTokenCollection () {
    this.needsUpdate = false

    const elements = Array.from(document.querySelectorAll('.deck-list-entry .deck-list-entry-name a'))
    const entries = elements.map(el => this.parseSetAndCollectorNumber(el.href))

    const tokenCollection = await this.lookupTokens(entries)

    return this.flattenTokenCollection(tokenCollection)
  }

  parseSetAndCollectorNumber (url) {
    const parts = url.split('https://scryfall.com/card/')[1].split('/')
    const set = parts[0]
    const number = parts[1]

    return {
      set,
      collector_number: number
    }
  }

  async lookupTokens (entries) {
    const entriesInBatches = entries.reduce((array, entry, i) => {
      if (i % 75 !== 0) {
        return array
      }

      return array.concat([entries.slice(i, i + 75)])
    }, [])

    const cardCollections = await Promise.all(
      entriesInBatches.map(e => this.lookupCardCollection(e))
    )
    const tokens = cardCollections.flat().map(c => c.getTokens())

    return Promise.all(tokens)
  }

  flattenTokenCollection (tokenCollection) {
    const flattenedTokens = tokenCollection.flat().reduce((tokens, token) => {
      if (!tokens.find(t => t.oracle_id === token.oracle_id)) {
        tokens.push(token)
      }

      return tokens
    }, [])

    flattenedTokens.sort(sortByAttribute({
      attributes: ['name']
    }))

    return flattenedTokens
  }
}

TokenList.metadata = {
  id: ids.TokenList,
  title: 'Token List',
  section: sections.DECK_VIEW,
  description: 'List tokens created by cards in the deck.'
}
TokenList.settingsDefaults = {
  enabled: true
}

export default TokenList
