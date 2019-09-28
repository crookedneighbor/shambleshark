import Feature from '../feature'
import makeEDHRecButton from './make-edhrec-button'
import deckParser from '../../lib/deck-parser'
import scryfall from '../../lib/scryfall'
import { sections } from '../constants'

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

EDHRecSuggestions.metadata = {
  id: 'edhrec-suggestions-button',
  title: 'EDHRec Suggestions',
  section: sections.DECK_BUILDER,
  description: 'Inserts an EDHRec button on commander decks. When accessed, will display a list of card suggestions from EDHRec.'
}
EDHRecSuggestions.settingsDefaults = {
  enabled: true
}

export default EDHRecSuggestions
