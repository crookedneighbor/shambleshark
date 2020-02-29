import Feature from '../../feature'
import makeEDHRecButton from './make-edhrec-button'
import mutation from 'Lib/mutation'
import { sections } from '../../constants'

const TIMEOUT_TO_CONTINUE = 1000

class EDHRecSuggestions extends Feature {
  async run () {
    return new Promise(function (resolve, reject) {
      const timeout = setTimeout(reject, TIMEOUT_TO_CONTINUE)

      mutation.ready('.deckbuilder-section-title', async function (title) {
        // TODO support oathbreaker as well
        if (title.innerText.toLowerCase().indexOf('commander') === -1) {
          // only run this code once deck has loaded and we are reasonably
          // certain it is a commander deck
          return
        }

        const edhRecButton = await makeEDHRecButton()
        const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')

        buttonsContainer.appendChild(edhRecButton)

        clearTimeout(timeout)
        resolve()
      })
    }).catch(function () {
      // Took more than 1 second to find the commander list
      // will continue looking for it in the case of a slow
      // connection, but no need to hang up the resolution
      // of the other features
    })
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
