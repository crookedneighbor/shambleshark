import bus from "framebus";
import CardInputModifier from "Features/deck-builder-features/card-input-modifier";
import deckParser from "Lib/deck-parser";
import { getDeck } from "Lib/scryfall";
import { ready } from "Lib/mutation";
import wait from "Lib/wait";

import { makeFakeCard, makeFakeDeck } from "Helpers/fake";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");
jest.mock("Lib/mutation");
jest.mock("framebus");

describe("Card Input Modifier", () => {
  let cim: CardInputModifier;

  let getDeckSpy: jest.SpyInstance;
  let flattenEntriesSpy: jest.SpyInstance;
  let busOnSpy: jest.SpyInstance;

  beforeEach(() => {
    cim = new CardInputModifier();
    getDeckSpy = mocked(getDeck).mockResolvedValue(makeFakeDeck());
    flattenEntriesSpy = jest
      .spyOn(deckParser, "flattenEntries")
      .mockReturnValue([]);
    busOnSpy = jest.spyOn(bus, "on").mockImplementation();
  });

  it("sets tooltip image with img from image cache", () => {
    const el = document.createElement("div");
    el.setAttribute("data-entry", "id");

    cim.imageCache.id = "https://example.com/image.png";
    jest.spyOn(cim.tooltip, "setImage").mockImplementation();

    cim.tooltip.triggerOnMouseover(el);

    expect(cim.tooltip.setImage).toBeCalledTimes(1);
    expect(cim.tooltip.setImage).toBeCalledWith(
      "https://example.com/image.png"
    );
  });

  it("sets tooltip image to empty string if id is not in image cache", () => {
    const el = document.createElement("div");
    el.setAttribute("data-entry", "id");

    jest.spyOn(cim.tooltip, "setImage").mockImplementation();

    cim.tooltip.triggerOnMouseover(el);

    expect(cim.tooltip.setImage).toBeCalledWith("");
  });

  describe("run", () => {
    let fakeEntry: HTMLElement;
    let readySpy: jest.SpyInstance;

    beforeEach(() => {
      readySpy = mocked(ready);

      fakeEntry = document.createElement("div");
      fakeEntry.setAttribute("data-entry", "entry-id");
      fakeEntry.innerHTML = `
        <textarea class="deckbuilder-entry-input"></textarea>
      `;
    });

    it("waits for new deckbuilder entries to attach listeners", async () => {
      const secondFakeEntry = document.createElement("div");
      readySpy.mockImplementation((name, fn) => {
        if (name === ".deckbuilder-entry") {
          fn(fakeEntry);
          fn(secondFakeEntry);
        }
      });
      jest.spyOn(cim, "attachListenersToEntry").mockImplementation();

      await cim.run();

      expect(ready).toBeCalledWith(".deckbuilder-entry", expect.any(Function));

      await wait();

      expect(cim.attachListenersToEntry).toBeCalledTimes(2);
      expect(cim.attachListenersToEntry).toBeCalledWith(fakeEntry);
      expect(cim.attachListenersToEntry).toBeCalledWith(secondFakeEntry);
    });

    it("listens for card update events", async () => {
      await cim.run();

      expect(bus.on).toBeCalledTimes(5);
      expect(bus.on).toBeCalledWith(
        "CALLED_DESTROYENTRY",
        expect.any(Function)
      );
      expect(bus.on).toBeCalledWith("CALLED_CREATEENTRY", expect.any(Function));
      expect(bus.on).toBeCalledWith("CALLED_UPDATEENTRY", expect.any(Function));
      expect(bus.on).toBeCalledWith(
        "CALLED_REPLACEENTRY",
        expect.any(Function)
      );
      expect(bus.on).toBeCalledWith("CALLED_CLEANUP", expect.any(Function));
    });

    it("removes card id from image cache when destroy entry event fires", async () => {
      const payload = {
        payload: "foo",
      };
      cim.imageCache.foo = "foo";

      type ReplyType = (res: Record<string, string>) => void;
      busOnSpy.mockImplementation((event: string, cb: ReplyType) => {
        if (event === "CALLED_DESTROYENTRY") {
          cb(payload);
        }
      });

      await cim.run();

      expect(cim.imageCache.foo).toBeFalsy();
    });

    it.each(["CLEANUP", "UPDATEENTRY", "REPLACEENTRY", "CREATEENTRY"])(
      "refreshes cache when CALLED_%s event is called",
      async (eventName) => {
        jest.spyOn(cim, "refreshCache").mockResolvedValue(undefined);

        busOnSpy.mockImplementation((event, cb) => {
          if (event === `CALLED_${eventName}`) {
            cb();
          }
        });

        await cim.run();
        await wait();

        expect(cim.refreshCache).toBeCalledTimes(1);
      }
    );
  });

  describe("attachListenersToEntry", () => {
    let entry: HTMLElement;

    beforeEach(() => {
      entry = document.createElement("div");
      entry.setAttribute("data-entry", "id");
      jest.spyOn(cim, "lookupImage").mockResolvedValue("");
      jest.spyOn(cim.tooltip, "addElement").mockImplementation();
    });

    it("noops if no id is available on entry", () => {
      entry.removeAttribute("data-entry");

      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(0);
      expect(cim.lookupImage).not.toBeCalled();
      expect(cim.tooltip.addElement).not.toBeCalled();
    });

    it("noops if listeners already has the entry", () => {
      cim.listeners.id = entry;

      expect(Object.keys(cim.listeners).length).toBe(1);

      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(1);
      expect(cim.lookupImage).not.toBeCalled();
      expect(cim.tooltip.addElement).not.toBeCalled();
    });

    it("adds the entry to the listeners", () => {
      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(1);
      expect(cim.listeners.id).toBe(entry);
    });

    it("looks up the image", () => {
      cim.attachListenersToEntry(entry);

      expect(cim.lookupImage).toBeCalledTimes(1);
      expect(cim.lookupImage).toBeCalledWith("id");
    });

    it("adds the entry to tooltip", () => {
      cim.attachListenersToEntry(entry);

      expect(cim.tooltip.addElement).toBeCalledTimes(1);
      expect(cim.tooltip.addElement).toBeCalledWith(entry);
    });
  });

  describe("getEntries", () => {
    it("flattens entries from getDeck call", async () => {
      const deck = {};
      const mockedEntries = [
        {
          id: "1",
        },
      ];
      getDeckSpy.mockResolvedValue(deck);
      flattenEntriesSpy.mockReturnValue(mockedEntries);

      const entries = await cim.getEntries();

      expect(entries).toBe(mockedEntries);
      expect(getDeck).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledWith(deck, {
        idToGroupBy: "id",
      });
    });

    it("caches the lookup", async () => {
      await cim.getEntries();
      await cim.getEntries();
      await cim.getEntries();

      expect(getDeck).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledTimes(1);
    });

    it("can bust the cache", async () => {
      await cim.getEntries();
      await cim.getEntries(true);
      await cim.getEntries(true);

      expect(getDeck).toBeCalledTimes(3);
      expect(deckParser.flattenEntries).toBeCalledTimes(3);
    });
  });

  describe("lookupImage", () => {
    it("resolves with image url if it is in the cache", async () => {
      cim.imageCache.foo = "https://example.com/foo";

      const url = await cim.lookupImage("foo");

      expect(getDeck).toBeCalledTimes(0);
      expect(url).toBe("https://example.com/foo");
    });

    it("looks up deck to find image", async () => {
      flattenEntriesSpy.mockReturnValue([
        makeFakeCard({
          id: "foo",
          cardDigest: {
            image: "https://example.com/foo-in-card-digest",
          },
        }),
      ]);

      const url = await cim.lookupImage("foo");

      expect(getDeck).toBeCalledTimes(1);
      expect(url).toBe("https://example.com/foo-in-card-digest");
      expect(cim.imageCache.foo).toBe("https://example.com/foo-in-card-digest");
    });

    it("returns nothing if entry with specific id cannot be found", async () => {
      flattenEntriesSpy.mockReturnValue([
        makeFakeCard({
          id: "not-foo",
          cardDigest: {
            image: "https://example.com/not-foo-in-card-digest",
          },
        }),
      ]);

      const url = await cim.lookupImage("foo");

      expect(getDeck).toBeCalledTimes(1);
      expect(url).toBeFalsy();
    });

    it("returns nothing if entry with specific id does not have an image", async () => {
      flattenEntriesSpy.mockReturnValue([
        {
          id: "foo",
        },
      ]);

      const url = await cim.lookupImage("foo");

      expect(getDeck).toBeCalledTimes(1);
      expect(url).toBeFalsy();
    });

    it("can bust the cache to re-lookup card image", async () => {
      cim.imageCache.foo = "https://example.com/cached-foo";
      flattenEntriesSpy.mockReturnValue([
        makeFakeCard({
          id: "foo",
          cardDigest: {
            image: "https://example.com/foo-in-card-digest",
          },
        }),
      ]);

      const url = await cim.lookupImage("foo", true);

      expect(getDeck).toBeCalledTimes(1);
      expect(url).toBe("https://example.com/foo-in-card-digest");
      expect(cim.imageCache.foo).toBe("https://example.com/foo-in-card-digest");
    });
  });

  describe("refreshCache", () => {
    it("resets the entry cache after 1 second", async () => {
      jest.spyOn(cim, "getEntries").mockResolvedValue([
        makeFakeCard({
          id: "foo",
          cardDigest: {
            image: "https://example.com/new-foo",
          },
        }),
        makeFakeCard({
          id: "bar",
          cardDigest: {
            image: "https://example.com/bar",
          },
        }),
        makeFakeCard({
          id: "baz",
          cardDigest: false,
        }),
      ]);
      cim.imageCache.foo = "https://example.com/cached-foo";

      jest.useFakeTimers();

      const refresh = cim.refreshCache();

      expect(cim.getEntries).toBeCalledTimes(0);

      // this is in a promise.resolve.then to not 'lock' on the await
      // https://stackoverflow.com/a/51132058/2601552
      await Promise.resolve().then(() => jest.advanceTimersByTime(999));

      expect(cim.getEntries).toBeCalledTimes(0);

      await Promise.resolve().then(() => jest.advanceTimersByTime(2));

      expect(cim.getEntries).toBeCalledTimes(1);

      // let the entries finish assigning the new cache
      await refresh;

      expect(cim.imageCache.foo).toBe("https://example.com/new-foo");
      expect(cim.imageCache.bar).toBe("https://example.com/bar");
      expect(cim.imageCache.baz).toBeFalsy();
    });
  });
});
