import TokenList from 'Features/deck-view-features/token-list'
import mutation from 'Lib/mutation'
import scryfall from 'Lib/scryfall'
import deckParser from 'Lib/deck-parser'
import wait from 'Lib/wait'

describe('Token List', function () {
  let tl, container

  beforeEach(function () {
    tl = new TokenList()
    container = document.createElement('div')
  })

  describe('run', function () {
    beforeEach(function () {
      jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
        cb(container)
      })

      jest.spyOn(tl, 'createUI').mockImplementation()
      jest.spyOn(tl, 'generateTokenCollection').mockResolvedValue([])
      jest.spyOn(tl, 'addToUI').mockImplementation()
    })

    it('waits for sidebar to be on the dom', async function () {
      mutation.ready.mockImplementation()

      await tl.run()

      expect(mutation.ready).toBeCalledTimes(1)
      expect(mutation.ready).toBeCalledWith('.sidebar', expect.any(Function))

      expect(tl.createUI).not.toBeCalled()

      mutation.ready.mock.calls[0][1](container)

      expect(tl.createUI).toBeCalled()
    })

    it('adds tokens to ui', async function () {
      const tokens = [{ id: 'token-id' }]
      tl.generateTokenCollection.mockResolvedValue(tokens)

      await tl.run()
      await wait()

      expect(tl.createUI).toBeCalledWith(container)
      expect(tl.addToUI).toBeCalledWith(tokens)
    })
  })

  describe('createUI', function () {
    it('adds elements to container', function () {
      tl.createUI(container)

      expect(container.querySelector('.token-list-title')).toBeTruthy()
    })

    it('creates references to tooltip', function () {
      tl.createUI(container)

      expect(tl.tokenListContainer.classList.contains('token-list-container')).toBe(true)
    })

    it('creates references to spinner', function () {
      tl.createUI(container)

      expect(tl.spinner.classList.contains('token-list-loading')).toBe(true)
    })
  })

  describe('addToUI', function () {
    let tokens

    beforeEach(function () {
      tokens = [{
        name: 'Token 1',
        scryfall_uri: 'https://scryfall.com/token-1'
      }]
      tl.createUI(container)
    })

    it('hides the spinner', function () {
      expect(tl.spinner.classList.contains('hidden')).toBe(false)

      tl.addToUI(tokens)

      expect(tl.spinner.classList.contains('hidden')).toBe(true)
    })

    it('adds an li and link for each token', function () {
      tokens.push({
        name: 'Token 2',
        scryfall_uri: 'https://scryfall.com/token-2'
      })
      tl.addToUI(tokens)

      const links = container.querySelectorAll('li a')

      expect(links[0].innerHTML).toBe('Token 1')
      expect(links[0].href).toBe('https://scryfall.com/token-1')
      expect(links[1].innerHTML).toBe('Token 2')
      expect(links[1].href).toBe('https://scryfall.com/token-2')
    })

    it('adds a message if no tokens were found', function () {
      tokens = []

      tl.addToUI(tokens)

      expect(container.querySelector('li').innerHTML).toBe('No tokens detected.')
    })
  })

  describe('findByScryfallId', function () {
    it('looks up scryfall api by id', async function () {
      const fakeCard = { id: 'fake-id' }
      jest.spyOn(scryfall.api, 'get').mockResolvedValue(fakeCard)

      const card = await tl.findByScryfallId('some-id')

      expect(scryfall.api.get).toBeCalledTimes(1)
      expect(scryfall.api.get).toBeCalledWith('/cards/some-id')

      expect(card).toBe(fakeCard)
    })
  })

  describe('fetchStoredData', function () {
    beforeEach(function () {
      jest.spyOn(TokenList, 'getData').mockResolvedValue()
    })

    it('gets stored data', async function () {
      const fakeData = {
        entries: {
          id: {}
        }
      }

      TokenList.getData.mockResolvedValue(fakeData)

      const data = await tl.fetchStoredData({ id: 'deck-id' })

      expect(TokenList.getData).toBeCalledTimes(1)
      expect(TokenList.getData).toBeCalledWith('deck-id')

      expect(data).toBe(fakeData)
    })

    it('supplies data if none exists', async function () {
      TokenList.getData.mockResolvedValue()

      const data = await tl.fetchStoredData({ id: 'deck-id' })

      expect(data).toEqual({
        entries: {}
      })
    })

    it('supplies entries if none exist', async function () {
      TokenList.getData.mockResolvedValue({})

      const data = await tl.fetchStoredData({ id: 'deck-id' })

      expect(data).toEqual({
        entries: {}
      })
    })
  })

  describe('flattenTokenCollection', function () {
    let tokenCollection

    beforeEach(function () {
      tokenCollection = [
        [],
        [{
          name: 'Token 1',
          oracle_id: 'id-1'
        }, {
          name: 'Token 2',
          oracle_id: 'id-2'
        }],
        [],
        [{
          name: 'Token 3',
          oracle_id: 'id-3'
        }]
      ]
    })

    it('flattens multidimensional array to single array', function () {
      const tokens = tl.flattenTokenCollection(tokenCollection)

      expect(tokens).toEqual([{
        name: 'Token 1',
        oracle_id: 'id-1'
      }, {
        name: 'Token 2',
        oracle_id: 'id-2'
      }, {
        name: 'Token 3',
        oracle_id: 'id-3'
      }])
    })

    it('alphebetizes by name', function () {
      tokenCollection[1].push({
        oracle_id: 'alpha-token-id',
        name: 'Alpha Token'
      })
      const tokens = tl.flattenTokenCollection(tokenCollection)

      expect(tokens).toEqual([{
        name: 'Alpha Token',
        oracle_id: 'alpha-token-id'
      }, {
        name: 'Token 1',
        oracle_id: 'id-1'
      }, {
        name: 'Token 2',
        oracle_id: 'id-2'
      }, {
        name: 'Token 3',
        oracle_id: 'id-3'
      }])
    })

    // TODO, eventually this will be by oracle id instead
    it('removes duplicate names', function () {
      tokenCollection[2].push({
        oracle_id: 'another-token-1',
        name: 'Token 1'
      })
      const tokens = tl.flattenTokenCollection(tokenCollection)

      expect(tokens).toEqual([{
        name: 'Token 1',
        oracle_id: 'id-1'
      }, {
        name: 'Token 2',
        oracle_id: 'id-2'
      }, {
        name: 'Token 3',
        oracle_id: 'id-3'
      }])
    })
  })

  describe('lookupTokens', function () {
    beforeEach(function () {
      tl.storedData = {
        entries: {}
      }
      jest.spyOn(tl, 'findByScryfallId').mockResolvedValue()
    })

    it('looks up th ids of stored entries', async function () {
      tl.findByScryfallId.mockResolvedValueOnce({
        id: 'token-1'
      })
      tl.findByScryfallId.mockResolvedValueOnce({
        id: 'token-2'
      })
      tl.findByScryfallId.mockResolvedValueOnce({
        id: 'token-3'
      })
      tl.findByScryfallId.mockResolvedValueOnce({
        id: 'token-4'
      })
      tl.storedData.entries.storedEntry1 = {
        tokens: ['token-1', 'token-2']
      }
      tl.storedData.entries.storedEntry2 = {
        tokens: ['token-3', 'token-4']
      }

      const tokenCollection = await tl.lookupTokens([{
        id: 'storedEntry1',
        card_digest: {}
      }, {
        id: 'storedEntry2',
        card_digest: {}
      }])

      expect(tl.findByScryfallId).toBeCalledTimes(4)
      expect(tl.findByScryfallId).toBeCalledWith('token-1')
      expect(tl.findByScryfallId).toBeCalledWith('token-2')
      expect(tl.findByScryfallId).toBeCalledWith('token-3')
      expect(tl.findByScryfallId).toBeCalledWith('token-4')

      expect(tokenCollection[0][0]).toEqual({ id: 'token-1' })
      expect(tokenCollection[0][1]).toEqual({ id: 'token-2' })
      expect(tokenCollection[1][0]).toEqual({ id: 'token-3' })
      expect(tokenCollection[1][1]).toEqual({ id: 'token-4' })
    })

    it('does not mark needsUpdate as true if only looking up stored entries', async function () {
      tl.findByScryfallId.mockResolvedValueOnce({
        id: 'token-1'
      })
      tl.storedData.entries.storedEntry1 = {
        tokens: ['token-1']
      }

      await tl.lookupTokens([{
        id: 'storedEntry1',
        card_digest: {}
      }])

      expect(tl.needsUpdate).toBeFalsy()
    })

    it('ignores entries without a card digest that do not exist in stored data', async function () {
      await tl.lookupTokens([{
        id: 'entry-1'
      }])

      expect(tl.needsUpdate).toBeFalsy()
      expect(tl.findByScryfallId).not.toBeCalled()
    })

    it('looks up cards by card digest id', async function () {
      const fakeCard = {
        all_parts: [],
        getTokens: jest.fn().mockResolvedValue([
          {
            id: 'token-1',
            name: 'Token 1'
          }, {
            id: 'token-2',
            name: 'Token 2'
          }
        ])
      }
      tl.findByScryfallId.mockResolvedValueOnce(fakeCard)

      const tokenCollection = await tl.lookupTokens([{
        id: 'entry-1',
        card_digest: {
          id: 'scryfall-id'
        }
      }])

      expect(tl.needsUpdate).toBeTruthy()
      expect(tl.findByScryfallId).toBeCalledTimes(1)
      expect(tl.findByScryfallId).toBeCalledWith('scryfall-id')

      expect(tokenCollection[0][0]).toEqual({
        id: 'token-1',
        name: 'Token 1'
      })
      expect(tokenCollection[0][1]).toEqual({
        id: 'token-2',
        name: 'Token 2'
      })
      expect(tl.storedData.entries['entry-1'].tokens).toEqual(['token-1', 'token-2'])
    })

    it('does not lookup tokens for cards without the all_parts attribute and provides an empty array instead', async function () {
      const fakeCard = {
        getTokens: jest.fn()
      }
      tl.findByScryfallId.mockResolvedValueOnce(fakeCard)

      const tokenCollection = await tl.lookupTokens([{
        id: 'entry-1',
        card_digest: {
          id: 'scryfall-id'
        }
      }])

      expect(tl.needsUpdate).toBeTruthy()
      expect(tl.findByScryfallId).toBeCalledTimes(1)
      expect(tl.findByScryfallId).toBeCalledWith('scryfall-id')
      expect(fakeCard.getTokens).not.toBeCalled()

      expect(tokenCollection[0].length).toBe(0)
      expect(tl.storedData.entries['entry-1'].tokens).toEqual([])
    })

    it('catches errors, logs them, and returns an empty array for the token lookup', async function () {
      jest.spyOn(console, 'error').mockImplementation()

      const fakeCard = {
        all_parts: [],
        getTokens: jest.fn().mockResolvedValue([
          {
            id: 'token-1',
            name: 'Token 1'
          }, {
            id: 'token-2',
            name: 'Token 2'
          }
        ])
      }
      const error = new Error('some error')
      tl.findByScryfallId.mockResolvedValueOnce(fakeCard)
      tl.findByScryfallId.mockRejectedValueOnce(error)

      const tokenCollection = await tl.lookupTokens([{
        id: 'entry-1',
        card_digest: {
          id: 'scryfall-id'
        }
      }, {
        id: 'entry-2',
        card_digest: {
          id: 'scryfall-id-2'
        }
      }])

      expect(tl.findByScryfallId).toBeCalledTimes(2)
      expect(tl.findByScryfallId).toBeCalledWith('scryfall-id')
      expect(tl.findByScryfallId).toBeCalledWith('scryfall-id-2')

      expect(tokenCollection[0][0]).toEqual({
        id: 'token-1',
        name: 'Token 1'
      })
      expect(tokenCollection[0][1]).toEqual({
        id: 'token-2',
        name: 'Token 2'
      })
      expect(tokenCollection[1].length).toBe(0)
      expect(tl.storedData.entries['entry-1'].tokens).toEqual(['token-1', 'token-2'])
      expect(tl.storedData.entries['entry-2'].tokens).toBeFalsy()

      expect(console.error).toBeCalledTimes(1)
      expect(console.error).toBeCalledWith(error)
    })
  })

  describe('generateTokenCollection', function () {
    let fakeDeck, fakeEntries

    beforeEach(function () {
      fakeDeck = {
        id: 'deck-id'
      }
      fakeEntries = [
        { id: 'entry-1' }
      ]

      jest.spyOn(scryfall, 'getDeck').mockResolvedValue(fakeDeck)
      jest.spyOn(deckParser, 'flattenEntries').mockReturnValue(fakeEntries)
      jest.spyOn(tl, 'fetchStoredData').mockResolvedValue({
        entries: {}
      })
      jest.spyOn(tl, 'lookupTokens').mockResolvedValue([])
      jest.spyOn(TokenList, 'saveData').mockImplementation()
      jest.spyOn(tl, 'flattenTokenCollection')
    })

    it('looks up deck and passes flattened entries into lookupTokens', async function () {
      await tl.generateTokenCollection()

      expect(scryfall.getDeck).toBeCalledTimes(1)

      expect(deckParser.flattenEntries).toBeCalledTimes(1)
      expect(deckParser.flattenEntries).toBeCalledWith(fakeDeck)

      expect(tl.lookupTokens).toBeCalledTimes(1)
      expect(tl.lookupTokens).toBeCalledWith(fakeEntries)
    })

    it('fetches stored data and calls saveData if an update is required', async function () {
      tl.lookupTokens.mockImplementation(() => {
        tl.needsUpdate = true
        tl.storedData.entries.id = { tokens: [] }

        return Promise.resolve([])
      })

      await tl.generateTokenCollection()

      expect(TokenList.saveData).toBeCalledTimes(1)
      expect(TokenList.saveData).toBeCalledWith('deck-id', tl.storedData)
    })

    it('flattens token collection from lookup tokens and returns the result', async function () {
      const tokenCollection = [[{ id: 'token' }]]
      const result = [{
        id: 'token',
        name: 'token name'
      }]

      tl.lookupTokens.mockResolvedValue(tokenCollection)
      tl.flattenTokenCollection.mockReturnValue(result)

      const tokens = await tl.generateTokenCollection()

      expect(tl.flattenTokenCollection).toBeCalledTimes(1)
      expect(tl.flattenTokenCollection).toBeCalledWith(tokenCollection)

      expect(tokens).toBe(result)
    })
  })
})
