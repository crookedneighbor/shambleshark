import { get, set } from "Lib/storage";
import { browser } from "webextension-polyfill-ts";

describe("storage", function () {
  let getSpy: jest.SpyInstance;
  let setSpy: jest.SpyInstance;

  beforeEach(function () {
    getSpy = jest.spyOn(browser.storage.sync, "get").mockResolvedValue({
      foo: "bar",
    });
    setSpy = jest.spyOn(browser.storage.sync, "set").mockImplementation(() => {
      return Promise.resolve();
    });
  });

  describe("get", function () {
    it("calls out to browser get function", async function () {
      const result = await get("foo", "baz");

      expect(result.foo).toBe("bar");
      expect(getSpy).toBeCalledTimes(1);
      expect(getSpy).toBeCalledWith(["foo", "baz"]);
    });

    it("can pass a single key name as a convenience", async function () {
      const result = await get("foo");

      expect(result).toBe("bar");
      expect(getSpy).toBeCalledTimes(1);
      expect(getSpy).toBeCalledWith(["foo"]);
    });
  });

  describe("set", function () {
    it("calls out to chrome set function", async function () {
      await set({
        foo: "bar",
      });

      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith({
        foo: "bar",
      });
    });

    it("can pass a single key name with a value as a convenience", async function () {
      await set("foo", "bar");

      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith({
        foo: "bar",
      });
    });
  });
});
