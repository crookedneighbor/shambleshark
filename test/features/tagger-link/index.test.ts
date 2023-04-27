import TaggerLink from "Features/search-results-features/tagger-link";
import { requestTags, TagEntries } from "Lib/tagger-bridge";
import { ready } from "Lib/mutation";

import SpyInstance = jest.SpyInstance;
jest.mock("Lib/tagger-bridge");
jest.mock("Lib/mutation");

describe("Tagger Link", () => {
  describe("run", () => {
    beforeEach(() => {
      jest.spyOn(TaggerLink.prototype, "setupButtons").mockImplementation();
      jest.spyOn(TaggerLink, "getSettings").mockResolvedValue({
        previewTags: true,
      });
    });

    it("fetches tagger metadata", async () => {
      const tl = new TaggerLink();

      await tl.run();

      expect(TaggerLink.getSettings).toBeCalledTimes(1);
    });

    it("sets up buttons", async () => {
      const tl = new TaggerLink();

      jest.spyOn(tl, "setupButtons").mockImplementation();

      await tl.run();

      expect(tl.setupButtons).toBeCalledTimes(1);
    });
  });

  describe("setupButtons", () => {
    let readySpy: SpyInstance;

    beforeEach(() => {
      readySpy = jest.mocked(ready);
      jest
        .spyOn(TaggerLink.prototype, "makeButton")
        .mockReturnValue(document.createElement("a"));
    });

    it("listens for new card grid items", async () => {
      const tl = new TaggerLink();

      await tl.setupButtons();

      expect(ready).toBeCalledTimes(1);
      expect(ready).toBeCalledWith(
        ".card-grid-item a.card-grid-item-card",
        expect.any(Function)
      );
    });

    it("adds a button to .card-grid-item", async () => {
      const tl = new TaggerLink();
      const el = document.createElement("div");
      el.classList.add("card-grid-item");
      el.innerHTML = `
        <div class="card-grid-item-card-faces"></div>
        <a class="card-grid-item-card" href="https://scryfall.com/card/set/number"></a>
      `;
      const fakeBtn = document.createElement("a");
      fakeBtn.classList.add("tagger-link-button");

      jest.mocked(tl.makeButton).mockReturnValue(fakeBtn);

      readySpy.mockImplementation((cssSelector, cb) => {
        cb(el.querySelector(".card-grid-item-card"));
      });

      await tl.setupButtons();

      expect(tl.makeButton).toBeCalledWith(
        "https://scryfall.com/card/set/number"
      );

      const btn = el.querySelector(".tagger-link-button");
      expect(btn).toBe(fakeBtn);
    });
  });

  describe("makeButton", () => {
    beforeEach(() => {
      jest
        .spyOn(TaggerLink.prototype, "createMouseoverHandler")
        .mockReturnValue(jest.fn());
    });

    it("creates a button link to tagger", () => {
      const tl = new TaggerLink();
      const btn = tl.makeButton("https://scryfall.com/card/set/number");

      expect(btn.href).toBe("https://tagger.scryfall.com/card/set/number");
    });

    it("when enabled to show tags, adds a mosueover event", () => {
      const tl = new TaggerLink();
      tl.showPreview = true;

      const btn = tl.makeButton("https://scryfall.com/card/set/number");

      expect(tl.createMouseoverHandler).toBeCalledTimes(1);
      expect(tl.createMouseoverHandler).toBeCalledWith(btn, {
        set: "set",
        number: "number",
      });
    });

    it("when enabled to show tags, adds a tag display menu", () => {
      const tl = new TaggerLink();
      tl.showPreview = true;

      const btn = tl.makeButton("https://scryfall.com/card/set/number");

      expect(btn.querySelector(".menu-container")).toBeTruthy();
    });

    it("when not enabled to show tags, skips the hover menu and mouseover event", () => {
      const tl = new TaggerLink();
      tl.showPreview = false;

      const btn = tl.makeButton("https://scryfall.com/card/set/number");

      expect(tl.createMouseoverHandler).toBeCalledTimes(0);
      expect(btn.querySelector(".menu-container")).toBeFalsy();
    });
  });

  describe("createMouseoverHandler", () => {
    let btn: HTMLAnchorElement, fakeEvent: MouseEvent;

    beforeEach(() => {
      btn = document.createElement("a");
      btn.innerHTML = '<div class="tagger-link-hover"></div>';

      fakeEvent = {
        pageX: 100,
      } as MouseEvent;

      jest.mocked(requestTags).mockResolvedValue({
        taggerLink: "https://tagger.scryfall.com",
        art: [],
        oracle: [],
      });
      jest.spyOn(TaggerLink.prototype, "addTags").mockImplementation();
    });

    it("creates a handler for mouseover events", () => {
      const tl = new TaggerLink();
      const handler = tl.createMouseoverHandler(btn, {
        set: "set",
        number: "number",
      });

      expect(handler).toBeInstanceOf(Function);
    });

    it("requests tagger info", () => {
      const tl = new TaggerLink();
      const handler = tl.createMouseoverHandler(btn, {
        set: "set",
        number: "number",
      });

      handler(fakeEvent);

      expect(requestTags).toBeCalledTimes(1);
      expect(requestTags).toBeCalledWith({
        set: "set",
        number: "number",
      });
    });

    it("adds tagger info when it becomes avaialble", async () => {
      const tl = new TaggerLink();
      const handler = tl.createMouseoverHandler(btn, {
        set: "set",
        number: "number",
      });

      await handler(fakeEvent);

      expect(tl.addTags).toBeCalledTimes(1);
      expect(tl.addTags).toBeCalledWith(
        btn.querySelector(".tagger-link-hover"),
        {
          taggerLink: "https://tagger.scryfall.com",
          art: [],
          oracle: [],
        }
      );
    });
  });

  describe("addTags", () => {
    let tl: TaggerLink, payload: TagEntries, tooltip: HTMLElement;
    let addTagsToMenuSpy: SpyInstance;

    beforeEach(() => {
      tl = new TaggerLink();
      addTagsToMenuSpy = jest.spyOn(tl, "addTagsToMenu").mockImplementation();
      payload = {
        taggerLink: "https://tagger.scryfall.com",
        art: [],
        oracle: [],
      };
      tooltip = document.createElement("div");
      tooltip.innerHTML =
        '<div class="menu-container"></div><div class="modal-dialog-spinner"></div>';
    });

    it("hides the spinner", () => {
      tl.addTags(tooltip, payload);

      expect(
        tooltip.querySelector(".modal-dialog-spinner.hidden")
      ).toBeTruthy();
    });

    it("reports when no tags can be found", () => {
      tl.addTags(tooltip, payload);

      expect(
        tooltip.querySelector<HTMLDivElement>(".menu-container")!.innerText
      ).toBe("No tags found. Add some!");
    });

    it("adds art tags when there is at least one avaialble", () => {
      payload.art.push({
        name: "art-tag",
        tagType: "ILLUSTRATION_TAG",
        isTag: true,
        link: "https://tagger.scryfall.com",
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(tl.addTagsToMenu).toBeCalledTimes(1);
      expect(tl.addTagsToMenu).toBeCalledWith(
        [
          {
            name: "art-tag",
            tagType: "ILLUSTRATION_TAG",
            isTag: true,
            link: "https://tagger.scryfall.com",
          },
        ],
        expect.anything()
      );
    });

    it("oracle tags when there is at least one avaialble", () => {
      payload.oracle.push({
        name: "oracle-tag",
        tagType: "ORACLE_CARD_TAG",
        isTag: true,
        link: "https://scryfall.com",
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [
          {
            name: "oracle-tag",
            tagType: "ORACLE_CARD_TAG",
            isTag: true,
            link: "https://scryfall.com",
          },
        ],
        expect.anything()
      );
    });

    it("sets tooltip top style based on tooltip height", () => {
      expect(tooltip.style.top).toBeFalsy();

      tl.addTags(tooltip, payload);

      expect(tooltip.style.top).toBeTruthy();
    });
  });

  describe("addTagsToMenu", () => {
    let tl: TaggerLink, menu: HTMLUListElement, tags: TagEntries;

    beforeEach(() => {
      tl = new TaggerLink();
      menu = document.createElement("ul");
      tags = {
        taggerLink: "https://tagger.scryfall.com",
        art: [
          {
            name: "Tag 1",
            tagType: "ILLUSTRATION_TAG",
            isTag: true,
            link: "https://scryfall.com/tag-1",
          },
          {
            name: "Tag 2",
            tagType: "ILLUSTRATION_TAG",
            isTag: true,
            link: "https://scryfall.com/tag-2",
          },
        ],
        oracle: [],
      };
    });

    it("adds tags to menu", () => {
      tl.addTagsToMenu(tags.art, menu);

      expect(menu.children.length).toBe(2);
      expect(menu.children[0].innerHTML).toContain("Tag 1");
      expect(menu.children[1].innerHTML).toContain("Tag 2");
    });

    it("sorts by name", () => {
      tags.art.push({
        name: "First",
        tagType: "ILLUSTRATION_TAG",
        isTag: true,
        link: "https://tagger.scryfall.com",
      });
      tl.addTagsToMenu(tags.art, menu);

      expect(menu.children.length).toBe(3);
      expect(menu.children[0].innerHTML).toContain("First");
      expect(menu.children[1].innerHTML).toContain("Tag 1");
      expect(menu.children[2].innerHTML).toContain("Tag 2");
    });

    it("prefers tags when sorting", () => {
      delete tags.art[0].isTag;
      delete tags.art[1].isTag;
      tags.art.push({
        name: "Z - last alphabetically",
        isTag: true,
        tagType: "ILLUSTRATION_TAG",
        link: "https://tagger.scryfall.com",
      });
      tl.addTagsToMenu(tags.art, menu);

      expect(menu.children.length).toBe(3);
      expect(menu.children[0].innerHTML).toContain("Z - last alphabetically");
      expect(menu.children[1].innerHTML).toContain("Tag 1");
      expect(menu.children[2].innerHTML).toContain("Tag 2");
    });

    it("prints a + x more tag when there are more than 8 tags", () => {
      let index = 0;
      Array.from({ length: 9 }, () => {
        index++;
        tags.art.push({
          name: `name ${index}`,
          tagType: "ILLUSTRATION_TAG",
          isTag: true,
          link: "https://tagger.scryfall.com",
        });
      });
      tl.addTagsToMenu(tags.art, menu);

      expect(menu.children.length).toBe(9);
      expect(menu.children[8].innerHTML).toContain("+ 4 more");
    });

    it("only includes the first 8 tags", () => {
      let index = 0;
      Array.from({ length: 9 }, () => {
        index++;
        tags.art.push({
          name: `name ${index}`,
          tagType: "ILLUSTRATION_TAG",
          isTag: true,
          link: "https://tagger.scryfall.com",
        });
      });
      tl.addTagsToMenu(tags.art, menu);

      expect(menu.children.length).toBe(9);
      expect(menu.children[0].innerHTML).toContain("name 1");
      expect(menu.children[1].innerHTML).toContain("name 2");
      expect(menu.children[2].innerHTML).toContain("name 3");
      expect(menu.children[3].innerHTML).toContain("name 4");
      expect(menu.children[4].innerHTML).toContain("name 5");
      expect(menu.children[5].innerHTML).toContain("name 6");
      expect(menu.children[6].innerHTML).toContain("name 7");
      expect(menu.children[7].innerHTML).toContain("name 8");
      expect(menu.children[8].innerHTML).not.toContain("name 9");
    });
  });
});
