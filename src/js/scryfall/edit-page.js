import bus from 'framebus'
import deckbuilderFeatures from '../features/deck-builder-features'
import './edit-page.css'

export default function () {
  bus.on('SCRYFALL_LISTENERS_READY', function () {
    Promise.all(deckbuilderFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    }))
  })
}
