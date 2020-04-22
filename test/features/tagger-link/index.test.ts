import * as bus from "framebus";
import TaggerLink, {
  ShamblesharkRelationship,
  TaggerPayload,
} from "Features/search-results-features/tagger-link";
import iframe from "Lib/iframe";
import mutation from "Lib/mutation";

import {
  ILLUSTRATION_SYMBOL,
  CARD_SYMBOL,
  PRINTING_SYMBOL,
  CREATURE_BODY_SYMBOL,
  DEPICTS_SYMBOL,
  SEEN_BEFORE_SYMBOL,
  BETTER_THAN_SYMBOL,
  COLORSHIFTED_SYMBOL,
  MIRRORS_SYMBOL,
  RELATED_TO_SYMBOL,
  SIMILAR_TO_SYMBOL,
} from "Svg";
import SpyInstance = jest.SpyInstance;
import { mocked } from "ts-jest/utils";

describe("Tagger Link", function () {
  describe("run", function () {
    let busSpy: SpyInstance;
    let settingsSpy: SpyInstance;

    beforeEach(function () {
      jest.spyOn(mutation, "ready").mockImplementation();
      busSpy = jest.spyOn(bus, "on").mockImplementation((event, cb) => cb());
      jest.spyOn(iframe, "create").mockImplementation();
      jest.spyOn(TaggerLink.prototype, "setupButtons").mockImplementation();
      settingsSpy = jest.spyOn(TaggerLink, "getSettings").mockResolvedValue({
        previewTags: true,
      });
    });

    it("fetches tagger metadata", async function () {
      const tl = new TaggerLink();

      await tl.run();

      expect(TaggerLink.getSettings).toBeCalledTimes(1);
    });

    it("when previewTags setting is true, waits for Tager to emit ready event", async function () {
      busSpy.mockImplementation();

      const tl = new TaggerLink();

      await tl.run();

      expect(tl.setupButtons).toBeCalledTimes(0);

      const handler = busSpy.mock.calls[0][1];

      handler();

      expect(tl.setupButtons).toBeCalledTimes(1);
    });

    it("when previewTags setting is true, adds an iframe to communicate with tagger", async function () {
      const tl = new TaggerLink();

      await tl.run();

      expect(iframe.create).toBeCalledTimes(1);
      expect(iframe.create).toBeCalledWith({
        id: "tagger-link-tagger-iframe",
        src: "https://tagger.scryfall.com",
      });
    });

    it("when previewTags setting is false, skips setting up Tagger iframe", async function () {
      const tl = new TaggerLink();

      settingsSpy.mockResolvedValue({
        previewTags: false,
      });
      await tl.run();

      expect(tl.setupButtons).toBeCalledTimes(1);
      expect(bus.on).toBeCalledTimes(0);
      expect(iframe.create).toBeCalledTimes(0);
    });
  });

  describe("setupButtons", function () {
    let readySpy: SpyInstance;
    let buttonSpy: SpyInstance;

    beforeEach(function () {
      readySpy = jest.spyOn(mutation, "ready").mockImplementation();
      buttonSpy = jest
        .spyOn(TaggerLink.prototype, "makeButton")
        .mockReturnValue(document.createElement("button"));
    });

    it("listens for new card grid items", async function () {
      const tl = new TaggerLink();

      await tl.setupButtons();

      expect(mutation.ready).toBeCalledTimes(1);
      expect(mutation.ready).toBeCalledWith(
        ".card-grid-item a.card-grid-item-card",
        expect.any(Function)
      );
    });

    it("adds a button to .card-grid-item", async function () {
      const tl = new TaggerLink();
      const el = document.createElement("div");
      el.classList.add("card-grid-item");
      el.innerHTML = `
        <div class="card-grid-item-card-faces"></div>
        <a class="card-grid-item-card" href="https://scryfall.com/card/set/number"></a>
      `;
      const fakeBtn = document.createElement("button");
      fakeBtn.classList.add("tagger-link-button");

      mocked(tl).makeButton.mockReturnValue(fakeBtn);

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
      const btn = tl.makeButton(
        "https://scryfall.com/card/set/number"
      ) as HTMLLinkElement;

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
    let btn: HTMLButtonElement, fakeEvent: MouseEvent;

    let emitSpy: SpyInstance;

    beforeEach(() => {
      btn = document.createElement("button") as HTMLButtonElement;
      btn.innerHTML = '<div class="tagger-link-hover"></div>';

      fakeEvent = {
        pageX: 100,
      } as MouseEvent;

      emitSpy = jest.spyOn(bus, "emit").mockImplementation();
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

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith(
        "TAGGER_TAGS_REQUEST",
        {
          set: "set",
          number: "number",
        },
        expect.any(Function)
      );
    });

    it("adds tagger info when it becomes avaialble", async () => {
      const fakeData = {};
      const tl = new TaggerLink();
      const handler = tl.createMouseoverHandler(btn, {
        set: "set",
        number: "number",
      });

      emitSpy.mockImplementation((name, data, cb) => {
        cb(fakeData);
      });

      await handler(fakeEvent);

      expect(tl.addTags).toBeCalledTimes(1);
      expect(tl.addTags).toBeCalledWith(
        btn.querySelector(".tagger-link-hover"),
        fakeData
      );
    });
  });

  describe("addTags", () => {
    let tl: TaggerLink, payload: TaggerPayload, tooltip: HTMLElement;

    let collectTagsSpy: SpyInstance;
    let collectRelationshipsSpy: SpyInstance;
    let addTagsToMenuSpy: SpyInstance;

    beforeEach(() => {
      tl = new TaggerLink();
      collectTagsSpy = jest.spyOn(tl, "collectTags").mockReturnValue({
        art: [],
        oracle: [],
        print: [],
      });
      collectRelationshipsSpy = jest
        .spyOn(tl, "collectRelationships")
        .mockReturnValue({
          art: [],
          oracle: [],
        });
      addTagsToMenuSpy = jest.spyOn(tl, "addTagsToMenu").mockImplementation();
      payload = {} as TaggerPayload;
      tooltip = document.createElement("div");
      tooltip.innerHTML =
        '<div class="menu-container"></div><div class="modal-dialog-spinner"></div>';
    });

    it("collects tags and relationships", () => {
      tl.addTags(tooltip, payload);

      expect(collectTagsSpy).toBeCalledTimes(1);
      expect(collectTagsSpy).toBeCalledWith(payload);
      expect(collectRelationshipsSpy).toBeCalledTimes(1);
      expect(collectRelationshipsSpy).toBeCalledWith(payload);
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
      collectTagsSpy.mockReturnValue({
        art: [{ name: "art-tag" }],
        print: [],
        oracle: [],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(tl.addTagsToMenu).toBeCalledTimes(1);
      expect(tl.addTagsToMenu).toBeCalledWith(
        [{ name: "art-tag" }],
        expect.anything()
      );
    });

    it("adds print tags when there is at least one avaialble", () => {
      collectTagsSpy.mockReturnValue({
        art: [],
        print: [{ name: "print-tag" }],
        oracle: [],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [{ name: "print-tag" }],
        expect.anything()
      );
    });

    it("oracle tags when there is at least one avaialble", () => {
      collectTagsSpy.mockReturnValue({
        art: [],
        print: [],
        oracle: [{ name: "oracle-tag" }],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [{ name: "oracle-tag" }],
        expect.anything()
      );
    });

    it("adds art relationships when there is at least one avaialble", () => {
      collectRelationshipsSpy.mockReturnValue({
        art: [{ name: "art-relationship" }],
        oracle: [],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [{ name: "art-relationship" }],
        expect.anything()
      );
    });

    it("oracle relationships when there is at least one avaialble", () => {
      collectRelationshipsSpy.mockReturnValue({
        art: [],
        print: [],
        oracle: [{ name: "oracle-relationship" }],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [{ name: "oracle-relationship" }],
        expect.anything()
      );
    });

    it("combines art & print tags and art relationsips", () => {
      collectTagsSpy.mockReturnValue({
        art: [{ name: "art-tag" }],
        print: [{ name: "print-tag" }],
        oracle: [],
      });
      collectRelationshipsSpy.mockReturnValue({
        art: [{ name: "art-relationship" }],
        oracle: [],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [
          { name: "art-tag" },
          { name: "print-tag" },
          { name: "art-relationship" },
        ],
        expect.anything()
      );
    });

    it("combines oracle tags and relationsips", () => {
      collectTagsSpy.mockReturnValue({
        art: [],
        print: [],
        oracle: [{ name: "oracle-tag" }],
      });
      collectRelationshipsSpy.mockReturnValue({
        art: [],
        oracle: [{ name: "oracle-relationship" }],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(1);
      expect(addTagsToMenuSpy).toBeCalledTimes(1);
      expect(addTagsToMenuSpy).toBeCalledWith(
        [{ name: "oracle-tag" }, { name: "oracle-relationship" }],
        expect.anything()
      );
    });

    it("can add both art and oracle tags/relationships", () => {
      collectTagsSpy.mockReturnValue({
        art: [{ name: "art-tag" }],
        print: [{ name: "print-tag" }],
        oracle: [{ name: "oracle-tag" }],
      });
      collectRelationshipsSpy.mockReturnValue({
        art: [{ name: "art-relationship" }],
        oracle: [{ name: "oracle-relationship" }],
      });
      tl.addTags(tooltip, payload);

      expect(tooltip.querySelectorAll(".menu-container ul").length).toBe(2);
      expect(addTagsToMenuSpy).toBeCalledTimes(2);
      expect(addTagsToMenuSpy).nthCalledWith(
        1,
        [
          { name: "art-tag" },
          { name: "print-tag" },
          { name: "art-relationship" },
        ],
        expect.anything()
      );
      expect(addTagsToMenuSpy).nthCalledWith(
        2,
        [{ name: "oracle-tag" }, { name: "oracle-relationship" }],
        expect.anything()
      );
    });

    it("sets tooltip top style based on tooltip height", () => {
      expect(tooltip.style.top).toBeFalsy();

      tl.addTags(tooltip, payload);

      expect(tooltip.style.top).toBeTruthy();
    });
  });

  describe("collectTags", () => {
    let tl: TaggerLink, payload: TaggerPayload;

    beforeEach(() => {
      tl = new TaggerLink();
      payload = {
        taggings: [
          {
            tag: {
              name: "Tag 1",
              type: "ILLUSTRATION_TAG",
            },
          },
          {
            tag: {
              name: "Tag 2",
              type: "ORACLE_CARD_TAG",
            },
          },
          {
            tag: {
              name: "Tag 3",
              type: "PRINTING_TAG",
            },
          },
        ],
      };
    });

    it("collects tags in groups", () => {
      const tags = tl.collectTags(payload);

      expect(tags).toEqual({
        art: [
          {
            name: "Tag 1",
            isTag: true,
            symbol: ILLUSTRATION_SYMBOL,
          },
        ],
        oracle: [
          {
            name: "Tag 2",
            isTag: true,
            symbol: CARD_SYMBOL,
          },
        ],
        print: [
          {
            name: "Tag 3",
            isTag: true,
            symbol: PRINTING_SYMBOL,
          },
        ],
      });
    });

    it("ignores any other types", () => {
      payload.taggings!.push({
        tag: {
          name: "bad type",
          type: "NONE",
        },
      });

      const tags = tl.collectTags(payload);

      expect(tags).toEqual({
        art: [
          {
            name: "Tag 1",
            isTag: true,
            symbol: ILLUSTRATION_SYMBOL,
          },
        ],
        oracle: [
          {
            name: "Tag 2",
            isTag: true,
            symbol: CARD_SYMBOL,
          },
        ],
        print: [
          {
            name: "Tag 3",
            isTag: true,
            symbol: PRINTING_SYMBOL,
          },
        ],
      });
    });
  });

  describe("collectRelationships", () => {
    let tl: TaggerLink, payload: TaggerPayload;

    beforeEach(() => {
      tl = new TaggerLink();
      payload = {
        illustrationId: "illustration-id",
        oracleId: "oracle-id",
        relationships: [
          {
            foreignKey: "illustrationId",
            relatedId: "related-id",
            contentName: "Depicts Relationship",
            relatedName: "Depicted Relationship",
            classifier: "DEPICTS",
            classifierInverse: "DEPICTED_IN",
          },
          {
            foreignKey: "oracleId",
            relatedId: "related-id",
            contentName: "Better Than Relationship",
            relatedName: "Worse Than Relationship",
            classifier: "BETTER_THAN",
            classifierInverse: "WORSE_THAN",
          },
        ],
      };
    });

    it("collects relationships in groups", () => {
      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [
          {
            name: "Depicted Relationship",
            liClass: "",
            symbol: DEPICTS_SYMBOL,
          },
        ],
        oracle: [
          {
            name: "Worse Than Relationship",
            liClass: "",
            symbol: BETTER_THAN_SYMBOL,
          },
        ],
      });
    });

    it("ingores symbols for unknown types", () => {
      payload.relationships![0].classifierInverse = "ASDF";
      payload.relationships![1].classifierInverse = "JKL;";
      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [
          {
            name: "Depicted Relationship",
            liClass: "",
            symbol: "",
          },
        ],
        oracle: [
          {
            name: "Worse Than Relationship",
            liClass: "",
            symbol: "",
          },
        ],
      });
    });

    it("handles all relationship types", () => {
      payload.relationships = [];
      const kinds = [
        "BETTER_THAN",
        "COLORSHIFTED",
        "COMES_AFTER",
        "COMES_BEFORE",
        "DEPICTED_IN",
        "DEPICTS",
        "MIRRORS",
        "REFERENCED_BY",
        "REFERENCES_TO",
        "RELATED_TO",
        "SIMILAR_TO",
        "WITHOUT_BODY",
        "WITH_BODY",
        "WORSE_THAN",
      ];
      kinds.forEach((kind) => {
        payload.relationships!.push({
          foreignKey: "oracleId",
          relatedId: "related-id",
          contentName: `${kind} content`,
          relatedName: `${kind} related`,
          classifier: kind,
          classifierInverse: kind,
        });
      });

      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [],
        oracle: [
          {
            name: "BETTER_THAN related",
            liClass: "icon-flipped",
            symbol: BETTER_THAN_SYMBOL,
          },
          {
            name: "COLORSHIFTED related",
            liClass: "",
            symbol: COLORSHIFTED_SYMBOL,
          },
          {
            name: "COMES_AFTER related",
            liClass: "",
            symbol: SEEN_BEFORE_SYMBOL,
          },
          {
            name: "COMES_BEFORE related",
            liClass: "icon-flipped",
            symbol: SEEN_BEFORE_SYMBOL,
          },
          {
            name: "DEPICTED_IN related",
            liClass: "",
            symbol: DEPICTS_SYMBOL,
          },
          {
            name: "DEPICTS related",
            liClass: "icon-flipped",
            symbol: DEPICTS_SYMBOL,
          },
          {
            name: "MIRRORS related",
            liClass: "",
            symbol: MIRRORS_SYMBOL,
          },
          {
            name: "REFERENCED_BY related",
            liClass: "",
            symbol: DEPICTS_SYMBOL,
          },
          {
            name: "REFERENCES_TO related",
            liClass: "icon-flipped",
            symbol: DEPICTS_SYMBOL,
          },
          {
            name: "RELATED_TO related",
            liClass: "",
            symbol: RELATED_TO_SYMBOL,
          },
          {
            name: "SIMILAR_TO related",
            liClass: "",
            symbol: SIMILAR_TO_SYMBOL,
          },
          {
            name: "WITHOUT_BODY related",
            liClass: "icon-upside-down",
            symbol: CREATURE_BODY_SYMBOL,
          },
          {
            name: "WITH_BODY related",
            liClass: "",
            symbol: CREATURE_BODY_SYMBOL,
          },
          {
            name: "WORSE_THAN related",
            liClass: "",
            symbol: BETTER_THAN_SYMBOL,
          },
        ],
      });
    });

    it("uses contentName and classifier when it is the related tag", () => {
      payload.relationships = [
        {
          foreignKey: "oracleId",
          relatedId: "oracle-id",
          contentName: "Content Name",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [],
        oracle: [
          {
            name: "Content Name",
            liClass: "icon-flipped",
            symbol: BETTER_THAN_SYMBOL,
          },
        ],
      });
    });

    it("uses realtedName and classifierInverse when it is the related tag", () => {
      payload.relationships = [
        {
          foreignKey: "oracleId",
          relatedId: "not-oracle-id",
          contentName: "Content Name",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [],
        oracle: [
          {
            name: "Related Name",
            liClass: "",
            symbol: BETTER_THAN_SYMBOL,
          },
        ],
      });
    });

    it("skips any unknown foreign keys", () => {
      payload.relationships!.push({
        // @ts-ignore
        foreignKey: "unknown",
        relatedId: "not-oracle-id",
        contentName: "Content Name",
        relatedName: "Related Name",
        classifier: "BETTER_THAN",
        classifierInverse: "WORSE_THAN",
      });
      const relationships = tl.collectRelationships(payload);

      expect(relationships).toEqual({
        art: [
          {
            name: "Depicted Relationship",
            liClass: "",
            symbol: DEPICTS_SYMBOL,
          },
        ],
        oracle: [
          {
            name: "Worse Than Relationship",
            liClass: "",
            symbol: BETTER_THAN_SYMBOL,
          },
        ],
      });
    });
  });

  describe("addTagsToMenu", () => {
    let tl: TaggerLink,
      menu: HTMLUListElement,
      tags: ShamblesharkRelationship[];

    beforeEach(() => {
      tl = new TaggerLink();
      menu = document.createElement("ul");
      tags = [
        {
          name: "Tag 1",
          symbol: "symbol 1",
        },
        {
          name: "Tag 2",
          symbol: "symbol 2",
        },
      ];
    });

    it("adds tags to menu", () => {
      tl.addTagsToMenu(tags, menu);

      expect(menu.children.length).toBe(2);
      expect(menu.children[0].innerHTML).toContain("symbol 1 Tag 1");
      expect(menu.children[1].innerHTML).toContain("symbol 2 Tag 2");
    });

    it("sorts by name", () => {
      tags.push({
        name: "First",
        symbol: "symbol 3",
      });
      tl.addTagsToMenu(tags, menu);

      expect(menu.children.length).toBe(3);
      expect(menu.children[0].innerHTML).toContain("symbol 3 First");
      expect(menu.children[1].innerHTML).toContain("symbol 1 Tag 1");
      expect(menu.children[2].innerHTML).toContain("symbol 2 Tag 2");
    });

    it("prefers tags when sorting", () => {
      tags.push({
        name: "Z - last alphabetically",
        isTag: true,
        symbol: "symbol 3",
      });
      tl.addTagsToMenu(tags, menu);

      expect(menu.children.length).toBe(3);
      expect(menu.children[0].innerHTML).toContain(
        "symbol 3 Z - last alphabetically"
      );
      expect(menu.children[1].innerHTML).toContain("symbol 1 Tag 1");
      expect(menu.children[2].innerHTML).toContain("symbol 2 Tag 2");
    });

    it("prints a + x more tag when there are more than 8 tags", () => {
      let index = 0;
      Array.from({ length: 9 }, () => {
        index++;
        tags.push({
          name: `name ${index}`,
          symbol: `symbol ${index}`,
        });
      });
      tl.addTagsToMenu(tags, menu);

      expect(menu.children.length).toBe(9);
      expect(menu.children[8].innerHTML).toContain("+ 4 more");
    });

    it("only includes the first 8 tags", () => {
      let index = 0;
      Array.from({ length: 9 }, () => {
        index++;
        tags.push({
          name: `name ${index}`,
          symbol: `symbol ${index}`,
        });
      });
      tl.addTagsToMenu(tags, menu);

      expect(menu.children.length).toBe(9);
      expect(menu.children[0].innerHTML).toContain("symbol 1 name 1");
      expect(menu.children[1].innerHTML).toContain("symbol 2 name 2");
      expect(menu.children[2].innerHTML).toContain("symbol 3 name 3");
      expect(menu.children[3].innerHTML).toContain("symbol 4 name 4");
      expect(menu.children[4].innerHTML).toContain("symbol 5 name 5");
      expect(menu.children[5].innerHTML).toContain("symbol 6 name 6");
      expect(menu.children[6].innerHTML).toContain("symbol 7 name 7");
      expect(menu.children[7].innerHTML).toContain("symbol 8 name 8");
      expect(menu.children[8].innerHTML).not.toContain("symbol 9 name 9");
    });
  });
});
