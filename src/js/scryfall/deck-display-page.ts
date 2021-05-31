import Framebus from "framebus";
import deckViewFeatures from "Features/deck-view-features";
import { ready as elementReady } from "Lib/mutation";
import createElement from "Lib/create-element";
import { BUS_EVENTS as events } from "Constants";

const bus = new Framebus();

function addContainerForSidebarFeatures(): void {
  const section =
    createElement(`<div id="shambleshark-deck-display-sidebar-toolbox" class="sidebar-toolbox">
  </div>`);

  elementReady(".sidebar", (container) => {
    container.appendChild(section);
  });
}

export default function addDeckDisplayFeatures(): void {
  bus.on(events.SCRYFALL_LISTENERS_READY, function () {
    Promise.all(
      deckViewFeatures.map((Feature) => {
        return Feature.isEnabled().then((isEnabled) => {
          if (isEnabled) {
            const feature = new Feature();
            return feature.run();
          }
        });
      })
    ).then(() => {
      addContainerForSidebarFeatures();
    });
  });
}
