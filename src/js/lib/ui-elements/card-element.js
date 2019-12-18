import bus from 'framebus'
import {
  CHECK_SYMBOL,
  PLUS_SYMBOL
} from '../../resources/svg'
import './card-element.css'

export default class CardElement {
  constructor (options = {}) {
    this.element = document.createElement('div')
    this.cardInDeck = false
    this.name = options.name
    this.img = options.img
    this.type = options.type
    if (options.getScryfallId) {
      this._getScryfallId = options.getScryfallId
    } else {
      this._getScryfallId = () => {
        return Promise.resolve(options.id)
      }
    }

    this.element.classList.add('edhrec-suggestion-card-container')
    this.element.setAttribute('role', 'button')
    this.element.setAttribute('tabindex', '0')
    this.element.setAttribute('aria-pressed', 'false')

    this.element.innerHTML = `
      <img src="${this.img}" alt="Add ${this.name} to deck" />
      <div class="edhrec-suggestion-overlay">
      ${PLUS_SYMBOL}
      </div>
      `
    this.img = this.element.querySelector('img')

    this.element.addEventListener('blur', () => {
      if (this.cardInDeck) {
        this.img.alt = `Remove ${this.name} from deck`
      } else {
        this.img.alt = `Add ${this.name} to deck`
      }
    })

    this.overlay = this.element.querySelector('.edhrec-suggestion-overlay')

    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.toggleCardState()
      }
    })

    this.element.addEventListener('click', () => {
      this.toggleCardState()

      this.element.blur()
    })
  }

  addCardToDeck () {
    this.element.setAttribute('aria-pressed', 'true')

    this.element.classList.add('in-deck')
    this.img.alt = `${this.name} added to deck.`
    this.overlay.innerHTML = CHECK_SYMBOL

    return this._getScryfallId().then(id => {
      bus.emit('ADD_CARD_TO_DECK', {
        cardName: this.name,
        cardId: id,
        isLand: this.type.toLowerCase().indexOf('land') > -1
      })
    }).catch(err => {
      console.error(err)

      bus.emit('SCRYFALL_PUSH_NOTIFICATION', {
        header: 'Card could not be added',
        message: `There was an error adding ${this.name} to the deck. See console for more details.`,
        color: 'red'
      })

      this.img.alt = `Error adding ${this.name} to deck.`
      this.element.classList.remove('in-deck')
      this.overlay.innerHTML = PLUS_SYMBOL
      this.cardInDeck = false
    })
  }

  removeCardFromDeck () {
    this.img.alt = `${this.name} removed from deck.`
    this.element.classList.remove('in-deck')
    this.overlay.innerHTML = PLUS_SYMBOL

    this.element.setAttribute('aria-pressed', 'false')
    bus.emit('REMOVE_CARD_FROM_DECK', {
      cardName: this.name
    })
  }

  // TODO: disable while update in progress?
  toggleCardState () {
    this.cardInDeck = !this.cardInDeck

    if (this.cardInDeck) {
      this.addCardToDeck()
    } else {
      this.removeCardFromDeck()
    }
  }
}
