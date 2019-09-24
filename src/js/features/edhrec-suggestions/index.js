import Feature from '../feature'
import makeEDHRecButton from './make-edhrec-button'
import deckParser from '../../lib/deck-parser'
import scryfall from '../../lib/scryfall'

class EDHRecSuggestions extends Feature {
  async run () {
    // TODO: sometimes we get a 401 response when deck initialization happens :(
    const deck = await scryfall.getDeck()
    const deckCouldBeCommanderDeck = await deckParser.isCommanderLikeDeck(deck)

    if (!deckCouldBeCommanderDeck) {
      return
    }

    const edhRecButton = await makeEDHRecButton()
    const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')

    buttonsContainer.appendChild(edhRecButton)
  }
}

EDHRecSuggestions.settingsKey = 'edhrec-suggestions-button'

EDHRecSuggestions.settingsDefaults = {
  enabled: true
}

export default EDHRecSuggestions
