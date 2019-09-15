import wait from '../../src/js/lib/wait'
import Scryfall from '../../src/js/lib/scryfall-globals'
import setUpListeners from '../../src/js/scryfall-embed/set-up-listeners'
import bus from 'framebus'

describe('set up listeners on Scryfall page', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'on')
    jest.spyOn(Scryfall, 'getDeck')
    jest.spyOn(Scryfall, 'addCard')
    jest.spyOn(Scryfall, 'updateEntry')
    jest.spyOn(Scryfall, 'pushNotification').mockImplementation()
    jest.spyOn(Scryfall, 'cleanUp').mockImplementation()
  })

  it('listens for events', function () {
    setUpListeners()

    expect(bus.on).toBeCalledWith('REQUEST_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('ADD_CARD_TO_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('CLEAN_UP_DECK', expect.any(Function))
  })

  describe('REQUEST_DECK', function () {
    it('replies with the active deck passed into the setup script', function () {
      const fakeDeck = {}
      const spy = jest.fn()

      Scryfall.getDeck.mockResolvedValue(fakeDeck)
      bus.on.mockImplementation((event, cb) => {
        if (event === 'REQUEST_DECK') {
          cb(spy)
        }
      })

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.getDeck).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()
        expect(spy.mock.calls[0][0]).toBe(fakeDeck)
      })
    })
  })

  describe('ADD_CARD_FROM_EDHREC', function () {
    let cardData, scryfallCard

    beforeEach(function () {
      cardData = {
        cardName: 'Rashmi, Etrnities Crafter',
        cardId: 'id-1',
        isLand: false
      }
      scryfallCard = {}
      bus.on.mockImplementation((event, cb) => {
        if (event === 'ADD_CARD_TO_DECK') {
          cb(cardData)
        }
      })
      Scryfall.addCard.mockResolvedValue(scryfallCard)
      Scryfall.updateEntry.mockReturnValue()
      Scryfall.pushNotification.mockReturnValue()
    })

    it('adds card to active deck', function () {
      setUpListeners('active-deck-id')

      expect(Scryfall.addCard.mock.calls.length).toBe(1)
      expect(Scryfall.addCard.mock.calls[0][0]).toBe('id-1')
    })

    it('updates lands to be put in lands section', function () {
      cardData.isLand = true

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(1)
        expect(scryfallCard.section).toBe('lands')
        expect(Scryfall.updateEntry.mock.calls[0][0]).toBe(scryfallCard)
      })
    })

    it('does not update non-lands to be put in lands section', function () {
      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(0)
      })
    })

    it('sends a push notification', function () {
      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.pushNotification.mock.calls.length).toBe(1)
        expect(Scryfall.pushNotification.mock.calls[0]).toEqual(['Card Added', 'Added Rashmi, Etrnities Crafter.', 'purple', 'deck'])
      })
    })
  })

  describe('CLEAN_UP_DECK', function () {
    beforeEach(function () {
      bus.on.mockImplementation((event, cb) => {
        if (event === 'CLEAN_UP_DECK') {
          cb()
        }
      })
    })

    it('calls cleanup', function () {
      setUpListeners('active-deck-id')

      expect(Scryfall.cleanUp).toBeCalledTimes(1)
    })
  })
})
