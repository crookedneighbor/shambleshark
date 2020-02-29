import Feature from '../../feature'
import { sections } from '../../constants'
import bus from 'framebus'
import mutation from 'Lib/mutation'
import scryfall from 'Lib/scryfall'
import deckParser from 'Lib/deck-parser'
import wait from 'Lib/wait'

const CARD_EVENTS = [
  'CLEANUP',
  'UPDATEENTRY',
  'REPLACEENTRY',
  'CREATEENTRY'
]

class CardInputModifier extends Feature {
  constructor () {
    super()

    this.imageCache = {}
    this.listeners = {}
  }

  async run () {
    bus.on('CALLED_DESTROYENTRY', async (data) => {
      // clean up our imageCache
      delete this.imageCache[data.payload]
    })

    CARD_EVENTS.forEach(method => {
      bus.on(`CALLED_${method}`, () => {
        this.refreshCache()
      })
    })

    mutation.ready('#card-tooltip', (tooltip) => {
      this.tooltipElement = tooltip
    })

    mutation.ready('.deckbuilder-entry', (entry) => {
      this.attachListenersToEntry(entry)
    })
  }

  attachListenersToEntry (entry, bustCache) {
    const id = entry.getAttribute('data-entry')

    if (!id) {
      return
    }

    if (id in this.listeners && entry === this.listeners[id]) {
      // already has listeners
      return
    }
    this.listeners[id] = entry

    this.lookupImage(id, bustCache)
    entry.addEventListener('mousemove', e => this.moveTooltip(e, entry))
    entry.addEventListener('mouseout', e => this.dismissTooltip(e))
  }

  getEntries (bustCache) {
    if (!this._getEntriesPromise || bustCache) {
      this._getEntriesPromise = scryfall.getDeck()
        .then(d => deckParser.flattenEntries(d, {
          idToGroupBy: 'id'
        }))
    }

    return this._getEntriesPromise
  }

  async lookupImage (id, bustCache) {
    if (!bustCache && id in this.imageCache) {
      return Promise.resolve(this.imageCache[id])
    }

    const entries = await this.getEntries(bustCache)
    const entry = entries.find(e => e.id === id)

    if (!entry) {
      return
    }

    const img = entry.card_digest && entry.card_digest.image

    this.imageCache[id] = img

    return img
  }

  async refreshCache () {
    // give Scryfall enough time to load new cards
    await wait(1000)

    const entries = await this.getEntries(true)
    entries.forEach(entry => {
      this.imageCache[entry.id] = entry.card_digest && entry.card_digest.image
    })
  }

  moveTooltip (event, entry) {
    // largley adapted from Scryfall's site, if that changes
    // this may also need ot be updated

    if (!this.tooltipElement) {
      return
    }

    if (window.innerWidth < 768) {
      // window is too small to bother with presenting card image
      return
    }

    const id = entry.getAttribute('data-entry')
    const img = this.imageCache[id]

    if (!img) {
      return
    }

    if (this.tooltipElement.style.display !== 'block') {
      this.tooltipElement.style.display = 'block'
    }

    this.tooltipElement.style.left = event.pageX + 50 + 'px'
    this.tooltipElement.style.top = event.pageY - 30 + 'px'

    const cardToolTipImg = document.getElementById('card-tooltip-img')

    if (cardToolTipImg.src !== img) {
      const t = document.createElement('img')
      t.id = 'card-tooltip-img'
      t.className = 'card'
      t.src = img

      this.tooltipElement.removeChild(cardToolTipImg)
      this.tooltipElement.appendChild(t)
    }
  }

  dismissTooltip () {
    if (!this.tooltipElement) {
      return
    }

    this.tooltipElement.style.display = 'none'
  }
}

CardInputModifier.metadata = {
  id: 'card-input-modifier',
  title: 'Card Input Modifier',
  section: sections.DECK_BUILDER,
  description: 'Modifiers for the card input.'
}

CardInputModifier.settingsDefaults = {
  enabled: true,
  showImageOnHover: true
}

CardInputModifier.settingDefinitions = [{
  id: 'showImageOnHover',
  label: 'Show card image when hovering over card input',
  input: 'checkbox'
}]

export default CardInputModifier
