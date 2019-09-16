import {
  hasLegalCommanders,
  isCommanderLikeDeck
} from '../../src/js/lib/deck-parser'
import {
  api as scryfall
} from '../../src/js/lib/scryfall'

describe('Deck Parser', function () {
  describe('isCommanderLikeDeck', function () {
    it('returns false if deck has no commanders section', async function () {
      const deck = {
        entries: {
          lands: [],
          nonlands: []
        }
      }

      expect(isCommanderLikeDeck(deck)).resolves.toBe(false)
    })

    it('returns true if deck has a commanders section', async function () {
      const deck = {
        entries: {
          commanders: [],
          lands: [],
          nonlands: []
        }
      }

      expect(isCommanderLikeDeck(deck)).resolves.toBe(true)
    })
  })

  describe('hasLegalCommanders', function () {
    beforeEach(function () {
      jest.spyOn(scryfall, 'get')
    })

    it('returns false if deck has a commanders section, but no commanders', async function () {
      const commanders = []

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false)
    })

    it('returns true if deck has a commanders section, but no card digest info in section', async function () {
      const commanders = [{
        id: 'id'
      }, {
        id: 'other-id'
      }]

      await expect(hasLegalCommanders(commanders)).resolves.toBe(false)
    })

    it('returns true if deck has a commanders section and all cards in it are legal commanders', async function () {
      const commanders = [{
        card_digest: {
          name: 'Sidar Kondo of Jamuraa'
        },
        id: 'id'
      }, {
        card_digest: {
          name: 'Tana the Bloodsower'
        },
        id: 'other-id'
      }]

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
      const commanders = [{
        card_digest: {
          name: 'Tana the Bloodsower'
        },
        id: 'id'
      }, {
        card_digest: {
          name: 'Craterhoof Behemoth'
        },
        id: 'other-id'
      }]

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
