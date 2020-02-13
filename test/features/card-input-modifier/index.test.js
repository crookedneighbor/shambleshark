import bus from 'framebus'
import CardInputModifier from '../../../src/js/features/deck-builder-features/card-input-modifier'
import deckParser from '../../../src/js/lib/deck-parser'
import scryfall from '../../../src/js/lib/scryfall'
import mutation from '../../../src/js/lib/mutation'
import wait from '../../../src/js/lib/wait'

describe('Card Input Modifier', function () {
  let cim

  beforeEach(function () {
    cim = new CardInputModifier()
    jest.spyOn(scryfall, 'getDeck').mockResolvedValue({})
    jest.spyOn(deckParser, 'flattenEntries').mockReturnValue([])
    jest.spyOn(bus, 'on').mockImplementation()
  })

  describe('run', function () {
    let fakeEntry

    beforeEach(function () {
      jest.spyOn(mutation, 'ready').mockImplementation()

      fakeEntry = document.createElement('div')
      fakeEntry.setAttribute('data-entry', 'entry-id')
      fakeEntry.innerHTML = `
        <textarea class="deckbuilder-entry-input"></textarea>
      `
    })

    it('waits for #card-tooltip to be ready', async function () {
      const fakeTooltip = document.createElement('div')

      mutation.ready.mockImplementationOnce(function (name, cb) {
        cb(fakeTooltip)
      })

      await cim.run()

      expect(mutation.ready).toBeCalledWith('#card-tooltip', expect.any(Function))
      expect(cim.tooltipElement).toBe(fakeTooltip)
    })

    it('waits for new deckbuilder entries to attach listeners', async function () {
      const secondFakeEntry = document.createElement('div')
      mutation.ready.mockImplementation(function (name, cb) {
        if (name === '.deckbuilder-entry') {
          cb(fakeEntry)
          cb(secondFakeEntry)
        }
      })
      jest.spyOn(cim, 'attachListenersToEntry').mockImplementation()

      await cim.run()

      expect(mutation.ready).toBeCalledWith('.deckbuilder-entry', expect.any(Function))

      await wait()

      expect(cim.attachListenersToEntry).toBeCalledTimes(2)
      expect(cim.attachListenersToEntry).toBeCalledWith(fakeEntry)
      expect(cim.attachListenersToEntry).toBeCalledWith(secondFakeEntry)
    })

    it('listens for card update events', async function () {
      await cim.run()

      expect(bus.on).toBeCalledTimes(5)
      expect(bus.on).toBeCalledWith('CALLED_DESTROYENTRY', expect.any(Function))
      expect(bus.on).toBeCalledWith('CALLED_CREATEENTRY', expect.any(Function))
      expect(bus.on).toBeCalledWith('CALLED_UPDATEENTRY', expect.any(Function))
      expect(bus.on).toBeCalledWith('CALLED_REPLACEENTRY', expect.any(Function))
      expect(bus.on).toBeCalledWith('CALLED_CLEANUP', expect.any(Function))
    })

    it('removes card id from image cache when destroy entry event fires', async function () {
      const payload = {
        payload: 'foo'
      }
      cim.imageCache.foo = 'foo'
      bus.on.mockImplementation((event, cb) => {
        if (event === 'CALLED_DESTROYENTRY') {
          cb(payload)
        }
      })

      await cim.run()

      expect(cim.imageCache.foo).toBeFalsy()
    })

    it.each([
      'CLEANUP',
      'UPDATEENTRY',
      'REPLACEENTRY',
      'CREATEENTRY'
    ])('refreshes cache when CALLED_%s event is called', async function (eventName) {
      jest.spyOn(cim, 'refreshCache').mockResolvedValue()

      bus.on.mockImplementation((event, cb) => {
        if (event === `CALLED_${eventName}`) {
          cb()
        }
      })

      await cim.run()
      await wait()

      expect(cim.refreshCache).toBeCalledTimes(1)
    })
  })

  describe('getEntries', function () {
    it('flattens entries from getDeck call', async function () {
      const deck = {}
      const mockedEntries = [{
        id: '1'
      }]
      scryfall.getDeck.mockResolvedValue(deck)
      deckParser.flattenEntries.mockReturnValue(mockedEntries)

      const entries = await cim.getEntries()

      expect(entries).toBe(mockedEntries)
      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(deckParser.flattenEntries).toBeCalledTimes(1)
      expect(deckParser.flattenEntries).toBeCalledWith(deck, {
        idToGroupBy: 'id'
      })
    })

    it('caches the lookup', async function () {
      await cim.getEntries()
      await cim.getEntries()
      await cim.getEntries()

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(deckParser.flattenEntries).toBeCalledTimes(1)
    })

    it('can bust the cache', async function () {
      await cim.getEntries()
      await cim.getEntries(true)
      await cim.getEntries(true)

      expect(scryfall.getDeck).toBeCalledTimes(3)
      expect(deckParser.flattenEntries).toBeCalledTimes(3)
    })
  })

  describe('lookupImage', function () {
    it('resolves with image url if it is in the cache', async function () {
      cim.imageCache.foo = 'https://example.com/foo'

      const url = await cim.lookupImage('foo')

      expect(scryfall.getDeck).toBeCalledTimes(0)
      expect(url).toBe('https://example.com/foo')
    })

    it('looks up deck to find image', async function () {
      deckParser.flattenEntries.mockReturnValue([{
        id: 'foo',
        card_digest: {
          image: 'https://example.com/foo-in-card-digest'
        }
      }])

      const url = await cim.lookupImage('foo')

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(url).toBe('https://example.com/foo-in-card-digest')
      expect(cim.imageCache.foo).toBe('https://example.com/foo-in-card-digest')
    })

    it('returns nothing if entry with specific id cannot be found', async function () {
      deckParser.flattenEntries.mockReturnValue([{
        id: 'not-foo',
        card_digest: {
          image: 'https://example.com/not-foo-in-card-digest'
        }
      }])

      const url = await cim.lookupImage('foo')

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(url).toBeFalsy()
    })

    it('returns nothing if entry with specific id does not have an image', async function () {
      deckParser.flattenEntries.mockReturnValue([{
        id: 'foo'
      }])

      const url = await cim.lookupImage('foo')

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(url).toBeFalsy()
    })

    it('can bust the cache to re-lookup card image', async function () {
      cim.imageCache.foo = 'https://example.com/cached-foo'
      deckParser.flattenEntries.mockReturnValue([{
        id: 'foo',
        card_digest: {
          image: 'https://example.com/foo-in-card-digest'
        }
      }])

      const url = await cim.lookupImage('foo', true)

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(url).toBe('https://example.com/foo-in-card-digest')
      expect(cim.imageCache.foo).toBe('https://example.com/foo-in-card-digest')
    })
  })

  describe('refreshCache', function () {
    it('resets the entry cache after 1 second', async function () {
      jest.spyOn(cim, 'getEntries').mockResolvedValue([{
        id: 'foo',
        card_digest: {
          image: 'https://example.com/new-foo'
        }
      }, {
        id: 'bar',
        card_digest: {
          image: 'https://example.com/bar'
        }
      }, {
        id: 'baz'
      }])
      cim.imageCache.foo = 'https://example.com/cached-foo'

      jest.useFakeTimers()

      const refresh = cim.refreshCache()

      expect(cim.getEntries).toBeCalledTimes(0)

      // this is in a promise.resolve.then to not 'lock' on the await
      // https://stackoverflow.com/a/51132058/2601552
      await Promise.resolve().then(() => jest.advanceTimersByTime(999))

      expect(cim.getEntries).toBeCalledTimes(0)

      await Promise.resolve().then(() => jest.advanceTimersByTime(2))

      expect(cim.getEntries).toBeCalledTimes(1)

      // let the entries finish assigning the new cache
      await refresh

      expect(cim.imageCache.foo).toBe('https://example.com/new-foo')
      expect(cim.imageCache.bar).toBe('https://example.com/bar')
      expect(cim.imageCache.baz).toBeFalsy()
    })
  })

  describe('moveTooltip', function () {
    let fakeEvent, fakeEntry

    beforeEach(function () {
      cim.imageCache.foo = 'https://example.com/foo'
      cim.tooltipElement = document.createElement('div')
      cim.tooltipElement.innerHTML = `
        <img id="card-tooltip-img" />
      `
      document.body.appendChild(cim.tooltipElement)
      fakeEvent = {
        pageX: 100,
        pageY: 100
      }
      fakeEntry = document.createElement('div')
      fakeEntry.setAttribute('data-entry', 'foo')
    })

    it('does not error if tooltip does not exist', function () {
      delete cim.tooltipElement
      expect(() => {
        cim.moveTooltip(fakeEvent, fakeEntry)
      }).not.toThrow()
    })

    it('noops when window width is small', function () {
      const originalWidth = window.innerWidth

      window.innerWidth = 600

      cim.moveTooltip(fakeEvent, fakeEntry)

      // indicates it never got to the point where it would open
      expect(cim.tooltipElement.style.display).not.toBe('block')

      window.innerWidth = originalWidth
    })

    it('noops when id does not exist in cache', function () {
      fakeEntry.setAttribute('data-entry', 'bar')
      cim.moveTooltip(fakeEvent, fakeEntry)

      // indicates it never got to the point where it would open
      expect(cim.tooltipElement.style.display).not.toBe('block')
    })

    it('opens tooltip', function () {
      cim.moveTooltip(fakeEvent, fakeEntry)
      expect(cim.tooltipElement.style.display).toBe('block')
      expect(cim.tooltipElement.style.left).toBe('150px')
      expect(cim.tooltipElement.style.top).toBe('70px')
      expect(document.getElementById('card-tooltip-img').src).toBe('https://example.com/foo')
    })
  })

  describe('dismissTooltip', function () {
    it('changes tooltip element display to "none"', function () {
      cim.tooltipElement = document.createElement('div')

      expect(cim.tooltipElement.style.display).not.toBe('none')

      cim.dismissTooltip()

      expect(cim.tooltipElement.style.display).toBe('none')
    })

    it('noops if tooltipElementt is not available', function () {
      delete cim.tooltipElement

      expect(() => {
        cim.dismissTooltip()
      }).not.toThrow()
    })
  })
})
