import searchResultsFeatures from 'Features/search-results-features'

export default function () {
  Promise.all(searchResultsFeatures.map(function (Feature) {
    const feature = new Feature()

    return feature.isEnabled().then(isEnabled => isEnabled && feature.run())
  }))
}
