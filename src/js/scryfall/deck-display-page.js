import bus from 'framebus'
import deckViewFeatures from 'Features/deck-view-features'
import {
  BUS_EVENTS as events
} from 'Constants'

export default function () {
  bus.on(events.SCRYFALL_LISTENERS_READY, function () {
    Promise.all(deckViewFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    }))
  })
}
