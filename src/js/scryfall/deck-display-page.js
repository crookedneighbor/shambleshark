import bus from "framebus";
import deckViewFeatures from "Features/deck-view-features";
import { ready as elementReady } from "Lib/mutation";
import createElement from "Lib/create-element";
import { BUS_EVENTS as events } from "Constants";

function addContainerForSidebarFeatures() {
  const section = createElement(`<div id="shambleshark-deck-display-sidebar-toolbox" class="sidebar-toolbox">
  </div>`);

  elementReady(".sidebar", (container) => {
    container.appendChild(section);
  });
}

export default function () {
  bus.on(events.SCRYFALL_LISTENERS_READY, function () {
    Promise.all(
      deckViewFeatures.map(function (Feature) {
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
