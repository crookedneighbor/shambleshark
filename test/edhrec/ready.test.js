import start from '../../src/js/edhrec/ready'
import mutation from '../../src/js/lib/mutation'
import bus from 'framebus'

describe('EDHRec Ready', function () {
  it('sets up a listener for EDHREC_READY event', function () {
    expect(bus.emit.callCount).to.equal(0)

    start()

    expect(bus.emit.callCount).to.equal(1)
    expect(bus.emit).to.be.calledWith('EDHREC_READY')
  })

  context('when edhrec iframe reports it it sready', function () {
    beforeEach(function () {
      sandbox.stub(mutation, 'ready')

      bus.emit.withArgs('EDHREC_READY').yields()
    })

    it('removes non-essential elements', function () {
      const el = this.makeDiv()
      const el2 = this.makeDiv()
      const el3 = this.makeDiv()
      const el4 = this.makeDiv()
      const el5 = this.makeDiv()

      mutation.ready.withArgs('#leaderboard').yields(el)
      mutation.ready.withArgs('.edhrec2__panels-outer').yields(el2)
      mutation.ready.withArgs('.decklist').yields(el3)
      mutation.ready.withArgs('.footer').yields(el4)
      mutation.ready.withArgs('.navbar-header .navbar-toggle').yields(el5)

      start()

      expect(el.parentNode.removeChild).to.be.calledWith(el)
      expect(el2.parentNode.removeChild).to.be.calledWith(el2)
      expect(el3.parentNode.removeChild).to.be.calledWith(el3)
      expect(el4.parentNode.removeChild).to.be.calledWith(el4)
      expect(el5.parentNode.removeChild).to.be.calledWith(el5)
    })

    it('removes href attributes from links', function () {
      const el = this.makeDiv()

      mutation.ready.withArgs('.cards a').yields(el)

      start()

      expect(el.removeAttribute.callCount).to.equal(1)
      expect(el.removeAttribute).to.be.calledWith('href')
    })

    it('styles button as purple', function () {
      const btn = this.makeDiv()

      btn.getAttribute.withArgs('onclick').returns('toggleCardInDecklistButtonOnClick(event,Rashmi, Eternities Crafter')

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(btn)

      start()

      expect(btn.style.background).to.equal('#634496')
    })

    it('sets a click handler on card buttons to toggle the class of the icon', function () {
      const btn = this.makeDiv()
      const icon = this.makeDiv()

      btn.querySelector.withArgs('.toggle-card-in-decklist-button-icon').returns(icon)

      btn.getAttribute.withArgs('onclick').returns('toggleCardInDecklistButtonOnClick(event,Rashmi, Eternities Crafter')
      btn.addEventListener.yields({ preventDefault: sandbox.stub() })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(btn)

      start()

      expect(icon.classList.toggle).to.be.calledWith('glyphicon-plus')
      expect(icon.classList.toggle).to.be.calledWith('glyphicon-ok')
    })

    it('sets a click handler on card buttons to add card', function () {
      const btn = this.makeDiv()
      const icon = this.makeDiv()

      btn.querySelector.withArgs('.toggle-card-in-decklist-button-icon').returns(icon)

      btn.getAttribute.withArgs('onclick').returns(`toggleCardInDecklistButtonOnClick(event,'Rashmi, Eternities Crafter')`)
      btn.addEventListener.yields({ preventDefault: sandbox.stub() })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(btn)

      start()

      expect(btn.setAttribute).to.be.calledWith('data-present-in-scryfall-decklist', true)
      expect(bus.emit).to.be.calledWith('ADD_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it('sets a click handler on card buttons to remove card if card is already marked as being in the deck', function () {
      const btn = this.makeDiv()
      const icon = this.makeDiv()

      btn.querySelector.withArgs('.toggle-card-in-decklist-button-icon').returns(icon)

      btn.hasAttribute.withArgs('data-present-in-scryfall-decklist').returns(true)
      btn.getAttribute.withArgs('onclick').returns(`toggleCardInDecklistButtonOnClick(event,'Rashmi, Eternities Crafter')`)
      btn.addEventListener.yields({ preventDefault: sandbox.stub() })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(btn)

      start()

      expect(btn.removeAttribute).to.be.calledWith('data-present-in-scryfall-decklist')
      expect(bus.emit).to.be.calledWith('REMOVE_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it.skip('sets btn state depending on if the deck has the card already', function () {
      // not implemented
    })
  })
})
