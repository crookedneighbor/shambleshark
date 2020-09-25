import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

class LegalityCheck extends Feature {
  static metadata = {
    id: ids.LegalityCheck,
    futureFeature: true,
    title: "Legality Check",
    section: sections.DECK_BUILDER,
    description: "Check if all cards in the deck are legal for the format.",
  };

  static settingsDefaults = {
    enabled: true,
  };

  async run(): Promise<void> {
    // TODO
  }
}

export default LegalityCheck;
