import Feature from '../feature'
import makeEDHRecButton from './make-edhrec-button'

export default class EDHRecSuggestions extends Feature {
  run () {
    // TODO only put edhrec button on commander decks
    const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')
    const edhRecButton = makeEDHRecButton()

    buttonsContainer.appendChild(edhRecButton)
  }

  isEnabled () {
    // TODO only put edhrec button on when configured in options
    return true
  }
}
