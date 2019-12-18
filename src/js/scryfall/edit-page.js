import bus from 'framebus'
import deckbuilderFeatures from '../features/deck-builder-features'

export default function () {
  const style = document.createElement('style')
  style.innerHTML = `
    /* to allow push notifications to appear above modals */
    .left-tray {
      z-index: 9000;
    }

    .dialog-title-symbol svg {
      fill: #343242;
      width: 20px;
      position: relative;
      top: 2px;
    }

  `
  document.head.appendChild(style)

  bus.on('SCRYFALL_LISTENERS_READY', function () {
    Promise.all(deckbuilderFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    }))
  })
}
