import addEDHRecIframe from 'Features/deck-builder-features/edhrec-suggestions/add-edhrec-iframe'
import deckParser from 'Lib/deck-parser'
import mutation from 'Lib/mutation'
import scryfall from 'Lib/scryfall'
import iframe from 'Lib/iframe'

describe('addEDHRecIframe', function () {
  let btn

  beforeEach(function () {
    btn = document.createElement('button')

    jest.spyOn(scryfall.api, 'get')
    jest.spyOn(scryfall, 'getDeck').mockResolvedValue({
      entries: {
        commanders: []
      }
    })
    jest.spyOn(deckParser, 'hasLegalCommanders').mockResolvedValue(true)
    jest.spyOn(deckParser, 'getSections').mockReturnValue([
      'commanders',
      'lands',
      'nonlands',
      'maybeboard'
    ])
    jest.spyOn(mutation, 'change').mockImplementation()

    const deckbuilderElement = document.createElement('div')
    deckbuilderElement.id = 'deckbuilder'
    document.body.appendChild(deckbuilderElement)

    jest.spyOn(iframe, 'create').mockResolvedValue()
  })

  it('sets button to disabled when requested deck does not have legal commanders', async function () {
    deckParser.hasLegalCommanders.mockResolvedValue(false)

    await addEDHRecIframe(btn)

    expect(btn.getAttribute('disabled')).toBe('disabled')
  })

  it('sets button to not disabled when requested has legal commanders', async function () {
    deckParser.hasLegalCommanders.mockResolvedValue(true)

    await addEDHRecIframe(btn)

    expect(btn.getAttribute('disabled')).toBeFalsy()
  })

  it('adds an edhrec iframe to page', async function () {
    await addEDHRecIframe(btn)

    expect(iframe.create).toBeCalledTimes(1)
    expect(iframe.create).toBeCalledWith({
      src: 'https://edhrec.com/404',
      id: 'edhrec-suggestions-iframe'
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
        <div class="deckbuilder-section-title"></div>
        <ul></ul>
      `
      commanderSection.querySelector('.deckbuilder-section-title').innerText = 'Commander(s)'

      scryfall.getDeck.mockResolvedValue(fakeDeck)
      document.body.appendChild(commanderSection)
    })

    it('enables the button when all entries are commanders', async function () {
      fakeDeck.entries.commanders = []
      addEntry()
      deckParser.hasLegalCommanders.mockResolvedValue(false)

      await addEDHRecIframe(btn)
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

      await addEDHRecIframe(btn)
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

      await addEDHRecIframe(btn)
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
      await addEDHRecIframe(btn)
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
      await addEDHRecIframe(btn)
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
      await addEDHRecIframe(btn)
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

      await addEDHRecIframe(btn)
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
      await addEDHRecIframe(btn)
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
      title.innerText = 'Lands'
      const fakeEl = {
        querySelector: jest.fn().mockReturnValue(title),
        querySelectorAll: jest.fn()
      }

      await addEDHRecIframe(btn)
      const changeHandler = mutation.change.mock.calls[0][1]

      await changeHandler(fakeEl)

      expect(fakeEl.querySelectorAll).not.toBeCalled()
    })
  })
})
