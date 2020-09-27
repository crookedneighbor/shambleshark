import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import { ready } from "Lib/mutation";

import "./index.css";

class DeckDisplay extends Feature {
  static metadata = {
    id: ids.DeckDisplay,
    futureFeature: false,
    title: "Deck Display",
    section: sections.DECK_VIEW,
    description:
      "Allows alternate displays for viewing your cards, such as a stacked card image view.",
  };

  static settingsDefaults = {
    enabled: true,
    collapseCardView: false,
  };

  static settingDefinitions = [
    {
      id: "collapseCardView",
      label: "Present the visual card list in a stacked presentation",
      input: "checkbox",
    },
  ];

  async run(): Promise<void> {
    const settings = await DeckDisplay.getSettings();

    if (!settings.collapseCardView) {
      return;
    }

    ready(".card-grid", (el) => {
      const cardItems = el.querySelectorAll(".card-grid-item[data-card-id]");

      cardItems[cardItems.length - 1].classList.add(
        "deck-display__last-card-grid-item"
      );
      el.classList.add("deck-display__collapse-card-gride-enabled");
    });
  }
}

export default DeckDisplay;
