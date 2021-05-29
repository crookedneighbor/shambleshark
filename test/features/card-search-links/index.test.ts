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
          manaCost: false,
        });

      jest
        .spyOn(CardSearchLinks.prototype, "decorateTypeLine")
        .mockImplementation();
      jest
        .spyOn(CardSearchLinks.prototype, "decorateManaCost")
        .mockImplementation();
    });

    it("does not call decorateTypeLine when not configured to decorate type line", async () => {
      const csl = new CardSearchLinks();

      await csl.run();

      expect(csl.decorateTypeLine).not.toBeCalled();
    });

    it("calls decorateTypeLine when configured to decorate type line", async () => {
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

    it("does not call decorateManaCost when not configured to decorate mana costs", async () => {
      const csl = new CardSearchLinks();

      await csl.run();

      expect(csl.decorateManaCost).not.toBeCalled();
    });

    it("calls decorateTypeLine when configured to decorate type line", async () => {
      const csl = new CardSearchLinks();
      settingsSpy.mockResolvedValue({
        manaCost: true,
      });

      await csl.run();

      expect(csl.decorateManaCost).toBeCalledTimes(1);
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

    it("preserves color indicators in type line", () => {
      const tm = new CardSearchLinks();
      container.innerHTML = `<abbr class="color-indicator color-indicator-BR" title="Color Indicator: Black and Red">
  Color Indicator: Black and Red
</abbr> Legendary Creature — Human Wizard`;

      tm.decorateTypeLine(false);

      const links = container.querySelectorAll("a");

      expect(links.length).toBe(4);

      expect(links[0].innerHTML).toBe("Legendary");
      expect(links[0].href).toContain("/search?q=type%3Alegendary");
      expect(links[1].innerHTML).toBe("Creature");
      expect(links[1].href).toContain("/search?q=type%3Acreature");
      expect(container.innerHTML).toContain("—");
      expect(links[2].innerHTML).toBe("Human");
      expect(links[2].href).toContain("/search?q=type%3Ahuman");
      expect(links[3].innerHTML).toBe("Wizard");
      expect(links[3].href).toContain("/search?q=type%3Awizard");

      expect(container.querySelector(".color-indicator")).toBeTruthy();
    });

    it("includes 'hide-link-color' class when configured", () => {
      const tm = new CardSearchLinks();

      tm.decorateTypeLine(true);
      expect(container.classList.contains("hide-link-color")).toBe(false);

      tm.decorateTypeLine(false);
      expect(container.classList.contains("hide-link-color")).toBe(true);
    });
  });

  describe("decorateManaCost", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement("div");
      const abbr3 = document.createElement("abbr");
      abbr3.classList.add("card-symbol");
      abbr3.textContent = "{3}";
      const abbrG = document.createElement("abbr");
      abbrG.classList.add("card-symbol");
      abbrG.textContent = "{G}";
      container.appendChild(abbr3);
      container.appendChild(abbrG);

      mocked(ready).mockImplementation((selector, cb) => {
        cb(container);
      });
    });

    it("decorates manacost with link", () => {
      const tm = new CardSearchLinks();

      tm.decorateManaCost();

      const link = container.querySelector("a") as HTMLAnchorElement;

      expect(link.innerHTML).toContain("{3}");
      expect(link.innerHTML).toContain("{G}");
      expect(link.href).toContain("/search?q=mana%3D%223G%22");
    });
  });
});
