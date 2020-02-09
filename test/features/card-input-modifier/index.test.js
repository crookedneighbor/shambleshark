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
      const fakeTooltip = {}

      mutation.ready.mockImplementationOnce(function (name, cb) {
        cb(fakeTooltip)
      })

      await cim.run()

      expect(mutation.ready).toBeCalledWith('#card-tooltip', expect.any(Function))
      expect(cim.tooltipElement).toBe(fakeTooltip)
    })

    it('waits for new deckbuilder entries', async function () {
      mutation.ready.mockImplementation(function (name, cb) {
        const fakeTooltip = document.createElement('div')

        if (name === '#card-tooltip') {
          cb(fakeTooltip)
        } else if (name === '.deckbuilder-entry') {
          cb(fakeEntry)
        }
      })

      await cim.run()

      expect(mutation.ready).toBeCalledWith('.deckbuilder-entry', expect.any(Function))
    })

    it('applies event listeners entry', async function () {
      const ta = fakeEntry.querySelector('textarea')

      jest.spyOn(fakeEntry, 'addEventListener')
      jest.spyOn(ta, 'addEventListener')

      mutation.ready.mockImplementation(function (name, cb) {
        const fakeTooltip = document.createElement('div')

        if (name === '#card-tooltip') {
          cb(fakeTooltip)
        } else if (name === '.deckbuilder-entry') {
          cb(fakeEntry)
        }
      })

      await cim.run()

      expect(mutation.ready).toBeCalledWith('.deckbuilder-entry', expect.any(Function))

      expect(fakeEntry.addEventListener).toBeCalledTimes(2)
      expect(fakeEntry.addEventListener).toBeCalledWith('mousemove', expect.any(Function))
      expect(fakeEntry.addEventListener).toBeCalledWith('mouseout', expect.any(Function))
      expect(ta.addEventListener).toBeCalledTimes(1)
      expect(ta.addEventListener).toBeCalledWith('change', expect.any(Function))

      jest.spyOn(cim, 'moveTooltip').mockImplementation()
      fakeEntry.dispatchEvent(new global.Event('mousemove'))

      expect(cim.moveTooltip).toBeCalledTimes(1)
      expect(cim.moveTooltip).toBeCalledWith(expect.anything(), 'entry-id')

      jest.spyOn(cim, 'dismissTooltip').mockImplementation()
      fakeEntry.dispatchEvent(new global.Event('mouseout'))

      expect(cim.dismissTooltip).toBeCalledTimes(1)

      jest.spyOn(cim, 'refreshImage').mockImplementation()
      ta.dispatchEvent(new global.Event('change'))

      expect(cim.refreshImage).toBeCalledTimes(1)
      expect(cim.refreshImage).toBeCalledWith('entry-id')
    })
  })

  describe('lookupImage', function () {
    it('resolves with image url if it is in the cache', async function () {
      cim.idCache.foo = 'https://example.com/foo'

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
      expect(cim.idCache.foo).toBe('https://example.com/foo-in-card-digest')
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
      cim.idCache.foo = 'https://example.com/cached-foo'
      deckParser.flattenEntries.mockReturnValue([{
        id: 'foo',
        card_digest: {
          image: 'https://example.com/foo-in-card-digest'
        }
      }])

      const url = await cim.lookupImage('foo', true)

      expect(scryfall.getDeck).toBeCalledTimes(1)
      expect(url).toBe('https://example.com/foo-in-card-digest')
      expect(cim.idCache.foo).toBe('https://example.com/foo-in-card-digest')
    })
  })

  describe('refreshImage', function () {
    it('deletes image from cache and calls lookup image after a second', async function () {
      jest.spyOn(cim, 'lookupImage').mockResolvedValue()
      cim.idCache.foo = 'https://example.com/cached-foo'

      jest.useFakeTimers()

      cim.refreshImage('foo')
      expect(cim.idCache.foo).toBeFalsy()

      expect(cim.lookupImage).toBeCalledTimes(0)

      // this is in a promise.resolve.then to not 'lock' on the await
      // https://stackoverflow.com/a/51132058/2601552
      await Promise.resolve().then(() => jest.advanceTimersByTime(999))

      expect(cim.lookupImage).toBeCalledTimes(0)

      await Promise.resolve().then(() => jest.advanceTimersByTime(2))

      expect(cim.lookupImage).toBeCalledTimes(1)
      expect(cim.lookupImage).toBeCalledWith('foo', true)
    })
  })

  describe('moveTooltip', function () {
    let fakeEvent

    beforeEach(function () {
      cim.idCache.foo = 'https://example.com/foo'
      cim.tooltipElement = document.createElement('div')
      cim.tooltipElement.innerHTML = `
        <img id="card-tooltip-img" />
      `
      document.body.appendChild(cim.tooltipElement)
      fakeEvent = {
        pageX: 100,
        pageY: 100
      }
    })

    it('noops when window width is small', function () {
      const originalWidth = window.innerWidth

      window.innerWidth = 600

      cim.moveTooltip(fakeEvent, 'foo')

      // indicates it never got to the point where it would open
      expect(cim.tooltipElement.style.display).not.toBe('block')

      window.innerWidth = originalWidth
    })

    it('noops when id does not exist in cache', function () {
      cim.moveTooltip(fakeEvent, 'bar')

      // indicates it never got to the point where it would open
      expect(cim.tooltipElement.style.display).not.toBe('block')
    })

    it('opens tooltip', function () {
      cim.moveTooltip(fakeEvent, 'foo')
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
  })
})
