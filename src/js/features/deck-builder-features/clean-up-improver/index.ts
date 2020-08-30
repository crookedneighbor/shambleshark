import Feature from "Feature";
import {
  FEATURE_IDS as ids,
  BUS_EVENTS as events,
  FEATURE_SECTIONS as sections,
} from "Constants";
import bus from "framebus";

import "./index.css";

class CleanUpImprover extends Feature {
  static metadata = {
    id: ids.CleanUpImprover,
    title: "Clean Up Improver",
    section: sections.DECK_BUILDER,
    description: "Modifies the clean up button to better organize the deck.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: true,
    cleanUpLandsInSingleton: true,
    insertSortingHeadings: true,
    sortEntriesPrimary: "none",
  };

  static settingDefinitions = [
    {
      id: "cleanUpLandsInSingleton",
      label:
        "Move lands and nonlands to their correct columns when cleaning up a singleton deck",
      input: "checkbox",
    },
    {
      id: "sortEntriesPrimary",
      label: "Keep cards sorted by:",
      input: "list",
      options: [
        {
          label: "Default (let Scryfall decide order on cleanup)",
          value: "none",
        },
        {
          label: "Card Type",
          value: "card-type",
        },
        {
          label: "By Name",
          value: "name",
        },
        // TODO can't apply this until there's a reliable way to look up the deck updates
        // {
        //   label: "By ManaCost",
        //   value: "mana-cost",
        // },
        // {
        //   label: "By Color",
        //   value: "color",
        // },
        // {
        //   label: "By Color Identity",
        //   value: "color-identity",
        // },
      ],
    },
    {
      id: "insertSortingHeadings",
      label: "Include headings above different sections of cards",
      input: "checkbox",
    },
  ];

  async run(): Promise<void> {
    const settings = await CleanUpImprover.getSettings();
    bus.emit(events.MODIFY_CLEAN_UP, settings);
  }
}

export default CleanUpImprover;
