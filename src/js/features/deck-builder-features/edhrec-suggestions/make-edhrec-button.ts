import bus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import createElement from "Lib/create-element";
import DeckSectionChooser from "Ui/deck-section-chooser";
import AddCardElement from "Ui/add-card-element";
import Drawer from "Ui/drawer";
import { getCardBySetCodeAndCollectorNumber, getDeck } from "Lib/scryfall";
import { EDHREC_SYMBOL } from "Svg";
import type { Card, Deck } from "Js/types/deck";
import type {
  EDHRecResponseHandler,
  EDHRecSuggestion,
  EDHRecError,
  Suggestions,
  EDHRecSection,
} from "Js/types/edhrec";

const TYPE_ORDER = [
  "creature",
  "instant",
  "sorcery",
  "artifact",
  "enchantment",
  "planeswalker",
  "land",
];
const TYPES_WITH_IRREGULAR_PLURALS: Record<string, string> = {
  Sorcery: "Sorceries",
};

function isValidCard(card: Card): boolean {
  return Boolean(card.card_digest);
}

function getCardName(card: Card): string {
  return card.card_digest?.name || "";
}

function getCardsInDeck(entries: Deck["entries"]) {
  return Object.entries(entries)
    .filter((value) => value[0] != "commanders")
    .map((value) => value[1])
    .flat()
    .filter((c) => isValidCard(c as Card))
    .map((entry) => {
      const card = entry as Card;

      return `${card.count} ${getCardName(card)}`;
    });
}

function formatEDHRecSuggestions(list: EDHRecSuggestion[]): Suggestions {
  return list.reduce<Suggestions>((suggestions, rec) => {
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

function createErrorDrawerState(drawer: Drawer, errors: EDHRecError[]) {
  drawer.setHeader("Something went wrong");

  const container = document.createElement("div");

  const errorList = document.createElement("ul");
  errors.forEach((errorMessage) => {
    const errorElement = document.createElement("li");
    errorElement.innerText = errorMessage.toString();
    errorList.appendChild(errorElement);
  });

  container.appendChild(errorList);

  drawer.setContent(container);
  drawer.setLoading(false);
}

function constructEDHRecSection(
  sectionId: string,
  cardType: string
): EDHRecSection {
  const sectionTitle = TYPES_WITH_IRREGULAR_PLURALS[cardType] || `${cardType}s`;

  const element = createElement<HTMLDivElement>(`<div
    id="edhrec-suggestion-${sectionId}"
    class="edhrec-suggestions-container"
    >
      <h3 class="edhrec-suggestions-section-title">${sectionTitle}</h3>
      <div class="edhrec-suggestions"></div>
  </div>`);

  return {
    name: cardType,
    element,
    cards: [],
  };
}

// TODO pull out into helper function
function createEDHRecResponseHandler(
  drawer: Drawer,
  deck: Deck
): EDHRecResponseHandler {
  return function (result) {
    if (result.errors) {
      createErrorDrawerState(drawer, result.errors);
      return;
    }

    const recomendations = formatEDHRecSuggestions(result.inRecs);
    // TODO ENHANCEMENT: handle cuts
    // const cuts = formatEDHRecSuggestions(result.outRecs)

    const container = document.createElement("div");
    const sections: Record<string, EDHRecSection> = {};
    container.id = "edhrec-card-suggestions";
    const deckSectionChooser = new DeckSectionChooser({
      id: "edhrec-suggestions-section-chooser",
      deck,
    });
    container.appendChild(deckSectionChooser.element);
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
        onAddCard: (payload) => {
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
        suggestions.appendChild(card.cardElement?.element as HTMLDivElement);
      });
      container.appendChild(section.element);
    });

    drawer.setContent(container);
    drawer.setLoading(false);
  };
}

function createDrawer(button: HTMLButtonElement): Drawer {
  const drawer = new Drawer({
    id: "edhrec-drawer",
    headerSymbol: EDHREC_SYMBOL,
    header: "EDHRec Suggestions",
    loadingMessage: "Loading EDHRec Suggestions",
    onClose(drawerInstance) {
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
        // TODO no any, not sure how to handle this correctly :(
        // does framebus need to be updated?
        createEDHRecResponseHandler(drawer, deck) as unknown
      );
    });
  });

  return drawer;
}

export default function makeEDHRecButton(): HTMLButtonElement {
  const button = createElement<HTMLButtonElement>(`<button
    id="edhrec-suggestions"
    aria-label="EDHRec Suggestions"
    class="button-n tiny"
    disabled="true"
  >
    ${EDHREC_SYMBOL}
    <i>EDHRec Suggestions</i>
</button>`);
  createDrawer(button);

  return button;
}
