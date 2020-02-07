import Feature from '../../feature'
import { sections } from '../../constants'
import bus from 'framebus'

class CleanUpImprover extends Feature {
  async run () {
    const settings = await CleanUpImprover.getSettings()
    bus.emit('MODIFY_CLEAN_UP', settings)
  }
}

CleanUpImprover.metadata = {
  id: 'clean-up-improver',
  title: 'Clean Up Improver',
  section: sections.DECK_BUILDER,
  description: 'Modifies the clean up button to better organize the deck.'
}
CleanUpImprover.settingsDefaults = {
  enabled: true,
  cleanUpLandsInSingleton: true
}

CleanUpImprover.settingDefinitions = [{
  id: 'cleanUpLandsInSingleton',
  label: 'Move lands and nonlands to their correct columns when cleaning up a singleton deck',
  input: 'checkbox'
}]

export default CleanUpImprover
