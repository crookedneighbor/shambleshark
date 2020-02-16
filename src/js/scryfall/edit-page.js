import bus from 'framebus'
import deckbuilderFeatures from '../features/deck-builder-features'
import injectCSS from '../lib/inject-css'

export default function () {
  // TODO move tthis to a css file
  injectCSS(`
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
  `)

  bus.on('SCRYFALL_LISTENERS_READY', function () {
    Promise.all(deckbuilderFeatures.map(function (Feature) {
      const feature = new Feature()

      return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
    }))
  })
}
