import Feature from "Feature";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import bus from "framebus";
import mutation from "Lib/mutation";
import { getDeck } from "Lib/scryfall";
import deckParser from "Lib/deck-parser";
import wait from "Lib/wait";
import CardTooltip from "Ui/card-tooltip";
import { Card, Deck } from "Js/types/deck";

const CARD_EVENTS = [
  events.CALLED_CLEANUP,
  events.CALLED_UPDATEENTRY,
  events.CALLED_REPLACEENTRY,
  events.CALLED_CREATEENTRY,
];

class CardInputModifier extends Feature {
  imageCache: Record<string, string>;
  listeners: Record<string, Element>;
  tooltip: CardTooltip;
  _getEntriesPromise: Promise<Card[]> | undefined;

  static metadata = {
    id: ids.CardInputModifier,
    title: "Card Input Modifier",
    section: sections.DECK_BUILDER,
    description: "Modifiers for the card input.",
  };

  static settingsDefaults = {
    enabled: true,
    showImageOnHover: true,
  };

  static settingDefinitions = [
    {
      id: "showImageOnHover",
      label: "Show card image when hovering over card input",
      input: "checkbox",
    },
  ];

  constructor() {
    super();

    this.imageCache = {};
    this.listeners = {};

    this.tooltip = new CardTooltip({
      // TODO eventually, card tooltip will set the type of element
      onMouseover: (element: Element) => {
        const id = element.getAttribute("data-entry");
        const img = id && this.imageCache[id];

        if (!img) {
          return;
        }

        this.tooltip.setImage(img);
      },
    });
  }

  async run() {
    bus.on(events.CALLED_DESTROYENTRY, async (data: { payload: string }) => {
      // clean up our imageCache
      delete this.imageCache[data.payload];
    });

    CARD_EVENTS.forEach((eventName) => {
      bus.on(eventName, () => {
        this.refreshCache();
      });
    });

    mutation.ready(".deckbuilder-entry", (entry: Element) => {
      this.attachListenersToEntry(entry);
    });
  }

  attachListenersToEntry(entry: Element) {
    const id = entry.getAttribute("data-entry");

    if (!id) {
      return;
    }

    if (id in this.listeners && entry === this.listeners[id]) {
      // already has listeners
      return;
    }
    this.listeners[id] = entry;

    this.lookupImage(id);
    this.tooltip.addElement(entry);
  }

  getEntries(bustCache?: boolean) {
    if (!this._getEntriesPromise || bustCache) {
      this._getEntriesPromise = getDeck().then((deck: Deck) =>
        deckParser.flattenEntries(deck, {
          idToGroupBy: "id",
        })
      );
    }

    return this._getEntriesPromise;
  }

  async lookupImage(id: string, bustCache?: boolean): Promise<string> {
    if (!bustCache && id in this.imageCache) {
      return Promise.resolve(this.imageCache[id]);
    }

    const entries = await this.getEntries(!bustCache);
    const entry = entries && entries.find((e) => e.id === id);

    if (!entry) {
      return "";
    }

    const img = (entry as any).card_digest?.image;

    this.imageCache[id] = img;

    return img;
  }

  async refreshCache(): Promise<void> {
    // give Scryfall enough time to load new cards
    await wait(1000);

    const entries = await this.getEntries(true);
    entries?.forEach((entry) => {
      this.imageCache[entry.id] = entry.card_digest?.image || "";
    });
  }
}

export default CardInputModifier;
