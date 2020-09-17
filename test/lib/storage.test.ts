import { get, set } from "Lib/storage";

describe("storage", () => {
  beforeEach(() => {
    // TODO probably should do this better
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.chrome as any) = {
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

  describe("get", () => {
    it("calls out to chrome get function", async () => {
      const result = await get("foo");

      expect(result).toBe("bar");
      expect(window.chrome.storage.sync.get).toBeCalledTimes(1);
      expect(window.chrome.storage.sync.get).toBeCalledWith(
        ["foo"],
        expect.any(Function)
      );
    });
  });

  describe("set", () => {
    it("calls out to chrome set function", async () => {
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
