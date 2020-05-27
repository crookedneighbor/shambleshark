import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

class FutureFeatureOptIn extends Feature {
  static metadata = {
    id: ids.FutureFeatureOptIn,
    title: "Opt-In To New Features Automatically",
    section: sections.GLOBAL,
    description:
      "When a new feature is added to the extension, automatically turn it on! Disabling this just means you will need to enable each new feature individually.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: true,
  };

  async run() {
    // NOOP only controls install/update behavior
  }
}

export default FutureFeatureOptIn;
