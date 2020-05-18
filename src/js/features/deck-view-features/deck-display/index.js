import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

class DeckDisplay extends Feature {
  static metadata = {
    id: ids.DeckDisplay,
    futureFeature: true,
    title: "Deck Display",
    section: sections.DECK_VIEW,
    description:
      "Allows alternate displays for viewing your cards, such as a stacked card image view.",
  };

  static settingsDefaults = {
    enabled: true,
  };

  async run() {
    // TODO
  }
}

export default DeckDisplay;
