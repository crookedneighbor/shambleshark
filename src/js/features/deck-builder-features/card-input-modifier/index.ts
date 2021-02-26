import Feature from "Feature";
import {
  BUS_EVENTS as events,
  FEATURE_IDS as ids,
  FEATURE_SECTIONS as sections,
} from "Constants";
import Framebus from "framebus";
import { ready as elementReady } from "Lib/mutation";
import { getDeck } from "Lib/scryfall";
import deckParser from "Lib/deck-parser";
import wait from "Lib/wait";
import CardTooltip from "Ui/card-tooltip";
import { Card } from "Js/types/deck";

const CARD_EVENTS = [
  events.CALLED_CLEANUP,
  events.CALLED_UPDATEENTRY,
  events.CALLED_REPLACEENTRY,
  events.CALLED_CREATEENTRY,
];
const bus = new Framebus();

type ImageRecord = {
  front: string;
  back?: string;
};

class CardInputModifier extends Feature {
  imageCache: Record<string, ImageRecord>;
  listeners: Record<string, Element>;
  tooltip: CardTooltip;
  _getEntriesPromise: Promise<Card[]> | undefined;

  static metadata = {
    id: ids.CardInputModifier,
    title: "Card Input Modifier",
    section: sections.DECK_BUILDER,
    description: "Modifiers for the card input.",
    futureFeature: false,
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
      onMouseover: (element) => {
        const id = element.getAttribute("data-entry");
        const imgs = id && this.imageCache[id];

        if (!imgs) {
          this.tooltip.setImages("", "");
          return;
        }

        this.tooltip.setImages(imgs.front, imgs.back);
      },
    });
  }

  async run(): Promise<void> {
    bus.on(events.CALLED_DESTROYENTRY, async (data) => {
      // clean up our imageCache
      delete this.imageCache[data.payload as string];
    });

    CARD_EVENTS.forEach((eventName) => {
      bus.on(eventName, () => {
        this.refreshCache();
      });
    });

    elementReady(".deckbuilder-entry", (entry) => {
      this.attachListenersToEntry(entry);
    });
  }

  attachListenersToEntry(entry: HTMLElement): void {
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

  getEntries(bustCache = false): Promise<Card[]> {
    if (!this._getEntriesPromise || bustCache) {
      this._getEntriesPromise = getDeck().then((deck) =>
        deckParser.flattenEntries(deck, {
          idToGroupBy: "id",
        })
      );
    }

    return this._getEntriesPromise;
  }

  async lookupImage(id: string, bustCache = false): Promise<ImageRecord> {
    if (!bustCache && id in this.imageCache) {
      return Promise.resolve(this.imageCache[id]);
    }

    const entries = await this.getEntries(!bustCache);
    const entry = entries.find((e) => e.id === id);

    if (!entry) {
      return {
        front: "",
      };
    }

    const card = entry.card_digest;
    const front = card?.image_uris?.front;
    const back = card?.image_uris?.back;

    if (!front) {
      return {
        front: "",
      };
    }

    this.imageCache[id] = {
      front,
      back,
    };

    return this.imageCache[id];
  }

  async refreshCache(): Promise<void> {
    // give Scryfall enough time to load new cards
    await wait(1000);

    const entries = await this.getEntries(true);
    entries?.forEach((entry) => {
      this.imageCache[entry.id] = {
        front: entry.card_digest?.image_uris?.front || "",
        back: entry.card_digest?.image_uris?.back || "",
      };
    });
  }
}

export default CardInputModifier;
