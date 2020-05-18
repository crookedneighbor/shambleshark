import * as bus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import createElement from "Lib/create-element";
import DeckSectionChooser from "Ui/deck-section-chooser";
import AddCardElement from "Ui/add-card-element";
import Drawer from "Ui/drawer";
import { getCardBySetCodeAndCollectorNumber, getDeck } from "Lib/scryfall";
import { EDHREC_SYMBOL } from "Svg";
import { Card, Deck, DeckSections } from "Js/types/deck";

const TYPE_ORDER = [
  "creature",
  "instant",
  "sorcery",
  "artifact",
  "enchantment",
  "planeswalker",
  "land",
];
const TYPES_WITH_IRREGULAR_PLURALS: { [name: string]: string } = {
  Sorcery: "Sorceries",
};

export interface EDHRecResponse {
  commanders: [];
  outRecs: EDHRecSuggestion[];
  inRecs: EDHRecSuggestion[];
}

export interface EDHRecSuggestion {
  primary_types: string[];
  names: string[];
  sanitized: string;
  scryfall_uri: string;
  images: string[];
  price: number;
  salt: number;
  score: number;
  [key: string]: any;
}

export interface Suggestion {
  name: string;
  type: string;
  set: string;
  collectorNumber: string;
  img: string;
  price: number;
  salt: number;
  score: number;
  cardElement?: AddCardElement;
}

export interface EDHRecSection {
  name: string;
  element: HTMLDivElement;
  cards: Suggestion[];
}

function isValidCard(card: Card) {
  return Boolean(card.card_digest);
}

function getCardName(card: Card) {
  return card.card_digest?.name || "Invalid card";
}

function getCardsInDeck(entries: { [section in DeckSections]?: Card[] }) {
  return Object.entries(entries)
    .filter((value) => value[0] != "commanders")
    .map((value) => value[1])
    .flat()
    .filter(isValidCard)
    .map((card) => `${card.count} ${getCardName(card)}`);
}

function formatEDHRecSuggestions(list: EDHRecSuggestion[]) {
  return list.reduce((suggestions: { [name: string]: Suggestion }, rec) => {
    const type = rec.primary_types[0];
    const name = rec.names.join(" // ");
    const [set, collectorNumber] = rec.scryfall_uri
      .split("/card/")[1]
      .split("/");
    const img = rec.images[0];
    const { price, salt, score } = rec;

    suggestions[name] = {
      name,
      type,
      set,
      collectorNumber,
      img,
      price,
      salt,
      score,
    };

    return suggestions;
  }, {});
}

function createErrorDrawerState(
  drawer: Drawer,
  err: { errors: string[]; toString: () => string }
) {
  drawer.setHeader("Something went wrong");

  const container = document.createElement("div");

  if (err.errors) {
    const errorList = document.createElement("ul");
    err.errors.forEach((errorMessage) => {
      const errorElement = document.createElement("li");
      errorElement.innerText = errorMessage;
      errorList.appendChild(errorElement);
    });

    container.appendChild(errorList);
  } else {
    container.appendChild(
      createElement(`<div>
      <p>An unknown error occurred:</p>
      <pre><code>${err.toString()}</code></pre>
    </div>`)
    );
  }

  drawer.setContent(container);
  drawer.setLoading(false);
}

function constructEDHRecSection(
  sectionId: string,
  cardType: string
): EDHRecSection {
  const sectionTitle = TYPES_WITH_IRREGULAR_PLURALS[cardType] || `${cardType}s`;

  const element = createElement(`<div
    id="edhrec-suggestion-${sectionId}"
    class="edhrec-suggestions-container"
    >
      <h3 class="edhrec-suggestions-section-title">${sectionTitle}</h3>
      <div class="edhrec-suggestions"></div>
  </div>`).firstElementChild as HTMLDivElement;

  return {
    name: cardType,
    element,
    cards: [],
  };
}

// TODO pull out into helper function

function createEDHRecResponseHandler(drawer: Drawer, deck: Deck) {
  return function ([err, result]: [
    { errors: string[]; toString: () => string },
    EDHRecResponse
  ]) {
    if (err) {
      createErrorDrawerState(drawer, err);
      return;
    }

    const recomendations = formatEDHRecSuggestions(result.inRecs);
    // TODO ENHANCEMENT: handle cuts
    // const cuts = formatEDHRecSuggestions(result.outRecs)

    const container = document.createElement("div");
    const sections: { [id: string]: EDHRecSection } = {};
    container.id = "edhrec-card-suggestions";
    const deckSectionChooser = new DeckSectionChooser({
      id: "edhrec-suggestions-section-chooser",
      deck,
    });
    container.appendChild(deckSectionChooser.element as HTMLDivElement);
    container.appendChild(document.createElement("hr"));

    Object.values(recomendations).forEach((card) => {
      const sectionId = card.type.toLowerCase();
      let section = sections[sectionId];

      if (!section) {
        section = sections[sectionId] = constructEDHRecSection(
          sectionId,
          card.type
        );
      }

      card.cardElement = new AddCardElement({
        name: card.name,
        img: card.img,
        type: card.type,
        singleton: true,
        getScryfallId() {
          return getCardBySetCodeAndCollectorNumber(
            card.set,
            card.collectorNumber
          ).then((cardFromScryfall) => {
            return cardFromScryfall.id;
          });
        },
        onAddCard: (payload: { section: any }) => {
          const section = deckSectionChooser.getValue();

          if (section) {
            payload.section = section;
          }
        },
      });

      section.cards.push(card);
    });

    TYPE_ORDER.forEach(function (type) {
      const section = sections[type];

      if (!section) {
        return;
      }

      const suggestions = section.element.querySelector(
        ".edhrec-suggestions"
      ) as HTMLDivElement;

      section.cards.forEach((card) => {
        suggestions.appendChild(card.cardElement?.element);
      });
      container.appendChild(section.element);
    });

    drawer.setContent(container);
    drawer.setLoading(false);
  };
}

function createDrawer(button: HTMLButtonElement) {
  const drawer = new Drawer({
    id: "edhrec-drawer",
    headerSymbol: EDHREC_SYMBOL,
    header: "EDHRec Suggestions",
    loadingMessage: "Loading EDHRec Suggestions",
    onClose(drawerInstance: Drawer) {
      bus.emit(events.CLEAN_UP_DECK);

      // reset this in case the error state changes it
      drawerInstance.resetHeader();
      drawerInstance.setLoading(true);

      // re-focus the EDHRec Suggestion button
      // for accessibility navigation
      button.focus();
    },
  });
  // TODO: the drawer class should probably handle this
  document.getElementById("deckbuilder")?.appendChild(drawer.element);

  button.addEventListener("click", (e) => {
    e.preventDefault();

    drawer.open();

    getDeck().then((deck) => {
      const commanders = deck.entries.commanders
        ?.filter(isValidCard)
        .map(getCardName);
      const cardsInDeck = getCardsInDeck(deck.entries);

      bus.emit(
        events.REQUEST_EDHREC_RECOMENDATIONS,
        {
          commanders,
          cards: cardsInDeck,
        },
        createEDHRecResponseHandler(drawer, deck)
      );
    });
  });

  return drawer;
}

export default function makeEDHRecButton() {
  const button = createElement(`<button
    id="edhrec-suggestions"
    aria-label="EDHRec Suggestions"
    class="button-n tiny"
    disabled="true"
  >
    ${EDHREC_SYMBOL}
    <i>EDHRec Suggestions</i>
</button>`).firstElementChild as HTMLButtonElement;
  createDrawer(button);

  return button;
}
