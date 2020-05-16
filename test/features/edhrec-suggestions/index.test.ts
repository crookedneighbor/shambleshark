import EDHRecSuggestions from "Features/deck-builder-features/edhrec-suggestions";
import { getDeck } from "Lib/scryfall";
import mutation from "Lib/mutation";
import iframe from "Lib/iframe";
import { Deck } from "../../../src/js/types/deck";
import SpyInstance = jest.SpyInstance;

import { makeFakeDeck } from "Helpers/fake";

jest.mock("Lib/scryfall");

describe("EDHRec Suggestions", function () {
  describe("run", function () {
    let toolbar: HTMLDivElement;

    let readySpy: SpyInstance;

    beforeEach(function () {
      toolbar = document.createElement("div");
      toolbar.classList.add("deckbuilder-toolbar-items-right");
      document.body.appendChild(toolbar);

      // for the modal that the button creates
      const deckbuilderElement = document.createElement("div");
      deckbuilderElement.id = "deckbuilder";
      document.body.appendChild(deckbuilderElement);

      getDeck.mockResolvedValue(
        makeFakeDeck({
          primarySections: ["commanders", "nonlands"],
          secondarySections: ["lands", "maybeboard"],
          entries: {
            commanders: [],
          },
        })
      );
      jest.spyOn(mutation, "change").mockImplementation();
      readySpy = jest
        .spyOn(mutation, "ready")
        .mockImplementation((selector, cb) => {
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
