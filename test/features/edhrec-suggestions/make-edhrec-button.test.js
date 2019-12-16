import bus from 'framebus'
import makeEDHRecButton from '../../../src/js/features/deck-builder-features/edhrec-suggestions/make-edhrec-button'
import deckParser from '../../../src/js/lib/deck-parser'
import wait from '../../../src/js/lib/wait'
import Drawer from '../../../src/js/lib/ui-elements/drawer'
import mutation from '../../../src/js/lib/mutation'
import scryfall from '../../../src/js/lib/scryfall'
import iframe from '../../../src/js/lib/iframe'

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

    jest.spyOn(iframe, 'create').mockResolvedValue()
    // jest doesn't know about the scrollTo method on elements
    jest.spyOn(Drawer.prototype, 'scrollTo').mockImplementation()
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

  it('adds an edhrec drawer to page', async function () {
    await makeEDHRecButton()

    expect(document.querySelector('#edhrec-drawer')).not.toBeFalsy()
  })

  it('adds an edhrec iframe to page', async function () {
    await makeEDHRecButton()

    expect(iframe.create).toBeCalledTimes(1)
    expect(iframe.create).toBeCalledWith({
      src: 'https://edhrec.com/404',
      id: 'edhrec-suggestions-iframe'
    })
  })

  it('cleans up deck after drawer is closed', async function () {
    const button = await makeEDHRecButton()

    button.click()

    const drawer = document.querySelector('#edhrec-drawer')
    const closeButton = drawer.querySelector('.modal-dialog-close')

    closeButton.click()

    expect(bus.emit).toBeCalledWith('CLEAN_UP_DECK')
  })

  it('focuses back on the button when closed', async function () {
    const button = await makeEDHRecButton()

    button.click()

    const drawer = document.querySelector('#edhrec-drawer')
    const closeButton = drawer.querySelector('.modal-dialog-close')

    closeButton.click()

    expect(document.activeElement).toBe(button)
  })

  describe('when clicked', function () {
    let fakeDeck, fakeEDHRecResponse

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
          lands: [
            {
              count: 1,
              card_digest: {
                id: 'reliquary-tower',
                name: 'Reliquary Tower'
              }
            }
          ],
          nonlands: [
            {
              count: 1,
              card_digest: {
                id: 'obstinate-familiar',
                name: 'Obstinate Familiar'
              }
            }
          ]
        }
      }
      fakeEDHRecResponse = {
        commanders: [
          // irrelevant
        ],
        outRecs: [
          // TODO future improvement
        ],
        inRecs: [
          {
            sanitized: 'arcane-signet',
            scryfall_uri: 'https://scryfall.com/card/eld/331/arcane-signet?utm_source=api',
            cmc: 2,
            names: [
              'Arcane Signet'
            ],
            primary_types: [
              'Artifact'
            ],
            price: 19.99,
            color_identity: [],
            salt: 0,
            tcgplayer: {
              url: 'https://store.tcgplayer.com/magic/throne-of-eldraine/arcane-signet?partner=EDHREC&utm_campaign=affiliate&utm_medium=EDHREC&utm_source=EDHREC',
              name: 'arcane signet',
              price: 11.4
            },
            images: [
              'https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723'
            ],
            name: 'Arcane Signet',
            cmcs: [
              2
            ],
            color_id: [],
            score: 73
          },
          {
            sanitized: 'shivan-reef',
            scryfall_uri: 'https://scryfall.com/card/ori/251/shivan-reef?utm_source=api',
            cmc: 0,
            names: [
              'Shivan Reef'
            ],
            primary_types: [
              'Land'
            ],
            price: 1.99,
            color_identity: [
              'R',
              'U'
            ],
            salt: 0.13793103448275862,
            images: [
              'https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659'
            ],
            name: 'Shivan Reef',
            cmcs: [
              0
            ],
            color_id: [
              'R',
              'U'
            ],
            score: 59,
            image: 'https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659'
          },
          {
            sanitized: 'arcane-denial',
            scryfall_uri: 'https://scryfall.com/card/a25/41/arcane-denial?utm_source=api',
            cmc: 2,
            names: [
              'Arcane Denial'
            ],
            primary_types: [
              'Instant'
            ],
            price: 0.79,
            color_identity: [
              'U'
            ],
            salt: 0.7719298245614035,
            images: [
              'https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019'
            ],
            url: '/cards/arcane-denial',
            name: 'Arcane Denial',
            cmcs: [
              2
            ],
            color_id: [
              'U'
            ],
            score: 52,
            image: 'https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019'
          }
        ]
      }
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        if (eventName === 'REQUEST_EDHREC_RECOMENDATIONS') {
          reply([null, fakeEDHRecResponse])
        }
      })

      scryfall.getDeck.mockResolvedValue(fakeDeck)
    })

    afterEach(async function () {
      // allow mocked promises to resolve
      await wait()
    })

    it('opens the drawer', async function () {
      bus.emit.mockImplementation()
      const btn = await makeEDHRecButton()

      jest.spyOn(Drawer.prototype, 'open')

      btn.click()

      expect(Drawer.prototype.open).toBeCalledTimes(1)
    })

    it('emits a request for EDHRec recomendations with deck data', async function () {
      bus.emit.mockImplementation()
      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      expect(bus.emit).toBeCalledTimes(1)
      expect(bus.emit).toBeCalledWith('REQUEST_EDHREC_RECOMENDATIONS', {
        commanders: ['Arjun, the Shifting Flame'],
        cards: [
          '1 Reliquary Tower',
          '1 Obstinate Familiar'
        ]
      }, expect.any(Function))
    })

    it('attempts any number of cards in command zone', async function () {
      bus.emit.mockImplementation()
      fakeDeck.entries.commanders = [
        {
          card_digest: {
            id: 'sidar-id',
            name: 'Sidar Kondo of Jamuraa'
          }
        },
        {
          card_digest: {
            id: 'tana-id',
            name: 'Tana, the Bloodsower'
          }
        },
        {
          card_digest: {
            id: 'reyhan-id',
            name: 'Reyhan, Last of the Abzan'
          }
        }
      ]

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      expect(bus.emit).toBeCalledTimes(1)
      expect(bus.emit).toBeCalledWith('REQUEST_EDHREC_RECOMENDATIONS', {
        commanders: [
          'Sidar Kondo of Jamuraa',
          'Tana, the Bloodsower',
          'Reyhan, Last of the Abzan'
        ],
        cards: [
          '1 Reliquary Tower',
          '1 Obstinate Familiar'
        ]
      }, expect.any(Function))
    })

    it('does not error when cards in deck are missing the card_digest', async function () {
      bus.emit.mockImplementation()
      fakeDeck.entries.lands.push({
        foo: 'bar'
      }, {
        count: 5,
        card_digest: {
          name: 'Island'
        }
      })
      fakeDeck.entries.nonlands.push({
        count: 1,
        card_digest: {
          name: 'Rhystic Study'
        }
      })

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      expect(bus.emit).toBeCalledTimes(1)
      expect(bus.emit).toBeCalledWith('REQUEST_EDHREC_RECOMENDATIONS', {
        commanders: [
          'Arjun, the Shifting Flame'
        ],
        cards: [
          '1 Reliquary Tower',
          '5 Island',
          '1 Obstinate Familiar',
          '1 Rhystic Study'
        ]
      }, expect.any(Function))
    })

    it('displays generic error when edhrec request errors', async function () {
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        const err = new Error('network error')

        reply([err])
      })
      jest.spyOn(Drawer.prototype, 'setContent')

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      const body = document.querySelector('#edhrec-drawer').innerHTML
      expect(body).toContain('An unknown error occurred:')
      expect(body).toContain('network error')
    })

    it('displays specific error when edhrec request errors with specific errors', async function () {
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        const err = {
          errors: ['1 error', '2 error']
        }

        reply([err])
      })
      jest.spyOn(Drawer.prototype, 'setContent')

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      const errors = document.querySelectorAll('#edhrec-drawer li')
      expect(errors[0].innerHTML).toContain('1 error')
      expect(errors[1].innerHTML).toContain('2 error')
    })

    it('populates drawer with list of recomendations organized by type', async function () {
      jest.spyOn(Drawer.prototype, 'setContent')
      jest.spyOn(Drawer.prototype, 'setLoading')

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      expect(Drawer.prototype.setContent).toBeCalledTimes(1)
      expect(Drawer.prototype.setLoading).toBeCalledWith(false)

      const sections = document.querySelectorAll('#edhrec-drawer .edhrec-suggestions-container')

      expect(sections.length).toBe(3)
      expect(sections[0].querySelector('h3').innerHTML).toBe('Instants')
      expect(sections[0].querySelector('.edhrec-suggestions img').src).toBe('https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019')
      expect(sections[0].querySelector('.edhrec-suggestions img').alt).toBe('Add Arcane Denial to deck')
      expect(sections[1].querySelector('h3').innerHTML).toBe('Artifacts')
      expect(sections[1].querySelector('.edhrec-suggestions img').src).toBe('https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723')
      expect(sections[1].querySelector('.edhrec-suggestions img').alt).toBe('Add Arcane Signet to deck')
      expect(sections[2].querySelector('h3').innerHTML).toBe('Lands')
      expect(sections[2].querySelector('.edhrec-suggestions img').src).toBe('https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659')
      expect(sections[2].querySelector('.edhrec-suggestions img').alt).toBe('Add Shivan Reef to deck')
    })

    it('looks up nonland card in scryfall and adds it to deck when chosen', async function () {
      const btn = await makeEDHRecButton()
      jest.spyOn(scryfall.api, 'get').mockResolvedValue({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type_line: 'Instant'
      })

      btn.click()

      await wait()

      const cardElement = document.querySelectorAll('#edhrec-drawer .edhrec-suggestion-card-container')[0]

      cardElement.click()

      expect(scryfall.api.get).toBeCalledTimes(1)
      expect(scryfall.api.get).toBeCalledWith('/cards/a25/41')

      await wait()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Arcane Denial',
        cardId: 'arcane-denial-id',
        isLand: false
      })
    })

    it('looks up land card in scryfall and adds it to deck when chosen', async function () {
      const btn = await makeEDHRecButton()
      jest.spyOn(scryfall.api, 'get').mockResolvedValue({
        name: 'Island',
        id: 'island-id',
        type_line: 'Basic Land'
      })

      btn.click()

      await wait()

      const cardElement = document.querySelectorAll('#edhrec-drawer .edhrec-suggestion-card-container')[0]

      cardElement.click()

      expect(scryfall.api.get).toBeCalledTimes(1)
      expect(scryfall.api.get).toBeCalledWith('/cards/a25/41')

      await wait()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Island',
        cardId: 'island-id',
        isLand: true
      })
    })

    it('can handle add/remove with enter key when focused', async function () {
      const btn = await makeEDHRecButton()
      jest.spyOn(scryfall.api, 'get').mockResolvedValue({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type_line: 'Instant'
      })

      btn.click()

      await wait()

      const cardElement = document.querySelectorAll('#edhrec-drawer .edhrec-suggestion-card-container')[0]

      cardElement.focus()
      const evt = new global.KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        which: 13
      })
      cardElement.dispatchEvent(evt)

      expect(scryfall.api.get).toBeCalledTimes(1)
      expect(scryfall.api.get).toBeCalledWith('/cards/a25/41')

      await wait()

      expect(bus.emit).toBeCalledWith('ADD_CARD_TO_DECK', {
        cardName: 'Arcane Denial',
        cardId: 'arcane-denial-id',
        isLand: false
      })

      cardElement.dispatchEvent(evt)

      expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_DECK', {
        cardName: 'Arcane Denial'
      })
    })

    it('handles error from scryfall lookup when card is chosen', async function () {
      const errFromScryfall = new Error('Error from scryfall')
      const btn = await makeEDHRecButton()

      jest.spyOn(scryfall.api, 'get').mockRejectedValue(errFromScryfall)
      jest.spyOn(console, 'error').mockImplementation()

      btn.click()

      await wait()

      const cardElement = document.querySelectorAll('#edhrec-drawer .edhrec-suggestion-card-container')[0]

      cardElement.click()

      expect(scryfall.api.get).toBeCalledTimes(1)
      expect(scryfall.api.get).toBeCalledWith('/cards/a25/41')

      await wait()

      expect(bus.emit).not.toBeCalledWith('ADD_CARD_TO_DECK', expect.any(Object))
      expect(bus.emit).toBeCalledWith('SCRYFALL_PUSH_NOTIFICATION', {
        header: 'Card could not be added',
        message: 'There was an error adding Arcane Denial to the deck. See console for more details.',
        color: 'red'
      })

      expect(cardElement.querySelector('img').alt).toBe('Error adding Arcane Denial to deck.')
      expect(console.error).toBeCalledWith(errFromScryfall)
    })

    it('removes card from deck when chosen a second time', async function () {
      const btn = await makeEDHRecButton()
      jest.spyOn(scryfall.api, 'get').mockResolvedValue({
        name: 'Arcane Denial',
        id: 'arcane-denial-id',
        type_line: 'Instant'
      })

      btn.click()

      await wait()

      const cardElement = document.querySelectorAll('#edhrec-drawer .edhrec-suggestion-card-container')[0]

      cardElement.click()

      await wait()

      cardElement.click()

      expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_DECK', {
        cardName: 'Arcane Denial'
      })
    })

    it('organizes sections in particular order', async function () {
      fakeEDHRecResponse.inRecs.push({
        sanitized: 'fake-creature',
        scryfall_uri: 'https://scyrfall.com/card/set/id/fake-creature',
        cmc: 2,
        names: [
          'Fake Creature'
        ],
        primary_types: [
          'Creature'
        ],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: [
          'fake-creature.png'
        ],
        name: 'Fake Creature',
        cmcs: [
          2
        ],
        color_id: [],
        score: 73
      }, {
        sanitized: 'fake-sorcery',
        scryfall_uri: 'https://scryfall.com/card/set/id/fake-sorcery',
        cmc: 2,
        names: [
          'Fake Sorcery'
        ],
        primary_types: [
          'Sorcery'
        ],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: [
          'fake-sorcery.png'
        ],
        name: 'Fake Sorcery',
        cmcs: [
          2
        ],
        color_id: [],
        score: 73
      }, {
        sanitized: 'fake-enchantment',
        scryfall_uri: 'https://scryfall.com/card/set/id/fake-enchantment',
        cmc: 2,
        names: [
          'Fake Enchantment'
        ],
        primary_types: [
          'Enchantment'
        ],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: [
          'fake-enchantment.png'
        ],
        name: 'Fake Enchantment',
        cmcs: [
          2
        ],
        color_id: [],
        score: 73
      }, {
        sanitized: 'fake-planeswalker',
        scryfall_uri: 'https://scryfall.com/card/set/id/fake-planeswalker',
        cmc: 2,
        names: [
          'Fake Planeswalker'
        ],
        primary_types: [
          'Planeswalker'
        ],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: [
          'fake-planeswalker.png'
        ],
        name: 'Fake Planeswalker',
        cmcs: [
          2
        ],
        color_id: [],
        score: 73
      })

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      const sections = document.querySelectorAll('#edhrec-drawer .edhrec-suggestions-container')

      expect(sections.length).toBe(7)
      expect(sections[0].querySelector('h3').innerHTML).toBe('Creatures')
      expect(sections[1].querySelector('h3').innerHTML).toBe('Instants')
      expect(sections[2].querySelector('h3').innerHTML).toBe('Sorceries')
      expect(sections[3].querySelector('h3').innerHTML).toBe('Artifacts')
      expect(sections[4].querySelector('h3').innerHTML).toBe('Enchantments')
      expect(sections[5].querySelector('h3').innerHTML).toBe('Planeswalkers')
      expect(sections[6].querySelector('h3').innerHTML).toBe('Lands')
    })

    it('ignores unknown sections', async function () {
      fakeEDHRecResponse.inRecs.push({
        sanitized: 'fake-unknown-type',
        scryfall_uri: 'https://scryfall.com/card/set/id/fake-unknown-type',
        cmc: 2,
        names: [
          'Fake Unknown Type'
        ],
        primary_types: [
          'Unknown Type'
        ],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: [
          'fake-unknown-type.png'
        ],
        name: 'Fake Unknown Type',
        cmcs: [
          2
        ],
        color_id: [],
        score: 73
      })

      const btn = await makeEDHRecButton()

      btn.click()

      await wait()

      const sections = document.querySelectorAll('#edhrec-drawer .edhrec-suggestions-container')

      expect(sections.length).toBe(3)
      expect(sections[0].querySelector('h3').innerHTML).toBe('Instants')
      expect(sections[1].querySelector('h3').innerHTML).toBe('Artifacts')
      expect(sections[2].querySelector('h3').innerHTML).toBe('Lands')
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
