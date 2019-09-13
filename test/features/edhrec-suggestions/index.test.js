import bus from 'framebus'
import EDHRecSuggestions from '../../../src/js/features/edhrec-suggestions'

describe('EDHRec Suggestions', function () {
  describe('addToDeckEditPage', function () {
    let toolbar, deckbuilderElement

    beforeEach(function () {
      jest.spyOn(bus, 'emit').mockImplementation()

      deckbuilderElement = document.createElement('div')
      deckbuilderElement.id = 'deckbuilder'
      document.body.appendChild(deckbuilderElement)

      toolbar = document.createElement('div')
      toolbar.classList.add('deckbuilder-toolbar-items-right')
      document.body.appendChild(toolbar)
    })

    it('adds an edhrec button to the toolbar items on the page', function () {
      const feature = new EDHRecSuggestions()

      feature.addToDeckEditPage()

      expect(toolbar.querySelector('#edhrec-suggestions')).not.toBeFalsy()
    })

    it.skip('opens an EDHRec modal when button is clicked', function () {
      // TODO
      // const fakeModal = document.createElement('div')
      //
      // document.body.appendChild(btn)
      //
      // bus.emit.mockImplementation((event, cb) => {
      //   const response = {
      //     entries: {},
      //     commanders: []
      //   }
      //
      //   if (event === 'REQUEST_DECK') {
      //     cb(response)
      //   }
      // })
      //
      // btn.click()
      //
      // expect(openEDHRecFrame).toBeCalledTimes(1)
      // expect(openEDHRecFrame).toBeCalledWith(fakeModal)
    })
  })

  it('embeds scryfall embedded script', function () {
    // TODO move to dedicated script
  })
})
