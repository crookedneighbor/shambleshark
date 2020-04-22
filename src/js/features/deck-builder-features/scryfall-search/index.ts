import Feature from "Features/feature";
import * as bus from "framebus";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import Drawer from "Ui/drawer";
import DeckSectionChooser from "Ui/deck-section-chooser";
import AddCardElement from "Ui/add-card-element";
import deckParser from "Lib/deck-parser";
import scryfall from "Lib/scryfall";
import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";
import "./index.css";
import { EXTERNAL_ARROW } from "Svg";
import { settingsDefaults } from "Js/types/feature";
import { Deck, DeckSections } from "Js/types/deck";
import { CardQueryResult, ScryfallAPICardResponse } from "scryfall-client";

// TODO saved searches

class ScryfallSearch extends Feature {
  drawer?: Drawer;
  settings?: settingsDefaults;
  currentQuery?: string;
  deck?: Deck;
  isSingleton?: boolean;
  cardList?: CardQueryResult;
  deckSectionChooser?: DeckSectionChooser;
  container?: HTMLDivElement;
  _nextInProgress?: boolean;

  async run(): Promise<void> {
    this.drawer = this.createDrawer();
    this.settings = await ScryfallSearch.getSettings();

    document
      .getElementById("header-search-field")!
      .addEventListener("keydown", (event) => {
        if (
          event.key !== "Enter" ||
          !(event.target as HTMLInputElement)?.value
        ) {
          return;
        }

        event.preventDefault();

        this.onEnter((event.target as HTMLInputElement)?.value);
      });
  }

  async onEnter(query: string): Promise<void> {
    this.drawer?.open();
    this.currentQuery = query;

    if (this.settings?.restrictFunnyCards) {
      this.currentQuery += " not:funny";
    }

    this.deck = await scryfall.getDeck();

    this.isSingleton = deckParser.isSingletonTypeDeck(this.deck);

    if (
      this.settings?.restrictToCommanderColorIdentity &&
      deckParser.isCommanderLike(this.deck)
    ) {
      const colors = await deckParser.getCommanderColorIdentity(this.deck);

      this.currentQuery += ` ids:${colors.join("")}`;
    }

    this.cardList = await scryfall.api
      .get<CardQueryResult>("cards/search", {
        q: this.currentQuery,
      })
      .catch(() => ({} as CardQueryResult));

    this.addSearchOptionsElement();

    this.addCards();

    this.drawer?.setLoading(false);
  }

  addSearchOptionsElement(): void {
    const totalCards = this.cardList?.total_cards;
    const el = createElement(`<div
      class="scryfall-search__options-container scryfall-search__non-card-element"
    >
      <div class="scryfall-search__search-results-counter">
        ${totalCards} result${totalCards !== 1 ? "s" : ""}&nbsp;
        <a class="scryfall-search__external-link-icon" href="/search?q=${encodeURI(
          this.currentQuery as string
        )}">${EXTERNAL_ARROW}</a>
      </div>
    </div>`).firstChild as HTMLDivElement;
    this.deckSectionChooser = new DeckSectionChooser({
      id: "scryfall-search__section-selection",
      deck: this.deck,
    });
    el?.appendChild(this.deckSectionChooser.element as Node);

    const hr = document.createElement("hr");
    hr.classList.add("scryfall-search__hr");

    this.container?.appendChild(el as Node);
    this.container?.appendChild(hr);
  }

  addCards(): void {
    if (this.cardList?.length === 0) {
      emptyElement(this.container);
      this.container?.appendChild(
        createElement(
          '<div class="scryfall-search__no-results scryfall-search__non-card-element">No search results.</div>'
        )
      );

      return;
    }

    const entries = deckParser.flattenEntries(this.deck as Deck);
    this.cardList?.forEach((card: ScryfallAPICardResponse) => {
      const cardInDeck = entries.find(
        (entry) =>
          entry.card_digest && entry.card_digest.oracle_id === card.oracle_id
      );
      const quantity = cardInDeck ? cardInDeck.count : 0;
      const addCardEl = new AddCardElement({
        quantity,
        singleton: this.isSingleton,
        id: card.id,
        name: card.name,
        img: card.getImage(),
        type: card.type_line,
        onAddCard: (payload: { section: DeckSections }) => {
          const section = this.deckSectionChooser?.getValue();

          if (section) {
            payload.section = section;
          }
        },
      });

      this.container?.appendChild(addCardEl.element);
    });
  }

  isReadyToLookupNextBatch(el: Element) {
    if (this._nextInProgress || !this.cardList || !this.cardList.has_more) {
      return false;
    }

    return el.scrollTop + el.clientHeight >= el.scrollHeight - 15000;
  }

  createDrawer() {
    // TODO find out if we can pass an arrow function here instead
    const self = this;
    const drawer = new Drawer({
      id: "scryfall-search-drawer",
      // TODO add scryfall symbol?
      // headerSymbol: EDHREC_SYMBOL,
      header: "Scryfall Search",
      loadingMessage: "Loading Scryfall Search",
      onScroll(drawerInstance: Drawer) {
        if (
          !self.isReadyToLookupNextBatch(
            drawerInstance.getScrollableElement() as Element
          )
        ) {
          return;
        }

        self._nextInProgress = true;

        return self.cardList?.next().then((cards) => {
          self.cardList = cards;
          self.addCards();
          self._nextInProgress = false;
        });
      },
      onClose(drawerInstance: Drawer) {
        self.cardList = undefined;
        bus.emit(events.CLEAN_UP_DECK);

        // reset this in case the error state changes it
        drawerInstance.setLoading(true);
        drawerInstance.resetHeader();
        emptyElement(self.container);

        // re-focus the Scryfall Search input
        // for accessibility navigation
        document.getElementById("header-search-field")!.focus();
      },
    });
    // TODO: the drawer class should probably handle this
    document.getElementById("deckbuilder")!.appendChild(drawer.element);

    this.container = document.createElement("div");
    drawer.setContent(this.container);

    return drawer;
  }
}

ScryfallSearch.metadata = {
  id: ids.ScryfallSearch,
  title: "Scryfall Search",
  section: sections.DECK_BUILDER,
  description:
    "Search for Scryfall cards right inside the deckbuilder! (Coming Soon: Save searches for specific decks for later)",
};

ScryfallSearch.settingsDefaults = {
  enabled: true,
  restrictToCommanderColorIdentity: true,
  restrictFunnyCards: false,
};

ScryfallSearch.settingDefinitions = [
  {
    id: "restrictToCommanderColorIdentity",
    label:
      "Automatically restrict searches to commander's color identity (if applicable)",
    input: "checkbox",
  },
  {
    id: "restrictFunnyCards",
    label:
      "Don't include funny cards when doing searches (adds not:funny to all searches)",
    input: "checkbox",
  },
];

export default ScryfallSearch;
