import searchResultsFeatures from "Features/search-results-features";

export default function addSearchPageFeatures(): void {
  Promise.all(
    searchResultsFeatures.map((Feature) => {
      return Feature.isEnabled().then((isEnabled) => {
        if (isEnabled) {
          const feature = new Feature();
          return feature.run();
        }
      });
    })
  );
}
