import ScryfallSearch from '../../../src/js/features/deck-builder-features/scryfall-search'

describe('Scryfall Search', function () {
  describe('run', function () {
    let headerSearchField

    beforeEach(function () {
      headerSearchField = document.createElement('input')
      headerSearchField.id = 'header-search-field'

      document.body.appendChild(headerSearchField)
    })

    it('creates a drawer', async function () {
      const ss = new ScryfallSearch()

      jest.spyOn(ss, 'createDrawer').mockReturnValue({})

      await ss.run()

      expect(ss.createDrawer).toBeCalledTimes(1)
    })

    it('sets up event listener for search bar', async function () {
      const ss = new ScryfallSearch()

      jest.spyOn(ss, 'createDrawer').mockReturnValue({})
      jest.spyOn(ss, 'onEnter').mockReturnValue({})

      await ss.run()

      headerSearchField.value = 'is:commander'
      headerSearchField.dispatchEvent(new KeyboardEvent('keydown',{key:'a'}));
      expect(ss.onEnter).toBeCalledTimes(0)

      headerSearchField.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
      expect(ss.onEnter).toBeCalledTimes(1)
      expect(ss.onEnter).toBeCalledWith('is:commander')
    })
  })
})
