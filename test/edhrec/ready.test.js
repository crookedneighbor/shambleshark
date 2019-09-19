import start from '../../src/js/edhrec/ready'
import mutation from '../../src/js/lib/mutation'
import bus from 'framebus'

describe('EDHRec Ready', function () {
  let elementsToDelete

  beforeEach(function () {
    jest.spyOn(bus, 'emit').mockImplementation((event, reply) => {
      const response = {
        cardsInDeck: {}
      }

      if (event === 'EDHREC_READY') {
        reply(response)
      }
    })

    elementsToDelete = {
      '#leaderboard': document.createElement('div'),
      '.edhrec2__panels-outer': document.createElement('div'),
      '.decklist': document.createElement('div'),
      '.footer': document.createElement('div'),
      '.navbar-header .navbar-toggle': document.createElement('div')
    }

    Object.keys(elementsToDelete).forEach((selector) => {
      document.body.appendChild(elementsToDelete[selector])
    })
  })

  it('removes non-essential elements', function () {
    jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
      if (selector in elementsToDelete) {
        cb(elementsToDelete[selector])
      }
    })

    start()

    expect(document.querySelector('#leaderbaord')).toBeNull()
    expect(document.querySelector('.edhrec2__panels-outer')).toBeNull()
    expect(document.querySelector('.decklist')).toBeNull()
    expect(document.querySelector('.footer')).toBeNull()
    expect(document.querySelector('.navbar-header .navbar-toggle')).toBeNull()
  })

  it('removes href attributes from links', function () {
    const el = document.createElement('a')
    el.href = 'https://example.com'

    jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
      if (selector === '.cards a') {
        cb(el)
      }
    })

    start()

    expect(el.href).toBeFalsy()
  })

  describe('button handlers', function () {
    let btn

    beforeEach(function () {
      jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
        if (selector in elementsToDelete) {
          cb(elementsToDelete[selector])
        }
        if (selector === '.toggle-card-in-decklist-button') {
          cb(btn)
        }
      })

      btn = document.createElement('div')
      const icon = document.createElement('div')

      icon.classList.add('toggle-card-in-decklist-button-icon')
      btn.setAttribute('onclick', 'toggleCardInDecklistButtonOnClick(event,\'Rashmi, Eternities Crafter\')')
      btn.appendChild(icon)

      document.body.appendChild(btn)
    })

    it('replaces button with a new button', function () {
      expect(document.body.children).toContain(btn)

      start()

      expect(document.body.children).not.toContain(btn)
      expect(document.querySelector('.toggle-card-in-decklist-button')).not.toBeFalsy()
    })

    it('styles button as purple', function () {
      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.style.background).toBe('rgb(99, 68, 150)')
    })

    it('defaults glyphicon icon to plus state', function () {
      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).toContain('glyphicon-plus')
    })

    it('sets a click handler on card buttons to toggle the class of the icon', function () {
      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).toContain('glyphicon-plus')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).not.toContain('glyphicon-ok')

      newBtn.click()

      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).not.toContain('glyphicon-plus')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).toContain('glyphicon-ok')
    })

    it('sets a click handler on card buttons to add card', function () {
      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.getAttribute('data-present-in-scryfall-decklist')).toBe('false')

      newBtn.click()

      expect(newBtn.getAttribute('data-present-in-scryfall-decklist')).toBe('true')

      expect(bus.emit).toBeCalledWith('ADD_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it('sets a click handler on card buttons to remove card if card is already marked as being in the deck', function () {
      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      newBtn.setAttribute('data-present-in-scryfall-decklist', 'true')

      newBtn.click()

      expect(newBtn.getAttribute('data-present-in-scryfall-decklist')).toBe('false')
      expect(bus.emit).toBeCalledWith('REMOVE_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it('configures button to show that card is already in deck if card is in deck', function () {
      bus.emit.mockImplementation((event, cb) => {
        const response = {
          cardsInDeck: {
            'Rashmi, Eternities Crafter': true
          }
        }

        if (event === 'EDHREC_READY') {
          cb(response)
        }
      })

      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.getAttribute('data-present-in-scryfall-decklist')).toBe('true')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).toContain('glyphicon-ok')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).not.toContain('glyphicon-plus')
    })

    it('configures button to show that cared is not already in deck if card is not in deck', function () {
      bus.emit.mockImplementation((event, cb) => {
        const response = {
          cardsInDeck: {
            'some other card': true
          }
        }

        if (event === 'EDHREC_READY') {
          cb(response)
        }
      })

      start()

      const newBtn = document.querySelector('.toggle-card-in-decklist-button')

      expect(newBtn.getAttribute('data-present-in-scryfall-decklist')).toBe('false')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).not.toContain('glyphicon-ok')
      expect(newBtn.querySelector('.toggle-card-in-decklist-button-icon').className).toContain('glyphicon-plus')
    })
  })
})
