import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import { ready as elementReady } from "Lib/mutation";
import nicknames from "Lib/card-nicknames";

class CardNicknameDisplay extends Feature {
  static metadata = {
    id: ids.CardNicknameDisplay,
    title: "Card Nicknames",
    section: sections.CARD_PAGE,
    description:
      "Display card nicknames like the fun (but temporary) names Scryfall staff give untranslated card previews.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: false,
    location: "sidebar",
  };

  static settingDefinitions = [
    {
      id: "location",
      label: "Where should the card nickname be displayed?",
      input: "list",
      options: [
        {
          label: "Sidebar (under the prints table)",
          value: "sidebar",
        },
        {
          label: "Flavor Name (under the real name)",
          value: "flavor-name",
        },
      ],
    },
  ];

  async run(): Promise<void> {
    const settings = await CardNicknameDisplay.getSettings();
    const choice = settings.location as string;
    const urlParts = window.location.pathname.split("/");
    const setCode = urlParts[2];
    const collectorNumber = urlParts[3];

    elementReady<HTMLDivElement>(this.getParentSelector(choice), (element) => {
      const result = nicknames.find((data) => {
        return (
          data.setCode === setCode && data.collectorNumber === collectorNumber
        );
      });

      if (result) {
        const container = this.createContainer(choice, result);
        element.appendChild(container);
      }
    });
  }

  private getParentSelector(choice: string): string {
    switch (choice) {
      case "flavor-name":
        return ".card-text-title";
      case "sidebar":
      default:
        return ".prints-info-section";
    }
  }

  private createContainer(
    choice: string,
    result: typeof nicknames[0]
  ): HTMLElement {
    let container: HTMLElement;

    switch (choice) {
      case "flavor-name":
        container = document.createElement("em");
        container.innerText = `"${result.nickname}" (${result.source})`;
        break;
      case "sidebar":
      default:
        container = document.createElement("div");
        container.classList.add("prints-info-section-note");
        container.innerText = `${result.source}: "${result.nickname}"`;
    }

    return container;
  }
}

export default CardNicknameDisplay;
