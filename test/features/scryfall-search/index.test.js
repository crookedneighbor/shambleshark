import ScryfallSearch from "Features/deck-builder-features/scryfall-search";
import deckParser from "Lib/deck-parser";
import scryfall from "Lib/scryfall";
import bus from "framebus";

import { makeFakeDeck, makeFakeCard } from "Helpers/fake";

describe("Scryfall Search", function () {
  describe("run", function () {
    let headerSearchField;

    beforeEach(function () {
      headerSearchField = document.createElement("input");
      headerSearchField.id = "header-search-field";
      jest.spyOn(ScryfallSearch, "getSettings").mockResolvedValue({});

      document.body.appendChild(headerSearchField);
    });

    it("creates a drawer", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "createDrawer").mockReturnValue({});

      await ss.run();

      expect(ss.createDrawer).toBeCalledTimes(1);
    });

    it("sets up event listener for search bar", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "createDrawer").mockReturnValue({});
      jest.spyOn(ss, "onEnter").mockReturnValue({});

      await ss.run();

      headerSearchField.value = "is:commander";
      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "a",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(0);

      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(1);
      expect(ss.onEnter).toBeCalledWith("is:commander");
    });

    it("does not call onEnter if no value in the header search field", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "createDrawer").mockReturnValue({});
      jest.spyOn(ss, "onEnter").mockReturnValue({});

      await ss.run();

      headerSearchField.value = "";
      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(0);
    });
  });

  describe("createDrawer", function () {
    let deckbuilderContainer, searchInput;

    beforeEach(function () {
      deckbuilderContainer = document.createElement("input");
      deckbuilderContainer.id = "deckbuilder";
      searchInput = document.createElement("input");
      searchInput.id = "header-search-field";

      document.body.appendChild(deckbuilderContainer);
      document.body.appendChild(searchInput);
    });

    it("adds a drawer to the page", function () {
      const ss = new ScryfallSearch();
      const drawer = ss.createDrawer();

      expect(
        deckbuilderContainer.querySelector("#scryfall-search-drawer")
      ).toBe(drawer.element);
    });

    it("triggers cleanup on close", function () {
      const ss = new ScryfallSearch();
      const drawer = ss.createDrawer();

      jest.spyOn(bus, "emit").mockReturnValue(null);

      drawer.triggerOnClose();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith("CLEAN_UP_DECK");
    });

    it("focuses search input on close", function () {
      const ss = new ScryfallSearch();
      const drawer = ss.createDrawer();

      jest.spyOn(searchInput, "focus").mockReturnValue(null);

      drawer.triggerOnClose();

      expect(searchInput.focus).toBeCalledTimes(1);
    });

    it("adds cards on scroll if ready for the next batch", async function () {
      const ss = new ScryfallSearch();
      const drawer = ss.createDrawer();

      jest.spyOn(ss, "isReadyToLookupNextBatch").mockReturnValue(true);
      jest.spyOn(ss, "addCards").mockReturnValue(null);
      ss.cardList = {
        next: jest.fn().mockResolvedValue([]),
      };

      expect(ss.addCards).toBeCalledTimes(0);

      await drawer.triggerOnScroll();

      expect(ss.addCards).toBeCalledTimes(1);
    });

    it("does not add cards on scroll if not ready for the next batch", async function () {
      const ss = new ScryfallSearch();
      const drawer = ss.createDrawer();

      jest.spyOn(ss, "isReadyToLookupNextBatch").mockReturnValue(false);
      jest.spyOn(ss, "addCards");
      ss.cardList = {
        next: jest.fn().mockResolvedValue([]),
      };

      await drawer.triggerOnScroll();

      expect(ss.addCards).toBeCalledTimes(0);
    });
  });

  describe("onEnter", function () {
    let ss;

    beforeEach(function () {
      ss = new ScryfallSearch();
      ss.drawer = {
        open: jest.fn(),
        setHeader: jest.fn(),
        setLoading: jest.fn(),
      };
      ss.container = document.createElement("div");
      ss.settings = {};

      jest.spyOn(scryfall.api, "get").mockResolvedValue([]);
      jest.spyOn(scryfall, "getDeck").mockResolvedValue(makeFakeDeck());
      jest.spyOn(ss, "addCards").mockReturnValue(null);
    });

    it("opens the drawer", async function () {
      await ss.onEnter("foo");

      expect(ss.drawer.open).toBeCalledTimes(1);
    });

    it("queries the api", async function () {
      await ss.onEnter("foo");

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("cards/search", {
        q: "foo",
      });
    });

    it("adds `not:funny` to query when restrictFunnyCards setting is active", async function () {
      ss.settings.restrictFunnyCards = true;
      await ss.onEnter("foo");

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("cards/search", {
        q: "foo not:funny",
      });
    });

    it("adds `ids` to query when restrictToCommanderColorIdentity setting is active and deck is commanderlike", async function () {
      ss.settings.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("cards/search", {
        q: "foo ids:BG",
      });
    });

    it("does not add `ids` to query when restrictToCommanderColorIdentity setting is active and deck is not commanderlike", async function () {
      ss.settings.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(false);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("cards/search", {
        q: "foo",
      });
    });

    it("can add both `not:funny` and `ids` to query", async function () {
      ss.settings.restrictFunnyCards = true;
      ss.settings.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("cards/search", {
        q: "foo not:funny ids:BG",
      });
    });

    it("adds cards from the api result", async function () {
      const cards = [{}, {}];

      scryfall.api.get.mockResolvedValue(cards);

      await ss.onEnter("foo");

      expect(ss.cardList).toBe(cards);
      expect(ss.addCards).toBeCalledTimes(1);
    });

    it("fetches the current deck", async function () {
      await ss.onEnter("foo");

      expect(scryfall.getDeck).toBeCalledTimes(1);
    });

    it("adds deck to instance", async function () {
      const fakeDeck = makeFakeDeck();

      scryfall.getDeck.mockResolvedValue(fakeDeck);

      await ss.onEnter("foo");

      expect(ss.deck).toBe(fakeDeck);
    });

    it("shows the drawer", async function () {
      await ss.onEnter("foo");

      expect(ss.drawer.setLoading).toBeCalledTimes(1);
      expect(ss.drawer.setLoading).toBeCalledWith(false);
    });
  });

  describe("addCards", function () {
    let ss;

    beforeEach(function () {
      ss = new ScryfallSearch();
      ss.container = document.createElement("div");
      ss.deck = makeFakeDeck({
        primarySections: ["mainboard"],
        entries: {
          mainboard: [
            makeFakeCard({
              count: 3,
            }),
          ],
        },
      });
    });

    it("creates card elements to add to container", function () {
      ss.cardList = [
        {
          id: "id-1",
          oracle_id: "oracle-id-1",
          name: "card 1",
          getImage() {
            return "https://example.com/1";
          },
          type_line: "type 1",
        },
        {
          id: "id-2",
          oracle_id: "oracle-id-2",
          name: "card 2",
          getImage() {
            return "https://example.com/2";
          },
          type_line: "type 2",
        },
      ];

      ss.addCards();

      expect(
        ss.container.querySelector('img[src="https://example.com/1"]')
      ).toBeTruthy();
      expect(
        ss.container.querySelector('img[src="https://example.com/2"]')
      ).toBeTruthy();
    });

    it("adds an error message when no card list is available", function () {
      ss.cardList = [];

      ss.addCards();

      expect(ss.container.innerHTML).toContain("No search results.");
    });
  });

  describe("isReadyToLookupNextBatch ", function () {
    let el;

    beforeEach(function () {
      el = document.createElement("div");
    });

    it("returns false if lookup is already in progress", function () {
      const ss = new ScryfallSearch();

      ss._nextInProgress = true;

      expect(ss.isReadyToLookupNextBatch(el)).toBe(false);
    });

    it("returns false if there is no card list", function () {
      const ss = new ScryfallSearch();

      ss.cardList = null;

      expect(ss.isReadyToLookupNextBatch(el)).toBe(false);
    });

    it("returns false if card list has no more in list", function () {
      const ss = new ScryfallSearch();

      ss.cardList = {
        has_more: false,
      };

      expect(ss.isReadyToLookupNextBatch(el)).toBe(false);
    });

    it("returns false if element position is beneath the scroll threshold", function () {
      const ss = new ScryfallSearch();

      ss.cardList = {
        has_more: true,
      };

      expect(
        ss.isReadyToLookupNextBatch({
          scrollTop: 100,
          clientHeight: 100,
          scrollHeight: 9999999,
        })
      ).toBe(false);
    });

    it("returns true if element position is within the scroll threshold", function () {
      const ss = new ScryfallSearch();

      ss.cardList = {
        has_more: true,
      };

      expect(
        ss.isReadyToLookupNextBatch({
          scrollTop: 100,
          clientHeight: 100,
          scrollHeight: 100,
        })
      ).toBe(true);
    });
  });
});
