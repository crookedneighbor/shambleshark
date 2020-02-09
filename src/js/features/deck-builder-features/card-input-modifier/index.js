import Feature from '../../feature'
import { sections } from '../../constants'
import mutation from '../../../lib/mutation'
import scryfall from '../../../lib/scryfall'
import deckParser from '../../../lib/deck-parser'
import wait from '../../../lib/wait'

class CardInputModifier extends Feature {
  constructor () {
    super()

    this.idCache = {}
  }

  async run () {
    mutation.ready('#card-tooltip', (tooltip) => {
      this.tooltipElement = tooltip

      mutation.ready('.deckbuilder-entry', async (entry) => {
        const id = entry.getAttribute('data-entry')
        const textarea = entry.querySelector('.deckbuilder-entry-input')
        const hasValue = textarea.value

        if (hasValue) {
          this.lookupImage(id)
        }

        entry.addEventListener('mousemove', e => this.moveTooltip(e, id))
        entry.addEventListener('mouseout', e => this.dismissTooltip(e))
        textarea.addEventListener('change', () => this.refreshImage(id))
      })
    })
  }

  async lookupImage (id, bustCache) {
    if (!bustCache && id in this.idCache) {
      return Promise.resolve(this.idCache[id])
    }

    if (!this._getEntriesPromise || bustCache) {
      this._getEntriesPromise = scryfall.getDeck()
        .then(d => deckParser.flattenEntries(d, {
          idToGroupBy: 'id'
        }))
    }

    const entries = await this._getEntriesPromise
    const entry = entries.find(e => e.id === id)

    if (!entry) {
      return
    }

    const img = entry.card_digest && entry.card_digest.image

    this.idCache[id] = img

    return img
  }

  async refreshImage (id) {
    delete this.idCache[id]

    // give Scryfall enough time to load new card
    await wait(1000)

    this.lookupImage(id, true)
  }

  moveTooltip (event, id) {
    // largley adapted from Scryfall's site, if that changes
    // this may also need ot be updated

    if (window.innerWidth < 768) {
      // window is too small to bother with presenting card image
      return
    }

    const img = this.idCache[id]

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
