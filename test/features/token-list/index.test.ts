import TokenList from "Features/deck-view-features/token-list";
import { ready } from "Lib/mutation";
import { getCollection } from "Lib/scryfall";
import wait from "Lib/wait";
import Modal from "Lib/ui-elements/modal";
import type { Card } from "scryfall-client/dist/types/model";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");
jest.mock("Lib/mutation");

// TODO mock modal class
describe("Token List", () => {
  let tl: TokenList;

  beforeEach(() => {
    tl = new TokenList();
  });

  describe("run", () => {
    let elements: HTMLElement[], container: HTMLDivElement;

    let readySpy: jest.SpyInstance;
    let getCardElementsSpy: jest.SpyInstance;
    let generateTokenCollectionSpy: jest.SpyInstance;

    beforeEach(() => {
      container = document.createElement("div") as HTMLDivElement;
      readySpy = mocked(ready).mockImplementation((selector, cb) => {
        cb(container);
      });
      elements = [];

      jest.spyOn(tl, "createUI").mockImplementation();
      getCardElementsSpy = jest
        .spyOn(tl, "getCardElements")
        .mockImplementation(() => {
          tl.elements = elements as HTMLAnchorElement[];
        });
      generateTokenCollectionSpy = jest
        .spyOn(tl, "generateTokenCollection")
        .mockResolvedValue([]);
      jest.spyOn(tl, "addToUI").mockImplementation();
    });

    it("waits for shambleshark sidebar to be on the dom", async () => {
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

    it("creates card elements", async () => {
      await tl.run();

      await wait();

      expect(getCardElementsSpy).toBeCalledTimes(1);
    });

    it("prefetches tokens", async () => {
      await tl.run();

      await wait();

      expect(generateTokenCollectionSpy).toBeCalledTimes(1);
    });

    it("does not prefetch tokens if there are more than 150 elements to look up", async () => {
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

  describe("createUI", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement("div");
    });

    it("adds token list button to UI", () => {
      tl.createUI(container);

      expect(container.querySelector("button.button-n")).toBeTruthy();
    });

    it("adds modal", () => {
      tl.createUI(container);

      expect(tl.modal).toBeTruthy();
    });

    it("opens the modal when token list button is clicked", () => {
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

    it("adds tokens to modal when it opens", async () => {
      const tokens: Card[] = [];

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

    it("refocuses button when it closes", () => {
      tl.createUI(container);

      const btn = container.querySelector(
        "button.button-n"
      ) as HTMLButtonElement;
      jest.spyOn(btn, "focus").mockImplementation();

      tl.modal?.triggerOnClose();

      expect(btn.focus).toBeCalledTimes(1);
    });
  });

  describe("addToUI", () => {
    let tokens: Card[];

    let setContentSpy: jest.SpyInstance;

    beforeEach(() => {
      const container = document.createElement("div");
      tokens = [
        ({
          name: "Token 1",
          scryfall_uri: "https://scryfall.com/token-1",
          oracle_id: "token-1",
          getImage: jest
            .fn()
            .mockReturnValue("https://img.scryfall.com/token-1"),
        } as unknown) as Card,
        ({
          name: "Token 2",
          scryfall_uri: "https://scryfall.com/token-2",
          oracle_id: "token-2",
          getImage: jest
            .fn()
            .mockReturnValue("https://img.scryfall.com/token-2"),
        } as unknown) as Card,
      ];
      tl.createUI(container);
      setContentSpy = jest
        .spyOn(tl.modal as Modal, "setContent")
        .mockImplementation();
    });

    it("adds a message if no tokens were found", () => {
      tokens = [];

      tl.addToUI(tokens);

      const el = setContentSpy.mock.calls[0][0];

      expect(el.innerHTML).toBe("No tokens detected.");
    });

    it("adds tokens to modal", () => {
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

    it("adds tokens to modal only once", () => {
      tl.addToUI(tokens);
      tl.addToUI(tokens);
      tl.addToUI(tokens);
      tl.addToUI(tokens);

      expect(setContentSpy).toBeCalledTimes(1);
    });
  });

  describe("parseSetAndCollectorNumber", () => {
    it("parses a scryfall url into a set and collector number", () => {
      expect(
        tl.parseSetAndCollectorNumber("https://scryfall.com/card/dom/102")
      ).toEqual({
        set: "dom",
        collector_number: "102",
      });
    });
  });

  describe("flattenTokenCollection", () => {
    let tokenCollection: Card[][];

    beforeEach(() => {
      tokenCollection = [
        [],
        [
          ({
            name: "Token 1",
            oracle_id: "id-1",
            scryfall_uri: "https://scryfall.com/code/1",
            getImage: jest.fn(),
          } as unknown) as Card,
          ({
            name: "Token 2",
            oracle_id: "id-2",
            scryfall_uri: "https://scryfall.com/code/2",
            getImage: jest.fn(),
          } as unknown) as Card,
        ],
        [],
        [
          ({
            name: "Token 3",
            oracle_id: "id-3",
            scryfall_uri: "https://scryfall.com/code/3",
            getImage: jest.fn(),
          } as unknown) as Card,
        ],
      ];
    });

    it("flattens multidimensional array to single array", () => {
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        expect.objectContaining({
          name: "Token 1",
          oracle_id: "id-1",
        }),
        expect.objectContaining({
          name: "Token 2",
          oracle_id: "id-2",
        }),
        expect.objectContaining({
          name: "Token 3",
          oracle_id: "id-3",
        }),
      ]);
    });

    it("alphebetizes by name", () => {
      tokenCollection[1].push(({
        oracle_id: "alpha-token-id",
        name: "Alpha Token",
        scryfall_uri: "https://scryfall.com/code/2",
        getImage: jest.fn(),
      } as unknown) as Card);
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        expect.objectContaining({
          name: "Alpha Token",
          oracle_id: "alpha-token-id",
        }),
        expect.objectContaining({
          name: "Token 1",
          oracle_id: "id-1",
        }),
        expect.objectContaining({
          name: "Token 2",
          oracle_id: "id-2",
        }),
        expect.objectContaining({
          name: "Token 3",
          oracle_id: "id-3",
        }),
      ]);
    });

    it("removes duplicate ids", () => {
      tokenCollection[2].push(({
        oracle_id: "id-1",
        name: "Token 1",
        scryfall_uri: "https://scryfall.com/code/1",
        getImage: jest.fn(),
      } as unknown) as Card);
      const tokens = tl.flattenTokenCollection(tokenCollection);

      expect(tokens).toEqual([
        expect.objectContaining({
          name: "Token 1",
          oracle_id: "id-1",
        }),
        expect.objectContaining({
          name: "Token 2",
          oracle_id: "id-2",
        }),
        expect.objectContaining({
          name: "Token 3",
          oracle_id: "id-3",
        }),
      ]);
    });
  });

  describe("lookupTokens", () => {
    let getCollectionSpy: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getCollectionSpy = mocked(getCollection).mockResolvedValue([] as any);
    });

    it("calls getCollection", async () => {
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

    it("resolves with array of the results of each card's getTokens call", async () => {
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

  describe("getCardElements", () => {
    let parentElement: HTMLDivElement;

    beforeEach(() => {
      jest.spyOn(document, "querySelectorAll");

      const makeEl = (url: string) => {
        const container = document.createElement("div");
        container.className = "deck-list-entry-name";

        const link = document.createElement("a");
        link.href = url;

        container.appendChild(link);

        return container;
      };
      parentElement = document.createElement("div");
      parentElement.className = "deck-list-entry";
      parentElement.appendChild(makeEl("https://scryfall.com/card/dom/102"));
      parentElement.appendChild(makeEl("https://scryfall.com/card/kld/184"));

      document.body.appendChild(parentElement);
    });

    it("looks for elements in deck entry view", () => {
      tl.getCardElements();

      expect(document.querySelectorAll).toBeCalledTimes(1);
      expect(document.querySelectorAll).toBeCalledWith(
        ".deck-list-entry .deck-list-entry-name a"
      );

      expect(tl.elements!.length).toBe(2);
      expect(tl.elements![0].href).toBe("https://scryfall.com/card/dom/102");
      expect(tl.elements![1].href).toBe("https://scryfall.com/card/kld/184");
    });

    it("uses visual deck mode to find tokens when deck list entry comes up empty", async () => {
      parentElement.className = "";
      parentElement.querySelectorAll("a").forEach((el) => {
        el.className = "card-grid-item-card";
      });

      await tl.getCardElements();

      expect(document.querySelectorAll).toBeCalledTimes(2);
      expect(document.querySelectorAll).toBeCalledWith(
        ".deck-list-entry .deck-list-entry-name a"
      );
      expect(document.querySelectorAll).toBeCalledWith("a.card-grid-item-card");

      expect(tl.elements!.length).toBe(2);
      expect(tl.elements![0].href).toBe("https://scryfall.com/card/dom/102");
      expect(tl.elements![1].href).toBe("https://scryfall.com/card/kld/184");
    });

    it("sets elements to empty array when none can be found", async () => {
      parentElement.className = "";

      await tl.getCardElements();

      expect(document.querySelectorAll).toBeCalledTimes(2);
      expect(document.querySelectorAll).toBeCalledWith(
        ".deck-list-entry .deck-list-entry-name a"
      );
      expect(document.querySelectorAll).toBeCalledWith("a.card-grid-item-card");

      expect(tl.elements!.length).toBe(0);
    });
  });

  describe("generateTokenCollection", () => {
    let lookupTokensSpy: jest.SpyInstance;
    let flattenTokenCollectionSpy: jest.SpyInstance;

    beforeEach(() => {
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
      ] as HTMLAnchorElement[];
    });

    it("looks up tokens with elements", async () => {
      const tokenCollection = [[{ id: "token" }]];
      const result: Card[] = [];

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

      expect(tokens).toEqual(result);
    });

    it("noops if no elements available", async () => {
      tl.elements = [];
      const tokens = await tl.generateTokenCollection();

      expect(tl.lookupTokens).not.toBeCalled();
      expect(tl.flattenTokenCollection).not.toBeCalled();

      expect(tokens).toEqual([]);
    });
  });
});
