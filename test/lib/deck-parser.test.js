import {
  flattenEntries,
  hasLegalCommanders
} from '../../src/js/lib/deck-parser'
import {
  api as scryfall
} from '../../src/js/lib/scryfall'

describe('Deck Parser', function () {
  describe('flattenEntries', function () {
    let fakeDeck

    beforeEach(function () {
      fakeDeck = {
        sections: {
          primary: ['1', '2'],
          secondary: ['3', '4']
        },
        entries: {
          1: [
            { id: 'id-1', count: 1, card_digest: { oracle_id: 'oracle-1' } },
            { id: 'id-2', count: 1, card_digest: { oracle_id: 'oracle-2' } }
          ],
          2: [
            { id: 'id-3', count: 1, card_digest: { oracle_id: 'oracle-3' } },
            { id: 'id-4', count: 1, card_digest: { oracle_id: 'oracle-4' } }
          ],
          3: [
            { id: 'id-5', count: 1, card_digest: { oracle_id: 'oracle-5' } },
            { id: 'id-6', count: 1, card_digest: { oracle_id: 'oracle-6' } }
          ],
          4: [
            { id: 'id-7', count: 1, card_digest: { oracle_id: 'oracle-7' } },
            { id: 'id-8', count: 1, card_digest: { oracle_id: 'oracle-8' } }
          ]
        }
      }
    })

    it('takes deck entries and flattens them into a single list', function () {
      const entries = flattenEntries(fakeDeck)

      expect(entries.length).toBe(8)
      expect(entries).toContainEqual({ id: 'id-1', count: 1, card_digest: { oracle_id: 'oracle-1' } })
      expect(entries).toContainEqual({ id: 'id-2', count: 1, card_digest: { oracle_id: 'oracle-2' } })
      expect(entries).toContainEqual({ id: 'id-3', count: 1, card_digest: { oracle_id: 'oracle-3' } })
      expect(entries).toContainEqual({ id: 'id-4', count: 1, card_digest: { oracle_id: 'oracle-4' } })
      expect(entries).toContainEqual({ id: 'id-5', count: 1, card_digest: { oracle_id: 'oracle-5' } })
      expect(entries).toContainEqual({ id: 'id-6', count: 1, card_digest: { oracle_id: 'oracle-6' } })
      expect(entries).toContainEqual({ id: 'id-7', count: 1, card_digest: { oracle_id: 'oracle-7' } })
      expect(entries).toContainEqual({ id: 'id-8', count: 1, card_digest: { oracle_id: 'oracle-8' } })
    })

    it('collapses cards with multiple entries in sections into one', function () {
      fakeDeck.entries['3'] = [
        {
          id: 'id-2',
          count: 2,
          card_digest: {
            oracle_id: 'oracle-2'
          }
        }
      ]

      const entries = flattenEntries(fakeDeck)

      expect(entries.length).toBe(6)
      expect(entries).toContainEqual({ id: 'id-1', count: 1, card_digest: { oracle_id: 'oracle-1' } })
      expect(entries).toContainEqual({ id: 'id-2', count: 3, card_digest: { oracle_id: 'oracle-2' } })
      expect(entries).toContainEqual({ id: 'id-3', count: 1, card_digest: { oracle_id: 'oracle-3' } })
      expect(entries).toContainEqual({ id: 'id-4', count: 1, card_digest: { oracle_id: 'oracle-4' } })
      expect(entries).toContainEqual({ id: 'id-7', count: 1, card_digest: { oracle_id: 'oracle-7' } })
      expect(entries).toContainEqual({ id: 'id-8', count: 1, card_digest: { oracle_id: 'oracle-8' } })
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
