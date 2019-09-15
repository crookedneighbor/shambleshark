import bus from 'framebus'
import makeEDHRecButton from '../../../src/js/features/edhrec-suggestions/make-edhrec-button'
import wait from '../../../src/js/lib/wait'
import Modal from '../../../src/js/lib/modal'
import scryfall from '../../../src/js/lib/scryfall-client'

describe('makeEDHRecButton', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'on')
    jest.spyOn(bus, 'emit')
    jest.spyOn(scryfall, 'get')

    const deckbuilderElement = document.createElement('div')
    deckbuilderElement.id = 'deckbuilder'
    document.body.appendChild(deckbuilderElement)
  })

  it('makes a button', function () {
    const btn = makeEDHRecButton()

    expect(btn.tagName).toBe('BUTTON')
  })

  it('adds an edhrec modal to page', function () {
    makeEDHRecButton()

    expect(document.querySelector('#edhrec-modal')).not.toBeFalsy()
  })

  it('cleans up deck after modal is closed', function () {
    makeEDHRecButton()

    const modal = document.querySelector('#edhrec-modal')
    const closeButton = modal.querySelector('.modal-dialog-close')

    closeButton.click()

    expect(bus.emit).toBeCalledWith('CLEAN_UP_DECK')
  })

  it('listens for the EDHREC_READY event', function () {
    makeEDHRecButton()

    expect(bus.on).toBeCalledWith('EDHREC_READY', expect.any(Function))
  })

  it('listens for the ADD_CARD_FROM_EDHREC event for nonland card and emits an ADD_CARD_TO_DECK event', async function () {
    const payload = {
      cardName: 'Name'
    }
    bus.on.mockImplementation((event, reply) => {
      if (event === 'ADD_CARD_FROM_EDHREC') {
        reply(payload)
      }
    })
    scryfall.get.mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Creature'
    })

    makeEDHRecButton()

    await wait()

    expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
      cardName: 'Name',
      cardId: 'some-id',
      isLand: false
    })
  })

  it('listens for the ADD_CARD_FROM_EDHREC event for land card and emits an ADD_CARD_TO_DECK event', async function () {
    const payload = {
      cardName: 'Name'
    }
    bus.on.mockImplementation((event, reply) => {
      if (event === 'ADD_CARD_FROM_EDHREC') {
        reply(payload)
      }
    })
    jest.spyOn(scryfall, 'get').mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Artifact Land'
    })

    makeEDHRecButton()

    await wait()

    expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
      cardName: 'Name',
      cardId: 'some-id',
      isLand: true
    })
  })

  it('listens for the REMOVE_CARD_FROM_EDHREC event and emits a REMOVE_CARD_TO_DECK event', async function () {
    const payload = {
      cardName: 'Name'
    }
    bus.on.mockImplementation((event, reply) => {
      if (event === 'REMOVE_CARD_FROM_EDHREC') {
        reply(payload)
      }
    })
    scryfall.get.mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Creature'
    })

    makeEDHRecButton()

    await wait()

    expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_DECK', {
      cardName: 'Name'
    })
  })

  describe('when clicked', function () {
    let fakeDeck

    beforeEach(function () {
      fakeDeck = {
        entries: {
          commanders: [
            {
              card_digest: {
                id: 'arjun-id',
                name: 'Arjun, the Shifting Flame'
              }
            }
          ],
          lands: [],
          nonlands: []
        }
      }

      bus.emit.mockImplementation((event, reply) => {
        if (event === 'REQUEST_DECK') {
          reply(fakeDeck)
        }
      })

      scryfall.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/arjun-the-shifting-flame'
        }
      })
    })

    it('opens the modal', function () {
      jest.spyOn(Modal.prototype, 'open')
      bus.emit.mockImplementation()

      const btn = makeEDHRecButton()

      btn.click()

      expect(Modal.prototype.open).toBeCalledTimes(1)
    })

    it('uses scryfall to populate the iframe src', async function () {
      const btn = makeEDHRecButton()

      btn.click()

      await wait(5)

      const iframe = document.querySelector('#edhrec-modal iframe')

      expect(iframe.src).toBe('https://example.com/edhrec/arjun-the-shifting-flame')
    })

    it('can handle partner commanders', async function () {
      const btn = makeEDHRecButton()

      fakeDeck.entries.commanders = [
        {
          card_digest: {
            id: 'sidar-id',
            name: 'Sidar Kondo of Jamura'
          }
        },
        {
          card_digest: {
            id: 'tana-id',
            name: 'Tana the Bloodsower'
          }
        }
      ]
      scryfall.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/sidar-kondo-of-jamura'
        }
      })

      btn.click()

      await wait(5)

      const iframe = document.querySelector('#edhrec-modal iframe')

      expect(iframe.src).toBe('https://example.com/edhrec/sidar-kondo-of-jamura-tana-the-bloodsower')
    })

    it('attempts any number of cards in command zone', async function () {
      const btn = makeEDHRecButton()

      fakeDeck.entries.commanders = [
        {
          card_digest: {
            id: 'sidar-id',
            name: 'Sidar Kondo of Jamura'
          }
        },
        {
          card_digest: {
            id: 'tana-id',
            name: 'Tana the Bloodsower'
          }
        },
        {
          card_digest: {
            id: 'reyhan-id',
            name: 'Reyhan, Last of the Abzan'
          }
        }
      ]
      scryfall.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/sidar-kondo-of-jamura'
        }
      })

      btn.click()

      await wait(5)

      const iframe = document.querySelector('#edhrec-modal iframe')

      expect(iframe.src).toBe('https://example.com/edhrec/sidar-kondo-of-jamura-tana-the-bloodsower-reyhan,-last-of-the-abzan')
    })

    it('unhides the modal content when EDHREC_READY event fires', async function () {
      const spy = jest.fn()

      jest.spyOn(Modal.prototype, 'setLoading')
      bus.on.mockImplementation((event, reply) => {
        if (event === 'EDHREC_READY') {
          wait(5).then(() => {
            reply(spy)
          })
        }
      })

      const btn = makeEDHRecButton()

      btn.click()

      await wait(5)

      expect(Modal.prototype.setLoading).toBeCalledTimes(1)
      expect(Modal.prototype.setLoading).toBeCalledWith(false)
    })

    it('replies to EDHREC_READY event with cards in deck', async function () {
      const spy = jest.fn()

      fakeDeck.entries.lands.push({
        card_digest: {
          name: 'Reliquary Tower'
        }
      })
      fakeDeck.entries.nonlands.push({
        card_digest: {
          name: 'Rhystic Study'
        }
      })

      bus.on.mockImplementation((event, reply) => {
        if (event === 'EDHREC_READY') {
          wait(5).then(() => {
            reply(spy)
          })
        }
      })

      const btn = makeEDHRecButton()

      btn.click()

      await wait(5)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith({
        cardsInDeck: {
          'Arjun, the Shifting Flame': true,
          'Reliquary Tower': true,
          'Rhystic Study': true
        }
      })
    })

    it('does not error when cards in deck are missing the card_digest', async function () {
      const spy = jest.fn()

      fakeDeck.entries.lands.push({
        card_digest: {
          name: 'Reliquary Tower'
        }
      }, {
        foo: 'bar'
      })
      fakeDeck.entries.nonlands.push({
        card_digest: {
          name: 'Rhystic Study'
        }
      })

      bus.on.mockImplementation((event, reply) => {
        if (event === 'EDHREC_READY') {
          wait(5).then(() => {
            reply(spy)
          })
        }
      })

      const btn = makeEDHRecButton()

      btn.click()

      await wait(5)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith({
        cardsInDeck: {
          'Arjun, the Shifting Flame': true,
          'Reliquary Tower': true,
          'Rhystic Study': true
        }
      })
    })
  })
})
