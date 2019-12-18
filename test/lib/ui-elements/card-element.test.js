import bus from 'framebus'
import CardElement from '../../../src/js/lib/ui-elements/card-element'
import {
  CHECK_SYMBOL,
  PLUS_SYMBOL
} from '../../../src/js/resources/svg'

describe('CardElement', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'emit').mockImplementation()
  })

  it('calls toggleCardState when clicked', async function () {
    const cardEl = new CardElement({
      name: 'Arcane Denial',
      id: 'arcane-denial-id',
      type: 'Instant',
      img: 'https://example.com/arcane-signet'
    })

    jest.spyOn(cardEl, 'toggleCardState').mockImplementation()

    cardEl.element.click()

    expect(cardEl.toggleCardState).toBeCalledTimes(1)

    cardEl.element.click()

    expect(cardEl.toggleCardState).toBeCalledTimes(2)
  })

  it('calls toggleCardState when pressing enter while focussed', async function () {
    const cardEl = new CardElement({
      name: 'Arcane Denial',
      id: 'arcane-denial-id',
      type: 'Instant',
      img: 'https://example.com/arcane-signet'
    })
    const evt = new global.KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      which: 13
    })

    jest.spyOn(cardEl, 'toggleCardState').mockImplementation()

    // does not do anything if element is not the focus
    document.dispatchEvent(evt)
    expect(cardEl.toggleCardState).toBeCalledTimes(0)

    cardEl.element.dispatchEvent(evt)

    expect(cardEl.toggleCardState).toBeCalledTimes(1)

    cardEl.element.dispatchEvent(evt)

    expect(cardEl.toggleCardState).toBeCalledTimes(2)
  })

  describe('addCardToDeck', function () {
    it('emits event to add card to deck', async function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      await cardEl.addCardToDeck()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Arcane Denial',
        cardId: 'arcane-denial-id',
        isLand: false
      })
    })

    it('emits event to add card to deck with isLand property set to true when card is a land', async function () {
      const cardEl = new CardElement({
        name: 'Island',
        id: 'island-id',
        type: 'Basic Land - Island',
        img: 'https://example.com/island'
      })

      await cardEl.addCardToDeck()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Island',
        cardId: 'island-id',
        isLand: true
      })
    })

    it('updates card ui', async function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      expect(cardEl.element.classList.contains('in-deck')).toBe(false)
      expect(cardEl.img.alt).not.toBe('Arcane Denial added to deck.')
      expect(cardEl.overlay.innerHTML).not.toContain(CHECK_SYMBOL)

      await cardEl.addCardToDeck()

      expect(cardEl.element.classList.contains('in-deck')).toBe(true)
      expect(cardEl.img.alt).toBe('Arcane Denial added to deck.')
      expect(cardEl.overlay.innerHTML).toContain(CHECK_SYMBOL)
    })

    it('can pass a custom getScryfallId function', async function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet',
        getScryfallId () {
          return Promise.resolve('different-id')
        }
      })

      await cardEl.addCardToDeck()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Arcane Denial',
        cardId: 'different-id',
        isLand: false
      })
    })

    it('handles error when getScryfallId fails', async function () {
      const errFromScryfall = new Error('Error from scryfall')
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet',
        getScryfallId () {
          return Promise.reject(errFromScryfall)
        }
      })

      jest.spyOn(console, 'error').mockImplementation()

      await cardEl.addCardToDeck()

      expect(bus.emit).not.toBeCalledWith('ADD_CARD_TO_DECK', expect.any(Object))
      expect(bus.emit).toBeCalledWith('SCRYFALL_PUSH_NOTIFICATION', {
        header: 'Card could not be added',
        message: 'There was an error adding Arcane Denial to the deck. See console for more details.',
        color: 'red'
      })

      expect(cardEl.img.alt).toBe('Error adding Arcane Denial to deck.')
      expect(console.error).toBeCalledWith(errFromScryfall)
      expect(cardEl.cardInDeck).toBe(false)
      expect(cardEl.element.classList.contains('in-deck')).toBe(false)
      expect(cardEl.overlay.innerHTML).toContain(PLUS_SYMBOL)
    })
  })

  describe('removeCardFromDeck', function () {
    it('emits event to remove from deck', function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      cardEl.removeCardFromDeck()

      expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_DECK', {
        cardName: 'Arcane Denial'
      })
    })

    it('sets card element state to removed', async function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      await cardEl.addCardToDeck()

      expect(cardEl.img.alt).not.toBe('Arcane Denial removed from deck.')
      expect(cardEl.element.classList.contains('in-deck')).toBe(true)
      expect(cardEl.overlay.innerHTML).not.toContain(PLUS_SYMBOL)

      cardEl.removeCardFromDeck()

      expect(cardEl.img.alt).toBe('Arcane Denial removed from deck.')
      expect(cardEl.element.classList.contains('in-deck')).toBe(false)
      expect(cardEl.overlay.innerHTML).toContain(PLUS_SYMBOL)
    })
  })

  describe('toggleCardState', function () {
    it('adds card to deck if card is not already in deck', function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      expect(cardEl.cardInDeck).toBe(false)

      jest.spyOn(cardEl, 'addCardToDeck').mockImplementation()
      jest.spyOn(cardEl, 'removeCardFromDeck').mockImplementation()

      cardEl.toggleCardState()

      expect(cardEl.addCardToDeck).toBeCalledTimes(1)
      expect(cardEl.removeCardFromDeck).toBeCalledTimes(0)
    })

    it('removes card from deck if card is already in deck', function () {
      const cardEl = new CardElement({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type: 'Instant',
        img: 'https://example.com/arcane-signet'
      })

      cardEl.cardInDeck = true

      jest.spyOn(cardEl, 'addCardToDeck').mockImplementation()
      jest.spyOn(cardEl, 'removeCardFromDeck').mockImplementation()

      cardEl.toggleCardState()

      expect(cardEl.removeCardFromDeck).toBeCalledTimes(1)
      expect(cardEl.addCardToDeck).toBeCalledTimes(0)
    })
  })
})
