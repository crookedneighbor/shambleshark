import cardPageFeatures from "Features/card-page-features";

export default function addCardPageFeatures(): void {
  Promise.all(
    cardPageFeatures.map((Feature) => {
      return Feature.isEnabled().then((isEnabled) => {
        if (isEnabled) {
          const feature = new Feature();
          return feature.run();
        }
      });
    })
  );
}
