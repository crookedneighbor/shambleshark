import bus from "framebus";
import CardInputModifier from "Features/deck-builder-features/card-input-modifier";
import deckParser from "Lib/deck-parser";
import scryfall from "Lib/scryfall";
import mutation from "Lib/mutation";
import wait from "Lib/wait";

describe("Card Input Modifier", function () {
  let cim;

  beforeEach(function () {
    cim = new CardInputModifier();
    jest.spyOn(scryfall, "getDeck").mockResolvedValue({});
    jest.spyOn(deckParser, "flattenEntries").mockReturnValue([]);
    jest.spyOn(bus, "on").mockImplementation();
  });

  it("sets tooltip image with img from image cache", function () {
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

  it("does not set tooltip image if id is not in image cache", function () {
    const el = document.createElement("div");
    el.setAttribute("data-entry", "id");

    jest.spyOn(cim.tooltip, "setImage").mockImplementation();

    cim.tooltip.triggerOnMouseover(el);

    expect(cim.tooltip.setImage).not.toBeCalled();
  });

  describe("run", function () {
    let fakeEntry;

    beforeEach(function () {
      jest.spyOn(mutation, "ready").mockImplementation();

      fakeEntry = document.createElement("div");
      fakeEntry.setAttribute("data-entry", "entry-id");
      fakeEntry.innerHTML = `
        <textarea class="deckbuilder-entry-input"></textarea>
      `;
    });

    it("waits for new deckbuilder entries to attach listeners", async function () {
      const secondFakeEntry = document.createElement("div");
      mutation.ready.mockImplementation(function (name, cb) {
        if (name === ".deckbuilder-entry") {
          cb(fakeEntry);
          cb(secondFakeEntry);
        }
      });
      jest.spyOn(cim, "attachListenersToEntry").mockImplementation();

      await cim.run();

      expect(mutation.ready).toBeCalledWith(
        ".deckbuilder-entry",
        expect.any(Function)
      );

      await wait();

      expect(cim.attachListenersToEntry).toBeCalledTimes(2);
      expect(cim.attachListenersToEntry).toBeCalledWith(fakeEntry);
      expect(cim.attachListenersToEntry).toBeCalledWith(secondFakeEntry);
    });

    it("listens for card update events", async function () {
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

    it("removes card id from image cache when destroy entry event fires", async function () {
      const payload = {
        payload: "foo",
      };
      cim.imageCache.foo = "foo";
      bus.on.mockImplementation((event, cb) => {
        if (event === "CALLED_DESTROYENTRY") {
          cb(payload);
        }
      });

      await cim.run();

      expect(cim.imageCache.foo).toBeFalsy();
    });

    it.each(["CLEANUP", "UPDATEENTRY", "REPLACEENTRY", "CREATEENTRY"])(
      "refreshes cache when CALLED_%s event is called",
      async function (eventName) {
        jest.spyOn(cim, "refreshCache").mockResolvedValue();

        bus.on.mockImplementation((event, cb) => {
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

  describe("attachListenersToEntry", function () {
    let entry;

    beforeEach(function () {
      entry = document.createElement("div");
      entry.setAttribute("data-entry", "id");
      jest.spyOn(cim, "lookupImage").mockImplementation();
      jest.spyOn(cim.tooltip, "addElement").mockImplementation();
    });

    it("noops if no id is available on entry", function () {
      entry.removeAttribute("data-entry");

      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(0);
      expect(cim.lookupImage).not.toBeCalled();
      expect(cim.tooltip.addElement).not.toBeCalled();
    });

    it("noops if listeners already has the entry", function () {
      cim.listeners.id = entry;

      expect(Object.keys(cim.listeners).length).toBe(1);

      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(1);
      expect(cim.lookupImage).not.toBeCalled();
      expect(cim.tooltip.addElement).not.toBeCalled();
    });

    it("adds the entry to the listeners", function () {
      cim.attachListenersToEntry(entry);

      expect(Object.keys(cim.listeners).length).toBe(1);
      expect(cim.listeners.id).toBe(entry);
    });

    it("looks up the image", function () {
      cim.attachListenersToEntry(entry);

      expect(cim.lookupImage).toBeCalledTimes(1);
      expect(cim.lookupImage).toBeCalledWith("id");
    });

    it("adds the entry to tooltip", function () {
      cim.attachListenersToEntry(entry);

      expect(cim.tooltip.addElement).toBeCalledTimes(1);
      expect(cim.tooltip.addElement).toBeCalledWith(entry);
    });
  });

  describe("getEntries", function () {
    it("flattens entries from getDeck call", async function () {
      const deck = {};
      const mockedEntries = [
        {
          id: "1",
        },
      ];
      scryfall.getDeck.mockResolvedValue(deck);
      deckParser.flattenEntries.mockReturnValue(mockedEntries);

      const entries = await cim.getEntries();

      expect(entries).toBe(mockedEntries);
      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledWith(deck, {
        idToGroupBy: "id",
      });
    });

    it("caches the lookup", async function () {
      await cim.getEntries();
      await cim.getEntries();
      await cim.getEntries();

      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(deckParser.flattenEntries).toBeCalledTimes(1);
    });

    it("can bust the cache", async function () {
      await cim.getEntries();
      await cim.getEntries(true);
      await cim.getEntries(true);

      expect(scryfall.getDeck).toBeCalledTimes(3);
      expect(deckParser.flattenEntries).toBeCalledTimes(3);
    });
  });

  describe("lookupImage", function () {
    it("resolves with image url if it is in the cache", async function () {
      cim.imageCache.foo = "https://example.com/foo";

      const url = await cim.lookupImage("foo");

      expect(scryfall.getDeck).toBeCalledTimes(0);
      expect(url).toBe("https://example.com/foo");
    });

    it("looks up deck to find image", async function () {
      deckParser.flattenEntries.mockReturnValue([
        {
          id: "foo",
          card_digest: {
            image: "https://example.com/foo-in-card-digest",
          },
        },
      ]);

      const url = await cim.lookupImage("foo");

      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(url).toBe("https://example.com/foo-in-card-digest");
      expect(cim.imageCache.foo).toBe("https://example.com/foo-in-card-digest");
    });

    it("returns nothing if entry with specific id cannot be found", async function () {
      deckParser.flattenEntries.mockReturnValue([
        {
          id: "not-foo",
          card_digest: {
            image: "https://example.com/not-foo-in-card-digest",
          },
        },
      ]);

      const url = await cim.lookupImage("foo");

      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(url).toBeFalsy();
    });

    it("returns nothing if entry with specific id does not have an image", async function () {
      deckParser.flattenEntries.mockReturnValue([
        {
          id: "foo",
        },
      ]);

      const url = await cim.lookupImage("foo");

      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(url).toBeFalsy();
    });

    it("can bust the cache to re-lookup card image", async function () {
      cim.imageCache.foo = "https://example.com/cached-foo";
      deckParser.flattenEntries.mockReturnValue([
        {
          id: "foo",
          card_digest: {
            image: "https://example.com/foo-in-card-digest",
          },
        },
      ]);

      const url = await cim.lookupImage("foo", true);

      expect(scryfall.getDeck).toBeCalledTimes(1);
      expect(url).toBe("https://example.com/foo-in-card-digest");
      expect(cim.imageCache.foo).toBe("https://example.com/foo-in-card-digest");
    });
  });

  describe("refreshCache", function () {
    it("resets the entry cache after 1 second", async function () {
      jest.spyOn(cim, "getEntries").mockResolvedValue([
        {
          id: "foo",
          card_digest: {
            image: "https://example.com/new-foo",
          },
        },
        {
          id: "bar",
          card_digest: {
            image: "https://example.com/bar",
          },
        },
        {
          id: "baz",
        },
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
