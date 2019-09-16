import {
  getDeck
} from '../../src/js/lib/scryfall'
import bus from 'framebus'

describe('scryfall', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'emit')
  })

  describe('getDeck', function () {
    it('requests deck from Scryfall page', async function () {
      let deck = {}

      bus.emit.mockImplementation((event, cb) => {
        cb(deck)
      })

      let resolvedDeck = await getDeck()

      expect(resolvedDeck).toEqual(deck)
      expect(bus.emit).toBeCalledWith('REQUEST_DECK', expect.any(Function))
    })
  })
})
