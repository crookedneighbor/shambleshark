import deckParser from "Lib/deck-parser";
import createElement from "Lib/create-element";

import type { Deck } from "Js/types/deck";

type DeckSectionChooserOptions = {
  deck?: Deck;
  id: string;
};

export default class DeckSectionChooser {
  element: HTMLDivElement;
  sectionSelect: HTMLSelectElement;

  private hasSections: boolean;

  constructor(options: DeckSectionChooserOptions) {
    const deck = options.deck;
    const id = options.id;
    this.hasSections = false;
    this.element = createElement(`<div
      id="${id}"
      class="form-row-content-band"
    >
        <select class="section-selection form-input auto small-select">
          <option value="" selected disabled>Section (auto)</option>
        </select>
      </div>
    `);
    this.sectionSelect = this.element.querySelector(
      "select.section-selection"
    ) as HTMLSelectElement;

    if (deck) {
      this.addSections(deck);
    }
  }

  addSections(deck: Deck): void {
    if (this.hasSections) {
      return;
    }

    this.hasSections = true;

    deckParser
      .getSections(deck)
      .sort()
      .forEach((section) => {
        const option = document.createElement("option");
        const sectionLabel = section[0].toUpperCase() + section.slice(1);

        option.value = section;
        option.innerText = `Add to ${sectionLabel}`;

        this.sectionSelect.appendChild(option);
      });
  }

  getValue(): string {
    return this.sectionSelect.value;
  }
}
