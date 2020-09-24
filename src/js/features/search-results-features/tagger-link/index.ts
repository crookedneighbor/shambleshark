import { getURL } from "Browser/runtime";
import Feature from "Feature";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";
import {
  setupBridgeToTagger,
  requestTags,
  TagEntries,
  TagInfo,
} from "Lib/tagger-bridge";
import createElement from "Lib/create-element";
import { ready as elementReady } from "Lib/mutation";
import { sortByAttribute } from "Lib/sort";
import TaggerIcon from "Lib/ui-elements/tagger-icon";
import "./index.css";

import { TAGGER_SYMBOL } from "Svg";

const SPINNER_GIF = getURL("spinner.gif");

// TODOS nice to haves
// * handle small screens
// * simple animations when opening the tag menu

function getTaggerData(link: string) {
  const parts = link.split("https://scryfall.com/card/")[1].split("/");

  return {
    set: parts[0],
    number: parts[1],
  };
}

function convertPageLinkToTagger(setCode: string, cardNumber: string) {
  return `https://tagger.scryfall.com/card/${setCode}/${cardNumber}`;
}

class TaggerLink extends Feature {
  // TODO we can probably omit this with a refactor
  // by splitting out the logic for making a button
  // adding it to the page, and creating an iframe
  showPreview: boolean;

  static metadata = {
    id: ids.TaggerLink,
    title: "Tagger Link",
    section: sections.SEARCH_RESULTS,
    description: "Provide a button to card's tagger page from search results.",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: true,
    previewTags: true,
  };

  static settingDefinitions = [
    {
      id: "previewTags",
      label: "Show preview of tags for card on hover.",
      input: "checkbox",
    },
  ];

  constructor() {
    super();

    this.showPreview = false;
  }

  async run(): Promise<void> {
    const settings = await TaggerLink.getSettings();
    this.showPreview = Boolean(settings.previewTags);

    if (!this.showPreview) {
      this.setupButtons();

      return;
    }

    await setupBridgeToTagger();

    this.setupButtons();
  }

  setupButtons(): void {
    elementReady<HTMLAnchorElement>(
      ".card-grid-item a.card-grid-item-card",
      (link) => {
        const button = this.makeButton(link.href);

        const cardFacesElement = (link.parentNode as HTMLElement).querySelector(
          ".card-grid-item-card-faces"
        ) as HTMLElement;

        cardFacesElement.appendChild(button);
      }
    );
  }

  makeButton(link: string): HTMLAnchorElement {
    const taggerData = getTaggerData(link);
    const taggerLink = convertPageLinkToTagger(
      taggerData.set,
      taggerData.number
    );

    const button = createElement<HTMLAnchorElement>(`<a
      href="${taggerLink}"
      class="tagger-link-button button-n primary icon-only subdued"
      alt="Open in Tagger"
    >
      ${TAGGER_SYMBOL}
    </a>`);

    if (this.showPreview) {
      const tagDisplayMenu = createElement(`<div class="tagger-link-hover">
        <div class="menu-container"></div>
        <img src="${SPINNER_GIF}" class="modal-dialog-spinner" aria-hidden="true">
      </div>`);
      button.prepend(tagDisplayMenu);
      button.addEventListener(
        "mouseover",
        this.createMouseoverHandler(button, taggerData)
      );
    }

    return button;
  }

  createMouseoverHandler(
    button: HTMLAnchorElement,
    taggerData: { set: string; number: string }
  ): (e: MouseEvent) => Promise<void> {
    let request: Promise<void>;

    const tooltip = button.querySelector(
      ".tagger-link-hover"
    ) as HTMLDivElement;

    return (event: MouseEvent) => {
      const pageWidth = document.body.clientWidth;
      const mousePosition = event.pageX;

      // if the mouse position is just over half the page
      // switch tooltip to the left instead of the default right
      if (mousePosition / pageWidth > 0.55) {
        tooltip.classList.add("left-aligned");
      } else {
        tooltip.classList.remove("left-aligned");
      }

      if (!request) {
        request = requestTags(taggerData).then((tagData) => {
          this.addTags(tooltip, tagData);
        });
      }

      return request;
    };
  }

  addTags(tooltip: HTMLElement, payload: TagEntries): void {
    const menuContainer = tooltip.querySelector(
      ".menu-container"
    ) as HTMLElement;
    const artMenu = document.createElement("ul");
    const cardMenu = document.createElement("ul");
    const spinner = tooltip.querySelector(
      ".modal-dialog-spinner"
    ) as HTMLElement;

    const artEntries = payload.art;
    const oracleEntries = payload.oracle;

    spinner.classList.add("hidden");

    if (artEntries.length) {
      menuContainer.appendChild(artMenu);
      this.addTagsToMenu(artEntries, artMenu);
    }

    if (oracleEntries.length) {
      menuContainer.appendChild(cardMenu);
      this.addTagsToMenu(oracleEntries, cardMenu);
    }

    if (menuContainer.children.length === 0) {
      menuContainer.innerText = "No tags found. Add some!";
    }

    tooltip.style.top = `-${Math.floor(tooltip.offsetHeight / 3.75)}px`;
  }

  addTagsToMenu(tags: TagInfo[], menu: HTMLUListElement): void {
    tags.sort(sortByAttribute(["isTag", "name"]));

    tags.forEach((tag) => {
      if (menu.children.length > 8) {
        return;
      }

      if (menu.children.length === 8) {
        menu.appendChild(createElement(`<li>+ ${tags.length - 7} more</li>`));

        return;
      }

      const li = document.createElement("li");
      const tagIcon = new TaggerIcon(tag.tagType);
      li.appendChild(tagIcon.element);
      li.appendChild(createElement(`<span>${tag.name}</span>`));

      menu.appendChild(li);
    });
  }
}

export default TaggerLink;
