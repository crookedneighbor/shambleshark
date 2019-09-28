import bus from 'framebus'
import deckbuilderFeatures from '../features/deck-builder-features'

export default function () {
  // to allow push notifications to appear above modals
  document.querySelector('.left-tray').style.zIndex = 9000

  bus.on('SCRYFALL_LISTENERS_READY', function () {
    Promise.all(deckbuilderFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    }))
  })
}
