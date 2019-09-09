import bus from 'framebus'
import editPage from '../../src/js/scryfall/edit-page'

describe('scryfall edit page', function () {
  context('EDHRec button', function () {
    beforeEach(function () {
      this.toolbar = this.makeDiv()
      this.script = this.makeDiv()
      this.button = this.makeDiv()
      this.modal = this.makeDiv()
      this.modal.querySelector.returns(this.makeDiv())
      document.querySelector.withArgs('.deckbuilder-toolbar-items-right').returns(this.toolbar)
      document.createElement.withArgs('button').returns(this.button)
      document.createElement.withArgs('div').returns(this.modal)
      document.createElement.withArgs('script').returns(this.script)
    })

    it('adds an edhrec button to the toolbar items on the page', function () {
      editPage()

      expect(document.querySelector).to.be.calledWith('.deckbuilder-toolbar-items-right')
      expect(this.toolbar.appendChild.callCount).to.equal(1)
      expect(this.toolbar.appendChild).to.be.calledWith()
    })

    it.skip('opens an EDHRec modal when button is clicked', function () {
      editPage()

      const clickHandler = this.button.addEventListener.args[0][1]
      const fakeDeckbuilderElement = this.makeDiv()

      bus.emit.withArgs('REQUEST_DECK').yields({
        entries: {},
        commanders: []
      })
      document.getElementById.withArgs('deckbuilder').returns(fakeDeckbuilderElement)

      clickHandler({
        preventDefault: sandbox.stub()
      })

      expect(bus.emit).to.be.calledWith('REQUEST_DECK')
      expect(fakeDeckbuilderElement.apprendChild).to.be.calledWith(this.modal)
      expect(this.modal.removeAttribute).to.be.calledWith('style')
    })

    it('closes modal when close button is clicked', function () {
      // TODO
    })
  })

  it('embeds scryfall embedded script', function () {
    // TODO move to dedicated script
  })
})
