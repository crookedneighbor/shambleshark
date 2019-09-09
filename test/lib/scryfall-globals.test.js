import {
  addCard,
  getActiveDeck,
  getDeck,
  updateEntry,
  pushNotification
} from '../../src/js/lib/scryfall-globals'

describe('Scryfall Globals', function () {
  beforeEach(function () {
    global.ScryfallAPI = {
      decks: {
        active: sandbox.stub().yields({ id: 'deck-id' }),
        addCard: sandbox.stub(),
        get: sandbox.stub(),
        updateEntry: sandbox.stub()
      }
    }

    global.Scryfall = {
      pushNotification: sandbox.stub()
    }
  })

  describe('getActiveDeck', function () {
    it('resolves with the active deck', function () {
      return getActiveDeck().then((deck) => {
        expect(deck.id).to.equal('deck-id')
      })
    })
  })

  describe('getDeck', function () {
    it('gets the active deck', function () {
      const deck = { id: 'deck-id' }

      global.ScryfallAPI.decks.get.yields(deck)

      return getDeck().then((resolvedDeck) => {
        expect(global.ScryfallAPI.decks.get).to.be.calledWith('deck-id')

        expect(deck).to.equal(resolvedDeck)
      })
    })
  })

  describe('addCard', function () {
    it('resolves with the card', function () {
      const card = {}

      global.ScryfallAPI.decks.addCard.yields(card)

      return addCard('card-id').then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.addCard).to.be.calledWith('deck-id', 'card-id')

        expect(card).to.equal(resolvedCard)
      })
    })
  })

  describe('updateEntry', function () {
    it('resolves with the card', function () {
      const cardToUpdate = { id: 'card-id' }
      const card = {}

      global.ScryfallAPI.decks.updateEntry.yields(card)

      return updateEntry(cardToUpdate).then((resolvedCard) => {
        expect(global.ScryfallAPI.decks.updateEntry).to.be.calledWith('deck-id', cardToUpdate)

        expect(card).to.equal(resolvedCard)
      })
    })
  })

  describe('pushNotification', function () {
    it('sends a push notification', function () {
      return pushNotification('Title', 'message', 'color', 'category').then(function () {
        expect(global.Scryfall.pushNotification.callCount).to.equal(1)
        expect(global.Scryfall.pushNotification).to.be.calledWith('Title', 'message', 'color', 'category')
      })
    })
  })
})
