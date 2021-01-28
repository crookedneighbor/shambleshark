import Framebus from "framebus";
import { CHECK_SYMBOL, MINUS_SYMBOL, PLUS_SYMBOL } from "Svg";
import { BUS_EVENTS as events } from "Constants";
import createElement from "Lib/create-element";
import emptyElement from "Lib/empty-element";
import noop from "Lib/noop";

import "./index.css";

type GetScryfallIDFunction = () => Promise<string>;
type CardPayload = {
  cardName: string;
  cardId: string;
  [prop: string]: unknown;
};
type OnAddCardFunction = (payload: CardPayload) => void;

type AddCardElementOptions = {
  quantity?: number;
  id?: string;
  name: string;
  img: string;
  type: string;
  singleton?: boolean;
  onAddCard?: OnAddCardFunction;
  getScryfallId?: GetScryfallIDFunction;
};

const bus = new Framebus();

export default class AddCardElement {
  element: HTMLDivElement;
  quantity: number;
  id?: string;
  name: string;
  img: HTMLImageElement;
  overlay: HTMLDivElement;
  minusButton: HTMLDivElement;
  plusButton: HTMLDivElement;
  metadata: HTMLDivElement;
  type: string;
  singleton: boolean;
  onAddCard: OnAddCardFunction;
  private _getScryfallId: GetScryfallIDFunction;

  constructor(options: AddCardElementOptions) {
    const imgSrc = options.img;
    this.quantity = options.quantity || 0;
    if (options.id) {
      this.id = options.id;
    }
    this.name = options.name;
    this.type = options.type;
    this.singleton = Boolean(options.singleton);
    this.onAddCard = options.onAddCard || noop;

    if (options.getScryfallId) {
      this._getScryfallId = options.getScryfallId;
    } else {
      this._getScryfallId = () => {
        return Promise.resolve(this.id as string);
      };
    }

    this.element = createElement(`<div
      class="add-card-element-container"
    >
      <img src="${imgSrc}"/>
      <div class="add-card-element-overlay">
        <div role="button" tabindex="0" class="add-card-element__panel minus-symbol">
          ${MINUS_SYMBOL}
        </div>
        <div role="button" tabindex="0" class="add-card-element__panel plus-symbol">
          ${PLUS_SYMBOL}
        </div>
        <div class="metadata"></div>
      </div>
    </div>`);

    this.img = this.element.querySelector("img") as HTMLImageElement;
    this.overlay = this.element.querySelector(
      ".add-card-element-overlay"
    ) as HTMLDivElement;
    this.minusButton = this.overlay.querySelector(
      ".minus-symbol"
    ) as HTMLDivElement;
    this.plusButton = this.overlay.querySelector(
      ".plus-symbol"
    ) as HTMLDivElement;
    this.metadata = this.overlay.querySelector(".metadata") as HTMLDivElement;

    if (this.singleton) {
      emptyElement(this.minusButton);
      this.minusButton.appendChild(createElement(CHECK_SYMBOL));
      this.minusButton.classList.add("solo");
      this.plusButton.classList.add("solo");
    }

    this.updateUI();

    this._setupListeners();
  }

  _setupListeners(): void {
    this.plusButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      this.addCardToDeck();
    });

    this.plusButton.addEventListener("click", () => {
      this.addCardToDeck();
    });

    this.minusButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      this.removeCardFromDeck();

      if (!this.cardInDeck()) {
        this.plusButton.focus();
      }
    });

    this.minusButton.addEventListener("click", () => {
      this.removeCardFromDeck();

      if (!this.cardInDeck()) {
        this.minusButton.blur();
      }
    });
  }

  setMetadata(value = ""): void {
    if (value) {
      emptyElement(this.metadata);
      this.metadata.appendChild(createElement(`<span>${value}</span>`));
      return;
    }

    if (this.singleton) {
      return;
    }

    if (!this.cardInDeck()) {
      emptyElement(this.metadata);
    } else {
      emptyElement(this.metadata);
      this.metadata.appendChild(
        createElement(`<span>${this.quantity}x</span>`)
      );
    }
  }

  updateUI(): void {
    this.minusButton.classList.toggle("hidden", !this.cardInDeck());
    this.plusButton.classList.toggle("solo", !this.cardInDeck());

    this.setMetadata();

    if (this.singleton) {
      this.plusButton.classList.toggle("hidden", this.cardInDeck());
    }

    this.element.classList.toggle("in-deck", this.cardInDeck());
  }

  cardInDeck(): boolean {
    return this.quantity > 0;
  }

  addCardToDeck(): Promise<void> {
    this.quantity++;

    this.updateUI();

    return this._getScryfallId()
      .then((id) => {
        const payload = {
          cardName: this.name,
          cardId: id,
        };

        if (this.onAddCard) {
          this.onAddCard(payload);
        }

        bus.emit(events.ADD_CARD_TO_DECK, payload);
      })
      .catch((err) => {
        this.quantity--;

        console.error(err);

        bus.emit(events.SCRYFALL_PUSH_NOTIFICATION, {
          header: "Card could not be added",
          message: `There was an error adding ${this.name} to the deck. See console for more details.`,
          color: "red",
        });

        this.updateUI();
      });
  }

  removeCardFromDeck(): void {
    this.quantity--;

    this.updateUI();

    bus.emit(events.REMOVE_CARD_FROM_DECK, {
      cardName: this.name,
    });
  }

  toggleAppearance(shouldHide = false): void {
    this.element.classList.toggle("hidden", shouldHide);
  }
}
