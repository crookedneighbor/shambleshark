import Feature from 'Feature'
import {
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections
} from 'Constants'

class TokenList extends Feature {
  async run () {
    // TODO
  }
}

TokenList.metadata = {
  id: ids.TokenList,
  futureFeature: true,
  title: 'Token List',
  section: sections.DECK_VIEW,
  description: 'List tokens created by cards in the deck.'
}
TokenList.settingsDefaults = {
  enabled: true
}

export default TokenList
