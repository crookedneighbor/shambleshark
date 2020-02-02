import {
  getCommanderColorIdentity,
  getSections,
  flattenEntries,
  isCommanderLike,
  isSingletonTypeDeck,
  hasLegalCommanders
} from '../../src/js/lib/deck-parser'
import {
  api as scryfall
} from '../../src/js/lib/scryfall'

describe('Deck Parser', function () {
  describe('getCommanderColorIdentity', function () {
    beforeEach(function () {
      jest.spyOn(scryfall, 'get')
    })

    it('returns array of color identity for commander', async function () {
      const fakeDeck = {
        entries: {
          commanders: [{
            card_digest: { oracle_id: 'id-1' }
          }]
        }
      }

      scryfall.get.mockResolvedValue([{
        color_identity: ['U', 'R']
      }])

      const colors = await getCommanderColorIdentity(fakeDeck)

      expect(colors).toEqual(['U', 'R'])
      expect(scryfall.get).toBeCalledTimes(1)
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: 'oracle_id:"id-1"'
      })
    })

    it('returns array of color identity for multiple commanders', async function () {
      const fakeDeck = {
        entries: {
          commanders: [{
            card_digest: { oracle_id: 'id-1' }
          }, {
            card_digest: { oracle_id: 'id-2' }
          }, {
            card_digest: { oracle_id: 'id-3' }
          }]
        }
      }

      scryfall.get.mockResolvedValue([{
        color_identity: ['U', 'R']
      }, {
        color_identity: ['U', 'B']
      }, {
        color_identity: ['W']
      }])

      const colors = await getCommanderColorIdentity(fakeDeck)

      expect(colors).toEqual(['U', 'R', 'B', 'W'])
      expect(scryfall.get).toBeCalledTimes(1)
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: 'oracle_id:"id-1" or oracle_id:"id-2" or oracle_id:"id-3"'
      })
    })

    it('returns array of c when color idenity is empty', async function () {
      const fakeDeck = {
        entries: {
          commanders: [{
            card_digest: { oracle_id: 'id-1' }
          }]
        }
      }

      scryfall.get.mockResolvedValue([{
        color_identity: []
      }])

      const colors = await getCommanderColorIdentity(fakeDeck)

      expect(colors).toEqual(['C'])
    })

    it('ignores cards without a card digeest', async function () {
      const fakeDeck = {
        entries: {
          commanders: [{
            card_digest: { oracle_id: 'id-1' }
          }, {
            // no card digetst
          }, {
            card_digest: { oracle_id: 'id-3' }
          }]
        }
      }

      scryfall.get.mockResolvedValue([{
        color_identity: ['U', 'R']
      }, {
        color_identity: ['W']
      }])

      const colors = await getCommanderColorIdentity(fakeDeck)

      expect(colors).toEqual(['U', 'R', 'W'])
      expect(scryfall.get).toBeCalledTimes(1)
      expect(scryfall.get).toBeCalledWith('/cards/search', {
        q: 'oracle_id:"id-1" or oracle_id:"id-3"'
      })
    })
  })

  describe('getSections', function () {
    it('returns a flattened array of deck sections', function () {
      const fakeDeck = {
        sections: {
          primary: ['1', '2'],
          secondary: ['3', '4']
        }
      }

      expect(getSections(fakeDeck)).toEqual(['1', '2', '3', '4'])
    })
  })

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

    it('returns false if any cards in it are not legal commanders', async function () {
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

  describe('isCommanderLike', function () {
    it('returns true when deck has a commanders section', function () {
      const deck = {
        sections: {
          a: ['foo'],
          b: ['foo', 'bar', 'commanders', 'baz'],
          c: ['foo']
        }
      }

      expect(isCommanderLike(deck)).toBe(true)
    })

    it('returns false when deck has no commanders', function () {
      const deck = {
        sections: {
          a: ['foo'],
          b: ['foo', 'bar', 'baz', 'nonlands'],
          c: ['foo']
        }
      }

      expect(isCommanderLike(deck)).toBe(false)
    })
  })

  describe('isSingletonTypeDeck', function () {
    it('returns true when deck has a commanders section', function () {
      const deck = {
        sections: {
          a: ['foo'],
          b: ['foo', 'bar', 'commanders', 'baz'],
          c: ['foo']
        }
      }

      expect(isSingletonTypeDeck(deck)).toBe(true)
    })

    it('returns true when deck has a nonlands section', function () {
      const deck = {
        sections: {
          a: ['foo'],
          b: ['foo', 'bar', 'nonlands', 'baz'],
          c: ['foo']
        }
      }

      expect(isSingletonTypeDeck(deck)).toBe(true)
    })

    it('returns false when deck has no commanders or nonlands section', function () {
      const deck = {
        sections: {
          a: ['foo'],
          b: ['foo', 'bar', 'baz'],
          c: ['foo']
        }
      }

      expect(isSingletonTypeDeck(deck)).toBe(false)
    })
  })
})
