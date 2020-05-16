import TokenList, { Token } from "Features/deck-view-features/token-list";
import mutation from "Lib/mutation";
import { getCollection } from "Lib/scryfall";
import wait from "Lib/wait";
import SpyInstance = jest.SpyInstance;
import Modal from "Lib/ui-elements/modal";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");

describe("Token List", function () {
  let tl: TokenList;

  beforeEach(function () {
    tl = new TokenList();
  });

  describe("run", function () {
    let elements: HTMLElement[], container: HTMLDivElement;

    let readySpy: SpyInstance;
    let getCardElementsSpy: SpyInstance;
    let generateTokenCollectionSpy: SpyInstance;

    beforeEach(function () {
      container = document.createElement("div") as HTMLDivElement;
      readySpy = jest
        .spyOn(mutation, "ready")
        .mockImplementation((selector, cb) => {
          cb(container);
        });
      elements = [];

      jest.spyOn(tl, "createUI").mockImplementation();
      getCardElementsSpy = jest
        .spyOn(tl, "getCardElements")
        .mockImplementation(() => {
          tl.elements = elements as HTMLLinkElement[];
        });
      generateTokenCollectionSpy = jest
        .spyOn(tl, "generateTokenCollection")
        .mockResolvedValue([]);
      jest.spyOn(tl, "addToUI").mockImplementation();
    });

    it("waits for shambleshark sidebar to be on the dom", async function () {
      readySpy.mockImplementation();

      await tl.run();

      expect(readySpy).toBeCalledTimes(1);
      expect(readySpy).toBeCalledWith(
        "#shambleshark-deck-display-sidebar-toolbox",
        expect.any(Function)
      );

      expect(tl.createUI).not.toBeCalled();

      readySpy.mock.calls[0][1](container);

      expect(tl.createUI).toBeCalled();
    });

    it("creates card elements", async function () {
      await tl.run();

      await wait();

      expect(getCardElementsSpy).toBeCalledTimes(1);
    });

    it("prefetches tokens", async function () {
      await tl.run();

      await wait();

      expect(generateTokenCollectionSpy).toBeCalledTimes(1);
    });

    it("does not prefetch tokens if there are more than 150 elements to look up", async function () {
      let i = 0;
      while (i < 151) {
        elements.push(document.createElement("div"));
        i++;
      }
      await tl.run();

      await wait();

      expect(generateTokenCollectionSpy).toBeCalledTimes(0);
    });
  });

  describe("createUI", function () {
    let container: HTMLDivElement;

    beforeEach(function () {
      container = document.createElement("div");
    });

    it("adds token list button to UI", function () {
      tl.createUI(container);

      expect(container.querySelector("button.button-n")).toBeTruthy();
    });

    it("adds modal", function () {
      tl.createUI(container);

      expect(tl.modal).toBeTruthy();
    });

    it("opens the modal when token list button is clicked", function () {
      tl.createUI(container);

      const openSpy = jest
        .spyOn(tl.modal as Modal, "open")
        .mockImplementation();

      const btn = container.querySelector(
        "button.button-n"
      ) as HTMLButtonElement;

      btn.click();

      expect(openSpy).toBeCalledTimes(1);
    });

    it("adds tokens to modal when it opens", async function () {
      const tokens: Token[] = [];

      tl.createUI(container);

      jest.spyOn(tl, "generateTokenCollection").mockResolvedValue(tokens);
      jest.spyOn(tl, "addToUI").mockImplementation();
      jest.spyOn(tl.modal as Modal, "setLoading").mockImplementation();

      await tl.modal?.triggerOnOpen();

      expect(tl.generateTokenCollection).toBeCalledTimes(1);
      expect(tl.addToUI).toBeCalledTimes(1);
      expect(tl.addToUI).toBeCalledWith(tokens);
      expect(tl.modal?.setLoading).toBeCalledTimes(1);
      expect(tl.modal?.setLoading).toBeCalledWith(false);
    });

    it("refocuses button when it closes", function () {
      tl.createUI(container);

      const btn = container.querySelector(
        "button.button-n"
      ) as HTMLButtonElement;
      jest.spyOn(btn, "focus").mockImplementation();

      tl.modal?.triggerOnClose();

      expect(btn.focus).toBeCalledTimes(1);
    });
  });

  describe("addToUI", function () {
    let tokens: Token[];

    let setContentSpy: SpyInstance;

    beforeEach(function () {
      const container = document.createElement("div");
      tokens = [
        {
          name: "Token 1",
          scryfall_uri: "https://scryfall.com/token-1",
          getImage: jest
            .fn()
            .mockReturnValue("https://img.scryfall.com/token-1"),
        },
        {
          name: "Token 2",
          scryfall_uri: "https://scryfall.com/token-2",
          getImage: jest
            .fn()
            .mockReturnValue("https://img.scryfall.com/token-2"),
        },
      ];
      tl.createUI(container);
      setContentSpy = jest
        .spyOn(tl.modal as Modal, "setContent")
        .mockImplementation();
    });

    it("adds a message if no tokens were found", function () {
      tokens = [];

      tl.addToUI(tokens);

      const el = setContentSpy.mock.calls[0][0];

      expect(el.querySelector("p").innerHTML).toBe("No tokens detected.");
    });

    it("adds tokens to modal", function () {
      tl.addToUI(tokens);

      const el = setContentSpy.mock.calls[0][0];
      const tokenEls = el.querySelectorAll("a");

      expect(tokenEls.length).toBe(2);
      expect(tokenEls[0].href).toBe("https://scryfall.com/token-1");
      expect(tokenEls[0].querySelector("img").src).toBe(
        "https://img.scryfall.com/token-1"
      );
      expect(tokenEls[0].querySelector("img").alt).toBe("Token 1");
      expect(tokenEls[1].href).toBe("https://scryfall.com/token-2");
      expect(tokenEls[1].querySelector("img").src).toBe(
        "https://img.scryfall.com/token-2"
      );
      expect(tokenEls[1].querySelector("img").alt).toBe("Token 2");
    });

    it("adds tokens to modal only once", function () {
      tl.addToUI(tokens);
      tl.addToUI(tokens);
      tl.addToUI(tokens);
      tl.addToUI(tokens);

      expect(setContentSpy).toBeCalledTimes(1);
    });
  });

  describe("parseSetAndCollectorNumber", function () {
    it("parses a scryfall url into a set and collector number", function () {
      expect(
        tl.parseSetAndCollectorNumber("https://scryfall.com/card/dom/102")
      ).toEqual({
        set: "dom",
        collector_number: "102",
      });
    });
  });

  describe("flattenTokenCollection", function () {
    let tokenCollection: Token[][];

    beforeEach(function () {
      tokenCollection = [
        [],
        [
          {
            name: "Token 1",
            oracle_id: "id-1",
          },
          {
            name: "Token 2",
            oracle_id: "id-2",
          },
        ],
        [],
        [
          {
            name: "Token 3",
            oracle_id: "id-3",
          },
        ],
      ] as Token[][];
    });

    it("flattens multidimensional array to single array", function () {
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        {
          name: "Token 1",
          oracle_id: "id-1",
        },
        {
          name: "Token 2",
          oracle_id: "id-2",
        },
        {
          name: "Token 3",
          oracle_id: "id-3",
        },
      ]);
    });

    it("alphebetizes by name", function () {
      tokenCollection[1].push({
        oracle_id: "alpha-token-id",
        name: "Alpha Token",
      } as Token);
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        {
          name: "Alpha Token",
          oracle_id: "alpha-token-id",
        },
        {
          name: "Token 1",
          oracle_id: "id-1",
        },
        {
          name: "Token 2",
          oracle_id: "id-2",
        },
        {
          name: "Token 3",
          oracle_id: "id-3",
        },
      ]);
    });

    it("removes duplicate ids", function () {
      tokenCollection[2].push({
        oracle_id: "id-1",
        name: "Token 1",
      } as Token);
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        {
          name: "Token 1",
          oracle_id: "id-1",
        },
        {
          name: "Token 2",
          oracle_id: "id-2",
        },
        {
          name: "Token 3",
          oracle_id: "id-3",
        },
      ]);
    });
  });

  describe("lookupTokens", function () {
    let getCollectionSpy: SpyInstance;

    beforeEach(function () {
      getCollectionSpy = mocked(getCollection).mockResolvedValue([]);
    });

    it("calls getCollection", async function () {
      await tl.lookupTokens([
        {
          set: "dom",
          collector_number: "102",
        },
      ]);

      expect(getCollectionSpy).toBeCalledTimes(1);
      expect(getCollectionSpy).toBeCalledWith([
        {
          set: "dom",
          collector_number: "102",
        },
      ]);
    });

    it("resolves with array of the results of each card's getTokens call", async function () {
      const fakeToken1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const fakeToken2 = [{ id: 4 }];
      const spy1 = jest.fn().mockResolvedValue(fakeToken1);
      const spy2 = jest.fn().mockResolvedValue(fakeToken2);
      const fakeResults = [
        {
          getTokens: spy1,
        },
        {
          getTokens: spy2,
        },
      ];
      const fakeEntry = {
        set: "foo",
        collector_number: "1",
      };
      const entries = [];
      let i = 0;
      while (i < 200) {
        entries.push(fakeEntry);
        i++;
      }

      getCollectionSpy.mockResolvedValue(fakeResults);

      const tokens = await tl.lookupTokens(entries);

      expect(spy1).toBeCalledTimes(1);
      expect(spy2).toBeCalledTimes(1);

      expect(tokens.length).toBe(2);
      expect(tokens[0][0].id).toBe(1);
      expect(tokens[0][1].id).toBe(2);
      expect(tokens[0][2].id).toBe(3);
      expect(tokens[1][0].id).toBe(4);
    });
  });

  describe("getCardElements", function () {
    let elements: Partial<NodeListOf<HTMLLinkElement>>;

    beforeEach(function () {
      elements = {
        0: {
          href: "https://scryfall.com/card/dom/102",
        } as HTMLLinkElement,
        1: {
          href: "https://scryfall.com/card/kld/184",
        } as HTMLLinkElement,
      };
      mocked(document).querySelectorAll.mockReturnValue(
        elements as NodeListOf<HTMLLinkElement>
      );
    });

    it("looks for elements in deck entry view", function () {
      tl.getCardElements();

      expect(mocked(document).querySelectorAll).toBeCalledTimes(1);
      expect(mocked(document).querySelectorAll).toBeCalledWith(
        ".deck-list-entry .deck-list-entry-name a"
      );

      expect(tl.elements).toStrictEqual(elements);
    });

    it("uses visual deck mode to find tokens when deck list entry comes up empty", async function () {
      mocked(document).querySelectorAll.mockReturnValueOnce(
        {} as NodeListOf<HTMLLinkElement>
      );
      mocked(document).querySelectorAll.mockReturnValueOnce(
        elements as NodeListOf<HTMLLinkElement>
      );

      await tl.getCardElements();

      expect(mocked(document).querySelectorAll).toBeCalledTimes(2);
      expect(mocked(document).querySelectorAll).toBeCalledWith(
        ".deck-list-entry .deck-list-entry-name a"
      );
      expect(mocked(document).querySelectorAll).toBeCalledWith(
        "a.card-grid-item-card"
      );
    });
  });

  describe("generateTokenCollection", function () {
    let lookupTokensSpy: SpyInstance;
    let flattenTokenCollectionSpy: SpyInstance;

    beforeEach(function () {
      lookupTokensSpy = jest.spyOn(tl, "lookupTokens").mockResolvedValue([]);
      flattenTokenCollectionSpy = jest
        .spyOn(tl, "flattenTokenCollection")
        .mockImplementation();
      tl.elements = [
        {
          href: "https://scryfall.com/card/dom/102",
        },
        {
          href: "https://scryfall.com/card/kld/184",
        },
      ] as HTMLLinkElement[];
    });

    it("looks up tokens with elements", async function () {
      const tokenCollection = [[{ id: "token" }]];
      const result: Token[] = [];

      lookupTokensSpy.mockResolvedValue(tokenCollection);
      flattenTokenCollectionSpy.mockReturnValue([]);

      const tokens = await tl.generateTokenCollection();

      expect(tl.lookupTokens).toBeCalledTimes(1);
      expect(tl.lookupTokens).toBeCalledWith([
        {
          set: "dom",
          collector_number: "102",
        },
        {
          set: "kld",
          collector_number: "184",
        },
      ]);
      expect(tl.flattenTokenCollection).toBeCalledTimes(1);
      expect(tl.flattenTokenCollection).toBeCalledWith(tokenCollection);

      expect(tokens).toBe(result);
    });

    it("noops if no elements available", async function () {
      tl.elements = [];
      const tokens = await tl.generateTokenCollection();

      expect(tl.lookupTokens).not.toBeCalled();
      expect(tl.flattenTokenCollection).not.toBeCalled();

      expect(tokens).toEqual([]);
    });
  });
});
