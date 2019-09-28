import {
  hasLegalCommanders
} from '../../src/js/lib/deck-parser'
import {
  api as scryfall
} from '../../src/js/lib/scryfall'

describe('Deck Parser', function () {
  describe('hasLegalCommanders', function () {
    beforeEach(function () {
      jest.spyOn(scryfall, 'get')
    })

    it('returns false if deck has a commanders section, but no commanders', async function () {
      const commanders = []

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false)
    })

    it('returns true if deck has a commanders section and all cards in it are legal commanders', async function () {
      const commanders = [
        'Sidar Kondo of Jamuraa',
        'Tana the Bloodsower'
      ]

      scryfall.get.mockResolvedValue({})

      await expect(hasLegalCommanders(commanders)).resolves.toBe(true)
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: '!"Sidar Kondo of Jamuraa" is:commander'
      })
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: '!"Tana the Bloodsower" is:commander'
      })
    })

    it('returns false if deck has a commanders section and any cards in it are not legal commanders', async function () {
      const commanders = [
        'Tana the Bloodsower',
        'Craterhoof Behemoth'
      ]

      scryfall.get.mockResolvedValueOnce({})
      scryfall.get.mockRejectedValueOnce(new Error('404'))

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false)
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: '!"Tana the Bloodsower" is:commander'
      })
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: '!"Craterhoof Behemoth" is:commander'
      })
    })
  })
})
