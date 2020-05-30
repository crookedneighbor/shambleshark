import EDHRecSuggestions from "Features/deck-builder-features/edhrec-suggestions";
import { getDeck } from "Lib/scryfall";
import { ready } from "Lib/mutation";
import iframe from "Lib/iframe";
import SpyInstance = jest.SpyInstance;

import { makeFakeDeck } from "Helpers/fake";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");
jest.mock("Lib/mutation");

describe("EDHRec Suggestions", function () {
  describe("run", function () {
    let toolbar: HTMLDivElement;
    let getDeckSpy: SpyInstance;
    let readySpy: SpyInstance;

    beforeEach(function () {
      getDeckSpy = mocked(getDeck);
      toolbar = document.createElement("div");
      toolbar.classList.add("deckbuilder-toolbar-items-right");
      document.body.appendChild(toolbar);

      // for the modal that the button creates
      const deckbuilderElement = document.createElement("div");
      deckbuilderElement.id = "deckbuilder";
      document.body.appendChild(deckbuilderElement);

      getDeckSpy.mockResolvedValue(
        makeFakeDeck({
          primarySections: ["commanders", "nonlands"],
          secondarySections: ["lands", "maybeboard"],
          entries: {
            commanders: [],
          },
        })
      );
      readySpy = mocked(ready).mockImplementation((selector, cb) => {
        const el = document.createElement("div");
        el.innerText = "Commander(s)";

        cb(el);
      });

      jest.spyOn(iframe, "create").mockImplementation();
    });

    it("adds an edhrec button to the toolbar items on the page for a commander deck", async function () {
      const feature = new EDHRecSuggestions();

      await feature.run();

      expect(toolbar.querySelector("#edhrec-suggestions")).not.toBeFalsy();
    });

    it("does not add an edhrec button to the toolbar items on the page for a non-commander deck", async function () {
      const feature = new EDHRecSuggestions();

      readySpy.mockImplementation((selector, cb) => {
        const el = document.createElement("div");
        el.innerText = "Lands";

        cb(el);
      });

      await feature.run();

      expect(toolbar.querySelector("#edhrec-suggestions")).toBeFalsy();
    });
  });
});
