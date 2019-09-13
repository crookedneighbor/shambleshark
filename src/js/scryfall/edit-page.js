import EDHRecSuggestions from '../features/edhrec-suggestions'

export default function () {
  [
    EDHRecSuggestions
  ].forEach(function (Feature) {
    const feature = new Feature()
    feature.run()
  })
}
