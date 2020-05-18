import Feature from "Feature";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import * as bus from "framebus";
import mutation from "Lib/mutation";
import { getDeck } from "Lib/scryfall";
import deckParser from "Lib/deck-parser";
import wait from "Lib/wait";
import CardTooltip from "Ui/card-tooltip";

const CARD_EVENTS = [
  events.CALLED_CLEANUP,
  events.CALLED_UPDATEENTRY,
  events.CALLED_REPLACEENTRY,
  events.CALLED_CREATEENTRY,
];

class CardInputModifier extends Feature {
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
      onMouseover: (el) => {
        const id = el.getAttribute("data-entry");
        const img = this.imageCache[id];

        if (!img) {
          return;
        }

        this.tooltip.setImage(img);
      },
    });
  }

  async run() {
    bus.on(events.CALLED_DESTROYENTRY, async (data) => {
      // clean up our imageCache
      delete this.imageCache[data.payload];
    });

    CARD_EVENTS.forEach((eventName) => {
      bus.on(eventName, () => {
        this.refreshCache();
      });
    });

    mutation.ready(".deckbuilder-entry", (entry) => {
      this.attachListenersToEntry(entry);
    });
  }

  attachListenersToEntry(entry) {
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

  getEntries(bustCache) {
    if (!this._getEntriesPromise || bustCache) {
      this._getEntriesPromise = getDeck().then((d) =>
        deckParser.flattenEntries(d, {
          idToGroupBy: "id",
        })
      );
    }

    return this._getEntriesPromise;
  }

  async lookupImage(id, bustCache) {
    if (!bustCache && id in this.imageCache) {
      return Promise.resolve(this.imageCache[id]);
    }

    const entries = await this.getEntries(bustCache);
    const entry = entries.find((e) => e.id === id);

    if (!entry) {
      return;
    }

    const img = entry.card_digest && entry.card_digest.image;

    this.imageCache[id] = img;

    return img;
  }

  async refreshCache() {
    // give Scryfall enough time to load new cards
    await wait(1000);

    const entries = await this.getEntries(true);
    entries.forEach((entry) => {
      this.imageCache[entry.id] = entry.card_digest && entry.card_digest.image;
    });
  }
}

export default CardInputModifier;
