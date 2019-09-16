import bus from 'framebus'
import Feature from '../feature'
import makeEDHRecButton from './make-edhrec-button'
import deckParser from '../../lib/deck-parser'

export default class EDHRecSuggestions extends Feature {
  run () {
    return new Promise((resolve) => {
      bus.emit('REQUEST_DECK', resolve)
    }).then(deckParser.isCommanderLikeDeck).then((deckCouldBeCommanderDeck) => {
      if (!deckCouldBeCommanderDeck) {
        return
      }

      const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')
      const edhRecButton = makeEDHRecButton()

      buttonsContainer.appendChild(edhRecButton)
    })
  }

  isEnabled () {
    // TODO only put edhrec button on when configured in options
    return true
  }
}
