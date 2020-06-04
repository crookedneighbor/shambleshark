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
  drawer?: Drawer;
  settings?: SearchSettings;
  currentQuery?: string;
  deck?: Deck;
  isSingleton?: boolean;
  // TODO no any, get card type from scryfall-client
  cardList?: any;
  deckSectionChooser?: DeckSectionChooser;
  container?: HTMLDivElement;
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

  async run(): Promise<void> {
    this.drawer = this.createDrawer();
    this.settings = await ScryfallSearch.getSettings<SearchSettings>();

    (document.getElementById(
      "header-search-field"
    ) as HTMLElement).addEventListener(
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

  async onEnter(query: string): Promise<void> {
    this.drawer?.open();
    this.currentQuery = query;

    if (this.settings?.restrictFunnyCards) {
      this.currentQuery += " not:funny";
    }

    this.deck = await getDeck();

    this.isSingleton = deckParser.isSingletonTypeDeck(this.deck);

    if (
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

    this.addSearchOptionsElement();

    this.addCards();

    this.drawer?.setLoading(false);
  }

  addSearchOptionsElement(): void {
    const totalCards = this.cardList?.total_cards;
    const el = createElement<HTMLDivElement>(`<div
      class="scryfall-search__options-container scryfall-search__non-card-element"
    >
      <div class="scryfall-search__search-results-counter">
        ${totalCards} result${totalCards !== 1 ? "s" : ""}&nbsp;
        <a class="scryfall-search__external-link-icon" href="/search?q=${encodeURI(
          this.currentQuery as string
        )}">${EXTERNAL_ARROW}</a>
      </div>
    </div>`);
    this.deckSectionChooser = new DeckSectionChooser({
      id: "scryfall-search__section-selection",
      deck: this.deck as Deck,
    });
    el?.appendChild(this.deckSectionChooser.element);

    const hr = document.createElement("hr");
    hr.classList.add("scryfall-search__hr");

    this.container?.appendChild(el as Node);
    this.container?.appendChild(hr);
  }

  addCards(): void {
    if (this.cardList?.length === 0) {
      emptyElement(this.container as HTMLDivElement);
      this.container?.appendChild(
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

      this.container?.appendChild(addCardEl.element);
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
        emptyElement(this.container as HTMLDivElement);

        // re-focus the Scryfall Search input
        // for accessibility navigation
        (document.getElementById("header-search-field") as HTMLElement).focus();
      },
    });
    // TODO: the drawer class should probably handle this
    (document.getElementById("deckbuilder") as HTMLElement).appendChild(
      drawer.element
    );

    this.container = document.createElement("div");
    drawer.setContent(this.container);

    return drawer;
  }
}

export default ScryfallSearch;
