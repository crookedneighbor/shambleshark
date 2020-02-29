import Feature from 'Feature'
import { FEATURE_SECTIONS as sections } from 'Constants'

class FutureFeatureOptIn extends Feature {
  async run () {
    // NOOP only controls install/update behavior
  }
}

FutureFeatureOptIn.metadata = {
  // TODO constant
  id: 'future-opt-in',
  title: 'Opt-In To New Features Automatically',
  section: sections.GLOBAL,
  description: 'When a new feature is added to the extension, automatically turn it on! Disabling this just means you will need to enable each new feature individually.'
}

FutureFeatureOptIn.settingsDefaults = {
  enabled: true
}

export default FutureFeatureOptIn
