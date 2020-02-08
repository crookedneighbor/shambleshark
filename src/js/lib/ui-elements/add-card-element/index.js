import bus from 'framebus'
import {
  CHECK_SYMBOL,
  MINUS_SYMBOL,
  PLUS_SYMBOL
} from '../../../resources/svg'
import injectCSS from '../../inject-css'
import css from './index.css'

injectCSS(css)

export default class AddCardElement {
  constructor (options = {}) {
    this.element = document.createElement('div')
    this.quantity = options.quantity || 0
    this.id = options.id
    this.name = options.name
    this.img = options.img
    this.type = options.type
    this.singleton = Boolean(options.singleton)
    this.onAddCard = options.onAddCard

    if (options.getScryfallId) {
      this._getScryfallId = options.getScryfallId
    } else {
      this._getScryfallId = () => {
        return Promise.resolve(this.id)
      }
    }

    this.element.classList.add('add-card-element-container')

    this.element.innerHTML = `
      <img src="${this.img}"/>
      <div class="add-card-element-overlay">
        <div role="button" tabindex="0" class="add-card-element__panel minus-symbol">
          ${MINUS_SYMBOL}
        </div>
        <div role="button" tabindex="0" class="add-card-element__panel plus-symbol">
          ${PLUS_SYMBOL}
        </div>
        <div class="metadata"></div>
      </div>
      `
    this.img = this.element.querySelector('img')
    this.overlay = this.element.querySelector('.add-card-element-overlay')
    this.minusButton = this.overlay.querySelector('.minus-symbol')
    this.plusButton = this.overlay.querySelector('.plus-symbol')
    this.metadata = this.overlay.querySelector('.metadata')

    if (this.singleton) {
      this.minusButton.innerHTML = CHECK_SYMBOL
      this.minusButton.classList.add('solo')
      this.plusButton.classList.add('solo')
    }

    this.updateUI()

    this._setupListeners()
  }

  _setupListeners () {
    this.plusButton.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return
      }

      this.addCardToDeck()
    })

    this.plusButton.addEventListener('click', () => {
      this.addCardToDeck()
    })

    this.minusButton.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return
      }

      this.removeCardFromDeck()

      if (!this.cardInDeck()) {
        this.plusButton.focus()
      }
    })

    this.minusButton.addEventListener('click', () => {
      this.removeCardFromDeck()

      if (!this.cardInDeck()) {
        this.minusButton.blur()
      }
    })
  }

  setMetadata (value) {
    if (value) {
      this.metadata.innerHTML = value
      return
    }

    if (this.singleton) {
      return
    }

    if (!this.cardInDeck()) {
      this.metadata.innerHTML = ''
    } else {
      this.metadata.innerHTML = this.quantity + 'x'
    }
  }

  updateUI () {
    this.minusButton.classList.toggle('hidden', !this.cardInDeck())
    this.plusButton.classList.toggle('solo', !this.cardInDeck())

    this.setMetadata()

    if (this.singleton) {
      this.plusButton.classList.toggle('hidden', this.cardInDeck())
    }

    this.element.classList.toggle('in-deck', this.cardInDeck())
  }

  cardInDeck () {
    return this.quantity > 0
  }

  addCardToDeck () {
    this.quantity++

    this.updateUI()

    return this._getScryfallId().then(id => {
      const payload = {
        cardName: this.name,
        cardId: id
      }

      if (this.onAddCard) {
        this.onAddCard(payload)
      }

      bus.emit('ADD_CARD_TO_DECK', payload)
    }).catch(err => {
      this.quantity--

      console.error(err)

      bus.emit('SCRYFALL_PUSH_NOTIFICATION', {
        header: 'Card could not be added',
        message: `There was an error adding ${this.name} to the deck. See console for more details.`,
        color: 'red'
      })

      this.updateUI()
    })
  }

  removeCardFromDeck () {
    this.quantity--

    this.updateUI()

    bus.emit('REMOVE_CARD_FROM_DECK', {
      cardName: this.name
    })
  }

  toggleAppearance (shouldHide) {
    this.element.classList.toggle('hidden', shouldHide)
  }
}
