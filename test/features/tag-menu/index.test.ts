import TagMenu from "Features/card-page-features/tag-menu";
import { requestTags, TagInfo } from "Lib/tagger-bridge";
import { ready } from "Lib/mutation";

import SpyInstance = jest.SpyInstance;
jest.mock("Lib/tagger-bridge");
jest.mock("Lib/mutation");

describe("TagMenu", () => {
  describe("run", () => {
    let settingsSpy: SpyInstance;
    let printElement: HTMLDivElement;
    let artTags: TagInfo[];
    let cardTags: TagInfo[];

    beforeEach(() => {
      const container = document.createElement("div");
      printElement = document.createElement("div");
      printElement.classList.add("prints-table");
      container.appendChild(printElement);
      artTags = [];
      cardTags = [];

      jest.mocked(requestTags).mockResolvedValue({
        taggerLink: "https://tagger.scryfall.com/card-slug",
        art: artTags,
        oracle: cardTags,
      });

      jest.spyOn(TagMenu.prototype, "addTags").mockImplementation();
      settingsSpy = jest.spyOn(TagMenu, "getSettings").mockResolvedValue({
        artTags: true,
        cardTags: true,
      });
      jest.mocked(ready).mockImplementation((selector, cb) => {
        cb(printElement);
      });

      jest.spyOn(TagMenu.prototype, "addTags").mockImplementation();
      jest.spyOn(TagMenu.prototype, "getTaggerData").mockReturnValue({
        set: "DOM",
        number: "123",
      });
    });

    it("fetches Tag Menu settings", async () => {
      const tm = new TagMenu();

      await tm.run();

      expect(TagMenu.getSettings).toBeCalledTimes(1);
    });

    it("requests tags", async () => {
      const tm = new TagMenu();

      await tm.run();

      expect(requestTags).toBeCalledTimes(1);
      expect(requestTags).toBeCalledWith({
        set: "DOM",
        number: "123",
      });
    });

    it("adds container as a sibling to the prints element", async () => {
      const tm = new TagMenu();

      await tm.run();

      expect(
        printElement.parentNode?.querySelector(".tag-menu-container")
      ).toBe(tm.container);
    });

    it("adds art tags to page when there is at least one art tag", async () => {
      artTags.push({
        name: "Tag 1",
        tagType: "ILLUSTRATION_TAG",
        link: "https://scryfall.com",
      });

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(1);
      expect(tm.addTags).toBeCalledWith(
        artTags,
        "Art Tags",
        "https://tagger.scryfall.com/card-slug"
      );
    });

    it("does not add art tags when there are none to add", async () => {
      artTags = [];

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(0);
    });

    it("does not add art tags when setting has them disabled", async () => {
      artTags.push({
        name: "Tag 1",
        tagType: "ILLUSTRATION_TAG",
        link: "https://scryfall.com",
      });
      settingsSpy.mockResolvedValue({
        artTags: false,
        cardTags: true,
      });

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(0);
    });

    it("adds card tags to page when there is at least one card tag", async () => {
      cardTags.push({
        name: "Tag 1",
        tagType: "CARD_ORACLE_TAG",
        link: "https://scryfall.com",
      });

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(1);
      expect(tm.addTags).toBeCalledWith(
        cardTags,
        "Card Tags",
        "https://tagger.scryfall.com/card-slug"
      );
    });

    it("does not add card tags when there are none to add", async () => {
      cardTags = [];

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(0);
    });

    it("does not add card tags when setting has them disabled", async () => {
      cardTags.push({
        name: "Tag 1",
        tagType: "CARD_ORACLE_TAG",
        link: "https://scryfall.com",
      });
      settingsSpy.mockResolvedValue({
        artTags: true,
        cardTags: false,
      });

      const tm = new TagMenu();

      await tm.run();

      expect(tm.addTags).toBeCalledTimes(0);
    });
  });

  describe("getTaggerData", () => {
    beforeEach(() => {
      const taggerLink = document.createElement("a");
      taggerLink.href = "https://tagger.scryfall.com/card/dom/123";

      document.body.appendChild(taggerLink);
    });

    it("pulls tagger data from the tagger link on the page", () => {
      const tm = new TagMenu();
      const data = tm.getTaggerData();

      expect(data).toEqual({
        set: "dom",
        number: "123",
      });
    });
  });

  describe("addTags", () => {
    it("creates a table element for the tags", () => {
      const tm = new TagMenu();
      tm.addTags([], "table name", "https://scryfall.com/link");
      const table = tm.container.querySelector("table") as HTMLTableElement;

      const headLink = table.querySelector("thead a") as HTMLAnchorElement;
      expect(headLink.href).toBe("https://scryfall.com/link");
      expect(headLink.innerHTML).toBe("table name");
      expect(table.querySelectorAll("tbody tr").length).toBe(0);
    });

    it("creates a tag row for each tag", () => {
      const rows = Array.from({ length: 5 }, (_, i) => {
        return {
          name: `Tag ${i + 1}`,
          tagType: "ILLUSTRATION_TAG",
          link: `https://scryfall.com/${i}`,
        };
      });
      const tm = new TagMenu();

      tm.addTags(rows, "table name", "https://scryfall.com/link");
      const table = tm.container.querySelector("table") as HTMLTableElement;

      const links = table.querySelectorAll<HTMLAnchorElement>("tbody tr a");

      expect(links.length).toBe(5);

      expect(links[0].innerHTML).toContain("Tag 1");
      expect(links[0].href).toContain("https://scryfall.com/0");

      expect(links[1].innerHTML).toContain("Tag 2");
      expect(links[1].href).toContain("https://scryfall.com/1");

      expect(links[2].innerHTML).toContain("Tag 3");
      expect(links[2].href).toContain("https://scryfall.com/2");

      expect(links[3].innerHTML).toContain("Tag 4");
      expect(links[3].href).toContain("https://scryfall.com/3");

      expect(links[4].innerHTML).toContain("Tag 5");
      expect(links[4].href).toContain("https://scryfall.com/4");
    });

    it("does not create more than 6 tag rows", () => {
      const rows = Array.from({ length: 10 }, (_, i) => {
        return {
          name: `Tag ${i + 1}`,
          tagType: "ILLUSTRATION_TAG",
          link: `https://scryfall.com/${i}`,
        };
      });
      const tm = new TagMenu();

      tm.addTags(rows, "table name", "https://scryfall.com/link");
      const table = tm.container.querySelector("table") as HTMLTableElement;

      // an extra one for the view more tag
      expect(table.querySelectorAll("tbody tr").length).toBe(7);
    });

    it("does not create a view more row when there are 6 entries or less", () => {
      const rows = Array.from({ length: 6 }, (_, i) => {
        return {
          name: `Tag ${i + 1}`,
          tagType: "ILLUSTRATION_TAG",
          link: `https://scryfall.com/${i}`,
        };
      });
      const tm = new TagMenu();

      tm.addTags(rows, "table name", "https://scryfall.com/link");
      const table = tm.container.querySelector("table") as HTMLTableElement;

      expect(table.querySelectorAll("tbody tr").length).toBe(6);
      expect(
        table.querySelectorAll("tbody tr")[5].querySelector("a")?.innerHTML
      ).toContain("Tag 6");
    });

    it("creates a view more row when there are more than 6 entries", () => {
      const rows = Array.from({ length: 7 }, (_, i) => {
        return {
          name: `Tag ${i + 1}`,
          tagType: "ILLUSTRATION_TAG",
          link: `https://scryfall.com/${i}`,
        };
      });
      const tm = new TagMenu();

      tm.addTags(rows, "table name", "https://scryfall.com/link");
      const table = tm.container.querySelector("table") as HTMLTableElement;

      expect(table.querySelectorAll("tbody tr").length).toBe(7);

      const viewMoreLink =
        table.querySelectorAll<HTMLAnchorElement>("tbody tr a")[6];
      expect(viewMoreLink.innerText).toContain("View more tags");
      expect(viewMoreLink.href).toBe("https://scryfall.com/link");
    });
  });
});
