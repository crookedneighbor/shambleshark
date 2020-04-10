import Feature from "Feature";
import {
  FEATURE_IDS as ids,
  BUS_EVENTS as events,
  FEATURE_SECTIONS as sections,
} from "Constants";
import bus from "framebus";

class CleanUpImprover extends Feature {
  async run() {
    const settings = await CleanUpImprover.getSettings();
    bus.emit(events.MODIFY_CLEAN_UP, settings);
  }
}

CleanUpImprover.metadata = {
  id: ids.CleanUpImprover,
  title: "Clean Up Improver",
  section: sections.DECK_BUILDER,
  description: "Modifies the clean up button to better organize the deck.",
};
CleanUpImprover.settingsDefaults = {
  enabled: true,
  cleanUpLandsInSingleton: true,
};

CleanUpImprover.settingDefinitions = [
  {
    id: "cleanUpLandsInSingleton",
    label:
      "Move lands and nonlands to their correct columns when cleaning up a singleton deck",
    input: "checkbox",
  },
];

export default CleanUpImprover;
