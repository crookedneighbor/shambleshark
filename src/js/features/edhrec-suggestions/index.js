import Feature from '../feature'
import Modal from '../../lib/modal'
import makeEDHRecButton from './make-edhrec-button'

export default class EDHRecSuggestions extends Feature {
  run () {
    // TODO only put edhrec button on commander decks
    const modal = new Modal({
      id: 'edhrec-modal',
      header: 'EDHRec Suggestions',
      onClose () {
        // TODO call cleanup on close
      }
    })
    const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')
    const edhRecButton = makeEDHRecButton(modal)

    document.getElementById('deckbuilder').appendChild(modal.element)
    buttonsContainer.appendChild(edhRecButton)
  }

  isEnabled () {
    // TODO only put edhrec button on when configured in options
    return true
  }
}
