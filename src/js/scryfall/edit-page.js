import bus from 'framebus'
import deckbuilderFeatures from '../features/deck-builder-features'

export default function () {
  const style = document.createElement('style')
  style.innerHTML = `
    /* to allow push notifications to appear above modals */
    .left-tray {
      z-index: 9000;
    }

    .modal-dialog-title-symbol svg {
      fill: #343242;
      width: 20px;
      position: relative;
      top: 2px;
    }

    /* EDHRec Suggestions CSS */
    .edhrec-suggestion-card-container {
      display: inline-block;
      width: 45%;
      min-width: 200px;
      margin: 2%;
      position: relative;
      cursor: pointer;
    }

    .edhrec-suggestion-card-container img {
      max-width: 100%;
      border-radius: 10px;
    }

    .edhrec-suggestion-card-container svg {
      max-width: 100px;
    }

    .edhrec-suggestion-card-container .edhrec-suggestion-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: #2B253A;
      opacity: .8;
      color: white;
      font-size: 80px;
      padding-top: 90px;
      border-radius: 10px;
      display: none;
    }

    .edhrec-suggestion-card-container:hover .edhrec-suggestion-overlay,
    .edhrec-suggestion-card-container:focus .edhrec-suggestion-overlay,
    .edhrec-suggestion-card-container.in-deck .edhrec-suggestion-overlay {
      display: block;
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
