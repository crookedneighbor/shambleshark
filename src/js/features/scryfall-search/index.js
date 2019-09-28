import Feature from '../feature'
import { sections } from '../constants'

class ScryfallSearch extends Feature {
  async run () {
    // TODO
  }
}

ScryfallSearch.metadata = {
  id: 'scryfall-search',
  futureFeature: true,
  title: 'Scryfall Search',
  section: sections.DECK_BUILDER,
  description: 'Search for Scryfall cards right inside the deckbuilder! You can save the searches for later too!'
}
ScryfallSearch.settingsDefaults = {
  enabled: true
}

export default ScryfallSearch
