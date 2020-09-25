import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

class CardNotes extends Feature {
  static metadata = {
    id: ids.CardNotes,
    futureFeature: true,
    title: "Card Notes",
    section: sections.DECK_BUILDER,
    description: "Add notes to individual cards.",
  };

  static settingsDefaults = {
    enabled: true,
  };

  async run(): Promise<void> {
    // TODO
  }
}

export default CardNotes;
