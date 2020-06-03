import bus from "framebus";
import deckbuilderFeatures from "Features/deck-builder-features";
import "./edit-page.css";
import { BUS_EVENTS as events } from "Constants";

export default function (): void {
  bus.on(events.SCRYFALL_LISTENERS_READY, function () {
    Promise.all(
      deckbuilderFeatures.map(function (Feature) {
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
