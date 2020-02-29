import wait from 'Lib/wait'
import Scryfall from '../../src/js/scryfall-embed/scryfall-globals'
import modifyCleanUp from '../../src/js/scryfall-embed/modify-clean-up'
import setUpListeners from '../../src/js/scryfall-embed/set-up-listeners'
import bus from 'framebus'

describe('set up listeners on Scryfall page', function () {
  beforeEach(function () {
    window.ScryfallAPI = {}
    window.Scryfall = {
      deckbuilder: {}
    }

    jest.spyOn(bus, 'on')
    jest.spyOn(bus, 'emit')
    jest.spyOn(Scryfall, 'getDeck')
    jest.spyOn(Scryfall, 'getDeckMetadata').mockResolvedValue({
      sections: {
        primary: ['mainboard'],
        secondary: ['sideboard']
      }
    })
    jest.spyOn(Scryfall, 'addCard')
    jest.spyOn(Scryfall, 'updateEntry').mockResolvedValue()
    jest.spyOn(Scryfall, 'removeEntry').mockResolvedValue()
    jest.spyOn(Scryfall, 'pushNotification').mockImplementation()
    jest.spyOn(Scryfall, 'cleanUp').mockImplementation()
    jest.spyOn(Scryfall, 'addHooksToCardManagementEvents').mockImplementation()
  })

  it('it does not listen for events if there is no Scryfall API object', function () {
    delete window.ScryfallAPI

    setUpListeners()

    expect(bus.on).not.toBeCalled()
  })

  it('it does not listen for events if there is no Scryfall.deckbuilder object', function () {
    delete window.Scryfall.deckbuilder

    setUpListeners()

    expect(bus.on).not.toBeCalled()
  })

  it('it does not listen for events if there is no Scryfall object', function () {
    delete window.Scryfall

    setUpListeners()

    expect(bus.on).not.toBeCalled()
  })

  it('listens for events', function () {
    setUpListeners()

    expect(bus.on).toBeCalledWith('REQUEST_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('SCRYFALL_PUSH_NOTIFICATION', expect.any(Function))
    expect(bus.on).toBeCalledWith('ADD_CARD_TO_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('REMOVE_CARD_FROM_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('CLEAN_UP_DECK', expect.any(Function))
    expect(bus.on).toBeCalledWith('MODIFY_CLEAN_UP', modifyCleanUp)
  })

  it('reports that listeners are ready', function () {
    setUpListeners()

    expect(bus.emit).toBeCalledWith('SCRYFALL_LISTENERS_READY')
  })

  it('adds hooks to card management events', function () {
    setUpListeners()

    expect(Scryfall.addHooksToCardManagementEvents).toBeCalledTimes(1)
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

  describe('SCRYFALL_PUSH_NOTIFICATION', function () {
    let pushData

    beforeEach(function () {
      bus.on.mockImplementation((event, cb) => {
        if (event === 'SCRYFALL_PUSH_NOTIFICATION') {
          cb(pushData)
        }
      })
    })

    it('sends a push notification', function () {
      pushData = {
        header: 'header',
        message: 'message',
        color: 'blue',
        type: 'foo'
      }

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.pushNotification.mock.calls.length).toBe(1)
        expect(Scryfall.pushNotification.mock.calls[0]).toEqual(['header', 'message', 'blue', 'foo'])
      })
    })

    it('defaults push notification color to purple', function () {
      pushData = {
        header: 'header',
        message: 'message',
        type: 'foo'
      }

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.pushNotification.mock.calls.length).toBe(1)
        expect(Scryfall.pushNotification.mock.calls[0]).toEqual(['header', 'message', 'purple', 'foo'])
      })
    })

    it('defaults push notification type to deck', function () {
      pushData = {
        header: 'header',
        message: 'message',
        color: 'blue'
      }

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.pushNotification.mock.calls.length).toBe(1)
        expect(Scryfall.pushNotification.mock.calls[0]).toEqual(['header', 'message', 'blue', 'deck'])
      })
    })
  })

  describe('ADD_CARD_TO_DECK', function () {
    let cardData, scryfallCard

    beforeEach(function () {
      cardData = {
        cardName: 'Rashmi, Etrnities Crafter',
        cardId: 'id-1'
      }
      scryfallCard = {
        card_digest: {
          type_line: 'Creature'
        }
      }
      bus.on.mockImplementation((event, cb) => {
        if (event === 'ADD_CARD_TO_DECK') {
          cb(cardData)
        }
      })
      Scryfall.addCard.mockResolvedValue(scryfallCard)
      Scryfall.updateEntry.mockReturnValue()
    })

    it('adds card to active deck', function () {
      setUpListeners('active-deck-id')

      expect(Scryfall.addCard.mock.calls.length).toBe(1)
      expect(Scryfall.addCard.mock.calls[0][0]).toBe('id-1')
    })

    it('updates card for specific section if section is specified', function () {
      cardData.section = 'sideboard'

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(1)
        expect(scryfallCard.section).toBe('sideboard')
        expect(Scryfall.updateEntry.mock.calls[0][0]).toBe(scryfallCard)
      })
    })

    it('updates card for specific section if section is specified even when card is a land card and there is a dedicated land section', function () {
      cardData.section = 'sideboard'
      scryfallCard.card_digest.type_line = 'Land'
      Scryfall.getDeckMetadata.mockResolvedValue({
        sections: {
          mainboard: ['lands']
        }
      })

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(1)
        expect(scryfallCard.section).toBe('sideboard')
        expect(Scryfall.updateEntry.mock.calls[0][0]).toBe(scryfallCard)
      })
    })

    it('updates lands to be put in lands section if deck has dedicated lands section and no section is specified', function () {
      scryfallCard.card_digest.type_line = 'Land'
      Scryfall.getDeckMetadata.mockResolvedValue({
        sections: {
          mainboard: ['lands']
        }
      })

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(1)
        expect(scryfallCard.section).toBe('lands')
        expect(Scryfall.updateEntry.mock.calls[0][0]).toBe(scryfallCard)
      })
    })

    it('does not update lands to be put in lands section if deck does not have dedicated lands section', function () {
      scryfallCard.card_digest.type_line = 'Land'

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.mock.calls.length).toBe(0)
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

  describe('REMOVE_CARD_FROM_DECK', function () {
    let cardData

    beforeEach(function () {
      cardData = {
        cardName: 'Rashmi, Etrnities Crafter'
      }
      bus.on.mockImplementation((event, cb) => {
        if (event === 'REMOVE_CARD_FROM_DECK') {
          cb(cardData)
        }
      })
      Scryfall.getDeck.mockResolvedValue({
        entries: {
          commanders: [{
            id: 'rashmi-id',
            count: 1,
            card_digest: {
              name: 'Rashmi, Etrnities Crafter'
            }
          }, {
            // empty object, no card info
          }],
          nonlands: [{
            id: 'birds-id',
            count: 2,
            card_digest: {
              name: 'Birds of Paradise'
            }
          }]
        }
      })
    })

    it('removes card from deck if there was only 1 left', async function () {
      setUpListeners('active-deck-id')

      await wait(5)

      expect(Scryfall.removeEntry).toBeCalledTimes(1)
      expect(Scryfall.removeEntry).toBeCalledWith('rashmi-id')
    })

    it('decrements count if card has more than 1 entry', async function () {
      cardData.cardName = 'Birds of Paradise'

      setUpListeners('active-deck-id')

      await wait(5)

      expect(Scryfall.removeEntry).toBeCalledTimes(0)
      expect(Scryfall.updateEntry).toBeCalledTimes(1)
      expect(Scryfall.updateEntry).toBeCalledWith({
        id: 'birds-id',
        count: 1,
        card_digest: {
          name: 'Birds of Paradise'
        }
      })
    })

    it('sends a push notification', async function () {
      setUpListeners('active-deck-id')

      await wait(5)

      expect(Scryfall.pushNotification).toBeCalledTimes(1)
      expect(Scryfall.pushNotification).toBeCalledWith('Card Removed', 'Removed Rashmi, Etrnities Crafter.', 'purple', 'deck')
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
