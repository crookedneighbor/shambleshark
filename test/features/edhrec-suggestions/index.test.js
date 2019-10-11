import EDHRecSuggestions from '../../../src/js/features/edhrec-suggestions'
import scryfall from '../../../src/js/lib/scryfall'
import mutation from '../../../src/js/lib/mutation'
import iframe from '../../../src/js/lib/iframe'

describe('EDHRec Suggestions', function () {
  describe('run', function () {
    let toolbar

    beforeEach(function () {
      toolbar = document.createElement('div')
      toolbar.classList.add('deckbuilder-toolbar-items-right')
      document.body.appendChild(toolbar)

      // for the modal that the button creates
      const deckbuilderElement = document.createElement('div')
      deckbuilderElement.id = 'deckbuilder'
      document.body.appendChild(deckbuilderElement)

      jest.spyOn(scryfall, 'getDeck').mockResolvedValue({
        entries: {
          commanders: []
        }
      })
      jest.spyOn(mutation, 'change').mockImplementation()
      jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
        const el = document.createElement('div')
        el.innerHTML = 'Commander(s)'

        cb(el)
      })

      jest.spyOn(iframe, 'create').mockResolvedValue()
    })

    it('adds an edhrec button to the toolbar items on the page for a commander deck', async function () {
      const feature = new EDHRecSuggestions()

      await feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).not.toBeFalsy()
    })

    it('does not add an edhrec button to the toolbar items on the page for a non-commander deck', async function () {
      const feature = new EDHRecSuggestions()

      mutation.ready.mockImplementation((selector, cb) => {
        const el = document.createElement('div')
        el.innerHTML = 'Lands'

        cb(el)
      })

      await feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).toBeFalsy()
    })
  })
})
