import Feature from '../feature'
import { sections } from '../constants'

class CleanUpImprover extends Feature {
  async run () {
    // TODO
  }
}

CleanUpImprover.metadata = {
  id: 'clean-up-improver',
  futureFeature: true,
  title: 'Clean Up Improver',
  section: sections.DECK_BUILDER,
  description: 'Modifies the clean up button to better organize the deck.'
}
CleanUpImprover.settingsDefaults = {
  enabled: true
}

export default CleanUpImprover
