import bus from 'framebus'
import makeEDHRecButton from '../../../src/js/features/edhrec-suggestions/make-edhrec-button'
import deckParser from '../../../src/js/lib/deck-parser'
import wait from '../../../src/js/lib/wait'
import Modal from '../../../src/js/lib/modal'
import mutation from '../../../src/js/lib/mutation'
import scryfall from '../../../src/js/lib/scryfall'

describe('makeEDHRecButton', function () {
  beforeEach(function () {
    jest.spyOn(bus, 'on')
    jest.spyOn(bus, 'emit')
    jest.spyOn(scryfall.api, 'get')
    jest.spyOn(scryfall, 'getDeck').mockResolvedValue({
      entries: {
        commanders: []
      }
    })
    jest.spyOn(deckParser, 'hasLegalCommanders').mockResolvedValue(true)
    jest.spyOn(mutation, 'change').mockImplementation()

    const deckbuilderElement = document.createElement('div')
    deckbuilderElement.id = 'deckbuilder'
    document.body.appendChild(deckbuilderElement)
  })

  it('makes a button', async function () {
    const btn = await makeEDHRecButton()

    expect(btn.tagName).toBe('BUTTON')
  })

  it('sets button to disabled when requested deck does not have legal commanders', async function () {
    deckParser.hasLegalCommanders.mockResolvedValue(false)

    const btn = await makeEDHRecButton()

    expect(btn.getAttribute('disabled')).toBe('disabled')
  })

  it('sets button to not disabled when requested has legal commanders', async function () {
    deckParser.hasLegalCommanders.mockResolvedValue(true)

    const btn = await makeEDHRecButton()

    expect(btn.getAttribute('disabled')).toBeFalsy()
  })

  it('adds an edhrec modal to page', async function () {
    await makeEDHRecButton()

    expect(document.querySelector('#edhrec-modal')).not.toBeFalsy()
  })

  it('cleans up deck after modal is closed', async function () {
    await makeEDHRecButton()

    const modal = document.querySelector('#edhrec-modal')
    const closeButton = modal.querySelector('.modal-dialog-close')

    closeButton.click()

    expect(bus.emit).toBeCalledWith('CLEAN_UP_DECK')
  })

  it('listens for the EDHREC_READY event', async function () {
    await makeEDHRecButton()

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
    scryfall.api.get.mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Creature'
    })

    await makeEDHRecButton()

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
    jest.spyOn(scryfall.api, 'get').mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Artifact Land'
    })

    await makeEDHRecButton()

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
    scryfall.api.get.mockResolvedValue({
      name: 'Name',
      id: 'some-id',
      type_line: 'Creature'
    })

    await makeEDHRecButton()

    await wait()

    expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_DECK', {
      cardName: 'Name'
    })
  })

  describe('when clicked', function () {
    let fakeDeck

    beforeEach(async function () {
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

      scryfall.getDeck.mockResolvedValue(fakeDeck)

      scryfall.api.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/arjun-the-shifting-flame'
        }
      })
    })

    it('opens the modal', async function () {
      const btn = await makeEDHRecButton()

      jest.spyOn(Modal.prototype, 'open')
      bus.emit.mockImplementation()

      btn.click()

      expect(Modal.prototype.open).toBeCalledTimes(1)
    })

    it('uses scryfall to populate the iframe src', async function () {
      const btn = await makeEDHRecButton()
      btn.click()

      await wait(5)

      const iframe = document.querySelector('#edhrec-modal iframe')

      expect(iframe.src).toBe('https://example.com/edhrec/arjun-the-shifting-flame')
    })

    it('can handle partner commanders', async function () {
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
      scryfall.api.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/sidar-kondo-of-jamura'
        }
      })

      const btn = await makeEDHRecButton()
      btn.click()

      await wait(5)

      const iframe = document.querySelector('#edhrec-modal iframe')

      expect(iframe.src).toBe('https://example.com/edhrec/sidar-kondo-of-jamura-tana-the-bloodsower')
    })

    it('attempts any number of cards in command zone', async function () {
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
      scryfall.api.get.mockResolvedValue({
        related_uris: {
          edhrec: 'https://example.com/edhrec/sidar-kondo-of-jamura'
        }
      })

      const btn = await makeEDHRecButton()
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
          wait(2).then(() => {
            reply(spy)
          })
        }
      })

      const btn = await makeEDHRecButton()
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
          wait(2).then(() => {
            reply(spy)
          })
        }
      })

      const btn = await makeEDHRecButton()
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
          wait(2).then(() => {
            reply(spy)
          })
        }
      })

      const btn = await makeEDHRecButton()
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

  describe('when commander list changes', function () {
    let fakeDeck, commanderSection

    function addEntry (options = {}) {
      const li = document.createElement('li')
      li.classList.add('deckbuilder-entry')
      li.innerHTML = `
        <select class="deckbuilder-entry-menu-select">
          <option id="option-1">1</option>
          <option id="option-2">2</option>
          <option id="option-3">3</option>
          <option id="option-4">4</option>
          <option id="option-5">5</option>
        </select>
        <textarea class="deckbuilder-entry-input"></textarea>
      `
      if (options.value) {
        li.querySelector('textarea').value = options.value
      }
      if (options.disabled) {
        Array.from(li.querySelectorAll('select option'))
          .forEach(el => el.setAttribute('disabled', 'disabled'))
      }
      commanderSection.querySelector('ul').appendChild(li)
    }

    beforeEach(async function () {
      fakeDeck = {
        entries: {
          commanders: [{
            card_digest: {
              name: 'Arjun, the Shifting Flame'
            }
          }],
          lands: [],
          nonlands: []
        }
      }
      commanderSection = document.createElement('div')
      commanderSection.innerHTML = `
        <div class="deckbuilder-section-title">Commander(s)</div>
        <ul></ul>
      `

      scryfall.getDeck.mockResolvedValue(fakeDeck)
      document.body.appendChild(commanderSection)
    })

    it('enables the button when all entries are commanders', async function () {
      fakeDeck.entries.commanders = []
      addEntry()
      deckParser.hasLegalCommanders.mockResolvedValue(false)

      const btn = await makeEDHRecButton()
      expect(btn.getAttribute('disabled')).toBeTruthy()

      const changeHandler = mutation.change.mock.calls[0][1]

      deckParser.hasLegalCommanders.mockResolvedValue(true)
      commanderSection.querySelector('textarea').value = '1 Arjun, the Shifting Flame'

      await changeHandler(commanderSection)

      expect(btn.getAttribute('disabled')).toBeFalsy()
    })

    it('enables the button entry has gone from illegal state to legal state', async function () {
      fakeDeck.entries.commanders = [{
        card_digest: {
          name: 'Food Chain'
        }
      }]
      addEntry({
        value: '1 Food Chain'
      })
      deckParser.hasLegalCommanders.mockResolvedValue(false)

      const btn = await makeEDHRecButton()
      expect(btn.getAttribute('disabled')).toBeTruthy()

      const changeHandler = mutation.change.mock.calls[0][1]

      deckParser.hasLegalCommanders.mockResolvedValue(true)
      commanderSection.querySelector('textarea').value = '1 Arjun, the Shifting Flame'

      await changeHandler(commanderSection)

      expect(btn.getAttribute('disabled')).toBeFalsy()
    })

    it('disables the button when the values have changed at least one entry is not a commander', async function () {
      addEntry({
        value: '1 Arjun, the Shifting Flame'
      })

      const btn = await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]
      addEntry({
        value: '1 Rhystic Study'
      })

      deckParser.hasLegalCommanders.mockResolvedValue(false)

      expect(btn.getAttribute('disabled')).toBeFalsy()

      await changeHandler(commanderSection)

      expect(btn.getAttribute('disabled')).toBeTruthy()
    })

    it('ignores blank entries', async function () {
      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      addEntry()
      addEntry()
      addEntry({
        value: '1 Arjun, the Shifting Flame'
      })
      addEntry()
      addEntry()

      await changeHandler(commanderSection)

      expect(deckParser.hasLegalCommanders).toBeCalledTimes(1)
      expect(deckParser.hasLegalCommanders).toBeCalledWith([
        'Arjun, the Shifting Flame'
      ])
    })

    it('ignores entries that have not finished lookup', async function () {
      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      addEntry({
        value: '1 Sidar Kondo of Jamuraa'
      })
      addEntry({
        value: '1 Tana the',
        disabled: true
      })

      deckParser.hasLegalCommanders.mockClear()
      await changeHandler(commanderSection)

      expect(deckParser.hasLegalCommanders).toBeCalledTimes(1)
      expect(deckParser.hasLegalCommanders).toBeCalledWith([
        'Sidar Kondo of Jamuraa'
      ])
    })

    it('ignores entries that do not match deck pattern', async function () {
      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      addEntry({
        value: '1 Sidar Kondo of Jamuraa'
      })
      addEntry({
        value: 'Tana the'
      })

      deckParser.hasLegalCommanders.mockClear()
      await changeHandler(commanderSection)

      expect(deckParser.hasLegalCommanders).toBeCalledTimes(1)
      expect(deckParser.hasLegalCommanders).toBeCalledWith([
        'Sidar Kondo of Jamuraa'
      ])
    })

    it('does not check legality of commanders whe commander list is unchanged', async function () {
      addEntry({
        value: '1 Arjun, the Shifting Flame'
      })

      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      deckParser.hasLegalCommanders.mockClear()
      await changeHandler(commanderSection)

      expect(deckParser.hasLegalCommanders).not.toBeCalled()
    })

    it('does not check legality of commanders whe commander list is unchanged but in a different order', async function () {
      fakeDeck.entries.commanders = [{
        card_digest: {
          name: 'Sidar Kondo of Jamuraa'
        }
      }, {
        card_digest: {
          name: 'Tana the Bloodsower'
        }
      }]
      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      deckParser.hasLegalCommanders.mockClear()
      addEntry({
        value: '1 Tana the Bloodsower'
      })
      addEntry({
        value: '1 Sidar Kondo of Jamuraa'
      })

      await changeHandler(commanderSection)

      expect(deckParser.hasLegalCommanders).not.toBeCalled()
    })

    it('does not check commanders when section is not the commander section', async function () {
      const title = document.createElement('div')
      title.innerHTML = 'Lands'
      const fakeEl = {
        querySelector: jest.fn().mockReturnValue(title),
        querySelectorAll: jest.fn()
      }

      await makeEDHRecButton()
      const changeHandler = mutation.change.mock.calls[0][1]

      await changeHandler(fakeEl)

      expect(fakeEl.querySelectorAll).not.toBeCalled()
    })
  })
})
