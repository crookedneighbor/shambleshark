import {
  addCard,
  getActiveDeck,
  getDeck,
  updateEntry,
  pushNotification
} from '../../src/js/lib/scryfall-globals'

describe('Scryfall Globals', function () {
  beforeEach(function () {
    const fakeDeck = {
      id: 'deck-id'
    }
    global.ScryfallAPI = {
      decks: {
        active: jest.fn().mockImplementation((cb) => {
          cb(fakeDeck)
        }),
        addCard: jest.fn(),
        get: jest.fn(),
        updateEntry: jest.fn()
      }
    }

    global.Scryfall = {
      pushNotification: jest.fn()
    }
  })

  describe('getActiveDeck', function () {
    it('resolves with the active deck', function () {
      return getActiveDeck().then((deck) => {
        expect(deck.id).toBe('deck-id')
      })
    })
  })

  describe('getDeck', function () {
    it('gets the active deck', function () {
      const deck = { id: 'deck-id' }

      global.ScryfallAPI.decks.get.mockImplementation((id, cb) => {
        cb(deck)
      })

      return getDeck().then((resolvedDeck) => {
        expect(global.ScryfallAPI.decks.get).toBeCalledWith('deck-id', expect.any(Function))

        expect(deck).toBe(resolvedDeck)
      })
    })
  })

  describe('addCard', function () {
    it('resolves with the card', function () {
      const card = {}

      global.ScryfallAPI.decks.addCard.mockImplementation((deckId, cardId, cb) => {
        cb(card)
      })

      return addCard('card-id').then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.addCard).toBeCalledWith('deck-id', 'card-id', expect.any(Function))

        expect(card).toBe(resolvedCard)
      })
    })
  })

  describe('updateEntry', function () {
    it('resolves with the card', function () {
      const cardToUpdate = { id: 'card-id' }
      const card = {}

      global.ScryfallAPI.decks.updateEntry.mockImplementation((deckId, cardToUpdate, cb) => {
        cb(card)
      })

      return updateEntry(cardToUpdate).then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith('deck-id', cardToUpdate, expect.any(Function))

        expect(card).toBe(resolvedCard)
      })
    })
  })

  describe('pushNotification', function () {
    it('sends a push notification', function () {
      return pushNotification('Title', 'message', 'color', 'category').then(function () {
        expect(global.Scryfall.pushNotification).toBeCalledTimes(1)
        expect(global.Scryfall.pushNotification).toBeCalledWith('Title', 'message', 'color', 'category')
      })
    })
  })
})
