import EDHRecSuggestions from '../../../src/js/features/edhrec-suggestions'
import scryfall from '../../../src/js/lib/scryfall'
import deckParser from '../../../src/js/lib/deck-parser'

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

      jest.spyOn(deckParser, 'isCommanderLikeDeck').mockResolvedValue(true)
      jest.spyOn(scryfall, 'getDeck').mockResolvedValue({
        entries: {
          commanders: []
        }
      })
    })

    it('adds an edhrec button to the toolbar items on the page for a commander-like deck', async function () {
      const feature = new EDHRecSuggestions()

      await feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).not.toBeFalsy()
    })

    it('does not add an edhrec button to the toolbar items on the page for a non-commander deck', async function () {
      const feature = new EDHRecSuggestions()

      deckParser.isCommanderLikeDeck.mockResolvedValue(false)

      await feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).toBeFalsy()
    })
  })
})
