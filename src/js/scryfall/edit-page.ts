import Framebus from "framebus";
import deckbuilderFeatures from "Features/deck-builder-features";
import "./edit-page.css";
import { BUS_EVENTS as events } from "Constants";

const bus = new Framebus();

export default function addEditPageFeatures(): void {
  bus.on(events.SCRYFALL_LISTENERS_READY, () => {
    Promise.all(
      deckbuilderFeatures.map((Feature) => {
        return Feature.isEnabled().then((isEnabled) => {
          if (isEnabled) {
            const feature = new Feature();
            return feature.run();
          }
        });
      })
    );
  });
}
