import {
  addCard,
  cleanUp,
  getActiveDeck,
  getActiveDeckId,
  getDeck,
  getDeckMetadata,
  removeEntry,
  updateEntry,
  pushNotification
} from '../../src/js/scryfall-embed/scryfall-globals'

describe('Scryfall Globals', function () {
  let fakeDeck

  beforeEach(function () {
    fakeDeck = {
      id: 'deck-id',
      sections: {
        primary: ['mainboard'],
        secondary: ['sideboard', 'maybeboard']
      },
      entries: {
        mainboard: [],
        sideboard: [],
        maybeboard: []
      }
    }
    global.ScryfallAPI = {
      grantSecret: 'secret',
      decks: {
        active: jest.fn().mockImplementation((cb) => {
          cb(fakeDeck)
        }),
        addCard: jest.fn(),
        destroyEntry: jest.fn(),
        get: jest.fn().mockImplementation((id, cb) => {
          cb(fakeDeck)
        }),
        updateEntry: jest.fn()
      }
    }

    global.Scryfall = {
      deckbuilder: {
        cleanUp: jest.fn()
      },
      pushNotification: jest.fn()
    }
  })

  describe('getActiveDeckId', function () {
    it('calls getActiveDeck to get the active deck', function () {
      return getActiveDeckId().then((id) => {
        expect(id).toBe('deck-id')
      })
    })

    it('waits progressively longer for grant secret', async function () {
      let hasResolved = false
      jest.useFakeTimers()
      delete global.ScryfallAPI.grantSecret

      const getActiveDeckIdPromise = getActiveDeckId().then(() => {
        hasResolved = true
      })

      expect(hasResolved).toBe(false)

      await Promise.resolve().then(() => jest.advanceTimersByTime(300))

      expect(hasResolved).toBe(false)

      global.ScryfallAPI.grantSecret = 'secret'

      await Promise.resolve().then(() => jest.advanceTimersByTime(10000))

      await getActiveDeckIdPromise

      expect(hasResolved).toBe(true)
    })

    it('skips api call if the deck id is available on the window', function () {
      global.Scryfall.deckbuilder.deckId = 'deck-id-from-window'

      return getActiveDeckId().then((id) => {
        expect(id).toBe('deck-id-from-window')
        expect(global.ScryfallAPI.decks.active).not.toBeCalled()
      })
    })
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

  describe('getDeckMetadata', function () {
    it('gets the metadata from active deck', function () {
      const deck = { id: 'deck-id', sections: {}, foo: 'bar' }

      global.ScryfallAPI.decks.get.mockImplementation((id, cb) => {
        cb(deck)
      })

      return getDeckMetadata().then(meta => {
        expect(global.ScryfallAPI.decks.get).toBeCalledWith('deck-id', expect.any(Function))

        expect(meta).toEqual({
          id: 'deck-id',
          sections: {}
        })
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

  describe('removeEntry', function () {
    it('calls destroy API', function () {
      const data = {}

      global.ScryfallAPI.decks.destroyEntry.mockImplementation((deckId, cardId, cb) => {
        cb(data)
      })

      return removeEntry('card-id').then((result) => {
        expect(global.ScryfallAPI.decks.destroyEntry).toBeCalledWith('deck-id', 'card-id', expect.any(Function))
        expect(result).toBeFalsy()
      })
    })
  })

  describe('cleanUp', function () {
    it('resolves after cleaning up', function () {
      return cleanUp().then(() => {
        expect(global.Scryfall.deckbuilder.cleanUp).toBeCalledTimes(1)
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
