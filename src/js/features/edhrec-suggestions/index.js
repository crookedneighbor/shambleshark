import Feature from '../feature'
import makeEDHRecButton from './make-edhrec-button'
import deckParser from '../../lib/deck-parser'
import scryfall from '../../lib/scryfall'

export default class EDHRecSuggestions extends Feature {
  async run () {
    const deck = await scryfall.getDeck()
    const deckCouldBeCommanderDeck = await deckParser.isCommanderLikeDeck(deck)

    if (!deckCouldBeCommanderDeck) {
      return
    }

    const edhRecButton = await makeEDHRecButton()
    const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')

    buttonsContainer.appendChild(edhRecButton)
  }

  isEnabled () {
    // TODO only put edhrec button on when configured in options
    return true
  }
}
