import Feature, { SettingsDefaults } from "Feature";
import bus from "framebus";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import Drawer from "Ui/drawer";
import DeckSectionChooser from "Ui/deck-section-chooser";
import AddCardElement from "Ui/add-card-element";
import deckParser from "Lib/deck-parser";
import { getDeck, search } from "Lib/scryfall";
import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";
import "./index.css";
import { EXTERNAL_ARROW } from "Svg";
import { Deck, DeckSections } from "Js/types/deck";

// TODO saved searches
interface SearchSettings extends SettingsDefaults {
  restrictToCommanderColorIdentity: boolean;
  restrictFunnyCards: boolean;
}

function createOnSearchHandler(
  cb: (value: string) => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const target = event.target as HTMLInputElement;

    if (event.key !== "Enter" || !target?.value) {
      return;
    }

    event.preventDefault();

    cb(target.value);
  };
}

class ScryfallSearch extends Feature {
  drawer: Drawer;
  currentQuery: string;
  headerSearchField: HTMLInputElement;
  deckSectionChooser: DeckSectionChooser;
  container: HTMLDivElement;
  cardResultsContainer: HTMLDivElement;

  settings?: SearchSettings;
  isSingleton?: boolean;
  deck?: Deck;
  // TODO no any, get card type from scryfall-client
  cardList?: any;
  _nextInProgress?: boolean;

  static metadata = {
    id: ids.ScryfallSearch,
    title: "Scryfall Search",
    section: sections.DECK_BUILDER,
    description:
      "Search for Scryfall cards right inside the deckbuilder! (Coming Soon: Save searches for specific decks for later)",
    futureFeature: false,
  };

  static settingsDefaults = {
    enabled: true,
    restrictToCommanderColorIdentity: true,
    restrictFunnyCards: false,
  };

  static settingDefinitions = [
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

  constructor() {
    super();

    this.deckSectionChooser = new DeckSectionChooser({
      id: "scryfall-search__section-selection",
    });
    this.container = this.createContainer();
    this.cardResultsContainer = this.container.querySelector(
      "#scryfall-search__card-results"
    ) as HTMLDivElement;
    this.drawer = this.createDrawer();
    this.currentQuery = "";
    this.headerSearchField = document.getElementById(
      "header-search-field"
    ) as HTMLInputElement;
  }

  async run(): Promise<void> {
    this.settings = await ScryfallSearch.getSettings<SearchSettings>();

    this.headerSearchField.addEventListener(
      "keydown",
      createOnSearchHandler((value) => {
        this.onEnter(value);
      })
    );
  }

  _queryContainsColorIdentity(query: string): boolean {
    query = query.toLowerCase();

    return Boolean(
      ["id", "ids", "identity", "ci"].find((idParam) => {
        return query.includes(`${idParam}:`);
      })
    );
  }

  async onEnter(query: string, adjustQuery = true): Promise<void> {
    this.drawer.setLoading(true);
    this.drawer.open();
    this.currentQuery = query;
    emptyElement(this.cardResultsContainer);

    if (
      adjustQuery &&
      this.settings?.restrictFunnyCards &&
      this.currentQuery.indexOf(":funny") === -1
    ) {
      this.currentQuery += " not:funny";
    }

    this.deck = await getDeck();

    this.isSingleton = deckParser.isSingletonTypeDeck(this.deck);

    if (
      adjustQuery &&
      this.settings?.restrictToCommanderColorIdentity &&
      deckParser.isCommanderLike(this.deck) &&
      !this._queryContainsColorIdentity(this.currentQuery)
    ) {
      const colors = await deckParser.getCommanderColorIdentity(this.deck);

      this.currentQuery += ` ids:${colors.join("")}`;
    }

    this.cardList = await search(this.currentQuery).catch(() => {
      // most likely a 404, return no results
      return [];
    });

    this.addMetadataToContainer();

    this.addCards();

    this.drawer.setLoading(false);
  }

  createContainer(): HTMLDivElement {
    const el = createElement<HTMLDivElement>(`<div>
      <div class="scryfall-search__options-container scryfall-search__non-card-element">
        <div class="scryfall-search__search-results-counter">
          <span class="scryfall-search__search-results-counter-total"></span>
          <a class="scryfall-search__external-link-icon">${EXTERNAL_ARROW}</a>
        </div>
        <div id="scryfall-search__section-selection-container"></div>
        <hr class="scryfall-search__hr" />
      </div>
      <div id="scryfall-search__card-results"></div>
    </div>`);
    (el.querySelector(
      "#scryfall-search__section-selection-container"
    ) as HTMLDivElement).appendChild(this.deckSectionChooser.element);

    return el;
  }

  addMetadataToContainer(): void {
    const totalCards = this.cardList?.total_cards || 0;
    (this.container.querySelector(
      ".scryfall-search__search-results-counter-total"
    ) as HTMLSpanElement).innerText = `${totalCards} result${
      totalCards !== 1 ? "s" : ""
    } `;

    (this.container.querySelector(
      "a.scryfall-search__external-link-icon"
    ) as HTMLAnchorElement).href = `/search?q=${encodeURI(this.currentQuery)}`;

    // TODO add to inline search input

    this.deckSectionChooser.addSections(this.deck as Deck);
  }

  addCards(): void {
    if (this.cardList?.length === 0) {
      emptyElement(this.cardResultsContainer);
      this.cardResultsContainer.appendChild(
        createElement(
          '<div class="scryfall-search__no-results scryfall-search__non-card-element">No search results.</div>'
        )
      );

      return;
    }

    const entries = deckParser.flattenEntries(this.deck as Deck);
    // TODO get Card type from scryfall-client
    this.cardList?.forEach((card: any) => {
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
        onAddCard: (payload) => {
          const section = this.deckSectionChooser?.getValue();

          if (section) {
            payload.section = section as DeckSections;
          }
        },
      });

      this.cardResultsContainer.appendChild(addCardEl.element);
    });
  }

  isReadyToLookupNextBatch(el: Element): boolean {
    if (this._nextInProgress || !this.cardList || !this.cardList.has_more) {
      return false;
    }

    return el.scrollTop + el.clientHeight >= el.scrollHeight - 15000;
  }

  createDrawer(): Drawer {
    const drawer = new Drawer({
      id: "scryfall-search-drawer",
      // TODO add scryfall symbol?
      // headerSymbol: EDHREC_SYMBOL,
      header: "Scryfall Search",
      loadingMessage: "Loading Scryfall Search",
      onScroll: (drawerInstance) => {
        if (
          !this.isReadyToLookupNextBatch(
            (drawerInstance as Drawer).getScrollableElement() as Element
          )
        ) {
          return;
        }

        this._nextInProgress = true;

        // TODO get types from scryfall-client
        return this.cardList?.next().then((cards: any) => {
          this.cardList = cards;
          this.addCards();
          this._nextInProgress = false;
        });
      },
      onClose: (drawerInstance) => {
        this.cardList = undefined;
        bus.emit(events.CLEAN_UP_DECK);

        // reset this in case the error state changes it
        drawerInstance.setLoading(true);
        drawerInstance.resetHeader();
        emptyElement(this.cardResultsContainer);

        // re-focus the Scryfall Search input
        // for accessibility navigation
        this.headerSearchField.focus();
      },
    });

    // TODO: the drawer class should probably handle this
    (document.getElementById("deckbuilder") as HTMLElement).appendChild(
      drawer.element
    );

    drawer.setContent(this.container);

    return drawer;
  }
}

export default ScryfallSearch;
