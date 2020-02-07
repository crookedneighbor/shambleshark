import {
  reset,
  addCard,
  cleanUp,
  getActiveDeck,
  getActiveDeckId,
  getDeck,
  hasDedicatedLandSection,
  modifyCleanup,
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

    it('skips api call if the deck id is available on the window', function () {
      global.Scryfall.deckbuilder.deckId = 'deck-id-from-window'

      return getActiveDeckId().then((id) => {
        expect(id).toBe('deck-id-from-window')
        expect(global.ScryfallAPI.decks.active).not.toBeCalled()
      })
    })
  })

  describe('hasDedicatedLandSection', function () {
    beforeEach(function () {
      reset()
    })

    it('resolves with false if deck does not have a lands section', function () {
      return hasDedicatedLandSection().then(res => {
        expect(res).toBe(false)
      })
    })

    it('resolves with false if deck does not have a lands section', function () {
      fakeDeck.sections.secondary.push('lands')

      return hasDedicatedLandSection().then(res => {
        expect(res).toBe(true)
      })
    })

    it('catches result after first run to avoid multiple api calls', function () {
      return hasDedicatedLandSection().then(res => {
        expect(global.ScryfallAPI.decks.get).toBeCalledTimes(1)

        return hasDedicatedLandSection()
      }).then(res => {
        expect(global.ScryfallAPI.decks.get).toBeCalledTimes(1)
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

  describe('modifyCleanUp', function () {
    let originalCleanupFunction

    beforeEach(function () {
      reset()
      originalCleanupFunction = global.Scryfall.deckbuilder.cleanUp
      global.ScryfallAPI.decks.updateEntry.mockImplementation((deckId, cardToUpdate, cb) => {
        cb()
      })
    })

    afterEach(function () {
      global.Scryfall.deckbuilder.cleanUp = originalCleanupFunction
    })

    it('replaces the cleanup function', function () {
      modifyCleanup()

      const newCleanupFunction = global.Scryfall.deckbuilder.cleanUp

      expect(newCleanupFunction).not.toEqual(originalCleanupFunction)
    })

    it('moves lands in nonlands section back to lands section when configured', async function () {
      modifyCleanup({
        cleanUpLandsInSingleton: true
      })

      fakeDeck.sections.primary.push('nonlands')
      fakeDeck.sections.secondary.push('lands')
      fakeDeck.entries.lands = []
      fakeDeck.entries.nonlands = [{
        id: 'card-without-a-digest',
        section: 'nonlands'
      }, {
        id: 'card-with-land-type',
        section: 'nonlands',
        card_digest: {
          type_line: 'Land'
        }
      }, {
        id: 'card-with-non-land-type',
        section: 'nonlands',
        card_digest: {
          type_line: 'Creature'
        }
      }, {
        id: 'another-card-with-land-type',
        section: 'nonlands',
        card_digest: {
          type_line: 'Basic Land - Mountain'
        }
      }]

      await global.Scryfall.deckbuilder.cleanUp()

      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledTimes(2)
      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith('deck-id', {
        id: 'card-with-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Land'
        }
      }, expect.any(Function))
      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith('deck-id', {
        id: 'another-card-with-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Basic Land - Mountain'
        }
      }, expect.any(Function))
    })

    it('moves nonlands in lands section back to nonlands section when configured', async function () {
      modifyCleanup({
        cleanUpLandsInSingleton: true
      })

      fakeDeck.sections.primary.push('nonlands')
      fakeDeck.sections.secondary.push('lands')
      fakeDeck.entries.nonlands = []
      fakeDeck.entries.lands = [{
        id: 'card-without-a-digest',
        section: 'lands'
      }, {
        id: 'card-with-non-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Creature'
        }
      }, {
        id: 'card-with-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Basic Land - Mountain'
        }
      }, {
        id: 'another-card-with-non-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Enchantment'
        }
      }]

      await global.Scryfall.deckbuilder.cleanUp()

      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledTimes(2)
      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith('deck-id', {
        id: 'card-with-non-land-type',
        section: 'nonlands',
        card_digest: {
          type_line: 'Creature'
        }
      }, expect.any(Function))
      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledWith('deck-id', {
        id: 'another-card-with-non-land-type',
        section: 'nonlands',
        card_digest: {
          type_line: 'Enchantment'
        }
      }, expect.any(Function))
    })

    it('does not update if nothing is available to update', async function () {
      modifyCleanup({
        cleanUpLandsInSingleton: true
      })

      fakeDeck.sections.primary.push('nonlands')
      fakeDeck.sections.secondary.push('lands')
      fakeDeck.entries.nonlands = [{
        id: 'card-without-a-digest',
        section: 'lands'
      }, {
        id: 'card-with-non-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Creature'
        }
      }]
      fakeDeck.entries.lands = [{
        id: 'card-without-a-digest',
        section: 'lands'
      }, {
        id: 'card-with-land-type',
        section: 'lands',
        card_digest: {
          type_line: 'Basic Land - Mountain'
        }
      }]

      await global.Scryfall.deckbuilder.cleanUp()

      expect(global.ScryfallAPI.decks.updateEntry).toBeCalledTimes(0)
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
