import Feature from "Feature";
import createElement from "Lib/create-element";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

class PriceOptions extends Feature {
  static metadata = {
    id: ids.PriceOptions,
    title: "Price Options",
    section: sections.DECK_VIEW,
    futureFeature: false,
    description: `Adds "No Prices" option when viewing a deck.`,
  };

  static settingsDefaults = {
    enabled: true,
  };

  async run(): Promise<void> {
    const selectBox = document.getElementById("with") as HTMLSelectElement;

    selectBox?.appendChild(
      createElement<HTMLOptionElement>(
        `<option value="no-prices">No Prices</option>`
      )
    );

    const withChoice = this.getWithParam();

    // TODO add feature to have a default with option

    switch (withChoice) {
      case "no-prices":
        if (selectBox) {
          selectBox.value = "no-prices";
        }
        this.hidePriceUI();
        break;
      default:
    }
  }

  getWithParam(): string | null {
    const query = window.location.search.split("?")[1];

    return new URLSearchParams(query).get("with");
  }

  hidePriceUI(): void {
    document.querySelector(".sidebar-prices")?.classList.add("hidden");

    Array.from(
      document.querySelectorAll(".deck-list-entry-axial-data")
    ).forEach((node) => {
      node.classList.add("hidden");
    });
  }
}

export default PriceOptions;
