import EDHRecSuggestions from '../../../src/js/features/edhrec-suggestions'

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
    })

    it('adds an edhrec button to the toolbar items on the page', function () {
      const feature = new EDHRecSuggestions()

      feature.run()

      expect(toolbar.querySelector('#edhrec-suggestions')).not.toBeFalsy()
    })
  })
})
