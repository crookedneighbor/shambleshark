import bus from 'framebus'
import deckViewFeatures from 'Features/deck-view-features'
import mutation from 'Lib/mutation'
import createElement from 'Lib/create-element'
import {
  BUS_EVENTS as events
} from 'Constants'

function addContainerForSidebarFeatures () {
  const section = createElement(`<div id="shambleshark-deck-display-sidebar-toolbox" class="sidebar-toolbox">
  </div>`).firstChild

  mutation.ready('.sidebar', container => {
    container.appendChild(section)
  })
}

export default function () {
  bus.on(events.SCRYFALL_LISTENERS_READY, function () {
    Promise.all(deckViewFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    })).then(() => {
      addContainerForSidebarFeatures()
    })
  })
}
