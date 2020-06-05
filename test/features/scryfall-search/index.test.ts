import ScryfallSearch from "Features/deck-builder-features/scryfall-search";
import deckParser from "Lib/deck-parser";
import { getDeck, search } from "Lib/scryfall";
import bus from "framebus";
import Drawer from "Lib/ui-elements/drawer";

import { makeFakeDeck, makeFakeCard } from "Helpers/fake";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");
jest.mock("framebus");

describe("Scryfall Search", function () {
  let headerSearchField: HTMLInputElement;
  let deckbuilderContainer: HTMLDivElement;
  let searchInput: HTMLInputElement;

  beforeEach(() => {
    headerSearchField = document.createElement("input");
    headerSearchField.id = "header-search-field";
    jest.spyOn(ScryfallSearch, "getSettings").mockResolvedValue({});

    document.body.appendChild(headerSearchField);

    deckbuilderContainer = document.createElement("input");
    deckbuilderContainer.id = "deckbuilder";
    searchInput = document.createElement("input");
    searchInput.id = "header-search-field";

    document.body.appendChild(deckbuilderContainer);
    document.body.appendChild(searchInput);
  });

  describe("Constructor", () => {
    it("creates a drawer", async () => {
      jest.spyOn(ScryfallSearch.prototype, "createDrawer");

      const ss = new ScryfallSearch();

      await ss.run();

      expect(ss.createDrawer).toBeCalledTimes(1);
      expect(
        deckbuilderContainer.querySelector("#scryfall-search-drawer")
      ).toBe(ss.drawer.element);
    });
  });

  describe("drawer behavior", function () {
    it("triggers cleanup on close", function () {
      const ss = new ScryfallSearch();

      ss.drawer.triggerOnClose();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith("CLEAN_UP_DECK");
    });

    it("focuses search input on close", function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss.headerSearchField, "focus");

      ss.drawer.triggerOnClose();

      expect(ss.headerSearchField.focus).toBeCalledTimes(1);
    });

    it("adds cards on scroll if ready for the next batch", async () => {
      const ss = new ScryfallSearch();

      ss.cardList = [];

      ss.cardList.next = jest.fn().mockResolvedValue(ss.cardList);

      jest.spyOn(ss, "isReadyToLookupNextBatch").mockReturnValue(true);
      jest.spyOn(ss, "addCards").mockImplementation();

      expect(ss.addCards).toBeCalledTimes(0);

      await ss.drawer.triggerOnScroll();

      expect(ss.addCards).toBeCalledTimes(1);
    });

    it("does not add cards on scroll if not ready for the next batch", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "isReadyToLookupNextBatch").mockReturnValue(false);
      jest.spyOn(ss, "addCards");
      ss.cardList = [];
      ss.cardList.next = jest.fn().mockResolvedValue([]);

      await ss.drawer.triggerOnScroll();

      expect(ss.addCards).toBeCalledTimes(0);
    });
  });

  describe("run", function () {
    it("fetches the deck data", async function () {
      mocked(getDeck).mockResolvedValue(makeFakeDeck());

      const ss = new ScryfallSearch();

      await ss.run();

      expect(ss.deck).toBeTruthy();
    });

    it("sets up event listener for header search bar", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "onEnter").mockResolvedValue();

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
      expect(ss.onEnter).toBeCalledWith("is:commander", true);
    });

    it("does not call onEnter if no value in the header search field", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "onEnter").mockResolvedValue();

      await ss.run();

      headerSearchField.value = "";
      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(0);
    });

    it("sets up event listener for inline search bar", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "onEnter").mockResolvedValue();

      await ss.run();

      ss.inlineSearchField.value = "is:commander";
      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "a",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(0);

      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(1);
      expect(ss.onEnter).toBeCalledWith("is:commander", false);
    });

    it("does not call onEnter if no value in the inline search field", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "onEnter").mockResolvedValue();

      await ss.run();

      ss.inlineSearchField.value = "";
      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.onEnter).toBeCalledTimes(0);
    });
  });

  describe("onEnter", function () {
    let ss: ScryfallSearch;
    let getDeckSpy: jest.SpyInstance;
    let searchSpy: jest.SpyInstance;

    beforeEach(function () {
      ss = new ScryfallSearch();
      ss.drawer = new Drawer();
      jest.spyOn(ss.drawer, "setLoading");
      jest.spyOn(Drawer.prototype, "scrollTo").mockImplementation();
      jest.spyOn(Drawer.prototype, "open");
      ss.settings = {
        enabled: false,
        restrictToCommanderColorIdentity: false,
        restrictFunnyCards: false,
      };

      searchSpy = mocked(search as jest.Mock).mockResolvedValue([]);
      getDeckSpy = mocked(getDeck).mockResolvedValue(makeFakeDeck());
      jest.spyOn(ss, "addCards").mockImplementation();
    });

    it("opens the drawer", async function () {
      await ss.onEnter("foo");

      expect(ss.drawer?.open).toBeCalledTimes(1);
    });

    it("queries the api", async function () {
      await ss.onEnter("foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo");
    });

    it("adds `not:funny` to query when restrictFunnyCards setting is active", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.onEnter("foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo not:funny");
    });

    it("does not add `not:funny` to query when restrictFunnyCards setting is active but adjustQuery param is set to false", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.onEnter("foo", false);

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo");
    });

    it("does not add `not:funny` to query when not:funny is already present", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.onEnter("not:funny foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("not:funny foo");
    });

    it("does not add `not:funny` to query when is:funny is already present", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.onEnter("is:funny foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("is:funny foo");
    });

    it("adds `ids` to query when restrictToCommanderColorIdentity setting is active and deck is commanderlike", async function () {
      ss.settings!.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(searchSpy).toBeCalledTimes(1);
      expect(searchSpy).toBeCalledWith("foo ids:BG");
    });

    it("does not add `ids` to query when restrictToCommanderColorIdentity setting is active and deck is commanderlike but adjustQuery param is set to false", async function () {
      ss.settings!.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo", false);

      expect(searchSpy).toBeCalledTimes(1);
      expect(searchSpy).toBeCalledWith("foo");
    });

    it.each(["id", "ids", "identity", "ci"])(
      "does not add `ids` to query when `%s` is already present",
      async function (param) {
        ss.settings!.restrictToCommanderColorIdentity = true;
        jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
        jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
        jest
          .spyOn(deckParser, "getCommanderColorIdentity")
          .mockResolvedValue(["B", "G"]);

        await ss.onEnter(`${param}:W foo`);

        expect(searchSpy).toBeCalledTimes(1);
        expect(searchSpy).toBeCalledWith(`${param}:W foo`);
      }
    );

    it("does not add `ids` to query when restrictToCommanderColorIdentity setting is active and deck is not commanderlike", async function () {
      ss.settings!.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(false);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(searchSpy).toBeCalledTimes(1);
      expect(searchSpy).toBeCalledWith("foo");
    });

    it("can add both `not:funny` and `ids` to query", async function () {
      ss.settings!.restrictFunnyCards = true;
      ss.settings!.restrictToCommanderColorIdentity = true;
      jest.spyOn(deckParser, "isSingletonTypeDeck").mockReturnValue(true);
      jest.spyOn(deckParser, "isCommanderLike").mockReturnValue(true);
      jest
        .spyOn(deckParser, "getCommanderColorIdentity")
        .mockResolvedValue(["B", "G"]);

      await ss.onEnter("foo");

      expect(searchSpy).toBeCalledTimes(1);
      expect(searchSpy).toBeCalledWith("foo not:funny ids:BG");
    });

    it("adds cards from the api result", async function () {
      const cards = [{}, {}];

      searchSpy.mockResolvedValue(cards);

      await ss.onEnter("foo");

      expect(ss.cardList).toBe(cards);
      expect(ss.addCards).toBeCalledTimes(1);
    });

    it("fetches the current deck", async function () {
      await ss.onEnter("foo");

      expect(getDeckSpy).toBeCalledTimes(1);
    });

    it("adds deck to instance", async function () {
      const fakeDeck = makeFakeDeck();

      getDeckSpy.mockResolvedValue(fakeDeck);

      await ss.onEnter("foo");

      expect(ss.deck).toBe(fakeDeck);
    });

    it("hides and then shows the drawer", async function () {
      await ss.onEnter("foo");

      expect(ss.drawer.setLoading).toBeCalledTimes(2);
      expect(ss.drawer.setLoading).nthCalledWith(1, true);
      expect(ss.drawer.setLoading).nthCalledWith(2, false);
    });
  });

  describe("addCards", function () {
    let ss: ScryfallSearch;

    beforeEach(function () {
      ss = new ScryfallSearch();
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
          color_identity: ["W"],
          oracle_id: "oracle-id-1",
          name: "card 1",
          getImage() {
            return "https://example.com/1";
          },
          type_line: "type 1",
        },
        {
          id: "id-2",
          color_identity: ["U"],
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
        ss.cardResultsContainer.querySelector(
          'img[src="https://example.com/1"]'
        )
      ).toBeTruthy();
      expect(
        ss.cardResultsContainer.querySelector(
          'img[src="https://example.com/2"]'
        )
      ).toBeTruthy();
    });

    it("adds an error message when no card list is available", function () {
      ss.cardList = [];

      ss.addCards();

      expect(ss.cardResultsContainer.innerHTML).toContain("No search results.");
    });
  });

  describe("isReadyToLookupNextBatch ", function () {
    let el: Element;

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

      ss.cardList = undefined;

      expect(ss.isReadyToLookupNextBatch(el)).toBe(false);
    });

    it("returns false if card list has no more in list", function () {
      const ss = new ScryfallSearch();

      ss.cardList = [];
      ss.cardList.has_more = false;

      expect(ss.isReadyToLookupNextBatch(el)).toBe(false);
    });

    it("returns false if element position is beneath the scroll threshold", function () {
      const ss = new ScryfallSearch();

      ss.cardList = [];
      ss.cardList.has_more = true;

      expect(
        ss.isReadyToLookupNextBatch({
          scrollTop: 100,
          clientHeight: 100,
          scrollHeight: 9999999,
        } as Element)
      ).toBe(false);
    });

    it("returns true if element position is within the scroll threshold", function () {
      const ss = new ScryfallSearch();

      ss.cardList = [];
      ss.cardList.has_more = true;

      expect(
        ss.isReadyToLookupNextBatch({
          scrollTop: 100,
          clientHeight: 100,
          scrollHeight: 100,
        } as Element)
      ).toBe(true);
    });
  });
});
