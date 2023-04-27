import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import { ready as elementReady } from "Lib/mutation";
import createElement from "Lib/create-element";
import nicknames from "Lib/card-nicknames";

import "./index.css";

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
    // TODO this hack is dupicated in tag menu
    // let's pull it out to a helper
    const taggerUrl = "https://tagger.scryfall.com/card/";
    const taggerButton = document.querySelector(
      `a[href^="${taggerUrl}"]`
    ) as HTMLAnchorElement;
    const parts = taggerButton.href.split(taggerUrl)[1].split("/");
    const setCode = parts[0];
    const collectorNumber = parts[1];

    elementReady<HTMLDivElement>(this.getParentSelector(choice), (element) => {
      const result = nicknames.find((data) => {
        return (
          data.setCode === setCode && data.collectorNumber === collectorNumber
        );
      });

      if (result && result.realName.length > 0) {
        this.addToPage(element, choice, result);
      }
    });
  }

  private getParentSelector(choice: string): string {
    switch (choice) {
      case "flavor-name":
        return ".card-text";
      case "sidebar":
      default:
        return ".prints-info-section";
    }
  }

  private addToPage(
    element: HTMLElement,
    choice: string,
    result: (typeof nicknames)[0]
  ): void {
    switch (choice) {
      case "flavor-name":
        Array.from(element.querySelectorAll(".card-text-title")).forEach(
          (subElement, index) => {
            subElement.appendChild(
              createElement(
                `<div><em>"${result.nickname[index]}" <span class="card-nickname-source">- ${result.source}</span></em></div>`
              )
            );
          }
        );
        break;
      case "sidebar":
      default:
        element.appendChild(
          createElement(`<div class="prints-info-section-note">
  ${result.source}: "${result.nickname.join('" // "')}"
</div>`)
        );
    }
  }
}

export default CardNicknameDisplay;
