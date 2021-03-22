import CardSearchLinks from "Features/card-page-features/card-search-links";
import { ready } from "Lib/mutation";

import SpyInstance = jest.SpyInstance;
import { mocked } from "ts-jest/utils";

jest.mock("Lib/mutation");

describe("CardSearchLinks", () => {
  describe("run", () => {
    let settingsSpy: SpyInstance;

    beforeEach(() => {
      settingsSpy = jest
        .spyOn(CardSearchLinks, "getSettings")
        .mockResolvedValue({
          displayAsLinks: false,
          typeline: false,
        });

      jest
        .spyOn(CardSearchLinks.prototype, "decorateTypeLine")
        .mockImplementation();
    });

    it("does not call decorateTypeLine when not configured to decorate type line", async () => {
      const csl = new CardSearchLinks();

      await csl.run();

      expect(csl.decorateTypeLine).not.toBeCalled();
    });

    it("calls decorateTypeLine when not configured to decorate type line", async () => {
      const csl = new CardSearchLinks();
      settingsSpy.mockResolvedValue({
        typeline: true,
      });

      await csl.run();

      expect(csl.decorateTypeLine).toBeCalledTimes(1);
    });

    it("calls decorateTypeLine with links configuration", async () => {
      const csl = new CardSearchLinks();
      settingsSpy.mockResolvedValue({
        typeline: true,
        displayAsLinks: false,
      });

      await csl.run();

      expect(csl.decorateTypeLine).toBeCalledTimes(1);
      expect(csl.decorateTypeLine).toBeCalledWith(false);

      mocked(csl.decorateTypeLine).mockReset();

      settingsSpy.mockResolvedValue({
        typeline: true,
        displayAsLinks: true,
      });

      await csl.run();

      expect(csl.decorateTypeLine).toBeCalledTimes(1);
      expect(csl.decorateTypeLine).toBeCalledWith(true);
    });
  });

  describe("decorateTypeLine", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement("div");
      container.textContent = "Legendary Creature — Druid Advisor";
      mocked(ready).mockImplementation((selector, cb) => {
        cb(container);
      });
    });

    it("decorates typeline with links", () => {
      const tm = new CardSearchLinks();

      tm.decorateTypeLine(false);

      const links = container.querySelectorAll("a");

      expect(links.length).toBe(4);
      expect(links[0].innerHTML).toBe("Legendary");
      expect(links[0].href).toContain("/search?q=type%3Alegendary");
      expect(links[1].innerHTML).toBe("Creature");
      expect(links[1].href).toContain("/search?q=type%3Acreature");
      expect(links[2].innerHTML).toBe("Druid");
      expect(links[2].href).toContain("/search?q=type%3Adruid");
      expect(links[3].innerHTML).toBe("Advisor");
      expect(links[3].href).toContain("/search?q=type%3Aadvisor");
      expect(container.innerHTML).toContain("—");
    });

    it("supports type lines with no subtypes", () => {
      const tm = new CardSearchLinks();
      container.textContent = "World Enchantment";

      tm.decorateTypeLine(false);

      const links = container.querySelectorAll("a");

      expect(links.length).toBe(2);
      expect(links[0].innerHTML).toBe("World");
      expect(links[0].href).toContain("/search?q=type%3Aworld");
      expect(links[1].innerHTML).toBe("Enchantment");
      expect(links[1].href).toContain("/search?q=type%3Aenchantment");
      expect(container.innerHTML).not.toContain("—");
    });

    it("includes 'hide-link-color' class when configured", () => {
      const tm = new CardSearchLinks();

      tm.decorateTypeLine(true);
      expect(container.classList.contains("hide-link-color")).toBe(false);

      tm.decorateTypeLine(false);
      expect(container.classList.contains("hide-link-color")).toBe(true);
    });
  });
});
