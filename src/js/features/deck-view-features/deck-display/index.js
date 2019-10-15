import Feature from '../../feature'
import { sections } from '../../constants'

class DeckDisplay extends Feature {
  async run () {
    // TODO
  }
}

DeckDisplay.metadata = {
  id: 'deck-display',
  futureFeature: true,
  title: 'Deck Display',
  section: sections.DECK_VIEW,
  description: 'Allows alternate displays for viewing your cards, such as an image view.'
}
DeckDisplay.settingsDefaults = {
  enabled: true
}

export default DeckDisplay
