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

  context('when edhrec iframe reports it is ready', function () {
    beforeEach(function () {
      sandbox.stub(mutation, 'ready')

      this.btn = this.makeDiv()
      this.newBtn = this.makeDiv()
      this.icon = this.makeDiv()
      this.newBtn.querySelector.withArgs('.toggle-card-in-decklist-button-icon').returns(this.icon)
      this.btn.getAttribute.withArgs('onclick').returns('toggleCardInDecklistButtonOnClick(event,\'Rashmi, Eternities Crafter\')')
      this.newBtn.getAttribute.withArgs('data-present-in-scryfall-decklist').returns('false')
      document.createElement.withArgs('div').returns(this.newBtn)

      bus.emit.withArgs('EDHREC_READY').yields({
        cardsInDeck: {}
      })
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

    it('replaces button with a new button', function () {
      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.btn.parentNode.removeChild).to.be.calledWith(this.btn)
      expect(this.btn.parentNode.appendChild).to.be.calledWith(this.newBtn)
    })

    it('styles button as purple', function () {
      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.newBtn.style.background).to.equal('#634496')
    })

    it('removes default icon styling', function () {
      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.icon.classList.remove).to.be.calledWith('glyphicon-plus')
      expect(this.icon.classList.remove).to.be.calledWith('glyphicon-ok')
    })

    it('sets a click handler on card buttons to toggle the class of the icon', function () {
      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      const clickHandler = this.newBtn.addEventListener.args[0][1]

      this.icon.classList.remove.resetHistory()
      this.icon.classList.add.resetHistory()

      clickHandler({
        preventDefault: sandbox.stub()
      })

      expect(this.icon.classList.remove).to.be.calledWith('glyphicon-plus')
      expect(this.icon.classList.remove).to.be.calledWith('glyphicon-ok')
      expect(this.icon.classList.add).to.be.calledWith('glyphicon-ok')
      expect(this.icon.classList.add).to.not.be.calledWith('glyphicon-plus')
    })

    it('sets a click handler on card buttons to add card', function () {
      this.newBtn.addEventListener.yields({ preventDefault: sandbox.stub() })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.newBtn.setAttribute).to.be.calledWith('data-present-in-scryfall-decklist', 'true')
      expect(bus.emit).to.be.calledWith('ADD_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it('sets a click handler on card buttons to remove card if card is already marked as being in the deck', function () {
      this.newBtn.getAttribute.withArgs('data-present-in-scryfall-decklist').returns('true')
      this.newBtn.addEventListener.yields({ preventDefault: sandbox.stub() })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.newBtn.setAttribute).to.be.calledWith('data-present-in-scryfall-decklist', 'false')
      expect(bus.emit).to.be.calledWith('REMOVE_CARD_FROM_EDHREC', {
        cardName: 'Rashmi, Eternities Crafter'
      })
    })

    it('configures button to show that cared is already in deck if card is in deck', function () {
      bus.emit.withArgs('EDHREC_READY').yields({
        cardsInDeck: {
          'Rashmi, Eternities Crafter': true
        }
      })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.newBtn.setAttribute).to.be.calledWith('data-present-in-scryfall-decklist', 'true')
      expect(this.icon.classList.add).to.be.calledWith('glyphicon-ok')
    })

    it('configures button to show that cared is not already in deck if card is not in deck', function () {
      bus.emit.withArgs('EDHREC_READY').yields({
        cardsInDeck: {
          'some other card': true
        }
      })

      mutation.ready.withArgs('.toggle-card-in-decklist-button').yields(this.btn)

      start()

      expect(this.newBtn.setAttribute).to.be.calledWith('data-present-in-scryfall-decklist', 'false')
      expect(this.icon.classList.add).to.be.calledWith('glyphicon-plus')
    })
  })
})
