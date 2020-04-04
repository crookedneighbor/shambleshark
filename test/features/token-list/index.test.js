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
      jest.spyOn(scryfall, 'getCollection').mockResolvedValue([])
    })

    it('calls getCollection', async function () {
      await tl.lookupTokens([{
        set: 'dom',
        collector_number: '102'
      }])

      expect(scryfall.getCollection).toBeCalledTimes(1)
      expect(scryfall.getCollection).toBeCalledWith([{
        set: 'dom',
        collector_number: '102'
      }])
    })

    it('resolves with array of the results of each card\'s getTokens call', async function () {
      const fakeToken1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const fakeToken2 = [{ id: 4 }]
      const spy1 = jest.fn().mockResolvedValue(fakeToken1)
      const spy2 = jest.fn().mockResolvedValue(fakeToken2)
      const fakeResults = [{
        getTokens: spy1
      }, {
        getTokens: spy2
      }]
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

      scryfall.getCollection.mockResolvedValue(fakeResults)

      const tokens = await tl.lookupTokens(entries)

      expect(spy1).toBeCalledTimes(1)
      expect(spy2).toBeCalledTimes(1)

      expect(tokens.length).toBe(2)
      expect(tokens[0][0].id).toBe(1)
      expect(tokens[0][1].id).toBe(2)
      expect(tokens[0][2].id).toBe(3)
      expect(tokens[1][0].id).toBe(4)
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

      expect(document.querySelectorAll).toBeCalledTimes(1)
      expect(document.querySelectorAll).toBeCalledWith('.deck-list-entry .deck-list-entry-name a')

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

    it('uses visual deck mode to find tokens when deck list entry comes up empty', async function () {
      const tokenCollection = [[{ id: 'token' }]]
      const result = []

      tl.lookupTokens.mockResolvedValue(tokenCollection)
      tl.flattenTokenCollection.mockReturnValue(result)

      document.querySelectorAll.mockReturnValueOnce([])
      document.querySelectorAll.mockReturnValueOnce([{
        href: 'https://scryfall.com/card/dom/102'
      }, {
        href: 'https://scryfall.com/card/kld/184'
      }])

      const tokens = await tl.generateTokenCollection()

      expect(document.querySelectorAll).toBeCalledTimes(2)
      expect(document.querySelectorAll).toBeCalledWith('.deck-list-entry .deck-list-entry-name a')
      expect(document.querySelectorAll).toBeCalledWith('a.card-grid-item-card')

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

    it('noops if no elements available', async function () {
      document.querySelectorAll.mockReturnValue([])
      const tokens = await tl.generateTokenCollection()

      expect(document.querySelectorAll).toBeCalledTimes(2)

      expect(tl.lookupTokens).not.toBeCalled()
      expect(tl.flattenTokenCollection).not.toBeCalled()

      expect(tokens).toEqual([])
    })
  })
})
