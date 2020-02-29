import {
  getDeck
} from 'Lib/scryfall'
import bus from 'framebus'

describe('scryfall', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'emit')
  })

  describe('getDeck', function () {
    beforeEach(function () {
      jest.useFakeTimers()
    })

    afterEach(function () {
      jest.runAllTimers()
    })

    it('requests deck from Scryfall page', async function () {
      const deck = {}

      bus.emit.mockImplementation((event, cb) => {
        cb(deck)
      })

      const resolvedDeck = await getDeck()

      expect(resolvedDeck).toEqual(deck)
      expect(bus.emit).toBeCalledWith('REQUEST_DECK', expect.any(Function))
    })

    it('caches result if request is made a second time within 2 seconds', async function () {
      const firstDeck = { id: '1' }
      const secondDeck = { id: '2' }

      bus.emit.mockImplementationOnce((event, cb) => {
        cb(firstDeck)
      })
      bus.emit.mockImplementationOnce((event, cb) => {
        cb(secondDeck)
      })

      const resolvedDeck = await getDeck()

      jest.advanceTimersByTime(1999)

      const compareDeck = await getDeck()

      expect(resolvedDeck).toEqual(firstDeck)
      expect(resolvedDeck).toEqual(compareDeck)
      expect(compareDeck).toEqual(firstDeck)

      jest.advanceTimersByTime(2)

      const deckAfterTimeout = await getDeck()

      expect(deckAfterTimeout).not.toEqual(resolvedDeck)
      expect(deckAfterTimeout).toEqual(secondDeck)
    })
  })
})
