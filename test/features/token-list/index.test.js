import TokenList from 'Features/deck-view-features/token-list'
import mutation from 'Lib/mutation'
import scryfall from 'Lib/scryfall'
import wait from 'Lib/wait'

describe('Token List', function () {
  let tl, container

  beforeEach(function () {
    tl = new TokenList()
    container = document.createElement('div')
  })

  it('sets tooltip image from `data-scryfall-image` property', function () {
    const el = document.createElement('div')
    el.setAttribute('data-scryfall-image', 'https://example.com/image.png')

    jest.spyOn(tl.tooltip, 'setImage').mockImplementation()

    tl.tooltip.triggerOnMouseover(el)

    expect(tl.tooltip.setImage).toBeCalledTimes(1)
    expect(tl.tooltip.setImage).toBeCalledWith('https://example.com/image.png')
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
        scryfall_uri: 'https://scryfall.com/token-1',
        getImage: jest.fn()
      }]
      tl.createUI(container)
      jest.spyOn(tl.tooltip, 'addElement').mockImplementation()
    })

    it('hides the spinner', function () {
      expect(tl.spinner.classList.contains('hidden')).toBe(false)

      tl.addToUI(tokens)

      expect(tl.spinner.classList.contains('hidden')).toBe(true)
    })

    it('adds an li and link for each token', function () {
      tokens.push({
        name: 'Token 2',
        scryfall_uri: 'https://scryfall.com/token-2',
        getImage: jest.fn()
      })
      tl.addToUI(tokens)

      const links = container.querySelectorAll('li a')

      expect(links[0].innerHTML).toBe('Token 1')
      expect(links[0].href).toBe('https://scryfall.com/token-1')
      expect(links[1].innerHTML).toBe('Token 2')
      expect(links[1].href).toBe('https://scryfall.com/token-2')
    })

    it('adds each element to tooltip', function () {
      tokens.push({
        name: 'Token 2',
        scryfall_uri: 'https://scryfall.com/token-2',
        getImage: jest.fn()
      })
      tl.addToUI(tokens)

      const els = container.querySelectorAll('li')

      expect(tl.tooltip.addElement).toBeCalledTimes(2)
      expect(tl.tooltip.addElement).toBeCalledWith(els[0])
      expect(tl.tooltip.addElement).toBeCalledWith(els[1])
    })

    it('adds a message if no tokens were found', function () {
      tokens = []

      tl.addToUI(tokens)

      expect(container.querySelector('li').innerHTML).toBe('No tokens detected.')
    })
  })

  describe('parseSetAndCollectorNumber', function () {
    it('parses a scryfall url into a set and collector number', function () {
      expect(tl.parseSetAndCollectorNumber('https://scryfall.com/card/dom/102')).toEqual({
        set: 'dom',
        collector_number: '102'
      })
    })
  })

  describe('lookupCardCollection', function () {
    it('looks up scryfall card collection', async function () {
      const fakeCards = [{ id: 'foo' }]
      jest.spyOn(scryfall.api, 'post').mockResolvedValue(fakeCards)

      const cards = await tl.lookupCardCollection([{
        set: 'DOM',
        collector_number: '102'
      }])

      expect(scryfall.api.post).toBeCalledTimes(1)
      expect(scryfall.api.post).toBeCalledWith('/cards/collection', {
        identifiers: [{
          set: 'DOM',
          collector_number: '102'
        }]
      })

      expect(cards).toBe(fakeCards)
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

    it('removes duplicate ids', function () {
      tokenCollection[2].push({
        oracle_id: 'id-1',
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
      jest.spyOn(tl, 'lookupCardCollection').mockResolvedValue([])
    })

    it('calls lookupCardCollection', async function () {
      await tl.lookupTokens([{
        set: 'dom',
        collector_number: '102'
      }])

      expect(tl.lookupCardCollection).toBeCalledTimes(1)
      expect(tl.lookupCardCollection).toBeCalledWith([{
        set: 'dom',
        collector_number: '102'
      }])
    })

    it('calls lookupCardCollection in batches of 75', async function () {
      const fakeEntry = {
        set: 'foo',
        collector_number: '1'
      }
      const entries = []
      let i = 0
      while (i < 400) {
        entries.push(fakeEntry)
        i++
      }

      await tl.lookupTokens(entries)

      expect(tl.lookupCardCollection).toBeCalledTimes(6)
      expect(tl.lookupCardCollection.mock.calls[0][0].length).toBe(75)
      expect(tl.lookupCardCollection.mock.calls[1][0].length).toBe(75)
      expect(tl.lookupCardCollection.mock.calls[2][0].length).toBe(75)
      expect(tl.lookupCardCollection.mock.calls[3][0].length).toBe(75)
      expect(tl.lookupCardCollection.mock.calls[4][0].length).toBe(75)
      expect(tl.lookupCardCollection.mock.calls[5][0].length).toBe(25)
    })

    it('resolves with flattened array of the results of each card\'s getTokens call', async function () {
      const fakeEntry = {
        set: 'foo',
        collector_number: '1'
      }
      const entries = []
      let i = 0
      while (i < 200) {
        entries.push(fakeEntry)
        i++
      }

      await tl.lookupTokens(entries)

      expect(tl.lookupCardCollection).toBeCalledTimes(3)
    })
  })

  describe('generateTokenCollection', function () {
    beforeEach(function () {
      jest.spyOn(document, 'querySelectorAll').mockReturnValue([{
        href: 'https://scryfall.com/card/dom/102'
      }, {
        href: 'https://scryfall.com/card/kld/184'
      }])
      jest.spyOn(tl, 'lookupTokens').mockResolvedValue([])
      jest.spyOn(tl, 'flattenTokenCollection').mockImplementation()
    })

    it('parses card data from dom and looks up tokens', async function () {
      const tokenCollection = [[{ id: 'token' }]]
      const result = []

      tl.lookupTokens.mockResolvedValue(tokenCollection)
      tl.flattenTokenCollection.mockReturnValue(result)

      const tokens = await tl.generateTokenCollection()

      expect(tl.lookupTokens).toBeCalledTimes(1)
      expect(tl.lookupTokens).toBeCalledWith([{
        set: 'dom',
        collector_number: '102'
      }, {
        set: 'kld',
        collector_number: '184'
      }])
      expect(tl.flattenTokenCollection).toBeCalledTimes(1)
      expect(tl.flattenTokenCollection).toBeCalledWith(tokenCollection)

      expect(tokens).toBe(result)
    })
  })
})
