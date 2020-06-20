import ScryfallSearch from "Features/deck-builder-features/scryfall-search";
import deckParser from "Lib/deck-parser";
import { getDeck, search } from "Lib/scryfall";
import bus from "framebus";
import Drawer from "Lib/ui-elements/drawer";
import Modal from "Lib/ui-elements/modal";

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

    jest.spyOn(Drawer.prototype, "scrollTo").mockImplementation();
    jest.spyOn(Modal.prototype, "scrollTo").mockImplementation();
  });

  describe("Constructor", () => {
    it("creates a drawer to display search results in", async () => {
      jest.spyOn(ScryfallSearch.prototype, "createDrawer");

      const ss = new ScryfallSearch();

      await ss.run();

      expect(ss.createDrawer).toBeCalledTimes(1);
      expect(
        deckbuilderContainer.querySelector("#scryfall-search-drawer")
      ).toBe(ss.drawer.element);
    });

    it("creates a modal to display saved searches in", async () => {
      jest.spyOn(ScryfallSearch.prototype, "createModal");

      const ss = new ScryfallSearch();

      await ss.run();

      expect(ss.createModal).toBeCalledTimes(1);
      expect(
        deckbuilderContainer.querySelector(
          "#scryfall-search-saved-search-modal"
        )
      ).toBe(ss.savedSearchModal.element);
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

  describe("saved searches modal behavior", () => {
    describe("on close", () => {
      it("sets loading state back to tru", () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss.savedSearchModal, "setLoading");

        expect(ss.savedSearchModal.setLoading).toBeCalledTimes(0);

        ss.savedSearchModal.triggerOnClose();

        expect(ss.savedSearchModal.setLoading).toBeCalledTimes(1);
        expect(ss.savedSearchModal.setLoading).toBeCalledWith(true);
      });
    });

    describe("on open", () => {
      beforeEach(() => {
        jest
          .spyOn(ScryfallSearch.prototype, "getSavedSearches")
          .mockResolvedValue([
            {
              name: "some name",
              query: "query",
            },
          ]);
      });

      it("looks up saved searches", async () => {
        const ss = new ScryfallSearch();

        expect(ss.getSavedSearches).toBeCalledTimes(0);

        await ss.savedSearchModal.triggerOnOpen();

        expect(ss.getSavedSearches).toBeCalledTimes(1);
        expect(ss.savedSearches.length).toBe(1);
        expect(ss.savedSearches[0]).toEqual({
          name: "some name",
          query: "query",
        });
      });

      it("sets saved input to current query", async () => {
        const ss = new ScryfallSearch();

        ss.currentQuery = "some query";
        await ss.savedSearchModal.triggerOnOpen();

        expect(ss.newSavedSearchInputs.query.value).toBe("some query");
      });

      it("creates elements for each saved search", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([
          {
            name: "Query 1",
            query: "query",
          },
          {
            name: "Query 2",
            query: "query",
          },
          {
            name: "Query 3",
            query: "query",
          },
        ]);

        await ss.savedSearchModal.triggerOnOpen();

        expect(
          ss.savedSearchModal.element.querySelectorAll(
            ".scryfall-search__saved-search-group"
          ).length
        ).toBe(3);
      });

      it("runs search when saved search is clicked", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([
          {
            name: "Query",
            query: "query",
          },
        ]);

        await ss.savedSearchModal.triggerOnOpen();

        jest.spyOn(ss, "runSearch");

        const searchEl = ss.savedSearchModal.element.querySelector(
          ".scryfall-search__saved-search-details"
        ) as HTMLElement;

        searchEl.click();

        expect(ss.runSearch).toBeCalledTimes(1);
        expect(ss.runSearch).toBeCalledWith("query");
      });

      it("creates a new saved search when a new saved search is submitted", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([]);
        jest.spyOn(ss, "saveSearches");

        await ss.savedSearchModal.triggerOnOpen();

        ss.newSavedSearchInputs.name.value = "name";
        ss.newSavedSearchInputs.query.value = "query";

        ss.savedSearchModal.element.querySelector("form")?.submit();

        expect(ss.savedSearches[0]).toEqual({
          name: "name",
          query: "query",
        });
        expect(ss.saveSearches).toBeCalledTimes(1);
        expect(
          ss.savedSearchModal.element.querySelector(
            ".scryfall-search__saved-search-details"
          )
        ).toBeTruthy();
        expect(ss.newSavedSearchInputs.name.value).toBe("");
        expect(ss.newSavedSearchInputs.query.value).toBe("");
      });

      it("does not create a new saved search when name input is missing", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([]);
        jest.spyOn(ss, "saveSearches");

        await ss.savedSearchModal.triggerOnOpen();

        ss.newSavedSearchInputs.name.value = "";
        ss.newSavedSearchInputs.query.value = "query";

        ss.savedSearchModal.element.querySelector("form")?.submit();

        expect(ss.savedSearches[0]).toBeFalsy();
        expect(ss.saveSearches).toBeCalledTimes(0);
        expect(
          ss.savedSearchModal.element.querySelector(
            ".scryfall-search__saved-search-details"
          )
        ).toBeFalsy();
        expect(
          ss.newSavedSearchInputs.name.classList.contains("validation-error")
        ).toBeTruthy();
        expect(ss.newSavedSearchInputs.name.value).toBe("");
        expect(ss.newSavedSearchInputs.query.value).toBe("query");
      });

      it("does not create a new saved search when query input is missing", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([]);
        jest.spyOn(ss, "saveSearches");

        await ss.savedSearchModal.triggerOnOpen();

        ss.newSavedSearchInputs.name.value = "name";
        ss.newSavedSearchInputs.query.value = "";

        ss.savedSearchModal.element.querySelector("form")?.submit();

        expect(ss.savedSearches[0]).toBeFalsy();
        expect(ss.saveSearches).toBeCalledTimes(0);
        expect(
          ss.savedSearchModal.element.querySelector(
            ".scryfall-search__saved-search-details"
          )
        ).toBeFalsy();
        expect(
          ss.newSavedSearchInputs.query.classList.contains("validation-error")
        ).toBeTruthy();
        expect(ss.newSavedSearchInputs.name.value).toBe("name");
        expect(ss.newSavedSearchInputs.query.value).toBe("");
      });

      it("runs the search when selected from options menu", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([
          {
            name: "Query",
            query: "query",
          },
        ]);

        await ss.savedSearchModal.triggerOnOpen();

        jest.spyOn(ss, "runSearch");

        const select = ss.savedSearchModal.element.querySelector(
          ".scryfall-search__saved-search-options-select select"
        ) as HTMLSelectElement;

        select.value = "open";
        select.dispatchEvent(new Event("change"));

        expect(ss.runSearch).toBeCalledTimes(1);
        expect(ss.runSearch).toBeCalledWith("query");
      });

      it("sets the new search inputs to the search details when edit is chosesn from the selections menu", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([
          {
            name: "Query",
            query: "query",
          },
        ]);
        jest.spyOn(ss, "deleteSearch");
        jest.spyOn(ss.newSavedSearchInputs.query, "focus");

        await ss.savedSearchModal.triggerOnOpen();

        const select = ss.savedSearchModal.element.querySelector(
          ".scryfall-search__saved-search-options-select select"
        ) as HTMLSelectElement;

        select.value = "edit";
        select.dispatchEvent(new Event("change"));

        expect(ss.deleteSearch).toBeCalledTimes(1);
        expect(ss.deleteSearch).toBeCalledWith(
          {
            name: "Query",
            query: "query",
          },
          expect.any(HTMLDivElement)
        );
        expect(ss.newSavedSearchInputs.name.value).toBe("Query");
        expect(ss.newSavedSearchInputs.query.value).toBe("query");
        expect(ss.newSavedSearchInputs.query.focus).toBeCalledTimes(1);
      });

      it("deletes the search when delete is chosesn from the selections menu", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss, "getSavedSearches").mockResolvedValue([
          {
            name: "Query",
            query: "query",
          },
        ]);
        jest.spyOn(ss, "deleteSearch");

        await ss.savedSearchModal.triggerOnOpen();

        const select = ss.savedSearchModal.element.querySelector(
          ".scryfall-search__saved-search-options-select select"
        ) as HTMLSelectElement;

        select.value = "delete";
        select.dispatchEvent(new Event("change"));

        expect(ss.deleteSearch).toBeCalledTimes(1);
        expect(ss.deleteSearch).toBeCalledWith(
          {
            name: "Query",
            query: "query",
          },
          expect.any(HTMLDivElement)
        );
      });

      it("sets the content of the modal with the saved search element and turns off loadin", async () => {
        const ss = new ScryfallSearch();

        jest.spyOn(ss.savedSearchModal, "setContent");
        jest.spyOn(ss.savedSearchModal, "setLoading");

        await ss.savedSearchModal.triggerOnOpen();

        expect(ss.savedSearchModal.setContent).toBeCalledTimes(1);
        expect(ss.savedSearchModal.setContent).toBeCalledWith(
          ss.savedSearchElement
        );
        expect(ss.savedSearchModal.setLoading).toBeCalledTimes(1);
        expect(ss.savedSearchModal.setLoading).toBeCalledWith(false);
      });
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

      jest.spyOn(ss, "runSearch").mockResolvedValue();

      await ss.run();

      headerSearchField.value = "is:commander";
      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "a",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(0);

      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(1);
      expect(ss.runSearch).toBeCalledWith("is:commander", true);
    });

    it("does not call runSearch if no value in the header search field", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "runSearch").mockResolvedValue();

      await ss.run();

      headerSearchField.value = "";
      headerSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(0);
    });

    it("sets up event listener for inline search bar", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "runSearch").mockResolvedValue();

      await ss.run();

      ss.inlineSearchField.value = "is:commander";
      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "a",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(0);

      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(1);
      expect(ss.runSearch).toBeCalledWith("is:commander", false);
    });

    it("does not call runSearch if no value in the inline search field", async function () {
      const ss = new ScryfallSearch();

      jest.spyOn(ss, "runSearch").mockResolvedValue();

      await ss.run();

      ss.inlineSearchField.value = "";
      ss.inlineSearchField.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Enter",
        })
      );
      expect(ss.runSearch).toBeCalledTimes(0);
    });
  });

  describe("runSearch", function () {
    let ss: ScryfallSearch;
    let getDeckSpy: jest.SpyInstance;
    let searchSpy: jest.SpyInstance;

    beforeEach(function () {
      ss = new ScryfallSearch();
      ss.drawer = new Drawer();
      jest.spyOn(ss.drawer, "setLoading");
      jest.spyOn(Drawer.prototype, "open");
      ss.settings = {
        enabled: false,
        restrictToCommanderColorIdentity: false,
        restrictFunnyCards: false,
      };

      searchSpy = mocked(search as jest.Mock).mockResolvedValue([]);
      getDeckSpy = mocked(getDeck).mockResolvedValue(makeFakeDeck());
      jest.spyOn(ss, "addCards").mockImplementation();
      jest.spyOn(ss, "addWarnings").mockImplementation();
    });

    it("opens the drawer", async function () {
      await ss.runSearch("foo");

      expect(ss.drawer?.open).toBeCalledTimes(1);
    });

    it("closes the saved searches modal", async function () {
      jest.spyOn(Modal.prototype, "close");

      await ss.runSearch("foo");

      expect(ss.savedSearchModal?.close).toBeCalledTimes(1);
    });

    it("queries the api", async function () {
      await ss.runSearch("foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo");
    });

    it("adds `not:funny` to query when restrictFunnyCards setting is active", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.runSearch("foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo not:funny");
    });

    it("does not add `not:funny` to query when restrictFunnyCards setting is active but adjustQuery param is set to false", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.runSearch("foo", false);

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("foo");
    });

    it("does not add `not:funny` to query when not:funny is already present", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.runSearch("not:funny foo");

      expect(search).toBeCalledTimes(1);
      expect(search).toBeCalledWith("not:funny foo");
    });

    it("does not add `not:funny` to query when is:funny is already present", async function () {
      ss.settings!.restrictFunnyCards = true;
      await ss.runSearch("is:funny foo");

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

      await ss.runSearch("foo");

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

      await ss.runSearch("foo", false);

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

        await ss.runSearch(`${param}:W foo`);

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

      await ss.runSearch("foo");

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

      await ss.runSearch("foo");

      expect(searchSpy).toBeCalledTimes(1);
      expect(searchSpy).toBeCalledWith("foo not:funny ids:BG");
    });

    it("adds cards from the api result", async function () {
      const cards = [{}, {}];

      searchSpy.mockResolvedValue(cards);

      await ss.runSearch("foo");

      expect(ss.cardList).toBe(cards);
      expect(ss.addCards).toBeCalledTimes(1);
    });

    it("adds warnings from the api result", async function () {
      const cards = {
        warnings: ["warning"],
      };

      searchSpy.mockResolvedValue(cards);

      await ss.runSearch("foo");

      expect(ss.cardList).toBe(cards);
      expect(ss.addWarnings).toBeCalledTimes(1);
    });

    it("fetches the current deck", async function () {
      await ss.runSearch("foo");

      expect(getDeckSpy).toBeCalledTimes(1);
    });

    it("adds deck to instance", async function () {
      const fakeDeck = makeFakeDeck();

      getDeckSpy.mockResolvedValue(fakeDeck);

      await ss.runSearch("foo");

      expect(ss.deck).toBe(fakeDeck);
    });

    it("hides and then shows the drawer", async function () {
      await ss.runSearch("foo");

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

  describe("addWarnings", () => {
    let ss: ScryfallSearch;

    beforeEach(function () {
      ss = new ScryfallSearch();
    });

    it("adds warnings", () => {
      ss.cardList = {
        warnings: ["warning 1", "warning 2"],
      };

      ss.addWarnings();

      expect(ss.searchErrorsContainer.innerText).toBe("warning 1 warning 2");
    });

    it("empties warnings container between uses", () => {
      ss.cardList = {
        warnings: ["warning 1", "warning 2"],
      };

      ss.addWarnings();

      expect(ss.searchErrorsContainer.innerText).toBe("warning 1 warning 2");

      ss.cardList = {
        warnings: ["warning 3"],
      };

      ss.addWarnings();

      expect(ss.searchErrorsContainer.innerText).toBe("warning 3");

      ss.cardList = {};

      ss.addWarnings();

      expect(ss.searchErrorsContainer.innerText).toBe("");
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

  describe("getSavedSearches", () => {
    it("looks up saved searches for deck id", async () => {
      const data = [
        {
          name: "search",
          query: "query",
        },
      ];
      mocked(getDeck).mockResolvedValue(
        makeFakeDeck({ id: "deck-with-saved-searches" })
      );
      jest.spyOn(ScryfallSearch, "getData").mockResolvedValue(data);

      const ss = new ScryfallSearch();

      const savedSearches = await ss.getSavedSearches();

      expect(ScryfallSearch.getData).toBeCalledTimes(1);
      expect(ScryfallSearch.getData).toBeCalledWith(
        "saved-searches:deck-with-saved-searches"
      );
      expect(savedSearches).toBe(data);
    });

    it("provides empty array when no data is present", async () => {
      mocked(getDeck).mockResolvedValue(makeFakeDeck());
      // @ts-ignore
      jest.spyOn(ScryfallSearch, "getData").mockResolvedValue(null);

      const ss = new ScryfallSearch();

      const savedSearches = await ss.getSavedSearches();

      expect(savedSearches).toEqual([]);
    });
  });

  describe("saveSearches", () => {
    it("saves searches", async () => {
      const ss = new ScryfallSearch();

      mocked(getDeck).mockResolvedValue(
        makeFakeDeck({ id: "deck-with-saved-searches" })
      );
      ss.savedSearches = [
        {
          name: "name",
          query: "query",
        },
      ];

      jest.spyOn(ScryfallSearch, "saveData").mockResolvedValue();

      await ss.saveSearches();

      expect(ScryfallSearch.saveData).toBeCalledTimes(1);
      expect(ScryfallSearch.saveData).toBeCalledWith(
        "saved-searches:deck-with-saved-searches",
        ss.savedSearches
      );
    });
  });

  describe("deleteSearch", () => {
    let ss: ScryfallSearch;
    let searchElement: HTMLDivElement;

    beforeEach(() => {
      ss = new ScryfallSearch();
      searchElement = document.createElement("div");
      ss.savedSearchesContainer.appendChild(searchElement);
    });

    it("removes a saved search", () => {
      const search = {
        name: "Search to be removed",
        query: "remove",
      };
      ss.savedSearches = [
        {
          name: "search",
          query: "query",
        },
        search,
        {
          name: "search",
          query: "query",
        },
      ];

      jest.spyOn(ss, "saveSearches");

      ss.deleteSearch(search, searchElement);

      expect(ss.savedSearches.includes(search)).toBeFalsy();
      expect(ss.saveSearches).toBeCalledTimes(1);
      expect(ss.savedSearchesContainer.contains(searchElement)).toBeFalsy();
    });
  });
});
