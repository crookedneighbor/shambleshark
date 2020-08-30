import bus from "framebus";
import {
  calculateTotalsByName,
  calculateTotalsByCardType,
} from "./calculate-totals";
import { getPrimaryType } from "Lib/card-parser";
import createElement from "Lib/create-element";
import { BUS_EVENTS as events } from "Constants";

import type { Card } from "Js/types/deck";
type HeadingDefinition = {
  id: string;
  label: string;
};
export type Headings = Record<string, Record<string, HTMLElement>>;

const SECTIONS_TO_APPLY_HEADERS = {
  nonlands: true,
  mainboard: true,
  columna: true,
  columnb: true,
};

const headingGroupings: Record<string, HeadingDefinition[]> = {
  "card-type": [
    {
      id: "creature",
      label: "creatures",
    },
    {
      id: "planeswalker",
      label: "planeswalkers",
    },
    {
      id: "artifact",
      label: "artifacts",
    },
    {
      id: "enchantment",
      label: "enchantments",
    },
    {
      id: "instant",
      label: "instants",
    },
    {
      id: "sorcery",
      label: "sorceries",
    },
    {
      id: "land",
      label: "lands",
    },
  ],
  name: [
    {
      id: "abcd",
      label: "a-d",
    },
    {
      id: "efg",
      label: "e-g",
    },
    {
      id: "hijk",
      label: "h-k",
    },
    {
      id: "lmnop",
      label: "l-p",
    },
    {
      id: "qrs",
      label: "q-s",
    },
    {
      id: "tuv",
      label: "t-v",
    },
    {
      id: "wx",
      label: "w-x",
    },
    {
      id: "yz",
      label: "y-z",
    },
  ],
};

function getHeadingForName(entry: Card): HeadingDefinition | void {
  const name = entry.card_digest?.name || "";
  const firstCharacter = name.charAt(0);

  return headingGroupings.name.find((group) => {
    return group.id.indexOf(firstCharacter.toLowerCase()) > -1;
  });
}

function getHeadingForCardType(entry: Card): HeadingDefinition | void {
  const primaryType = getPrimaryType(entry);

  return headingGroupings["card-type"].find((group) => {
    return group.id === primaryType;
  });
}

function calculateTotalsForSection(
  section: string,
  sortChoice: string
): Record<string, number> {
  const entries = window.Scryfall.deckbuilder.entries[section];

  switch (sortChoice) {
    case "name":
      return calculateTotalsByName(entries);
    case "card-type":
      return calculateTotalsByCardType(entries);
    default:
      return {};
  }
}

function updateTotalsInHeadings(totalCount: number): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(
      ".cleanup-improver__deck-section-heading"
    )
  ).forEach((el) => {
    const cleanupTotal = el.querySelector<HTMLElement>(
      ".modify-cleanup-total-count"
    );
    if (cleanupTotal) {
      cleanupTotal.innerText = String(totalCount);
    }
  });
}

function updateSubTotalsInHeadings(section: string, sortChoice: string): void {
  const totalsForSection = calculateTotalsForSection(section, sortChoice);

  Object.keys(totalsForSection).forEach((area) => {
    const el = document.querySelector<HTMLElement>(
      `[data-heading-section-id="${area}"] .modify-cleanup-subtotal-count`
    );

    if (el) {
      el.innerText = String(totalsForSection[area]);
    }
  });
}

export function addDeckTotalUpdateListener(sortChoice: string): void {
  bus.on(
    events.DECK_TOTAL_COUNT_UPDATED,
    ({ totalCount }: { totalCount: number }) => {
      updateTotalsInHeadings(totalCount);

      window.Scryfall.deckbuilder.flatSections.forEach((section) => {
        if (!(section in SECTIONS_TO_APPLY_HEADERS)) {
          return;
        }

        updateSubTotalsInHeadings(section, sortChoice);
      });
    }
  );
}

function resetDefaultHeadings(): void {
  // reset any modifications to the existing section
  // titles to hide them when custom ones are added
  Array.from(
    document.querySelectorAll<HTMLElement>("h6.deckbuilder-section-title-bar")
  ).forEach((el) => {
    el.classList.remove("is-hidden");
  });
}

function getHeadingToUse(
  sortChoice: string,
  entry: Card
): HeadingDefinition | void {
  switch (sortChoice) {
    case "card-type":
      return getHeadingForCardType(entry);
    case "name":
      return getHeadingForName(entry);
    default:
      break;
  }
}

function createHeadingElement(
  entry: Card,
  heading: HeadingDefinition,
  subtotal: number
): HTMLElement {
  const total = window.Scryfall.deckbuilder.totalCount();
  const li = createElement<HTMLLIElement>(`<li
    class="cleanup-improver__deck-section-heading"
    data-heading-section-id="${heading.id}"
  >
    <h6 class="deckbuilder-section-title-bar">
      <span class="deckbuilder-section-title">
        ${heading.label}
      </span>
      <span class="deckbuilder-section-count">
        <span class="modify-cleanup-subtotal-count">${subtotal}</span>/<span class="modify-cleanup-total-count">${total}</span> cards</span>
    </h6>
  </li>`);

  return li;
}

function resetPreviousHeadings(headings: Headings, section: string): void {
  if (headings[section]) {
    Object.keys(headings[section]).forEach((header) => {
      const el = headings[section][header];
      el.parentNode?.removeChild(el);
    });
  }

  headings[section] = {};
}

export function insertHeadings(sortChoice: string, headings: Headings): void {
  window.Scryfall.deckbuilder.$nextTick(() => {
    resetDefaultHeadings();

    window.Scryfall.deckbuilder.flatSections.forEach((section) => {
      if (!(section in SECTIONS_TO_APPLY_HEADERS)) {
        return;
      }
      const totalsForSection = calculateTotalsForSection(section, sortChoice);

      resetPreviousHeadings(headings, section);

      window.Scryfall.deckbuilder.entries[section].forEach((entry) => {
        if (!entry.card_digest) {
          return;
        }
        const headingToUse = getHeadingToUse(sortChoice, entry);

        if (headingToUse && !headings[section][headingToUse.id]) {
          const li = createHeadingElement(
            entry,
            headingToUse,
            totalsForSection[headingToUse.id]
          );
          headings[section][headingToUse.id] = li;

          const entryElement = document.querySelector(
            `[data-entry="${entry.id}"]`
          ) as HTMLElement;
          const originalTitle = entryElement.parentNode?.parentNode?.querySelector(
            "h6.deckbuilder-section-title-bar"
          );
          originalTitle?.classList.add("is-hidden");

          entryElement.parentNode?.insertBefore(li, entryElement);
        }
      });
    });
  });
}
