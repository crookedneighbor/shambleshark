import * as bus from "framebus";
import AddCardElement from "Ui/add-card-element";
import { PLUS_SYMBOL } from "Svg";

jest.mock("framebus");

describe("AddCardElement", function () {
  it("defaults card in deck status to false", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    expect(cardEl.cardInDeck()).toBe(false);
    expect(cardEl.element.classList.contains("in-deck")).toBe(false);
  });

  it("can set card in deck status to true when quantity is greater than 0", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      quantity: 1,
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    expect(cardEl.cardInDeck()).toBe(true);
    expect(cardEl.element.classList.contains("in-deck")).toBe(true);
  });

  it("defaults to having the minus button be hidden", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    expect(cardEl.plusButton.classList.contains("solo")).toBe(true);
    expect(cardEl.minusButton.classList.contains("hidden")).toBe(true);
  });

  it("shows the minus button if quantity > 0", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      quantity: 1,
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    expect(cardEl.plusButton.classList.contains("solo")).toBe(false);
    expect(cardEl.minusButton.classList.contains("hidden")).toBe(false);
  });

  it("sets minus button to use check symbol when in singleton mode", async function () {
    const cardElInNormalMode = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });
    const cardElInSingletonMode = new AddCardElement({
      name: "Arcane Denial",
      singleton: true,
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    expect(cardElInNormalMode.minusButton.innerHTML).toContain(
      "svg-minus-symbol"
    );
    expect(cardElInNormalMode.minusButton.innerHTML).not.toContain(
      "svg-check-symbol"
    );
    expect(cardElInSingletonMode.minusButton.innerHTML).toContain(
      "svg-check-symbol"
    );
    expect(cardElInSingletonMode.minusButton.innerHTML).not.toContain(
      "svg-minus-symbol"
    );
  });

  it("calls addCardToDeck when plus button is clicked", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    jest.spyOn(cardEl, "addCardToDeck").mockImplementation();

    cardEl.plusButton.click();

    expect(cardEl.addCardToDeck).toBeCalledTimes(1);

    cardEl.plusButton.click();

    expect(cardEl.addCardToDeck).toBeCalledTimes(2);
  });

  it("calls addCardToDeck when pressing enter while plus button is focussed", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });
    const evt = new window.KeyboardEvent("keydown", {
      key: "Enter",
    });

    jest.spyOn(cardEl, "addCardToDeck").mockImplementation();

    expect(cardEl.addCardToDeck).toBeCalledTimes(0);

    cardEl.plusButton.dispatchEvent(evt);

    expect(cardEl.addCardToDeck).toBeCalledTimes(1);

    cardEl.plusButton.dispatchEvent(evt);

    expect(cardEl.addCardToDeck).toBeCalledTimes(2);
  });

  it("calls removeCardFromDeck when minus button is clicked", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });

    jest.spyOn(cardEl, "removeCardFromDeck").mockImplementation();

    cardEl.minusButton.click();

    expect(cardEl.removeCardFromDeck).toBeCalledTimes(1);

    cardEl.minusButton.click();

    expect(cardEl.removeCardFromDeck).toBeCalledTimes(2);
  });

  it("calls removeCardFromDeck when pressing enter while minus button is focussed", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      quantity: 3,
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });
    const evt = new window.KeyboardEvent("keydown", {
      key: "Enter",
    });

    jest.spyOn(cardEl, "removeCardFromDeck").mockImplementation();

    expect(cardEl.removeCardFromDeck).toBeCalledTimes(0);

    cardEl.minusButton.dispatchEvent(evt);

    expect(cardEl.removeCardFromDeck).toBeCalledTimes(1);

    cardEl.minusButton.dispatchEvent(evt);

    expect(cardEl.removeCardFromDeck).toBeCalledTimes(2);
  });

  it("focuses on plus button when last card is removed from deck using the keyboard", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      quantity: 0,
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });
    const evt = new window.KeyboardEvent("keydown", {
      key: "Enter",
    });

    jest.spyOn(cardEl.plusButton, "focus").mockImplementation();
    jest.spyOn(cardEl, "removeCardFromDeck").mockImplementation();

    expect(cardEl.plusButton.focus).toBeCalledTimes(0);

    cardEl.minusButton.dispatchEvent(evt);

    expect(cardEl.plusButton.focus).toBeCalledTimes(1);
  });

  it("does not focus on plus button when cards remain in deck when being removed using the keyboard", async function () {
    const cardEl = new AddCardElement({
      name: "Arcane Denial",
      quantity: 2,
      id: "arcane-denial-id",
      type: "Instant",
      img: "https://example.com/arcane-signet",
    });
    const evt = new window.KeyboardEvent("keydown", {
      key: "Enter",
    });

    jest.spyOn(cardEl.plusButton, "focus").mockImplementation();
    jest.spyOn(cardEl, "removeCardFromDeck").mockImplementation();

    expect(cardEl.plusButton.focus).toBeCalledTimes(0);

    cardEl.minusButton.dispatchEvent(evt);

    expect(cardEl.plusButton.focus).toBeCalledTimes(0);
  });

  describe("setMetadata", function () {
    it("sets metadata to quantity when there is a quantity and no value is passed in", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        quantity: 2,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.quantity = 3;

      cardEl.setMetadata();

      expect(cardEl.metadata.innerHTML).toContain("3x");
    });

    it("sets metadata to empty when in singleton mode", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        singleton: true,
        quantity: 1,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.setMetadata();

      expect(cardEl.metadata.innerHTML).toBe("");
    });

    it("sets metadata to empty when quantity is 0 and no value is passed in", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        quantity: 2,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.quantity = 0;

      cardEl.setMetadata();

      expect(cardEl.metadata.innerHTML).toBe("");
    });

    it("sets metadata to value when value is passed in", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        quantity: 2,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.setMetadata("custom message");

      expect(cardEl.metadata.innerHTML).toContain("custom message");
    });
  });

  describe("updateUI", function () {
    it("sets the state for card not being in deck", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        quantity: 1,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      jest.spyOn(cardEl, "setMetadata");

      expect(cardEl.minusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(false);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(true);

      cardEl.quantity = 0;

      cardEl.updateUI();

      expect(cardEl.setMetadata).toBeCalledTimes(1);
      expect(cardEl.minusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(true);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(false);
    });

    it("sets the state for card being in deck", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        quantity: 0,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      jest.spyOn(cardEl, "setMetadata");

      expect(cardEl.minusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(true);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(false);

      cardEl.quantity = 1;

      cardEl.updateUI();

      expect(cardEl.setMetadata).toBeCalledTimes(1);
      expect(cardEl.minusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(false);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(true);
    });

    it("sets the state for card not being in deck in singleton mode", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        singleton: true,
        quantity: 1,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      jest.spyOn(cardEl, "setMetadata");

      expect(cardEl.minusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(false);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.element.classList.contains("in-deck")).toBe(true);

      cardEl.quantity = 0;

      cardEl.updateUI();

      expect(cardEl.setMetadata).toBeCalledTimes(1);
      expect(cardEl.minusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(true);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(false);
    });

    it("sets the state for card being in deck in singleton mode", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        singleton: true,
        quantity: 0,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      jest.spyOn(cardEl, "setMetadata");

      expect(cardEl.minusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(true);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(false);

      cardEl.quantity = 1;

      cardEl.updateUI();

      expect(cardEl.setMetadata).toBeCalledTimes(1);
      expect(cardEl.minusButton.classList.contains("hidden")).toBe(false);
      expect(cardEl.plusButton.classList.contains("solo")).toBe(false);
      expect(cardEl.plusButton.classList.contains("hidden")).toBe(true);
      expect(cardEl.element.classList.contains("in-deck")).toBe(true);
    });
  });

  describe("cardInDeck", function () {
    it("returns true when quantity is greater than zero", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        quantity: 1,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      expect(cardEl.cardInDeck()).toBe(true);
    });

    it("returns false when quantity is zero", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        quantity: 0,
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      expect(cardEl.cardInDeck()).toBe(false);
    });
  });

  describe("addCardToDeck", function () {
    it("emits event to add card to deck", async function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      await cardEl.addCardToDeck();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "arcane-denial-id",
      });
    });

    it("passes add card object to onAddCard before emitting add card to deck event", async function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        onAddCard(data: { cardName: string; section: string; cardId: string }) {
          data.cardName = "foo";
          data.section = "bar";
        },
        img: "https://example.com/arcane-signet",
      });

      await cardEl.addCardToDeck();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "foo",
        section: "bar",
        cardId: "arcane-denial-id",
      });
    });

    it("updates card ui", async function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      jest.spyOn(cardEl, "updateUI");

      await cardEl.addCardToDeck();

      expect(cardEl.updateUI).toBeCalledTimes(1);
    });

    it("can pass a custom getScryfallId function", async function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
        getScryfallId() {
          return Promise.resolve("different-id");
        },
      });

      await cardEl.addCardToDeck();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "different-id",
      });
    });

    it("handles error when getScryfallId fails", async function () {
      const errFromScryfall = new Error("Error from scryfall");
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
        getScryfallId() {
          return Promise.reject(errFromScryfall);
        },
      });

      jest.spyOn(console, "error").mockImplementation();

      await cardEl.addCardToDeck();

      expect(bus.emit).not.toBeCalledWith(
        "ADD_CARD_TO_DECK",
        expect.any(Object)
      );
      expect(bus.emit).toBeCalledWith("SCRYFALL_PUSH_NOTIFICATION", {
        header: "Card could not be added",
        message:
          "There was an error adding Arcane Denial to the deck. See console for more details.",
        color: "red",
      });

      expect(console.error).toBeCalledWith(errFromScryfall);
      expect(cardEl.cardInDeck()).toBe(false);
      expect(cardEl.element.classList.contains("in-deck")).toBe(false);
      expect(cardEl.overlay.innerHTML).toContain(PLUS_SYMBOL);
    });
  });

  describe("removeCardFromDeck", function () {
    it("emits event to remove from deck", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.removeCardFromDeck();

      expect(bus.emit).toBeCalledWith("REMOVE_CARD_FROM_DECK", {
        cardName: "Arcane Denial",
      });
    });

    it("decrements quantity", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        quantity: 10,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.removeCardFromDeck();

      expect(cardEl.quantity).toBe(9);
    });

    it("updates ui", async function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        singleton: true,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      await cardEl.addCardToDeck();

      jest.spyOn(cardEl, "updateUI");

      cardEl.removeCardFromDeck();

      expect(cardEl.updateUI).toBeCalledTimes(1);
    });
  });

  describe("toggleAppearance", function () {
    it("adds hidden class if true is passed in", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        singleton: true,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      expect(cardEl.element.classList.contains("hidden")).toBe(false);

      cardEl.toggleAppearance(true);
      expect(cardEl.element.classList.contains("hidden")).toBe(true);

      cardEl.toggleAppearance(true);
      expect(cardEl.element.classList.contains("hidden")).toBe(true);
    });

    it("removes hidden class if false is passed in", function () {
      const cardEl = new AddCardElement({
        name: "Arcane Denial",
        singleton: true,
        id: "arcane-denial-id",
        type: "Instant",
        img: "https://example.com/arcane-signet",
      });

      cardEl.toggleAppearance(true);
      expect(cardEl.element.classList.contains("hidden")).toBe(true);

      cardEl.toggleAppearance(false);
      expect(cardEl.element.classList.contains("hidden")).toBe(false);

      cardEl.toggleAppearance(false);
      expect(cardEl.element.classList.contains("hidden")).toBe(false);
    });
  });
});
