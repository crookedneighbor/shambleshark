import { get, set } from "Lib/storage";

declare global {
  interface Window {
    chrome: any;
  }
}

describe("storage", function () {
  beforeEach(function () {
    window.chrome = {
      storage: {
        sync: {
          get: jest.fn().mockImplementation((keys, callback) => {
            const result = {
              foo: "bar",
            };

            callback(result);
          }),
          set: jest.fn().mockImplementation((obj, callback) => {
            callback();
          }),
        },
      },
    };
  });

  describe("get", function () {
    it("calls out to chrome get function", async function () {
      const result = await get("foo", "baz");

      expect(result.foo).toBe("bar");
      expect(window.chrome.storage.sync.get).toBeCalledTimes(1);
      expect(window.chrome.storage.sync.get).toBeCalledWith(
        ["foo", "baz"],
        expect.any(Function)
      );
    });

    it("can pass a single key name as a convenience", async function () {
      const result = await get("foo");

      expect(result).toBe("bar");
      expect(window.chrome.storage.sync.get).toBeCalledTimes(1);
      expect(window.chrome.storage.sync.get).toBeCalledWith(
        ["foo"],
        expect.any(Function)
      );
    });
  });

  describe("set", function () {
    it("calls out to chrome set function", async function () {
      await set({
        foo: "bar",
      });

      expect(window.chrome.storage.sync.set).toBeCalledTimes(1);
      expect(window.chrome.storage.sync.set).toBeCalledWith(
        {
          foo: "bar",
        },
        expect.any(Function)
      );
    });

    it("can pass a single key name with a value as a convenience", async function () {
      await set("foo", "bar");

      expect(window.chrome.storage.sync.set).toBeCalledTimes(1);
      expect(window.chrome.storage.sync.set).toBeCalledWith(
        {
          foo: "bar",
        },
        expect.any(Function)
      );
    });
  });
});
