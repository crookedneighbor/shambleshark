import wait from "Lib/wait";
import { create, isInsideIframe } from "Lib/iframe";

describe("iframe", () => {
  describe("create", () => {
    it("creates an iframe that resolves when it loads", async () => {
      const fakeIframe = document.createElement("iframe");
      jest
        .spyOn(fakeIframe, "addEventListener")
        .mockImplementation((eventName, cb) => {
          // let it happen async so iframe can be added to body
          wait().then(() => (cb as EventListener)(new Event("load")));
        });
      jest.spyOn(document, "createElement").mockReturnValue(fakeIframe);
      jest.spyOn(document.body, "appendChild");

      await create({
        src: "https://example.com",
        id: "some-id",
      });

      expect(document.body.appendChild).toBeCalledWith(fakeIframe);
      expect(fakeIframe.id).toBe("some-id");
      expect(fakeIframe.src).toBe("https://example.com/");
      expect(fakeIframe.style.width).toBe("0px");
      expect(fakeIframe.style.height).toBe("0px");
      expect(fakeIframe.style.opacity).toBe("0");
    });
  });

  describe("isInsideIframe", () => {
    it("returns false when parent location is identitical to window location", () => {
      expect(window.location).toEqual(window.parent.location);

      expect(isInsideIframe()).toBe(false);
    });

    it("returns true when parent location is not identitical to window location", () => {
      Object.defineProperty(window, "parent", {
        writable: true,
        value: {
          location: {},
        },
      });
      expect(window.location).not.toEqual(window.parent.location);

      expect(isInsideIframe()).toBe(true);
    });
  });
});
