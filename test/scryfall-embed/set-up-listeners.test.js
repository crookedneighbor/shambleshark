import wait from '../../src/js/lib/wait'
import Scryfall from '../../src/js/lib/scryfall-globals'
import setUpListeners from '../../src/js/scryfall-embed/set-up-listeners'
import bus from 'framebus'

describe('set up listeners on Scryfall page', function () {
  it('listens for events', function () {
    setUpListeners()

    expect(bus.on).to.be.calledWith('REQUEST_DECK')
    expect(bus.on).to.be.calledWith('ADD_CARD_TO_DECK')
  })

  context('REQUEST_DECK', function () {
    it('replies with the active deck passed into the setup script', function (done) {
      const fakeDeck = {}

      sandbox.stub(Scryfall, 'getDeck').resolves(fakeDeck)

      bus.on.withArgs('REQUEST_DECK').yields(function (deck) {
        expect(deck).to.equal(fakeDeck)
        expect(Scryfall.getDeck.callCount).to.equal(1)

        done()
      })

      setUpListeners('active-deck-id')
    })
  })

  context('ADD_CARD_FROM_EDHREC', function () {
    beforeEach(function () {
      this.cardData = {
        cardName: 'Rashmi, Etrnities Crafter',
        cardId: 'id-1',
        isLand: false
      }
      this.scryfallCard = {}
      bus.on.withArgs('ADD_CARD_TO_DECK').yields(this.cardData)
      sandbox.stub(Scryfall, 'addCard').resolves(this.scryfallCard)
      sandbox.stub(Scryfall, 'updateEntry')
      sandbox.stub(Scryfall, 'pushNotification')
    })

    it('adds card to active deck', function () {
      setUpListeners('active-deck-id')

      expect(Scryfall.addCard.callCount).to.equal(1)
      expect(Scryfall.addCard).to.be.calledWith('id-1')
    })

    it('updates lands to be put in lands section', function () {
      this.cardData.isLand = true

      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.updateEntry.callCount).to.equal(1)
        expect(this.scryfallCard.section).to.equal('lands')
        expect(Scryfall.updateEntry).to.be.calledWith(this.scryfallCard)
      })
    })

    it('does not update non-lands to be put in lands section', function () {
      setUpListeners('active-deck-id')

      expect(Scryfall.updateEntry.callCount).to.equal(0)
    })

    it('sends a push notification', function () {
      setUpListeners('active-deck-id')

      return wait().then(() => {
        expect(Scryfall.pushNotification.callCount).to.equal(1)
        expect(Scryfall.pushNotification).to.be.calledWith('Card Added', 'Added Rashmi, Etrnities Crafter.', 'purple', 'deck')
      })
    })
  })
})
