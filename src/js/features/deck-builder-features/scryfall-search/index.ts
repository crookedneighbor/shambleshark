import Feature, { SettingsDefaults } from "Feature";
import bus from "framebus";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import Drawer from "Ui/drawer";
import Modal from "Ui/modal";
import DeckSectionChooser from "Ui/deck-section-chooser";
import AddCardElement from "Ui/add-card-element";
import deckParser from "Lib/deck-parser";
import { getDeck, search } from "Lib/scryfall";
import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";
import "./index.css";
import { EXTERNAL_ARROW, ARROW, ELLIPSIS, CHECK_SYMBOL } from "Svg";
import { Deck, DeckSections } from "Js/types/deck";
import type { Card, List } from "scryfall-client/dist/types/model";

// TODO saved searches - nice to haves
// * organize searches
// * choose searches from dropdown
// * manage all searches from all decks
// * persistent storage
interface SearchSettings extends SettingsDefaults {
  restrictToCommanderColorIdentity: boolean;
  restrictFunnyCards: boolean;
}

type SavedSearch = {
  query: string;
  name: string;
};

class ScryfallSearch extends Feature {
  drawer: Drawer;
  savedSearchModal: Modal;
  savedSearches: SavedSearch[];
  savedSearchElement: HTMLElement;
  savedSearchesContainer: HTMLDivElement;
  newSavedSearchInputs: {
    name: HTMLInputElement;
    query: HTMLInputElement;
  };
  currentQuery: string;
  headerSearchField: HTMLInputElement;
  inlineSearchField: HTMLInputElement;
  deckSectionChooser: DeckSectionChooser;
  container: HTMLDivElement;
  cardResultsContainer: HTMLDivElement;
  searchErrorsContainer: HTMLDivElement;

  settings?: SearchSettings;
  isSingleton?: boolean;
  deck?: Deck;
  cardList?: List<Card>;
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
    this.searchErrorsContainer = this.container.querySelector(
      "#scryfall-search__warnings"
    ) as HTMLDivElement;
    this.drawer = this.createDrawer();
    this.savedSearchModal = this.createModal();
    this.savedSearches = [];
    this.savedSearchElement = this.createSavedSearchElement();
    this.savedSearchesContainer = this.savedSearchElement.querySelector(
      ".scryfall-search__new-saved-search-button"
    ) as HTMLDivElement;
    this.newSavedSearchInputs = {
      name: this.savedSearchElement.querySelector(
        "#scryfall-search__new-saved-search-name"
      ) as HTMLInputElement,
      query: this.savedSearchElement.querySelector(
        "#scryfall-search__new-saved-search-query"
      ) as HTMLInputElement,
    };
    this._setupSavedSearchForm();

    this.currentQuery = "";
    this.inlineSearchField = this.container.querySelector(
      "#inline-search-header-search-field"
    ) as HTMLInputElement;
    this.headerSearchField = document.getElementById(
      "header-search-field"
    ) as HTMLInputElement;
  }

  async run(): Promise<void> {
    this.settings = await ScryfallSearch.getSettings<SearchSettings>();

    this._attachSearchHandler(this.headerSearchField, true);
    this._attachSearchHandler(this.inlineSearchField, false);

    this.deck = await getDeck();
  }

  private _queryContainsColorIdentity(query: string): boolean {
    query = query.toLowerCase();

    return Boolean(
      ["id", "ids", "identity", "ci"].find((idParam) => {
        return query.includes(`${idParam}:`);
      })
    );
  }

  private _attachSearchHandler(
    container: HTMLInputElement,
    adjustQuery: boolean
  ): void {
    container.addEventListener("keydown", (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement;

      if (event.key !== "Enter" || !target?.value) {
        return;
      }

      event.preventDefault();

      this.runSearch(target.value, adjustQuery);
    });

    const savedSearchOpener = createElement(`
      <div class="scryfall-search__saved-search-selector">${ARROW}</div>
    `);

    savedSearchOpener.addEventListener("click", () => {
      this.currentQuery = container.value;
      this.drawer.close();
      this.savedSearchModal.open();
    });

    container.parentNode?.appendChild(savedSearchOpener);
  }

  private async _getKeyForSavedSearch(): Promise<string> {
    const id = (await getDeck()).id;

    return `saved-searches:${id}`;
  }

  private _setupSavedSearchForm(): void {
    this.newSavedSearchInputs.name.addEventListener("focus", () => {
      this.newSavedSearchInputs.name.classList.remove("validation-error");
    });
    this.newSavedSearchInputs.query.addEventListener("focus", () => {
      this.newSavedSearchInputs.query.classList.remove("validation-error");
    });
    this.savedSearchElement
      .querySelector(".scryfall-search__saved-search-form")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();

        this.newSavedSearchInputs.name.classList.remove("validation-error");
        this.newSavedSearchInputs.query.classList.remove("validation-error");

        const newSearch = {
          name: this.newSavedSearchInputs.name.value,
          query: this.newSavedSearchInputs.query.value,
        };

        if (!newSearch.name || !newSearch.name.trim()) {
          this.newSavedSearchInputs.name.classList.add("validation-error");
          return;
        }

        if (!newSearch.query || !newSearch.query.trim()) {
          this.newSavedSearchInputs.query.classList.add("validation-error");
          return;
        }

        this.savedSearches.push(newSearch);
        this.saveSearches();

        this.newSavedSearchInputs.name.value = "";
        this.newSavedSearchInputs.query.value = "";
        this._createSearchElement(newSearch);
      });
  }

  async runSearch(query: string, adjustQuery = true): Promise<void> {
    this.savedSearchModal.close();
    this.drawer.setLoading(true);
    this.drawer.open();
    this.currentQuery = query;
    emptyElement(this.cardResultsContainer);
    emptyElement(this.searchErrorsContainer);

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
      // fake it as a Card List
      return ([] as unknown) as List<Card>;
    });

    this.addMetadataToContainer();

    this.addWarnings();
    this.addCards();

    this.drawer.setLoading(false);
  }

  createContainer(): HTMLDivElement {
    const el = createElement<HTMLDivElement>(`<div>
      <div class="header-search-inline-search">
        <form action="/search" accept-charset="UTF-8" method="get" class="header-search">
          <label for="inline-search-header-search-field" class="vh">Search for Magic cards</label>
          <input type="text" id="inline-search-header-search-field" placeholder="Search for Magic cards…" autocomplete="on" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="1024" class="header-search-field">
          <button type="submit" class="vh">Find Cards</button>
        </form>
      </div>

      <div class="scryfall-search__options-container scryfall-search__non-card-element">
        <div class="scryfall-search__search-results-counter">
          <span class="scryfall-search__search-results-counter-total"></span>
          <a class="scryfall-search__external-link-icon">${EXTERNAL_ARROW}</a>
        </div>
        <div id="scryfall-search__section-selection-container"></div>

        <hr class="scryfall-search__hr" />

        <div id="scryfall-search__warnings" class="search-info"></div>
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

    this.inlineSearchField.value = this.currentQuery;

    this.deckSectionChooser.addSections(this.deck as Deck);
  }

  addWarnings(): void {
    emptyElement(this.searchErrorsContainer);

    if (!this.cardList?.warnings) {
      return;
    }

    const warnings = this.cardList.warnings.join(" ");
    this.searchErrorsContainer.innerText = warnings;
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
    this.cardList?.forEach((card: Card) => {
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

        return this.cardList?.next().then((cards: List<Card>) => {
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
        emptyElement(this.searchErrorsContainer);

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

  createSavedSearchElement(): HTMLDivElement {
    return createElement<HTMLDivElement>(
      `<div class="scryfall-search__saved-search-container">
        <form class="scryfall-search__saved-search-form">
          <label>Search description and query</label>
          <div>
            <input id="scryfall-search__new-saved-search-name" type="text" placeholder="Saved Search Description" />
          </div>
          <div>
            <input id="scryfall-search__new-saved-search-query" type="text" placeholder="Query" value="" />
          </div>
          <div>
            <button id="scryfall-search__new-saved-search-button" type="submit" class="button-n primary">
              ${CHECK_SYMBOL}
              <i>Save Search</i>
            </button>
          </div>
        </form>

        <hr class="scryfall-search__hr" />

        <div class="scryfall-search__new-saved-search-button"></div>
      </div>`
    );
  }

  private _createSearchElement(search: SavedSearch): Element {
    const searchGroup = createElement(`<div class="scryfall-search__saved-search-group">
      <div class="scryfall-search__saved-search-details">
        <div class="scryfall-search__saved-search-details-name-container">
          ${search.name}
        </div>
        <div class="scryfall-search__saved-search-details-query-container">
          <pre>${search.query}</pre>
        </div>
      </div>

      <span class="deckbuilder-entry-menu scryfall-search__saved-search-options-select">
        <span class="deckbuilder-entry-menu-visual">
          ${ELLIPSIS}
        </span>
        <select class="deckbuilder-entry-menu-select">
          <option value="" selected disabled>What do you want to do?</option>
          <option value="open">Run this search</option>
          <option value="edit">Edit Saved Search</option>
          <option value="delete">Delete Saved Search</option>
        </select>
      </span>
    </div>`);

    searchGroup
      .querySelector(".scryfall-search__saved-search-details")
      ?.addEventListener("click", () => {
        this.runSearch(search.query);
      });

    this._setupSearchSelect(search, searchGroup);
    this.savedSearchesContainer.appendChild(searchGroup);

    return searchGroup;
  }

  private _setupSearchSelect(search: SavedSearch, searchGroup: Element): void {
    const select = searchGroup.querySelector(
      ".scryfall-search__saved-search-options-select select"
    ) as HTMLSelectElement;
    select.addEventListener("focus", function () {
      // reset value so that the change will always be picked up
      this.value = "";
    });
    select.addEventListener("change", (event) => {
      const choice = (event.target as HTMLSelectElement).value;

      switch (choice) {
        case "open":
          this.runSearch(search.query);
          break;
        case "edit":
          this.deleteSearch(search, searchGroup);
          this.newSavedSearchInputs.name.value = search.name;
          this.newSavedSearchInputs.query.value = search.query;
          this.newSavedSearchInputs.query.focus();
          break;
        case "delete":
          this.deleteSearch(search, searchGroup);
          break;
        default:
      }

      // so that the focus listener to reset the value will always be called
      select.blur();
    });
  }

  deleteSearch(search: SavedSearch, searchGroup: Element): void {
    this.savedSearches = this.savedSearches.filter((s) => s !== search);
    this.saveSearches();
    this.savedSearchesContainer.removeChild(searchGroup);
  }

  async getSavedSearches(): Promise<SavedSearch[]> {
    const dataKey = await this._getKeyForSavedSearch();

    return ((await ScryfallSearch.getData(dataKey)) as SavedSearch[]) || [];
  }

  async saveSearches(): Promise<void> {
    const dataKey = await this._getKeyForSavedSearch();

    return ScryfallSearch.saveData(dataKey, this.savedSearches);
  }

  createModal(): Modal {
    const modal = new Modal({
      id: "scryfall-search-saved-search-modal",
      header: "Saved Searches",
      onClose: () => {
        modal.setLoading(true);
      },
      onOpen: async () => {
        this.savedSearches = await this.getSavedSearches();

        this.newSavedSearchInputs.query.value = this.currentQuery;
        emptyElement(this.savedSearchesContainer);

        this.savedSearches.forEach((s) => this._createSearchElement(s));

        modal.setContent(this.savedSearchElement);

        modal.setLoading(false);
      },
    });
    (document.getElementById("deckbuilder") as HTMLElement).appendChild(
      modal.element
    );

    return modal;
  }
}

export default ScryfallSearch;
