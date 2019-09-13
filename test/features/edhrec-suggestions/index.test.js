import EDHRecSuggestions from '../../../src/js/features/edhrec-suggestions'

describe('EDHRec Suggestions', function () {
  describe('run', function () {
    let toolbar, deckbuilderElement

    beforeEach(function () {
      deckbuilderElement = document.createElement('div')
      deckbuilderElement.id = 'deckbuilder'
      document.body.appendChild(deckbuilderElement)

      toolbar = document.createElement('div')
      toolbar.classList.add('deckbuilder-toolbar-items-right')
      document.body.appendChild(toolbar)
    })

    it('adds an edhrec button to the toolbar items on the page', function () {
      const feature = new EDHRecSuggestions()

      feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).not.toBeFalsy()
    })

    it('adds an edhrec modal to page', function () {
      const feature = new EDHRecSuggestions()

      feature.run()

      expect(deckbuilderElement.querySelector('#edhrec-modal')).not.toBeFalsy()
    })
  })
})
