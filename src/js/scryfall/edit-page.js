import EDHRecSuggestions from '../features/edhrec-suggestions'

export default function () {
  // to allow push notifications to appear above modals
  document.querySelector('.left-tray').style.zIndex = 9000

  return Promise.all([
    EDHRecSuggestions
  ].map(function (Feature) {
    const feature = new Feature()
    return feature.run()
  }))
}
