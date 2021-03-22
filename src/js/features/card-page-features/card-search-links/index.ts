import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import { ready as elementReady } from "Lib/mutation";
import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";

import "./index.css";

class CardSearchLinks extends Feature {
  static metadata = {
    id: ids.CardSearchLinks,
    title: "Card Data Search Links",
    section: sections.CARD_PAGE,
    description:
      "Decorate various card attributes with searches for those attributes in other cards.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: false,
    displayAsLinks: false,
    typeline: true,
    manaCost: true,
  };

  static settingDefinitions = [
    {
      id: "displayAsLinks",
      label: "Change color of the text to indicate they are links.",
      input: "checkbox",
    },
    {
      id: "typeline",
      label: "Make card type line searchable",
      input: "checkbox",
    },
    {
      id: "manaCost",
      label: "Make the mana cost line searchable",
      input: "checkbox",
    },
  ];

  async run(): Promise<void> {
    const settings = await CardSearchLinks.getSettings();

    if (settings.typeline) {
      this.decorateTypeLine(Boolean(settings.displayAsLinks));
    }
    if (settings.manaCost) {
      this.decorateManaCost();
    }
  }

  decorateTypeLine(displayAsLinks: boolean): void {
    elementReady<HTMLDivElement>(".card-text-type-line", (element) => {
      const text = (element.textContent || "").trim();
      const parts = text.split(" — ");
      const supertype = parts[0];
      const subtype = parts[1];
      let newTypeLine = "";

      supertype.split(" ").forEach((t) => {
        newTypeLine += ` <a href="/search?q=type%3A${t.toLowerCase()}">${t}</a>`;
      });

      if (subtype) {
        newTypeLine += " —";
        subtype.split(" ").forEach((t) => {
          newTypeLine += ` <a href="/search?q=type%3A${t.toLowerCase()}">${t}</a>`;
        });
      }

      element.textContent = "";
      element.appendChild(createElement(`<span>${newTypeLine}</span>`));

      if (!displayAsLinks) {
        element.classList.add("hide-link-color");
      }
    });
  }

  decorateManaCost(): void {
    elementReady<HTMLDivElement>(".card-text-mana-cost", (element) => {
      let manaCost = "";
      const symbols = element.querySelectorAll(".card-symbol");

      symbols.forEach((abbr) => {
        manaCost += (abbr.textContent || "").replace(/[{}]/g, "");
      });

      const link = createElement(
        `<a href='/search?q=mana%3D"${manaCost}"'>${element.innerHTML}</a>`
      );
      emptyElement(element);

      element.appendChild(link);
    });
  }
}

export default CardSearchLinks;
