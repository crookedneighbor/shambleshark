import searchResultsFeatures from "Features/search-results-features";

export default function () {
  Promise.all(
    searchResultsFeatures.map(function (Feature) {
      return Feature.isEnabled().then((isEnabled) => {
        if (isEnabled) {
          const feature = new Feature();
          return feature.run();
        }
      });
    })
  );
}
